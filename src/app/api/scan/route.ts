import { NextRequest, NextResponse } from 'next/server';
import { Mistral } from '@mistralai/mistralai';
import { analyzeUrl, analyzeEmailContent, analyzeEmailHeaders } from '@/lib/detector';
import { checkRateLimit, RATE_LIMITS } from "@/lib/rate-limit";

const apiKey = process.env.OPENROUTER_API_KEY || process.env.MISTRAL_API_KEY;
const client = new Mistral({ apiKey });

const MAX_BODY_BYTES = 50 * 1024; // 50 KB

export async function POST(req: NextRequest) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    req.headers.get("x-real-ip") ||
    "unknown";

  const rateError = checkRateLimit(ip, "scan", RATE_LIMITS.AI_SCAN);
  if (rateError) {
    return NextResponse.json({ error: rateError }, { status: 429 });
  }

  try {
    // 1) Read body as text and enforce size limit
    const rawBody = await req.text();
    if (rawBody.length > MAX_BODY_BYTES) {
      return NextResponse.json(
        { error: "Request body too large" },
        { status: 413 }
      );
    }

    // 2) Parse JSON safely
    let body;
    try {
      body = JSON.parse(rawBody);
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON" },
        { status: 400 }
      );
    }

    const { type, value, useAi } = body as {
      type: "url" | "content" | "headers";
      value: string;
      useAi?: boolean;
    };

    if (!value) {
      return NextResponse.json({ error: 'No input provided' }, { status: 400 });
    }

    // Step 1: Rule-based analysis (Heuristics)
    let ruleResult;
    if (type === 'url') {
      ruleResult = analyzeUrl(value);
    } else if (type === 'headers') {
      ruleResult = analyzeEmailHeaders(value);
    } else {
      ruleResult = analyzeEmailContent(value);
    }

    // Step 2: AI-based analysis (if requested)
    let aiResult = null;
    let usedAi = false;

    if (useAi && apiKey) {
      try {
        const prompt = `
          You are a cyber security expert specialized in phishing detection.
          Analyze the following ${type}: "${value}"

          The rule-based heuristic engine gave this a risk score of ${ruleResult.score}/100 and found these issues:
          ${ruleResult.reasons.length > 0 ? ruleResult.reasons.join(', ') : 'No obvious issues found by rules.'}

          Provide your own expert AI analysis. 
          Your risk score should be a refinement of the heuristic score. 
          Keep your score within 5-10 points of the heuristic score (${ruleResult.score}) unless you identify a critical threat the rules completely missed.

          Provide a detailed analysis in JSON format with the following keys:
          - isPhishy (boolean)
          - score (number from 0 to 100)
          - severity (string: "low", "medium", "high", or "critical")
          - reasons (array of strings explaining why)
          - advice (string giving advice to the user)

          Respond ONLY with the JSON object.
        `;

        let content = '';

        if (apiKey.startsWith('sk-or-')) {
          // OpenRouter support
          const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${apiKey}`,
              'Content-Type': 'application/json',
              'HTTP-Referer': 'https://phishguard.security',
              'X-Title': 'PhishGuard AI',
            },
            body: JSON.stringify({
              model: 'qwen/qwen3-4b:free',
              messages: [{ role: 'user', content: prompt }]
            })
          });

          const data = await response.json();
          console.log('OpenRouter Scan Response:', JSON.stringify(data, null, 2));
          if (data.error) {
            console.error('OpenRouter Scan Error:', data.error);
            throw new Error(`OpenRouter Error: ${data.error.message || JSON.stringify(data.error)}`);
          }
          content = data.choices?.[0]?.message?.content;
        } else {
          // Official Mistral support
          const chatResponse = await client.chat.complete({
            model: 'mistral-small-latest',
            messages: [{ role: 'user', content: prompt }],
            responseFormat: { type: 'json_object' }
          });
          content = chatResponse.choices?.[0]?.message?.content as string;
        }

        if (content) {
          const jsonMatch = content.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            aiResult = JSON.parse(jsonMatch[0]);
            usedAi = true;
          }
        }
      } catch (aiError) {
        console.error('AI Analysis Error:', aiError);
      }
    }

    // Combine results
    const finalResult = {
      ...(aiResult || ruleResult),
      usedAi
    };

    // Adjust the score if AI analysis was used to ensure consistency with heuristics
    if (aiResult) {
      const diff = aiResult.score - ruleResult.score;
      if (Math.abs(diff) > 10) {
        // Cap the difference at 10 points for stability
        finalResult.score = Math.round(ruleResult.score + (diff > 0 ? 10 : -10));
      } else {
        // Ensure a minimum variance if the scores are very close
        if (Math.abs(diff) < 5) {
          finalResult.score = diff >= 0
            ? Math.min(100, ruleResult.score + 5)
            : Math.max(0, ruleResult.score - 5);
        }
      }

      // Update severity based on adjusted score
      if (finalResult.score >= 80) finalResult.severity = 'critical';
      else if (finalResult.score >= 50) finalResult.severity = 'high';
      else if (finalResult.score >= 25) finalResult.severity = 'medium';
      else finalResult.severity = 'low';

      // Merge heuristic reasons that the AI might have missed
      const existingReasons = new Set(aiResult.reasons.map((r: string) => r.toLowerCase()));
      ruleResult.reasons.forEach(reason => {
        if (!existingReasons.has(reason.toLowerCase())) {
          finalResult.reasons.push(`Pattern detected: ${reason}`);
        }
      });
    }

    return NextResponse.json(finalResult);

  } catch (error) {
    console.error('Scan Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
