// api/bot.js
import fetch from "node-fetch";
import { json } from "micro";

const BOT_TOKEN = "8421330750:AAFqmjmoDeGpzJ9mA7OQw10u1665mfS1W08";
const SHEET_CSV =
  "https://docs.google.com/spreadsheets/d/1nyKuHyNzCh1jalUnrN_TVYRYvNptYklY6MAedLw5Lwk/export?format=tsv";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(200).send("OK");

  const update = await json(req);
  const msg = update.message;
  const chatId = msg?.chat?.id;
  let text = msg?.text || "";

  if (!chatId) return res.end();

  // ---------- Slash Commands ----------
  if (text === "/help") {
    await send(
      chatId,
      `🚌 Yangon YBS Guide Bot

📌 Usage:
/route ဆူးလေ to လှည်းတန်း
or
ဆူးလေ to လှည်းတန်း`
    );
    return res.end();
  }

  if (text.startsWith("/route")) text = text.replace("/route", "").trim();

  // ---------- Route Search ----------
  if (!text.includes("to")) {
    await send(chatId, "❌ Format မှားပါတယ်\nဥပမာ: ဆူးလေ to လှည်းတန်း");
    return res.end();
  }

  const [fromRaw, toRaw] = text.split("to");
  const from = normalize(fromRaw);
  const to = normalize(toRaw);

  const rows = await loadSheet();
  const fromStops = rows.filter((r) => fuzzyMatch(r.name_mm, from));
  const toStops = rows.filter((r) => fuzzyMatch(r.name_mm, to));

  let reply = `📍 ${fromRaw.trim()} ➜ ${toRaw.trim()}\n\n`;

  // ---------- Direct Route ----------
  const direct = [];
  for (const f of fromStops) {
    for (const t of toStops) {
      if (f.service_name === t.service_name && f.sequence < t.sequence) direct.push(f);
    }
  }

  if (direct.length) {
    reply += "✅ တစ်ဆင့်တည်း\n";
    direct.forEach((d) => {
      reply += `🚌 Bus ${d.service_name}\n`;
    });
    await send(chatId, reply);
    return res.end();
  }

  // ---------- Transfer Route ----------
  const transfers = [];
  for (const f of fromStops) {
    for (const mid of rows) {
      if (mid.service_name !== f.service_name || mid.sequence <= f.sequence) continue;

      for (const t of toStops) {
        if (mid.bus_stop_id === t.bus_stop_id && mid.service_name !== t.service_name && mid.sequence < t.sequence) {
          transfers.push({
            busA: f.service_name,
            busB: t.service_name,
            stop: mid.name_mm || mid.name_en,
          });
        }
      }
    }
  }

  if (!transfers.length) {
    reply += "❌ Route မတွေ့ပါ";
  } else {
    reply += "🔁 နှစ်ဆင့်သွားရပါမယ်\n";
    transfers.forEach((t) => {
      reply += `🚌 Bus ${t.busA} ➜ Bus ${t.busB}\n📌 Transfer: ${t.stop}\n\n`;
    });
  }

  await send(chatId, reply);
  res.end();
}

// ================= HELPERS =================
async function loadSheet() {
  const tsv = await fetch(SHEET_CSV).then((r) => r.text());
  const lines = tsv.split("\n");
  const header = lines[0].split("\t");

  return lines.slice(1).map((line) => {
    const cols = line.split("\t");
    const obj = {};
    header.forEach((h, i) => (obj[h] = cols[i]));
    obj.sequence = Number(obj.sequence);
    return obj;
  });
}

function normalize(text = "") {
  return text.replace(/\s/g, "").toLowerCase().trim();
}

function fuzzyMatch(a, b) {
  if (!a || !b) return false;
  a = normalize(a);
  b = normalize(b);
  return a.includes(b) || b.includes(a);
}

async function send(chatId, text) {
  await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text }),
  });
}
