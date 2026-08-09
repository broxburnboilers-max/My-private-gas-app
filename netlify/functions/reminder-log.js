// Reminder Log — tracks which due-date reminders have already been sent,
// so the daily automation never messages the same customer twice for the
// same certificate/service due date.
//
// GET  -> returns the full list of sent reminder keys.
// POST -> appends new keys to the list (body: { keys: ["...", "..."] }).
//
// Protected by the same x-api-key as gas-records.js.

const { getStore, connectLambda } = require("@netlify/blobs");

exports.handler = async (event) => {
  connectLambda(event);

  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, x-api-key",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Content-Type": "application/json",
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }

  const expectedKey = process.env.VITE_SYNC_KEY;
  const providedKey = event.headers["x-api-key"] || event.headers["X-Api-Key"];

  if (!expectedKey || providedKey !== expectedKey) {
    return { statusCode: 401, headers, body: JSON.stringify({ error: "Unauthorized" }) };
  }

  const store = getStore("gas-app-data");

  try {
    if (event.httpMethod === "GET") {
      const data = await store.get("reminder-log", { type: "json" });
      return { statusCode: 200, headers, body: JSON.stringify({ keys: (data && data.keys) || [] }) };
    }

    if (event.httpMethod === "POST") {
      const body = JSON.parse(event.body || "{}");
      const newKeys = Array.isArray(body.keys) ? body.keys : [];
      const existing = await store.get("reminder-log", { type: "json" });
      const merged = Array.from(new Set([...((existing && existing.keys) || []), ...newKeys]));
      await store.setJSON("reminder-log", { keys: merged, updatedAt: new Date().toISOString() });
      return { statusCode: 200, headers, body: JSON.stringify({ message: "Logged", count: merged.length }) };
    }

    return { statusCode: 405, headers, body: JSON.stringify({ error: "Method not allowed" }) };
  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};
