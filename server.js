import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import Database from "better-sqlite3";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;

// --- SQLite storage ---
import fs from "fs";
const DATA_DIR = process.env.DATA_DIR || __dirname;
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
const db = new Database(path.join(DATA_DIR, "data.sqlite"));
db.exec(`CREATE TABLE IF NOT EXISTS state (key TEXT PRIMARY KEY, value TEXT)`);

const readState = () => {
  const row = db.prepare("SELECT value FROM state WHERE key = 'main'").get();
  return row ? JSON.parse(row.value) : {};
};

const writeState = (data) => {
  db.prepare(
    "INSERT INTO state (key, value) VALUES ('main', ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value"
  ).run(JSON.stringify(data));
};

app.use(express.json({ limit: "50mb" }));

app.get("/api/state", (req, res) => {
  try {
    res.json(readState());
  } catch {
    res.json({});
  }
});

app.post("/api/state", (req, res) => {
  try {
    writeState(req.body);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ ok: false, error: String(err) });
  }
});

// --- بک‌آپ خودکار روزانه تلگرام ---
const TELEGRAM_TOKEN   = process.env.TELEGRAM_TOKEN   || '7495631798:AAFy7s12wEKinGYyLXIGTXY-iJ2Yu7wHFSA';
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || '2146248157';

const sendDailyBackup = async () => {
  try {
    const db = readState();
    const caption = `📦 *بک‌آپ روزانه P21 ULTRA*\n📅 \`${new Date().toLocaleDateString('fa-IR')}\` — ⏰ \`${new Date().toLocaleTimeString('fa-IR')}\`\n• کالا: \`${db.products?.length||0}\` — حواله: \`${db.exits?.length||0}\` — پرسنل: \`${db.recipients?.length||0}\``;
    const fileName = `P21_BACKUP_${new Date().toISOString().split('T')[0]}.json`;
    const fileContent = JSON.stringify(db, null, 2);

    const { FormData, Blob } = await import('node:buffer').then(() => ({ FormData: globalThis.FormData, Blob: globalThis.Blob })).catch(() => ({ FormData: null, Blob: null }));
    
    // استفاده از form-data ساده
    const boundary = '----FormBoundary' + Math.random().toString(36).slice(2);
    const body = Buffer.concat([
      Buffer.from(`--${boundary}
Content-Disposition: form-data; name="chat_id"

${TELEGRAM_CHAT_ID}
`),
      Buffer.from(`--${boundary}
Content-Disposition: form-data; name="caption"

${caption}
`),
      Buffer.from(`--${boundary}
Content-Disposition: form-data; name="parse_mode"

Markdown
`),
      Buffer.from(`--${boundary}
Content-Disposition: form-data; name="document"; filename="${fileName}"
Content-Type: application/json

`),
      Buffer.from(fileContent),
      Buffer.from(`
--${boundary}--
`)
    ]);

    await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendDocument`, {
      method: 'POST',
      headers: { 'Content-Type': `multipart/form-data; boundary=${boundary}`, 'Content-Length': String(body.length) },
      body
    });
    console.log('[Backup] بک‌آپ روزانه ارسال شد:', new Date().toLocaleString('fa-IR'));
  } catch (err) {
    console.error('[Backup Error]:', err);
  }
};

// هر روز ساعت ۲۳:۵۵ بک‌آپ بفرست
const scheduleDailyBackup = () => {
  const now = new Date();
  const next = new Date();
  next.setHours(23, 55, 0, 0);
  if (next <= now) next.setDate(next.getDate() + 1);
  const msUntil = next - now;
  setTimeout(() => {
    sendDailyBackup();
    setInterval(sendDailyBackup, 24 * 60 * 60 * 1000); // بعدش هر ۲۴ ساعت
  }, msUntil);
  console.log(`[Backup] بک‌آپ بعدی در ${Math.round(msUntil/3600000)} ساعت دیگر`);
};

scheduleDailyBackup();

async function sendBackupToTelegram() {
  if (!TELEGRAM_TOKEN || !TELEGRAM_CHAT_ID) return;
  try {
    const data = readState();
    const json = JSON.stringify(data, null, 2);
    const form = new FormData();
    form.append("chat_id", TELEGRAM_CHAT_ID);
    form.append(
      "document",
      new Blob([json], { type: "application/json" }),
      `backup-${new Date().toISOString().slice(0, 10)}.json`
    );
    form.append("caption", "📦 پشتیبان خودکار اطلاعات انبار");
    await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendDocument`, {
      method: "POST",
      body: form,
    });
  } catch (err) {
    console.error("Telegram backup failed:", err);
  }
}

