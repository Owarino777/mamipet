// Browser checks against qa-blog-fixture + a Next dev server on port 3100.
// Chrome must expose a dedicated headless CDP instance on 9224.
import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
const base = "http://localhost:3100";
const targets = await (await fetch("http://127.0.0.1:9224/json")).json();
const ws = new WebSocket(
  targets.find((target) => target.type === "page").webSocketDebuggerUrl,
);
await new Promise((resolve, reject) => {
  ws.addEventListener("open", resolve, { once: true });
  ws.addEventListener("error", reject, { once: true });
});
let sequence = 0;
const pending = new Map();
const errors = [];
ws.addEventListener("message", (event) => {
  const message = JSON.parse(event.data);
  if (message.method === "Runtime.exceptionThrown")
    errors.push(message.params.exceptionDetails.text);
  if (!message.id) return;
  const call = pending.get(message.id);
  if (!call) return;
  pending.delete(message.id);
  if (message.error) call.reject(new Error(message.error.message));
  else call.resolve(message.result);
});
function send(method, params = {}) {
  return new Promise((resolve, reject) => {
    const id = ++sequence;
    const timer = setTimeout(() => {
      pending.delete(id);
      reject(new Error(`${method} timed out`));
    }, 20000);
    pending.set(id, {
      resolve: (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      reject: (reason) => {
        clearTimeout(timer);
        reject(reason);
      },
    });
    ws.send(JSON.stringify({ id, method, params }));
  });
}
async function evaluate(expression) {
  const result = await send("Runtime.evaluate", {
    expression,
    returnByValue: true,
    awaitPromise: true,
  });
  if (result.exceptionDetails) throw new Error(result.exceptionDetails.text);
  return result.result.value;
}
async function until(expression) {
  for (let attempt = 0; attempt < 120; attempt += 1) {
    if (await evaluate(expression)) return;
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error(`Not observed: ${expression}`);
}
async function navigate(path) {
  await send("Page.navigate", { url: `${base}${path}` });
  await until("document.readyState === 'complete'");
}
async function click(text) {
  await evaluate(
    `(() => { const button = [...document.querySelectorAll('button')].find(x => x.textContent.trim() === ${JSON.stringify(text)}); if (!button) throw new Error('Missing button'); button.click(); })()`,
  );
}
async function fill(selector, value) {
  await evaluate(
    `(() => { const input = document.querySelector(${JSON.stringify(selector)}); Object.getOwnPropertyDescriptor(input.tagName === 'TEXTAREA' ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype, 'value').set.call(input, ${JSON.stringify(value)}); input.dispatchEvent(new Event('input', {bubbles:true})); })()`,
  );
}
async function screenshot(name, width, height) {
  await send("Emulation.setDeviceMetricsOverride", {
    width,
    height,
    deviceScaleFactor: 1,
    mobile: width < 600,
  });
  await new Promise((resolve) => setTimeout(resolve, 300));
  const dimensions = await evaluate(
    "({width:innerWidth, scroll:document.documentElement.scrollWidth})",
  );
  assert.ok(
    dimensions.scroll <= width + 1 && dimensions.width <= width + 1,
    `${name}: horizontal overflow ${JSON.stringify(dimensions)}`,
  );
  const image = await send("Page.captureScreenshot", {
    format: "png",
    captureBeyondViewport: true,
  });
  await writeFile(
    `.qa-artifacts/${name}.png`,
    Buffer.from(image.data, "base64"),
  );
}

try {
  await mkdir(".qa-artifacts", { recursive: true });
  await send("Page.enable");
  await send("Runtime.enable");
  await send("Network.enable");
  await send("Network.clearBrowserCookies");
  await navigate("/admin/blog");
  await until("location.pathname === '/login'");
  assert.equal((await fetch(`${base}/api/admin/blog`)).status, 401);
  await screenshot("login-desktop", 1440, 900);

  const user = {
    id: "11111111-1111-4111-8111-111111111111",
    email: "editor@example.test",
    aud: "authenticated",
    role: "authenticated",
    app_metadata: {},
    user_metadata: { firstName: "Camille" },
  };
  const expiry = Math.floor(Date.now() / 1000) + 3600;
  const token = [
    Buffer.from('{"alg":"HS256","typ":"JWT"}').toString("base64url"),
    Buffer.from(
      JSON.stringify({ sub: user.id, exp: expiry, role: "authenticated" }),
    ).toString("base64url"),
    "qa-signature",
  ].join(".");
  const value =
    "base64-" +
    Buffer.from(
      JSON.stringify({
        access_token: token,
        refresh_token: "qa-refresh",
        expires_at: expiry,
        expires_in: 3600,
        token_type: "bearer",
        user,
      }),
    ).toString("base64url");
  await send("Network.setCookie", {
    name: "sb-127-auth-token",
    value,
    url: base,
    path: "/",
    sameSite: "Lax",
  });
  await navigate("/admin/dashboard");
  await until("Boolean(document.querySelector('.workspace-heading h1'))");
  await screenshot("admin-dashboard-desktop", 1440, 1000);
  await screenshot("admin-dashboard-mobile", 390, 844);
  await navigate("/admin/blog");
  await until("Boolean(document.querySelector('.blog-admin h1'))");
  await screenshot("blog-admin-list-desktop", 1440, 1000);
  await screenshot("blog-admin-list-mobile", 390, 844);
  await navigate("/admin/blog/new");
  await until("Boolean(document.querySelector('.blog-editor-fields input'))");
  await fill(".blog-fields input", "Préparer la garde de son chat");
  await fill(".blog-fields textarea", "Les bons gestes pour un départ serein.");
  await fill(
    ".blog-block textarea",
    "Préparez les habitudes de votre chat et les coordonnées utiles.",
  );
  await click("Enregistrer le brouillon");
  await until(
    "document.body.innerText.includes('Brouillon enregistré. La version publique reste inchangée.')",
  );
  const editorPath = await evaluate("location.pathname");
  assert.match(editorPath, /^\/admin\/blog\/[0-9a-f-]{36}$/);
  await screenshot("blog-editor-desktop", 1440, 1000);
  await screenshot("blog-editor-mobile", 390, 844);
  await click("Voir l’aperçu");
  await until("Boolean(document.querySelector('.blog-article h1'))");
  await screenshot("blog-preview-mobile", 390, 844);
  await click("Publier l’article");
  await until("document.body.innerText.includes('Article publié.')");
  const publicPath = await evaluate(
    "document.querySelector('a[target=\"_blank\"]').getAttribute('href')",
  );
  await navigate(publicPath);
  await until(
    "Boolean(document.querySelector('script[type=\"application/ld+json\"]'))",
  );
  assert.equal(
    await evaluate("document.querySelector('h1').textContent"),
    "Préparer la garde de son chat",
  );
  assert.ok(
    (
      await evaluate("document.querySelector('link[rel=canonical]').href")
    ).endsWith(publicPath),
  );
  await screenshot("blog-article-mobile", 390, 844);
  await screenshot("blog-article-desktop", 1440, 1000);
  await navigate("/blog");
  await until("Boolean(document.querySelector('.blog-card'))");
  await screenshot("blog-list-mobile", 390, 844);
  await screenshot("blog-list-desktop", 1440, 1000);
  assert.ok(
    (await (await fetch(`${base}/sitemap.xml`)).text()).includes(publicPath),
  );
  await navigate(editorPath);
  await until("Boolean(document.querySelector('.blog-editor-fields input'))");
  await fill(".blog-fields input", "Révision privée");
  await click("Enregistrer le brouillon");
  await until(
    "document.body.innerText.includes('Brouillon enregistré. La version publique reste inchangée.')",
  );
  assert.ok(
    (await (await fetch(`${base}${publicPath}`)).text()).includes(
      "Préparer la garde de son chat",
    ),
  );
  assert.ok(
    !(await (await fetch(`${base}${publicPath}`)).text()).includes(
      "Révision privée",
    ),
  );
  await evaluate("window.confirm = () => true");
  await click("Retirer du site");
  await until("document.body.innerText.includes('Article retiré du site.')");
  assert.ok(
    !(await (await fetch(`${base}/sitemap.xml`)).text()).includes(publicPath),
  );
  await navigate(publicPath);
  await until(
    "document.body.innerText.includes('404') || document.body.innerText.includes('introuvable')",
  );
  assert.deepEqual(errors, []);
  await send("Network.clearBrowserCookies");
  await navigate("/pet-sitters");
  await until("Boolean(document.querySelector('.maplibregl-canvas, .maplibre-map-shell--fallback'))");
  await screenshot("search-map-desktop", 1440, 1000);
  console.log("Map smoke check:", await evaluate("document.querySelector('.maplibregl-canvas') ? 'WebGL canvas mounted' : 'map fallback displayed'"));
  console.log(
    "PASS: admin guard, draft, save, preview, publish, SEO, mobile/desktop overflow, private revisions and withdrawal. Fixture only; Supabase deployment is not tested.",
  );
} finally {
  ws.close();
}
