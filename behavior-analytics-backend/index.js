import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

const app = express();
const allowedOrigins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://motionfolio-mu.vercel.app",
    "https://motionfolio-btpz.vercel.app",
];

app.use(cors({
    origin(origin, callback) {
        // Allow non-browser clients/tools (no Origin header)
        if (!origin) {
            return callback(null, true);
        }

        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }

        return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true
}));
app.use(express.json());
app.use(express.text({ type: "text/plain" }));

app.use(express.static("public"));

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const hasSupabaseConfig = Boolean(supabaseUrl && supabaseKey);

const supabase = hasSupabaseConfig
    ? createClient(supabaseUrl, supabaseKey)
    : null;

const UUID_V4_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

app.get("/", (req, res) => {
    res.send("Analytics backend running 🚀");
});

app.get("/track", (req, res) => {
    res.status(200).json({
        status: "ok",
        message: "Use POST /track with JSON body to store events"
    });
});

app.post("/track", async (req, res) => {
    if (!supabase) {
        return res.status(500).json({
            error: "Supabase is not configured. Set SUPABASE_URL and SUPABASE_KEY in .env"
        });
    }

    const parsedBody =
        typeof req.body === "string"
            ? (() => {
                try {
                    return JSON.parse(req.body);
                } catch {
                    return null;
                }
            })()
            : req.body;

    if (!parsedBody || typeof parsedBody !== "object") {
        return res.status(400).json({
            error: "Invalid JSON body"
        });
    }

    const { sessionId, siteId, type, x, y, page, time } = parsedBody;

    if (!sessionId || !siteId || !type) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    if (!UUID_V4_REGEX.test(sessionId) || !UUID_V4_REGEX.test(siteId)) {
        return res.status(400).json({
            error: "sessionId and siteId must be valid UUID v4 strings"
        });
    }

    // upsert session
    const { error: sessionError } = await supabase
        .from("sessions")
        .upsert({
            id: sessionId,
            site_id: siteId
        });

    if (sessionError) {
        console.error("Session error:", sessionError);
        return res.status(500).json({ error: "Session upsert failed" });
    }

    // insert event
    const { error: eventError } = await supabase
        .from("events")
        .insert({
            session_id: sessionId,
            site_id: siteId,
            type,
            x,
            y,
            page,
            time
        });

    if (eventError) {
        console.error("Event error:", eventError);
        return res.status(500).json({ error: "DB insert failed" });
    }

    res.json({ status: "ok" });
});

app.get("/sessions/:siteId", async (req, res) => {
    if (!supabase) {
        return res.status(500).json({
            error: "Supabase is not configured. Set SUPABASE_URL and SUPABASE_KEY in .env"
        });
    }

    const { siteId } = req.params;
    if (!UUID_V4_REGEX.test(siteId)) {
        return res.status(400).json({
            error: "siteId must be a valid UUID v4 string"
        });
    }

    const { data, error } = await supabase
        .from("sessions")
        .select("*")
        .eq("site_id", siteId)
        .order("created_at", { ascending: false });

    if (error) return res.status(500).json(error);
    res.json(data);
});

app.get("/events/:sessionId", async (req, res) => {
    if (!supabase) {
        return res.status(500).json({
            error: "Supabase is not configured. Set SUPABASE_URL and SUPABASE_KEY in .env"
        });
    }

    const { sessionId } = req.params;
    if (!UUID_V4_REGEX.test(sessionId)) {
        return res.status(400).json({
            error: "sessionId must be a valid UUID v4 string"
        });
    }

    const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("session_id", sessionId)
        .order("time", { ascending: true });

    if (error) return res.status(500).json(error);
    res.json(data);
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    if (!hasSupabaseConfig) {
        console.warn("SUPABASE_URL/SUPABASE_KEY missing; POST /track will return a config error");
    }
    console.log(`Server running on http://localhost:${PORT}`);
});