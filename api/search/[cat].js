LINEスタンプ 個別URL一覧
スタンプセットIDを入力すると、各スタンプの個別ID・静止画URL・アニメーションURLを一覧化します。　高度な設定 ↓

キーワードで検索
例: ねこ、あいさつ、敬語

すべての種類
検索
すべて
スタンプ
絵文字
着せかえ
スタンプ／絵文字のセットID または LINE STORE URL
例: 15497 または https://store.line.me/emojishop/product/（ID）/ja
画像一覧を取得
最初にメタデータの取得を試します。ブラウザ側のCORS制限で失敗する場合は、ページ下部の「高度な設定」にある貼り付け欄を使用してください。
取得結果
お気に入り
履歴
「画像一覧を取得」または検索結果の選択で、ここに画像一覧が表示されます。

アニメーション変換（APNG → GIF / WebP）
アニメーションURLのAPNGは、画像アプリやLINEの画像送信では静止画になります。一般的な形式に変換して保存します。GIFは透過が1bit（半透明は不可）、WebPはChromeなどWebPエンコード対応ブラウザで利用できます。CORSで取得できない場合は、保存済みのAPNGファイルを選択してください。


GIF
一覧をまとめて保存（ZIP・ボイス含む）
手元のAPNGを変換…
使用しているURL形式
静止画: /iPhone/sticker@2x.png
アニメーション: /iPhone/sticker_animation@2x.png?v=1

このページはLINEの公式APIではなく、公開されているLINE CDNのメタデータ形式を利用します。取得できない場合は、ネットワーク制限・CORS・配信仕様変更などが考えられます。

検索はLINE STOREの非公式な検索APIを使います。ブラウザから直接取得できない場合は、公開されている第三者のプロキシ（Hugging Face Space）を経由します。その場合、検索キーワードがそのサーバーに送られます。ただしこのサーバーは日本国外にあるため、日本国内限定の公式スタンプなどは出ません。出したい場合は、下の「日本の一覧で検索する」で自分用の中継を設定してください。

⚙ 高度な設定
高度な設定
閉じる
一覧のエクスポート（CSV保存・URL一覧コピー）
日本の一覧で検索する（自分用の検索中継を設定）
初期設定では https://linestickerurllist.vercel.app の中継が使われます。無料枠を超えるなどして使えなくなった場合は、自動的に第三者のプロキシに切り替わります（その場合、日本限定の公式スタンプは出ません）。

LINE STOREは接続元の国で商品一覧が変わります。日本で動く小さな中継を自分で用意し、そのURLを下に入力すると、日本の一覧（公式の日本限定スタンプを含む）で検索できます。方法A: Cloudflare Workers（無料。Workers & Pages → Create → Hello World → Edit code に貼り付け → Deploy。表示されたURLを入力）。方法C: Vercel（東京。スマホ可）。方法B: 自分のPCで動かす（保存して python proxy.py を実行し、http://127.0.0.1:8787 を入力。Chromeで許可を求められたら許可）。

中継URL
https://linestickerurllist.vercel.app
保存
方法A: Cloudflare Workersのコード

export default {
  async fetch(req) {
    const cors = {"Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "*"};
    if (req.method === "OPTIONS") return new Response(null, {headers: cors});
    const u = new URL(req.url);
    if (!u.pathname.startsWith("/api/search/")) return new Response("not found", {status: 404, headers: cors});
    const r = await fetch("https://store.line.me" + u.pathname + u.search, {headers: {"Accept-Language": "ja-JP,ja;q=0.9", "User-Agent": "Mozilla/5.0"}});
    return new Response(r.body, {status: r.status, headers: {...cors, "Content-Type": "application/json"}});
  }
};
コードをコピー
方法B: proxy.py

import http.server, urllib.request

class H(http.server.BaseHTTPRequestHandler):
    def cors(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Headers", "*")
        self.send_header("Access-Control-Allow-Private-Network", "true")

    def do_OPTIONS(self):
        self.send_response(204); self.cors(); self.end_headers()

    def do_GET(self):
        if not self.path.startswith("/api/search/"):
            self.send_response(404); self.cors(); self.end_headers(); return
        req = urllib.request.Request("https://store.line.me" + self.path,
            headers={"Accept-Language": "ja-JP,ja;q=0.9", "User-Agent": "Mozilla/5.0"})
        try:
            body, code = urllib.request.urlopen(req).read(), 200
        except Exception as e:
            body, code = str(e).encode(), 502
        self.send_response(code); self.cors()
        self.send_header("Content-Type", "application/json"); self.end_headers()
        self.wfile.write(body)

http.server.HTTPServer(("127.0.0.1", 8787), H).serve_forever()
コードをコピー
方法C: Vercel（東京リージョン）。スマホだけでも設定できます。GitHubに新しいリポジトリを作り、次の2つのファイルを追加します（ファイル名は vercel.json と api/search/[cat].js。GitHubのファイル名欄に「api/search/[cat].js」と入力するとフォルダも作られます）。VercelのAdd New → ProjectでそのリポジトリをImportしてDeployし、発行された xxxx.vercel.app のURLを上の中継URLに入力します。ログインを求められる場合は、Settings → Deployment ProtectionでVercel Authenticationをオフにしてください。関連作品・おすすめを使うには、api/search/[cat].js を、下の最新のコードに貼り替えて保存（Commit）してください（Vercelが自動で更新されます）。

{
  "regions": ["hnd1"]
}
vercel.json をコピー
module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "*");
  if (req.method === "OPTIONS") return res.status(204).end();
  const u = new URL(req.url, "http://localhost");
  const cat = u.pathname.split("/").pop();
  const headers = { "Accept-Language": "ja-JP,ja;q=0.9", "User-Agent": "Mozilla/5.0" };
  if (cat === "product") {
    const emoji = u.searchParams.get("kind") === "emoji";
    const kind = emoji ? "emojishop" : "stickershop";
    const id = (u.searchParams.get("id") || "").replace(/[^0-9a-f]/gi, "");
    if (!id) return res.status(400).send("bad id");
    const html = await (await fetch("https://store.line.me/" + kind + "/product/" + id + "/ja", { headers })).text();
    const dec = (x) => x.replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">");
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
    return res.status(200).send(JSON.stringify({ id, kind: emoji ? "emoji" : "sticker", author: am ? { id: am[1], name: dec(am[2]) } : null, others, related }));
  }
  if (!["sticker", "emoji", "theme", "family"].includes(cat)) return res.status(404).send("not found");
  const r = await fetch("https://store.line.me/api/search/" + cat + u.search, { headers });
  res.status(r.status).setHeader("Content-Type", "application/json");
  res.send(await r.text());
};
api/search/[cat].js をコピー
検索結果の生データ（表示がおかしいときの確認用）
メタデータJSONを手動で貼り付ける（自動取得できない場合）
⚙
