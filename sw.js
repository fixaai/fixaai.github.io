/* Service worker do Fixa aí.

   Duas caches, com regras diferentes de propósito:

   - PÁGINA (index.html e qualquer navegação): REDE primeiro, cache como reserva.
     Era cache primeiro, e isso criou uma armadilha: se um service worker antigo
     ficasse no ar, ele serviria para sempre o index guardado, e publicar código
     novo não adiantaria nada. Custa uma ida à rede ao abrir; garante que ninguém
     fica preso numa versão velha. Sem internet, usa a última cópia salva.

   - RESTO DO PROGRAMA (ícones, manifesto): cache primeiro. Quase nunca mudam.

   - BANCO (banco.json): rede primeiro, com a cache como rede de segurança.
     É o que garante o que a Isabela pediu: questão nova aparece sozinha,
     sem ninguém baixar arquivo. Sem internet, usa a última cópia salva.
*/
const VERSAO_APP   = "026qf-v03";
const VERSAO_BANCO = "684a01b441d4";
const CACHE_APP   = "fixaai-app-" + VERSAO_APP;
const CACHE_BANCO = "fixaai-banco";

const ESSENCIAIS = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon-maskable-512.png",
  "./icons/apple-touch-icon.png",
  "./icons/favicon-32.png"
];

self.addEventListener("install", e => {
  e.waitUntil((async () => {
    const c = await caches.open(CACHE_APP);
    await c.addAll(ESSENCIAIS);
    // guarda o banco já na instalação, para a primeira sessão offline funcionar
    try{
      const r = await fetch("./banco.json?v=" + VERSAO_BANCO, { cache: "no-cache" });
      if(r.ok) await (await caches.open(CACHE_BANCO)).put("./banco.json", r.clone());
    }catch(err){ /* sem rede na instalação: o app busca depois */ }
    self.skipWaiting();
  })());
});

self.addEventListener("activate", e => {
  e.waitUntil((async () => {
    const nomes = await caches.keys();
    await Promise.all(nomes
      .filter(n => n.startsWith("fixaai-app-") && n !== CACHE_APP)
      .map(n => caches.delete(n)));
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", e => {
  const req = e.request;
  if(req.method !== "GET") return;
  const url = new URL(req.url);
  if(url.origin !== self.location.origin) return;

  // ---- o banco: rede primeiro ----
  if(url.pathname.endsWith("/banco.json")){
    e.respondWith((async () => {
      try{
        const r = await fetch(req, { cache: "no-cache" });
        if(r.ok) (await caches.open(CACHE_BANCO)).put("./banco.json", r.clone());
        return r;
      }catch(err){
        const salvo = await caches.match("./banco.json");
        if(salvo) return salvo;
        throw err;
      }
    })());
    return;
  }

  // ---- a página: rede primeiro ----
  const ehPagina = req.mode === "navigate" || url.pathname.endsWith("/index.html")
                || url.pathname === "/" || url.pathname.endsWith("/");
  if(ehPagina){
    e.respondWith((async () => {
      try{
        const r = await fetch(req, { cache: "no-cache" });
        if(r.ok) (await caches.open(CACHE_APP)).put("./index.html", r.clone());
        return r;
      }catch(err){
        const salvo = await caches.match("./index.html");
        if(salvo) return salvo;
        throw err;
      }
    })());
    return;
  }

  // ---- resto do programa: cache primeiro ----
  e.respondWith((async () => {
    const salvo = await caches.match(req, { ignoreSearch: true });
    if(salvo) return salvo;
    try{
      const r = await fetch(req);
      if(r.ok && r.type === "basic") (await caches.open(CACHE_APP)).put(req, r.clone());
      return r;
    }catch(err){
      throw err;
    }
  })());
});
