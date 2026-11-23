module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "*");
  if (req.method === "OPTIONS") return res.status(204).end();
  const u = new URL(req.url, "http://localhost");
  const cat = u.pathname.split("/").pop();
  if (!["sticker", "emoji", "theme", "family"].includes(cat)) return res.status(404).send("not found");
  const r = await fetch("https://store.line.me/api/search/" + cat + u.search, {
    headers: { "Accept-Language": "ja-JP,ja;q=0.9", "User-Agent": "Mozilla/5.0" },
  });
  res.status(r.status).setHeader("Content-Type", "application/json");
  res.send(await r.text());
};
