
import { createClient } from "@libsql/client";

const TURSO_URL = "libsql://ybs-hidecatd.aws-ap-northeast-1.turso.io";
const TURSO_TOKEN = "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3ODE4NDUwMjgsImlkIjoiMDE5ZWRlM2QtMzYwMS03YzA2LWFjNDctMzMwMWRmMzNkZjg0IiwicmlkIjoiNTViMzFlZTktMjI5YS00Nzc5LTg2MTAtNzkxOWY0ZWM5ODJmIn0.UOUB-skCOmLkstLAWHtCSfywb5VO1k2K7W0eubSdmLynhIo8wV1b6hsMviACBd2o6sKBL2vbogkRr73kAC-wDg";

const client = createClient({
  url: TURSO_URL,
  authToken: TURSO_TOKEN,
});

export async function initDb() {
  await client.execute(`
    CREATE TABLE IF NOT EXISTS ybs_live_status (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      bus_id TEXT NOT NULL,
      station_name TEXT NOT NULL,
      status_type TEXT NOT NULL, -- 'delayed', 'normal', 'crowded'
      user_feedback TEXT,         -- ရင်ဖွင့်စာသား (ရှိလျှင်)
      reported_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
}

export async function saveLiveStatus(busId, stationName, statusType, feedback = "") {
  await client.execute({
    sql: "INSERT INTO ybs_live_status (bus_id, station_name, status_type, user_feedback) VALUES (?, ?, ?, ?)",
    args: [busId, stationName, statusType, feedback],
  });
}

export async function getRecentLiveStatus(busId, minutes = 30) {
  const result = await client.execute({
    sql: `SELECT * FROM ybs_live_status 
          WHERE bus_id = ? 
          AND reported_at >= datetime('now', '-' || ? || ' minutes')
          ORDER BY reported_at DESC LIMIT 1`,
    args: [busId, minutes],
  });
  return result.rows[0];
}

export default client;
