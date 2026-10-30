// Contact relay for the "Gas Contacts" Android helper app.
// The web app makes a random one-time id, opens gascontacts://pick?id=ID,
// the helper POSTs the chosen contact here, and the web app GETs it back
// (the entry is deleted on read and ignored after 15 minutes).
const { getStore, connectLambda } = require("@netlify/blobs");

exports.handler = async (event) => {
  connectLambda(event);
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Content-Type": "application/json",
    "Cache-Control": "no-store",
  };
  if (event.httpMethod === "OPTIONS") return { statusCode: 200, headers, body: "" };
  const store = getStore("contact-relay");
  const okId = (v) => typeof v === "string" && /^[a-f0-9]{32}$/.test(v);
  try {
    if (event.httpMethod === "POST") {
      const body = JSON.parse(event.body || "{}");
      if (!okId(body.id) || !body.contact) return { statusCode: 400, headers, body: JSON.stringify({ error: "bad request" }) };
      const json = JSON.stringify({ t: Date.now(), contact: body.contact });
      if (json.length > 20000) return { statusCode: 413, headers, body: "{}" };
      await store.set(body.id, json);
      return { statusCode: 200, headers, body: JSON.stringify({ ok: true }) };
    }
    if (event.httpMethod === "GET") {
      const id = (event.queryStringParameters || {}).id;
      if (!okId(id)) return { statusCode: 400, headers, body: JSON.stringify({ error: "bad id" }) };
      const raw = await store.get(id);
      if (!raw) return { statusCode: 200, headers, body: JSON.stringify({ pending: true }) };
      await store.delete(id);
      const v = JSON.parse(raw);
      if (Date.now() - v.t > 15 * 60e3) return { statusCode: 200, headers, body: JSON.stringify({ pending: true }) };
      return { statusCode: 200, headers, body: JSON.stringify({ contact: v.contact }) };
    }
    return { statusCode: 405, headers, body: "{}" };
  } catch (e) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: String(e && e.message) }) };
  }
};
