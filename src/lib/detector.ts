export interface DetectionResult {
  isPhishy: boolean;
  score: number; // 0 to 100
  reasons: string[];
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export function analyzeUrl(url: string): DetectionResult {
  const reasons: string[] = [];
  let score = 0;

  try {
    const urlObj = new URL(url.startsWith('http') ? url : `http://${url}`);
    const hostname = urlObj.hostname;
    const path = urlObj.pathname;

    // IP Address in Hostname
    if (/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(hostname)) {
      reasons.push("Uses an IP address instead of a domain name.");
      score += 30;
    }

    // URL Length
    if (url.length > 75) {
      reasons.push("The URL is unusually long.");
      score += 10;
    }

    // Shortened URL
    const shorteners = ['bit.ly', 'goo.gl', 'tinyurl.com', 't.co', 'ow.ly', 'is.gd', 'buff.ly', 'adf.ly'];
    if (shorteners.some(s => hostname.includes(s))) {
      reasons.push("Uses a URL shortener which may hide the destination.");
      score += 15;
    }

    // Presence of '@' symbol
    if (url.includes('@')) {
      reasons.push("Contains an '@' symbol, often used for credential theft or redirection.");
      score += 25;
    }

    // Double Slashes after protocol
    if (url.slice(7).includes('//')) {
      reasons.push("Contains multiple double slashes, often used for redirects.");
      score += 15;
    }

    // Dash in Domain
    if (hostname.includes('-')) {
      reasons.push("Domain name contains a hyphen, which is common in phishing sites.");
      score += 10;
    }

    // Subdomain Count
    const dots = hostname.split('.').length - 1;
    if (dots > 3) {
      reasons.push("Excessive number of subdomains.");
      score += 15;
    }

    // HTTPS Check
    if (url.startsWith('http://')) {
      reasons.push("Uses insecure HTTP protocol.");
      score += 20;
    }

    // Suspicious TLDs
    const suspiciousTlds = ['.top', '.xyz', '.loan', '.win', '.bid', '.gq', '.tk', '.ml', '.cf', '.ga'];
    if (suspiciousTlds.some(tld => hostname.endsWith(tld))) {
      reasons.push(`Uses a suspicious top-level domain (${hostname.split('.').pop()}).`);
      score += 15;
    }

    // Non-standard Ports
    if (urlObj.port && !['80', '443'].includes(urlObj.port)) {
      reasons.push(`Uses a non-standard port: ${urlObj.port}.`);
      score += 10;
    }

    // Keywords in URL
    const keywords = ['login', 'verify', 'update', 'account', 'secure', 'banking', 'signin', 'confirm', 'paypal', 'microsoft', 'google', 'apple', 'amazon', 'netflix', 'wallet', 'token'];
    keywords.forEach(kw => {
      if (url.toLowerCase().includes(kw)) {
        reasons.push(`Contains high-risk keyword: "${kw}".`);
        score += 10;
      }
    });

    // HTTPS in path
    if (path.toLowerCase().includes('https') || path.toLowerCase().includes('http')) {
      reasons.push("URL contains another protocol string in the path.");
      score += 20;
    }

    // Unusual characters
    if (/[^a-zA-Z0-9-._~:/?#[\]@!$&'()*+,;=]/.test(url)) {
      reasons.push("Contains unusual or encoded characters.");
      score += 10;
    }

    // Punycode detection
    if (hostname.includes('xn--')) {
      reasons.push("Uses Punycode (homograph attack potential).");
      score += 40;
    }

    // Numbers in hostname
    const numberCount = (hostname.match(/\d/g) || []).length;
    if (numberCount > 5) {
      reasons.push("Hostname contains an unusual amount of numbers.");
      score += 10;
    }

    // Sensitive Directory names
    const sensitiveDirs = ['/etc/', '/bin/', '/wp-admin/', '/wp-content/', '/cgi-bin/', '/admin/'];
    if (sensitiveDirs.some(dir => path.includes(dir))) {
      reasons.push("Attempts to access sensitive directory patterns.");
      score += 15;
    }

    // File extension check
    const dangerousExts = ['.exe', '.sh', '.bat', '.cmd', '.scr', '.vbs', '.js', '.jar'];
    if (dangerousExts.some(ext => path.endsWith(ext))) {
      reasons.push("Points directly to an executable or script file.");
      score += 30;
    }

    // Port 80 with sensitive keywords
    if (urlObj.port === '80' && keywords.some(kw => url.includes(kw))) {
      reasons.push("Insecure port 80 used with sensitive keywords.");
      score += 20;
    }

    // Repeated characters in domain
    if (/(.)\1{2,}/.test(hostname)) {
      reasons.push("Domain contains suspicious repeated characters.");
      score += 10;
    }

    // Subdomains without standard prefix
    if (!hostname.startsWith('www.') && dots >= 2) {
      reasons.push("Complex subdomain structure without standard 'www' prefix.");
      score += 5;
    }

    // Query parameters that look like URLs
    if (urlObj.search && (urlObj.search.includes('http://') || urlObj.search.includes('https://'))) {
      reasons.push("Query string contains another URL (potential open redirect).");
      score += 20;
    }

    // Path mimicking a domain
    const segments = path.split('/');
    if (segments.some(seg => seg.includes('.') && !seg.endsWith('.html') && !seg.endsWith('.php'))) {
      reasons.push("Path segments mimic other domain names.");
      score += 15;
    }

    // Mail protocols
    if (urlObj.port === '25' || urlObj.port === '587') {
      reasons.push("Using email server ports in a web URL.");
      score += 30;
    }

    // No extension in path with sensitive keywords
    if (path.length > 1 && !path.includes('.') && keywords.some(kw => path.includes(kw))) {
      reasons.push("Path contains keywords but no file extension.");
      score += 5;
    }

    // Extremely short domain name
    const domainOnly = hostname.split('.')[0];
    if (domainOnly.length < 3 && !['me', 'io', 'ai'].includes(hostname.split('.').pop() || '')) {
      reasons.push("Domain name is unusually short.");
      score += 10;
    }

    // TLD as subdomain
    if (hostname.includes('.com.') || hostname.includes('.net.') || hostname.includes('.org.')) {
      reasons.push("TLD-like string used as a subdomain.");
      score += 15;
    }

    // Mixed case in hostname
    if (/[A-Z]/.test(hostname) && hostname !== hostname.toLowerCase()) {
      reasons.push("Hostname uses unusual mixed casing.");
      score += 5;
    }

    // Percentage encoding in hostname
    if (hostname.includes('%')) {
      reasons.push("Hostname contains percentage encoding.");
      score += 20;
    }

    // Underscore in hostname
    if (hostname.includes('_')) {
      reasons.push("Hostname contains an underscore (invalid in many DNS configs).");
      score += 10;
    }

    // Proxy ports
    if (['8080', '3128', '1080'].includes(urlObj.port)) {
      reasons.push("Uses common proxy or non-standard web ports.");
      score += 10;
    }

  } catch {
    reasons.push("Invalid URL format.");
    score += 50;
  }

  // Normalize score
  score = Math.min(100, score);

  let severity: DetectionResult['severity'] = 'low';
  if (score >= 80) severity = 'critical';
  else if (score >= 50) severity = 'high';
  else if (score >= 25) severity = 'medium';

  return {
    isPhishy: score >= 40,
    score,
    reasons: [...new Set(reasons)], // Deduplicate
    severity
  };
}

export function analyzeEmailContent(content: string): DetectionResult {
  const reasons: string[] = [];
  let score = 0;

  const keywords = {
    urgency: ['urgent', 'immediately', 'within 24 hours', 'action required', 'suspended', 'locked', 'detected unusual activity'],
    financial: ['payment', 'bank', 'invoice', 'inheritance', 'lottery', 'crypto', 'wallet', 'refund', 'billing'],
    credentials: ['password', 'login', 'verify', 'update credentials', 'reset', 'security question'],
    greetings: ['dear customer', 'dear user', 'valued member', 'hello friend'],
    threatening: ['legal action', 'police', 'court', 'arrest', 'unauthorized access']
  };

  const contentLower = content.toLowerCase();

  // 1. Urgency
  if (keywords.urgency.some(kw => contentLower.includes(kw))) {
    reasons.push("Contains language creating a false sense of urgency.");
    score += 20;
  }

  // 2. Financial keywords
  if (keywords.financial.some(kw => contentLower.includes(kw))) {
    reasons.push("Contains financial or payment-related keywords.");
    score += 15;
  }

  // 3. Credential requests
  if (keywords.credentials.some(kw => contentLower.includes(kw))) {
    reasons.push("Requests sensitive credential or account updates.");
    score += 25;
  }

  // 4. Generic greetings
  if (keywords.greetings.some(kw => contentLower.includes(kw))) {
    reasons.push("Uses generic or impersonal greetings.");
    score += 10;
  }

  // 5. Threatening language
  if (keywords.threatening.some(kw => contentLower.includes(kw))) {
    reasons.push("Contains threatening or intimidating language.");
    score += 25;
  }

  // 6. Poor grammar/spelling (simulated by looking for specific patterns)
  if (/\b(teh|recieve|manger|accountt|adress)\b/i.test(content)) {
    reasons.push("Potential spelling or grammar inconsistencies detected.");
    score += 15;
  }

  // 7. Excessive punctuation
  if (/[!?]{2,}/.test(content)) {
    reasons.push("Uses excessive punctuation to create excitement or panic.");
    score += 10;
  }

  // 8. Link mentions without links
  if ((contentLower.includes('click here') || contentLower.includes('link below')) && !content.includes('http')) {
    reasons.push("Asks to click links that might be obscured or missing in plain text.");
    score += 10;
  }

  // 9. All caps sections
  const capsCount = (content.match(/[A-Z]{5,}/g) || []).length;
  if (capsCount > 3) {
    reasons.push("Uses excessive capital letters (shouting).");
    score += 10;
  }

  // 10. Strange characters
  if (/[^\x00-\x7F]/.test(content)) {
    reasons.push("Contains non-standard characters which might be used for obfuscation.");
    score += 10;
  }

  // Normalize score
  score = Math.min(100, score);

  let severity: DetectionResult['severity'] = 'low';
  if (score >= 75) severity = 'critical';
  else if (score >= 50) severity = 'high';
  else if (score >= 25) severity = 'medium';

  return {
    isPhishy: score >= 40,
    score,
    reasons: [...new Set(reasons)],
    severity
  };
}

export function analyzeEmailHeaders(headers: string): DetectionResult {
  const reasons: string[] = [];
  let score = 0;

  const headersLower = headers.toLowerCase();

  // 1. Check for mismatched Return-Path and From
  const fromMatch = headers.match(/From:.*<(.+?)>/i) || headers.match(/From:\s*(.+)/i);
  const returnPathMatch = headers.match(/Return-Path:.*<(.+?)>/i) || headers.match(/Return-Path:\s*(.+)/i);

  if (fromMatch && returnPathMatch) {
    const from = fromMatch[1].trim().toLowerCase();
    const returnPath = returnPathMatch[1].trim().toLowerCase();
    if (from !== returnPath && !from.includes(returnPath.split('@')[1] || '')) {
      reasons.push("Return-Path does not match the From address domain.");
      score += 30;
    }
  }

  // 2. SPF/DKIM failures
  if (headersLower.includes('spf=fail') || headersLower.includes('spf=softfail')) {
    reasons.push("SPF authentication failed.");
    score += 25;
  }
  if (headersLower.includes('dkim=fail')) {
    reasons.push("DKIM signature verification failed.");
    score += 25;
  }

  // 3. X-PHP-Originating-Script
  if (headersLower.includes('x-php-originating-script')) {
    reasons.push("Email sent via a PHP script, common in automated phishing.");
    score += 15;
  }

  // 4. Multiple "Received" hops from suspicious locations
  const receivedCount = (headers.match(/Received:/gi) || []).length;
  if (receivedCount > 10) {
    reasons.push("Unusually high number of transfer hops.");
    score += 10;
  }

  // 5. Mismatched X-Sender and From
  const xSenderMatch = headers.match(/X-Sender:.*<(.+?)>/i) || headers.match(/X-Sender:\s*(.+)/i);
  if (xSenderMatch && fromMatch) {
    const from = fromMatch[1].trim().toLowerCase();
    const xSender = xSenderMatch[1].trim().toLowerCase();
    if (from !== xSender) {
      reasons.push("X-Sender header is different from the From address.");
      score += 20;
    }
  }

  // Normalize score
  score = Math.min(100, score);

  let severity: DetectionResult['severity'] = 'low';
  if (score >= 75) severity = 'critical';
  else if (score >= 50) severity = 'high';
  else if (score >= 25) severity = 'medium';

  return {
    isPhishy: score >= 35,
    score,
    reasons: [...new Set(reasons)],
    severity
  };
}
