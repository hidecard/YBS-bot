// Vercel + Node.js 18+ supports native fetch, no need for node-fetch
import { json } from "micro"; // parse JSON body

const BOT_TOKEN = "8421330750:AAFqmjmoDeGpzJ9mA7OQw10u1665mfS1W08";
const SHEET_CSV =
  "https://docs.google.com/spreadsheets/d/1nyKuHyNzCh1jalUnrN_TVYRYvNptYklY6MAedLw5Lwk/export?format=tsv";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(200).send("OK");

  const update = await json(req);
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
      `📍 Nearest Stop\n🚌 ${stop.name_mm || stop.name_en}\n🗺 ${mapLink(
        stop.lat,
        stop.lng
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

  const fromStops = rows.filter(
    (r) => normalize(r.name_en) === from || normalize(r.name_mm) === from
  );
  const toStops = rows.filter(
    (r) => normalize(r.name_en) === to || normalize(r.name_mm) === to
  );

  let reply = `📍 ${fromRaw.trim()} ➜ ${toRaw.trim()}\n\n`;

  // ---------- Direct Route ----------
  const direct = [];
  for (const f of fromStops) {
    for (const t of toStops) {
      if (f.service_name === t.service_name && Number(f.sequence) < Number(t.sequence))
        direct.push(f);
    }
  }

  if (direct.length) {
    reply += "✅ တစ်ဆင့်တည်း\n";
    direct.forEach((d) => {
      reply += `🚌 Bus ${d.service_name}\n🗺 ${mapLink(d.lat, d.lng)}\n`;
    });
    await send(chatId, reply);
    return res.end();
  }

  // ---------- Transfer Route ----------
  const transfers = [];
  for (const f of fromStops) {
    for (const mid of rows) {
      if (mid.service_name !== f.service_name) continue;
      if (Number(mid.sequence) <= Number(f.sequence)) continue;

      for (const t of toStops) {
        if (mid.bus_stop_id === t.bus_stop_id && mid.service_name !== t.service_name && Number(mid.sequence) < Number(t.sequence)) {
          transfers.push({
            busA: f.service_name,
            busB: t.service_name,
            stop: mid.name_mm || mid.name_en,
            lat: mid.lat,
            lng: mid.lng,
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
      reply += `🚌 Bus ${t.busA} ➜ Bus ${t.busB}\n📌 Transfer: ${t.stop}\n🗺 ${mapLink(t.lat, t.lng)}\n\n`;
    });
  }

  await send(chatId, reply);
  res.end();
}

// ================= HELPERS =================

async function loadSheet() {
  const tsv = await fetch(SHEET_CSV).then((r) => r.text());
  const rows = tsv
    .split("\n")
    .filter((r) => r.trim())
    .map((r) => {
      const [
        service_name,
        sequence,
        bus_stop_id,
        name_en,
        name_mm,
        road_en,
        road_mm,
        township_en,
        township_mm,
        lat,
        lng,
      ] = r.split("\t");
      return { service_name, sequence, bus_stop_id, name_en, name_mm, road_en, road_mm, township_en, township_mm, lat, lng };
    });
  return rows;
}

function normalize(text = "") {
  return text.replace(/ဈေး|မှတ်တိုင်/g, "").replace(/\s/g, "").toLowerCase().trim();
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
  for (const r of rows) {
    const d = distance(lat, lng, r.lat, r.lng);
    if (d < min) {
      min = d;
      nearest = r;
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
