import { json } from "micro"; // JSON parser for Vercel

const BOT_TOKEN = "8421330750:AAFqmjmoDeGpzJ9mA7OQw10u1665mfS1W08";
const SHEET_CSV =
  "https://docs.google.com/spreadsheets/d/1nyKuHyNzCh1jalUnrN_TVYRYvNptYklY6MAedLw5Lwk/export?format=tsv";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(200).send("OK");

  const update = await json(req); // parse Telegram JSON
  const msg = update.message;
  const chatId = msg?.chat?.id;
  let text = msg?.text || "";

  // ---------- Slash Commands ----------
  if (text === "/help") {
    await send(
      chatId,
      `🚌 Yangon YBS Guide Bot

📌 Usage:
/route ဆူးလေ to လှည်းတန်း
or
ဆူးလေ to လှည်းတန်း

📍 Location share → nearest stop`
    );
    return res.end();
  }

  if (text.startsWith("/route")) text = text.replace("/route", "").trim();

  // ---------- Location (Nearest Stop) ----------
  if (msg?.location) {
    const { latitude, longitude } = msg.location;
    const rows = await loadSheet();
    const stop = nearestStop(latitude, longitude, rows);
    await send(
      chatId,
      `📍 Nearest Stop\n🚌 ${stop[3] || stop[4]}\n🗺 ${mapLink(
        stop[9],
        stop[10]
      )}`
    );
    return res.end();
  }

  if (!text.includes("to")) {
    await send(chatId, "❌ Format မှားပါတယ်\nဥပမာ: ဆူးလေ to လှည်းတန်း");
    return res.end();
  }

  const [fromRaw, toRaw] = text.split("to");
  const from = normalize(fromRaw);
  const to = normalize(toRaw);

  const rows = await loadSheet();
  const fromStops = [];
  const toStops = [];

  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    if (normalize(r[3]) === from || normalize(r[4]) === from) fromStops.push(r);
    if (normalize(r[3]) === to || normalize(r[4]) === to) toStops.push(r);
  }

  let reply = `📍 ${fromRaw.trim()} ➜ ${toRaw.trim()}\n\n`;

  // ---------- Direct Route ----------
  const direct = [];
  for (const f of fromStops) {
    for (const t of toStops) {
      if (f[0] === t[0] && Number(f[1]) < Number(t[1])) direct.push(f);
    }
  }

  if (direct.length) {
    reply += "✅ တစ်ဆင့်တည်း\n";
    direct.forEach(d => {
      reply += `🚌 Bus ${d[0]}\n🗺 ${mapLink(d[9], d[10])}\n`;
    });
    await send(chatId, reply);
    return res.end();
  }

  // ---------- Transfer Route ----------
  const transfers = [];
  for (const f of fromStops) {
    for (const mid of rows) {
      if (mid[0] !== f[0]) continue;
      if (Number(mid[1]) <= Number(f[1])) continue;

      for (const t of toStops) {
        if (mid[2] === t[2] && mid[0] !== t[0] && Number(mid[1]) < Number(t[1])) {
          transfers.push({
            busA: f[0],
            busB: t[0],
            stop: mid[3] || mid[4],
            lat: mid[9],
            lng: mid[10],
          });
        }
      }
    }
  }

  if (!transfers.length) {
    reply += "❌ Route မတွေ့ပါ";
  } else {
    reply += "🔁 နှစ်ဆင့်သွားရပါမယ်\n";
    transfers.forEach(t => {
      reply += `🚌 Bus ${t.busA} ➜ Bus ${t.busB}\n📌 Transfer: ${t.stop}\n🗺 ${mapLink(
        t.lat,
        t.lng
      )}\n\n`;
    });
  }

  await send(chatId, reply);
  res.end();
}

// ================= HELPERS =================
async function loadSheet() {
  const tsv = await fetch(SHEET_CSV).then(r => r.text());
  return tsv.split("\n").map(r => r.split("\t")); // TSV safe
}

function normalize(text = "") {
  return text
    .replace(/ဈေး|မှတ်တိုင်/g, "")
    .replace(/\s/g, "")
    .toLowerCase()
    .trim();
}

function mapLink(lat, lng) {
  return `https://www.google.com/maps?q=${lat},${lng}`;
}

function distance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

function nearestStop(lat, lng, rows) {
  let min = Infinity,
    nearest = null;
  for (let i = 1; i < rows.length; i++) {
    const d = distance(lat, lng, rows[i][9], rows[i][10]);
    if (d < min) {
      min = d;
      nearest = rows[i];
    }
  }
  return nearest;
}

async function send(chatId, text) {
  await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text }),
  });
}