setInterval(sendBackupToTelegram, 6 * 60 * 60 * 1000);

// ── پروکسی Claude API برای OCR بارنامه ──────────────────────────────────────
app.post("/api/ocr", async (req, res) => {
  const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;
  if (!ANTHROPIC_KEY) {
    // اگه key نبود، به فرانت بگو مستقیم تلاش کنه
    return res.status(503).json({ error: "NO_KEY" });
  }
  try {
    const { base64Data, mimeType } = req.body;
    const prompt = `این تصویر یک بارنامه، رسید کالا، یا فرم خروج است.
وظیفه: تمام متن‌ها را با دقت بخوان — حتی دست‌نویس بد، مخلوط فارسی/انگلیسی، یا ناخوانا.
برای متون ناخوانا بهترین تخمین را بزن. هرگز خطا نده.

فقط JSON خالص (بدون backtick، بدون هیچ توضیح):
{"docNumber":"","sender":"","receiver":"","date":"","items":[{"description":"شرح کالا","quantity":1,"unit":"عدد"}]}

items = تمام اقلام جدول کالا. اگه چیزی خوانده نشد رشته خالی بگذار.`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-opus-4-6",
        max_tokens: 2000,
        messages: [{
          role: "user",
          content: [
            { type: "image", source: { type: "base64", media_type: mimeType || "image/jpeg", data: base64Data } },
            { type: "text", text: prompt }
          ]
        }]
      })
    });
    const data = await response.json();
    if (data.error) return res.status(500).json({ error: data.error.message });
    const text = (data.content || []).map(c => c.text || "").join("");
    const clean = text.replace(/```json|```/g, "").trim();
    // استخراج JSON از داخل متن
    const jsonMatch = clean.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return res.status(500).json({ error: "پاسخ JSON نبود: " + clean.slice(0,200) });
    const result = JSON.parse(jsonMatch[0]);
    res.json(result);
  } catch (err) {
    console.error("OCR error:", err);
    res.status(500).json({ error: String(err) });
  }
});

// ── ذخیره و خواندن تنظیمات ───────────────────────────────────────────────────
const SETTINGS_FILE = path.join(__dirname, "data", "settings.json");

const readSettings = () => {
  try { return JSON.parse(fs.readFileSync(SETTINGS_FILE, "utf8")); } catch { return {}; }
};
const writeSettings = (s) => {
  fs.mkdirSync(path.dirname(SETTINGS_FILE), { recursive: true });
  fs.writeFileSync(SETTINGS_FILE, JSON.stringify(s, null, 2));
};

app.get("/api/settings/anthropic-key", (req, res) => {
  const s = readSettings();
  res.json({ key: s.anthropicKey || "" });
});

app.post("/api/settings/anthropic-key", express.json(), (req, res) => {
  const s = readSettings();
  s.anthropicKey = req.body.key || "";
  writeSettings(s);
  res.json({ ok: true });
});

// endpoint مستقیم OCR با key ذخیره‌شده
app.post("/api/ocr", async (req, res) => {
  const settings = readSettings();
  const ANTHROPIC_KEY = settings.anthropicKey || process.env.ANTHROPIC_API_KEY;
  if (!ANTHROPIC_KEY) return res.status(503).json({ error: "NO_KEY" });
  try {
    const { base64Data, mimeType } = req.body;
    const prompt = `این تصویر یک بارنامه است. تمام متن‌ها را بخوان — دست‌نویس، فارسی، انگلیسی. فقط JSON خالص بدون توضیح: {"docNumber":"","sender":"","receiver":"","date":"","items":[{"description":"شرح کالا","quantity":1,"unit":"عدد"}]}`;
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": ANTHROPIC_KEY, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({
        model: "claude-opus-4-6", max_tokens: 2000,
        messages: [{ role: "user", content: [
          { type: "image", source: { type: "base64", media_type: mimeType || "image/jpeg", data: base64Data } },
          { type: "text", text: prompt }
        ]}]
      })
    });
    const data = await response.json();
    if (data.error) return res.status(500).json({ error: data.error.message });
    const text = (data.content || []).map(c => c.text || "").join("");
    const clean = text.replace(/```json|```/g, "").trim();
    const m = clean.match(/\{[\s\S]*\}/);
    if (!m) return res.status(500).json({ error: "پاسخ JSON نبود" });
    res.json(JSON.parse(m[0]));
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

app.use(express.static(path.join(__dirname, "dist")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
