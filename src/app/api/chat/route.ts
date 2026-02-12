import { NextRequest, NextResponse } from 'next/server';
import { Mistral } from '@mistralai/mistralai';
import { checkRateLimit, RATE_LIMITS } from "@/lib/rate-limit";

const apiKey = process.env.OPENROUTER_API_KEY || process.env.MISTRAL_API_KEY;

const MAX_BODY_BYTES = 50 * 1024; // 50 KB

export async function POST(req: NextRequest) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    req.headers.get("x-real-ip") ||
    "unknown";

  const rateError = checkRateLimit(ip, "chat", RATE_LIMITS.AI_CHAT);
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

    const { messages } = body as { messages: Array<{ role: string; content: string }> };

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Invalid messages' }, { status: 400 });
    }

    if (!apiKey) {
      console.error('API Key is missing');
      return NextResponse.json({ error: 'API Key not configured' }, { status: 500 });
    }

    const systemPrompt = {
      role: 'system',
      content: `You are a Phishing Link Detection Assistant. Your goal is to help users identify and analyze phishing links, scam websites, and online fraud attempts.

Your responses are strictly limited to phishing detection and cybersecurity topics.

GREETINGS:
If the user greets you, respond with:
"Hi! I'm here to help you identify phishing links and scam websites. Please share a suspicious link, message, or phishing-related question so I can assist you."

SCOPE:
You may respond to queries about:
- Phishing links or fake URLs
- Scam websites
- Email, SMS, WhatsApp, or social media phishing
- Fraudulent login pages
- URL safety analysis
- Phishing prevention techniques
- Cybersecurity awareness related to phishing

REFUSAL:
For non-phishing questions, respond with:
"I am not trained to answer this question. This tool is designed specifically for phishing detection and security analysis."

STRUCTURE:
When analyzing threats, use the following structure:
1. Analysis Summary
2. Observation: What appears suspicious
3. Risk: Why it is dangerous
4. Indicators: Technical red flags
5. Recommended Action

Keep responses professional, structured, and free of emojis.`
    };

    let content = '';
    console.log('Using API Key starting with:', apiKey.substring(0, 8) + '...');

    if (apiKey.startsWith('sk-or-')) {
      console.log('Routing to OpenRouter...');

      // List of free models to try in order of preference
      const models = [
        'google/gemma-3-4b-it:free',
        'openai/gpt-oss-120b:free',
        'meta-llama/llama-3-8b-instruct:free',
        'mistralai/mistral-7b-instruct:free',
        'huggingfaceh4/zephyr-7b-beta:free',
        'microsoft/phi-3-mini-128k-instruct:free',
        'meta-llama/llama-3.2-1b-instruct:free',
      ];

      let lastError;

      for (const model of models) {
        try {
          console.log(`Attempting with model: ${model}`);

          // Prepare messages - handle system prompt compatibility
          const finalMessages = [...messages];
          if (finalMessages.length > 0 && finalMessages[0].role === 'user') {
            // Create a deep copy to avoid modifying the original array for next iteration
            finalMessages[0] = {
              ...finalMessages[0],
              content: systemPrompt.content + "\n\n" + finalMessages[0].content
            };
          } else {
            finalMessages.unshift({ role: 'user', content: systemPrompt.content });
          }

          // Create separate AbortController for each request
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout per model

          try {
            const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': 'https://phishguard.security',
                'X-Title': 'PhishGuard AI',
              },
              body: JSON.stringify({
                model,
                messages: finalMessages
              }),
              signal: controller.signal
            });
            clearTimeout(timeoutId); // Clear timeout on response

            const data = await response.json();

            if (data.error) {
              console.warn(`Model ${model} failed:`, JSON.stringify(data.error));
              lastError = data.error;
              continue; // Try next model
            }

            if (!data.choices || !data.choices[0] || !data.choices[0].message) {
              console.warn(`Model ${model} returned invalid structure:`, JSON.stringify(data));
              lastError = { message: 'Invalid response structure' };
              continue; // Try next model
            }

            content = data.choices?.[0]?.message?.content;
            console.log(`Success with model: ${model}`);
            break; // Success! Exit loop

          } catch (fetchErr) {
            clearTimeout(timeoutId);
            console.error(`Fetch exception with model ${model}:`, fetchErr);
            lastError = fetchErr;
            // Continue to next model
          }

        } catch (err) {
          console.error(`Unexpected exception with model ${model}:`, err);
          lastError = err;
        }
      }

      if (!content) {
        if (lastError) {
          console.error('All models failed. Last error:', lastError);
          const fs = require('fs');
          try { fs.writeFileSync('last_chat_error.log', JSON.stringify(lastError, null, 2)); } catch (e) { }
          throw new Error("All models failed. Last error: " + (lastError instanceof Error ? lastError.message : JSON.stringify(lastError)));
        }
        throw new Error('Failed to get response from any model');
      }

    } else {
      console.log('Routing to Mistral...');
      const client = new Mistral({ apiKey });

      const typedSystemPrompt: { role: 'system'; content: string } = systemPrompt as { role: 'system'; content: string };

      const chatResponse = await client.chat.complete({
        model: 'mistral-small-latest',
        messages: [typedSystemPrompt, ...messages] as any,
      });
      content = chatResponse.choices?.[0]?.message?.content as string;
    }

    return NextResponse.json({ content });

    return NextResponse.json({ content });

  } catch (error) {
    console.error('Chat Error (Full):', error);
    // Return a generic error message to the client to avoid leaking internal details
    return NextResponse.json({
      error: 'An internal error occurred while processing your request.',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
