// ==========================
// 1. CONFIG
// ==========================
const scriptEl = document.currentScript;

const SITE_ID = scriptEl?.getAttribute("data-site-id");
const API_URL = "http://localhost:4000/track";

if (!SITE_ID) {
    console.warn("No data-site-id provided to tracker.js");
}
// ==========================
// 2. SESSION HANDLING
// ==========================
let sessionId = localStorage.getItem("ba_session_id");

if (!sessionId) {
    sessionId = crypto.randomUUID();
    localStorage.setItem("ba_session_id", sessionId);
}

// ==========================
// 3. SEND EVENT FUNCTION
// ==========================
function sendEvent(type, data = {}) {
    const payload = {
        sessionId,
        siteId: SITE_ID,
        type,
        x: data.x ?? null,
        y: data.y ?? null,
        page: window.location.pathname,
        time: Date.now()
    };

    const body = new Blob([JSON.stringify(payload)], {
        type: "application/json"
    });
    navigator.sendBeacon(API_URL, body);
}

// ==========================
// 4. EVENT LISTENERS
// ==========================

// CLICK tracking
document.addEventListener("click", (e) => {
    sendEvent("click", {
        x: e.clientX,
        y: e.clientY
    });
});

// SCROLL tracking
let lastScrollY = 0;
window.addEventListener("scroll", () => {
    const currentY = window.scrollY;

    // only log if scrolled enough (avoid spam)
    if (Math.abs(currentY - lastScrollY) > 50) {
        lastScrollY = currentY;
        sendEvent("scroll", {
            y: currentY
        });
    }
});

// MOUSE MOVE tracking (throttled)
let lastMoveTime = 0;
document.addEventListener("mousemove", (e) => {
    const now = Date.now();

    if (now - lastMoveTime > 200) {
        lastMoveTime = now;
        sendEvent("move", {
            x: e.clientX,
            y: e.clientY
        });
    }
});

// PAGE LOAD event
window.addEventListener("load", () => {
    sendEvent("pageview");
});