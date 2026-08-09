// Gas Records Sync — stores the app's certificate/job records in Netlify Blobs
// so reminder automation (running outside the browser) can read due dates
// and contact details without needing the user's device to be online.
//
// POST  -> saves the full "records" array sent by the app (called automatically
//          whenever a job is saved in the app).
// GET   -> returns the stored records array (used by the reminder automation).
//
// Both methods require a matching `x-api-key` header (value comes from the
// VITE_SYNC_KEY environment variable configured in the Netlify site settings).

const { getStore, connectLambda } = require("@netlify/blobs");

exports.handler = async (event) => {
  // This function uses the classic ("Lambda compatibility") handler style,
  // which does not auto-populate the Netlify Blobs environment. connectLambda
  // wires it up manually using the incoming request event.
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
    if (event.httpMethod === "POST") {
      const body = JSON.parse(event.body || "{}");
      const records = Array.isArray(body.records) ? body.records : [];
      // Refuse to overwrite existing data with an empty array unless explicitly
      // forced — protects against a fresh browser/device wiping everyone's data.
      if (records.length === 0 && !body.force) {
        const existing = await store.get("records", { type: "json" });
        if (existing && Array.isArray(existing.records) && existing.records.length > 0) {
          return {
            statusCode: 409,
            headers,
            body: JSON.stringify({ error: "Refusing to overwrite existing records with an empty array. Pass force:true to override." }),
          };
        }
      }
      await store.setJSON("records", { records, updatedAt: new Date().toISOString() });
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ message: "Saved", count: records.length }),
      };
    }

    if (event.httpMethod === "GET") {
      const data = await store.get("records", { type: "json" });
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(data || { records: [], updatedAt: null }),
      };
    }

    return { statusCode: 405, headers, body: JSON.stringify({ error: "Method not allowed" }) };
  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};
