interface Env {
  PREVIEW_WEBHOOK_URL?: string;
  PREVIEW_WEBHOOK_KEY?: string;
  PREVIEW_WEBHOOK_HEADER?: string;
}

interface CFProperties {
  city?: string;
  region?: string;
  country?: string;
  asn?: number;
  asOrganization?: string;
  botManagement?: {
    score?: number;
    verifiedBot?: boolean;
    corporateProxy?: boolean;
    staticResource?: boolean;
  };
}

interface EventData {
  t: 'view' | 'leave';
  sid: string;
  slug: string;
  path: string;
  ts: number;
  ref?: string;
  ua?: string;
  sw?: number;
  secs?: number;
  scroll?: number;
  owner?: boolean;
}

const BOT_PATTERNS = [
  /googlebot/i,
  /bingbot/i,
  /slurp/i,
  /duckduckbot/i,
  /baiduspider/i,
  /yandexbot/i,
  /facebot/i,
  /facebookexternalhit/i,
  /twitterbot/i,
  /slackbot/i,
  /linkedinbot/i,
  /whatsapp/i,
  /telegrambot/i,
  /discordbot/i,
  /crawler/i,
  /spider/i,
  /bot\b/i,
  /headless/i,
  /phantom/i,
  /selenium/i,
  /puppeteer/i,
];

const EMAIL_SCANNER_PATTERNS = [
  /safelinks/i,
  /outlook/i,
  /microsoft office/i,
  /mimecast/i,
  /barracuda/i,
  /proofpoint/i,
  /symantec/i,
  /forcepoint/i,
  /websense/i,
  /mailchimp/i,
  /sendgrid/i,
  /postmark/i,
  /mailgun/i,
  /amazonses/i,
  /google-safety/i,
  /urldefense/i,
];

function detectBot(ua: string, cf?: CFProperties): { isBot: boolean; hint?: string } {
  if (!ua) return { isBot: false };

  if (cf?.botManagement) {
    if (cf.botManagement.verifiedBot) {
      return { isBot: true, hint: 'cf-verified-bot' };
    }
    if (cf.botManagement.score !== undefined && cf.botManagement.score < 30) {
      return { isBot: true, hint: `cf-score-${cf.botManagement.score}` };
    }
  }

  for (const pattern of EMAIL_SCANNER_PATTERNS) {
    if (pattern.test(ua)) {
      return { isBot: true, hint: 'email-scanner' };
    }
  }

  for (const pattern of BOT_PATTERNS) {
    if (pattern.test(ua)) {
      return { isBot: true, hint: 'ua-bot' };
    }
  }

  return { isBot: false };
}

const sessionSeen = new Map<string, Set<string>>();

function shouldForward(sid: string, eventType: string): boolean {
  if (eventType !== 'view' && eventType !== 'leave') return false;
  
  let seen = sessionSeen.get(sid);
  if (!seen) {
    seen = new Set();
    sessionSeen.set(sid, seen);
  }
  
  if (seen.has(eventType)) return false;
  seen.add(eventType);
  
  if (sessionSeen.size > 10000) {
    const keys = Array.from(sessionSeen.keys());
    for (let i = 0; i < 1000; i++) {
      sessionSeen.delete(keys[i]);
    }
  }
  
  return true;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  if (!env.PREVIEW_WEBHOOK_URL) {
    return new Response(null, { status: 204 });
  }

  let data: EventData;
  try {
    data = await request.json();
  } catch {
    return new Response(null, { status: 204 });
  }

  if (data.owner) {
    return new Response(null, { status: 204 });
  }

  if (!shouldForward(data.sid, data.t)) {
    return new Response(null, { status: 204 });
  }

  const cf = (request as unknown as { cf?: CFProperties }).cf;
  const botInfo = detectBot(data.ua || '', cf);

  const payload = {
    t: data.t,
    sid: data.sid,
    slug: data.slug,
    path: data.path,
    ts: data.ts,
    ...(data.t === 'view' && {
      ref: data.ref,
      ua: data.ua,
      sw: data.sw,
    }),
    ...(data.t === 'leave' && {
      secs: data.secs,
      scroll: data.scroll,
    }),
    geo: {
      city: cf?.city,
      region: cf?.region,
      country: cf?.country,
      asn: cf?.asn,
      org: cf?.asOrganization,
    },
    ...(botInfo.isBot && { bot: botInfo.hint }),
  };

  const headerName = env.PREVIEW_WEBHOOK_HEADER || 'Authorization';
  const headerValue = env.PREVIEW_WEBHOOK_HEADER
    ? env.PREVIEW_WEBHOOK_KEY
    : `Bearer ${env.PREVIEW_WEBHOOK_KEY}`;

  context.waitUntil(
    fetch(env.PREVIEW_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(env.PREVIEW_WEBHOOK_KEY && { [headerName]: headerValue! }),
      },
      body: JSON.stringify(payload),
    }).catch(() => {})
  );

  return new Response(null, { status: 204 });
};

export const onRequestOptions: PagesFunction = async () => {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
};
