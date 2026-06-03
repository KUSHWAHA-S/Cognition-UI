(function () {
  "use strict";

  // ------------------------------------------------------------------
  // 1. CONFIG
  // ------------------------------------------------------------------
  var scriptEl = document.currentScript;
  var TRACKING_ID = scriptEl && scriptEl.getAttribute("data-id");
  var API_URL =
    (scriptEl && scriptEl.getAttribute("data-api")) ||
    "https://cognition-ui.vercel.app/api/events";

  if (!TRACKING_ID) {
    console.warn("[Cognition] No data-id attribute found on script tag.");
    return;
  }

  // ------------------------------------------------------------------
  // 2. SESSION
  // sessionStorage resets per tab — correct unit for a behavioural session
  // ------------------------------------------------------------------
  var SESSION_KEY = "cog_sid";
  var sessionId = sessionStorage.getItem(SESSION_KEY);
  if (!sessionId) {
    sessionId =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
            var r = (Math.random() * 16) | 0;
            return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
          });
    sessionStorage.setItem(SESSION_KEY, sessionId);
  }

  // ------------------------------------------------------------------
  // 3. EVENT QUEUE + FLUSH
  // ------------------------------------------------------------------
  var queue = [];

  function push(evt) {
    queue.push(evt);
  }

  function buildPayload() {
    return JSON.stringify({
      tracking_id: TRACKING_ID,
      session_id: sessionId,
      events: queue.splice(0), // drain the queue
    });
  }

  function flushFetch() {
    if (!queue.length) return;
    var body = buildPayload();
    fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: body,
      keepalive: true,
    }).catch(function () {});
  }

  function flushBeacon() {
    if (!queue.length) return;
    var body = buildPayload();
    var blob = new Blob([body], { type: "application/json" });
    if (!navigator.sendBeacon(API_URL, blob)) {
      // sendBeacon can return false if the queue is full — fall back to fetch
      fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: body,
        keepalive: true,
      }).catch(function () {});
    }
  }

  // Flush every 10 seconds
  setInterval(flushFetch, 10000);

  // Flush on tab close / navigation away — sendBeacon survives page unload
  window.addEventListener("beforeunload", flushBeacon);
  // pagehide fires on iOS Safari where beforeunload is unreliable
  window.addEventListener("pagehide", flushBeacon);

  // ------------------------------------------------------------------
  // 4. HELPERS
  // ------------------------------------------------------------------

  function now() {
    return new Date().toISOString();
  }

  function scrollDepthPct() {
    var scrolled = window.scrollY + window.innerHeight;
    var total = document.body.scrollHeight;
    return total > 0 ? Math.min(100, Math.round((scrolled / total) * 100)) : 0;
  }

  // Build a short CSS-like selector: tag#id.class1.class2 (no PII)
  function selector(el) {
    if (!el || el.nodeType !== 1) return null;
    var s = el.tagName.toLowerCase();
    if (el.id) s += "#" + el.id;
    if (el.className && typeof el.className === "string") {
      var classes = el.className.trim().split(/\s+/).slice(0, 3).join(".");
      if (classes) s += "." + classes;
    }
    return s;
  }

  // Walk up DOM to find the nearest interactive ancestor
  var INTERACTIVE = { A: 1, BUTTON: 1, INPUT: 1, SELECT: 1, TEXTAREA: 1 };
  function interactiveAncestor(el) {
    var node = el;
    while (node && node !== document.body) {
      if (
        INTERACTIVE[node.tagName] ||
        node.getAttribute("onclick") ||
        node.getAttribute("role") === "button" ||
        node.getAttribute("tabindex") != null
      ) {
        return node;
      }
      node = node.parentElement;
    }
    return null;
  }

  // ------------------------------------------------------------------
  // 5. HOVER DURATION (hesitation signal)
  // Record mouseenter time per element; on click compute duration_ms
  // ------------------------------------------------------------------
  var hoverStart = null;

  document.addEventListener("mouseenter", function (e) {
    hoverStart = { el: e.target, t: Date.now() };
  }, true);

  // ------------------------------------------------------------------
  // 6. RAGE CLICK DETECTION
  // 3+ clicks within 2000ms and within 30px radius
  // ------------------------------------------------------------------
  var clickBuffer = []; // [{x, y, t}]

  function isRageClick(x, y, t) {
    // Keep only clicks within the 2s window
    clickBuffer = clickBuffer.filter(function (c) { return t - c.t < 2000; });
    clickBuffer.push({ x: x, y: y, t: t });
    if (clickBuffer.length < 3) return false;
    // Check if last 3 are within 30px of each other
    var recent = clickBuffer.slice(-3);
    for (var i = 1; i < recent.length; i++) {
      var dx = recent[i].x - recent[0].x;
      var dy = recent[i].y - recent[0].y;
      if (Math.sqrt(dx * dx + dy * dy) > 30) return false;
    }
    return true;
  }

  // ------------------------------------------------------------------
  // 7. CLICK TRACKING
  // Emits: click, dead_click, rage_click
  // ------------------------------------------------------------------
  document.addEventListener("click", function (e) {
    var t = Date.now();
    var el = e.target;
    var x = Math.round(e.clientX);
    var y = Math.round(e.clientY);
    var sel = selector(el);

    // Hover duration since mouseenter on this element
    var duration = null;
    if (hoverStart && hoverStart.el === el) {
      duration = t - hoverStart.t;
    }
    hoverStart = null;

    var base = {
      page_url: window.location.href,
      element_selector: sel,
      x: x,
      y: y,
      duration_ms: duration,
      scroll_depth: null,
      timestamp: now(),
    };

    if (isRageClick(x, y, t)) {
      push(Object.assign({}, base, { event_type: "rage_click" }));
      return; // rage click supersedes regular click
    }

    if (!interactiveAncestor(el)) {
      push(Object.assign({}, base, { event_type: "dead_click" }));
      return; // dead click supersedes regular click
    }

    push(Object.assign({}, base, { event_type: "click" }));
  });

  // ------------------------------------------------------------------
  // 8. SCROLL TRACKING (throttled — max 1 event per 500ms)
  // ------------------------------------------------------------------
  var lastScrollAt = 0;

  window.addEventListener("scroll", function () {
    var t = Date.now();
    if (t - lastScrollAt < 500) return;
    lastScrollAt = t;
    push({
      event_type: "scroll",
      page_url: window.location.href,
      element_selector: null,
      x: null,
      y: null,
      duration_ms: null,
      scroll_depth: scrollDepthPct(),
      timestamp: now(),
    });
  }, { passive: true });

  // ------------------------------------------------------------------
  // 9. BACKTRACK DETECTION
  // Maintain a visited-URL stack; popstate to a previously seen URL = backtrack
  // ------------------------------------------------------------------
  var visitedUrls = [window.location.href];

  window.addEventListener("popstate", function () {
    var current = window.location.href;
    var isBacktrack = visitedUrls.indexOf(current) !== -1;
    if (isBacktrack) {
      push({
        event_type: "backtrack",
        page_url: current,
        element_selector: null,
        x: null,
        y: null,
        duration_ms: null,
        scroll_depth: null,
        timestamp: now(),
      });
    }
    // Always add to visited list (handles forward navigation too)
    if (visitedUrls.indexOf(current) === -1) {
      visitedUrls.push(current);
    }
  });

  // Track SPA navigations via pushState
  var _origPushState = history.pushState.bind(history);
  history.pushState = function (state, title, url) {
    _origPushState(state, title, url);
    var href = window.location.href;
    if (visitedUrls.indexOf(href) === -1) {
      visitedUrls.push(href);
    }
    push({
      event_type: "page_view",
      page_url: href,
      element_selector: null,
      x: null,
      y: null,
      duration_ms: null,
      scroll_depth: null,
      timestamp: now(),
    });
  };

  // ------------------------------------------------------------------
  // 10. INITIAL PAGE VIEW
  // ------------------------------------------------------------------
  push({
    event_type: "page_view",
    page_url: window.location.href,
    element_selector: null,
    x: null,
    y: null,
    duration_ms: null,
    scroll_depth: scrollDepthPct(),
    timestamp: now(),
  });

})();
