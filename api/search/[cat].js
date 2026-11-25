module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "*");
  if (req.method === "OPTIONS") return res.status(204).end();
  try {
    const u = new URL(req.url, "http://localhost");
    const cat = u.pathname.split("/").pop();
    const headers = { "Accept-Language": "ja-JP,ja;q=0.9", "User-Agent": "Mozilla/5.0" };
    const get = async (url) => {
      const ac = new AbortController();
      const tm = setTimeout(() => ac.abort(), 9000);
      try { return await fetch(url, { headers, signal: ac.signal }); } finally { clearTimeout(tm); }
    };
    if (cat === "product") {
      const emoji = u.searchParams.get("kind") === "emoji";
      const kind = emoji ? "emojishop" : "stickershop";
      const id = (u.searchParams.get("id") || "").replace(/[^0-9a-f]/gi, "");
      if (!id) return res.status(400).send("bad id");
      const html = await (await get("https://store.line.me/" + kind + "/product/" + id + "/ja")).text();
      const dec = (x) => x.replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">");
      const metas = html.match(/<meta\b[^>]*>/g) || [];
      const metaContent = (key) => { for (const t of metas) { if (new RegExp('(?:property|name)="' + key + '"', "i").test(t)) { const c = t.match(/\bcontent="([^"]*)"/); if (c) return dec(c[1]); } } return ""; };
      const description = metaContent("og:description") || metaContent("description");
      const am = html.match(/\/(?:stickershop|emojishop|themeshop)\/author\/(\d+)\/ja[^>]*>\s*([^<]+?)\s*</);
      const iRel = html.search(/>\s*関連(スタンプ|絵文字)\s*</);
      const iOth = html.search(/>[^<]*の他の作品\s*</);
      const parse = (seg) => {
        const out = [], seen = new Set();
        const re = /(<a\b[^>]*href="[^"]*\/(stickershop|emojishop)\/product\/([0-9a-f]+)\/ja\?from=[^"]*"[^>]*>)([\s\S]*?)<\/a>/g;
        let m;
        while ((m = re.exec(seg))) {
          if (m[3] === id || seen.has(m[3])) continue;
          seen.add(m[3]);
          const t = (m[1].match(/\btitle="([^"]*)"/) || [])[1] || m[4].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
          out.push({ id: m[3], kind: m[2] === "emojishop" ? "emoji" : "sticker", title: dec(t), sound: /Sound/i.test(m[4]), anim: /Animation/i.test(m[4]) });
        }
        return out;
      };
      const others = iOth >= 0 ? parse(html.slice(iOth, iRel > iOth ? iRel : undefined)) : [];
      const related = iRel >= 0 ? parse(html.slice(iRel)) : [];
      res.setHeader("Content-Type", "application/json");
      return res.status(200).send(JSON.stringify({ id, kind: emoji ? "emoji" : "sticker", description, author: am ? { id: am[1], name: dec(am[2]) } : null, others, related }));
    }
    if (!["sticker", "emoji", "theme", "family"].includes(cat)) return res.status(404).send("not found");
    const r = await get("https://store.line.me/api/search/" + cat + u.search);
    res.setHeader("Content-Type", "application/json");
    return res.status(r.status).send(await r.text());
  } catch (e) {
    res.setHeader("Content-Type", "application/json");
    const why = (e && e.cause && (e.cause.code || e.cause.message)) || (e && e.message) || String(e);
    return res.status(502).send(JSON.stringify({ error: String(why) }));
  }
};
