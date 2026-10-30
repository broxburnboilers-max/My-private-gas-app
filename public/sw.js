// Service worker: only used to receive contacts shared from the phone's
// Contacts app (Share -> Gas App). It does NOT cache the app, so new
// deploys always load straight away.
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  if (event.request.method === "POST" && url.pathname === "/share-contact") {
    event.respondWith((async () => {
      let text = "";
      try {
        const form = await event.request.formData();
        const files = form.getAll("contact");
        for (const f of files) { if (f && typeof f.text === "function") text += (await f.text()) + "\n"; }
        if (!text.trim()) text = [form.get("title"), form.get("text")].filter(Boolean).join("\n");
      } catch (e) {}
      const cache = await caches.open("shared-contact");
      await cache.put("/__shared-contact", new Response(JSON.stringify({ text, t: Date.now() }), { headers: { "Content-Type": "application/json" } }));
      return Response.redirect("/?shared-contact=1", 303);
    })());
  }
});
