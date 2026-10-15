(function() {
  'use strict';
  var endpoint = '/api/pv';
  var sid = Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
  var startTime = Date.now();
  var maxScroll = 0;
  var sent = { view: false, leave: false };

  var params = new URLSearchParams(location.search);
  if (params.get('me') === '1') {
    try { localStorage.setItem('ht_me', '1'); } catch (e) {}
  } else if (params.get('me') === '0') {
    try { localStorage.removeItem('ht_me'); } catch (e) {}
  }

  function isOwner() {
    try { return localStorage.getItem('ht_me') === '1'; } catch (e) { return false; }
  }

  function getSlug() {
    var m = location.pathname.match(/\/preview\/([^\/]+)/);
    return m ? m[1] : 'unknown';
  }

  function send(type, extra) {
    if (sent[type]) return;
    sent[type] = true;
    var data = {
      t: type,
      sid: sid,
      slug: getSlug(),
      path: location.pathname,
      ts: Date.now()
    };
    if (type === 'view') {
      data.ref = document.referrer || '';
      data.ua = navigator.userAgent || '';
      data.sw = screen.width || 0;
    }
    if (extra) {
      for (var k in extra) data[k] = extra[k];
    }
    if (isOwner()) data.owner = true;
    try {
      navigator.sendBeacon(endpoint, JSON.stringify(data));
    } catch (e) {}
  }

  function trackScroll() {
    var scrollTop = window.pageYOffset || document.documentElement.scrollTop || 0;
    var docHeight = Math.max(
      document.body.scrollHeight || 0,
      document.documentElement.scrollHeight || 0,
      document.body.offsetHeight || 0,
      document.documentElement.offsetHeight || 0
    );
    var winHeight = window.innerHeight || document.documentElement.clientHeight || 0;
    var scrollable = docHeight - winHeight;
    if (scrollable > 0) {
      var pct = Math.round((scrollTop / scrollable) * 100);
      if (pct > maxScroll) maxScroll = pct;
    }
  }

  function sendLeave() {
    var secs = Math.round((Date.now() - startTime) / 1000);
    send('leave', { secs: secs, scroll: maxScroll });
  }

  send('view');

  window.addEventListener('scroll', trackScroll, { passive: true });
  trackScroll();

  document.addEventListener('visibilitychange', function() {
    if (document.visibilityState === 'hidden') sendLeave();
  });
  window.addEventListener('pagehide', sendLeave);
})();
