const BOT_PATTERNS = [
  /googlebot/i, /bingbot/i, /slurp/i, /duckduckbot/i, /baiduspider/i,
  /yandexbot/i, /facebot/i, /facebookexternalhit/i, /twitterbot/i,
  /slackbot/i, /linkedinbot/i, /whatsapp/i, /telegrambot/i, /discordbot/i,
  /crawler/i, /spider/i, /bot\b/i, /headless/i, /phantom/i, /selenium/i, /puppeteer/i,
];

const EMAIL_SCANNER_PATTERNS = [
  /safelinks/i, /outlook/i, /microsoft office/i, /mimecast/i, /barracuda/i,
  /proofpoint/i, /symantec/i, /forcepoint/i, /websense/i, /mailchimp/i,
  /sendgrid/i, /postmark/i, /mailgun/i, /amazonses/i, /google-safety/i, /urldefense/i,
];

function detectBot(ua, cf) {
  if (!ua) return { isBot: false };
  if (cf && cf.botManagement) {
    if (cf.botManagement.verifiedBot) return { isBot: true, hint: 'cf-verified-bot' };
    if (cf.botManagement.score !== undefined && cf.botManagement.score < 30) {
      return { isBot: true, hint: 'cf-score-' + cf.botManagement.score };
    }
  }
  for (const p of EMAIL_SCANNER_PATTERNS) if (p.test(ua)) return { isBot: true, hint: 'email-scanner' };
  for (const p of BOT_PATTERNS) if (p.test(ua)) return { isBot: true, hint: 'ua-bot' };
  return { isBot: false };
}

const sessionSeen = new Map();

function shouldForward(sid, eventType) {
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
    for (let i = 0; i < 1000; i++) sessionSeen.delete(keys[i]);
  }
  return true;
}

async function handleTracking(request, env, ctx) {
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  if (request.method !== 'POST') {
    return new Response(null, { status: 405 });
  }

  if (!env.PREVIEW_WEBHOOK_URL) {
    return new Response(null, { status: 204 });
  }

  let data;
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

  const cf = request.cf;
  const botInfo = detectBot(data.ua || '', cf);

  const payload = {
    t: data.t,
    sid: data.sid,
    slug: data.slug,
    path: data.path,
    ts: data.ts,
  };

  if (data.t === 'view') {
    payload.ref = data.ref;
    payload.ua = data.ua;
    payload.sw = data.sw;
  }
  if (data.t === 'leave') {
    payload.secs = data.secs;
    payload.scroll = data.scroll;
  }

  payload.geo = {
    city: cf ? cf.city : undefined,
    region: cf ? cf.region : undefined,
    country: cf ? cf.country : undefined,
    asn: cf ? cf.asn : undefined,
    org: cf ? cf.asOrganization : undefined,
  };

  if (botInfo.isBot) payload.bot = botInfo.hint;

  const headerName = env.PREVIEW_WEBHOOK_HEADER || 'Authorization';
  const headerValue = env.PREVIEW_WEBHOOK_HEADER
    ? env.PREVIEW_WEBHOOK_KEY
    : 'Bearer ' + env.PREVIEW_WEBHOOK_KEY;

  const headers = { 'Content-Type': 'application/json' };
  if (env.PREVIEW_WEBHOOK_KEY) headers[headerName] = headerValue;

  ctx.waitUntil(
    fetch(env.PREVIEW_WEBHOOK_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    }).catch(() => {})
  );

  return new Response(null, { status: 204 });
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname === '/api/pv') {
      return handleTracking(request, env, ctx);
    }

    return env.ASSETS.fetch(request);
  },
};
