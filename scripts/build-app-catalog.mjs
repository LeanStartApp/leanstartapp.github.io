import fs from "node:fs";
import vm from "node:vm";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const { apps, groups } = vm.runInNewContext(fs.readFileSync(path.join(root, "js/apps.js"), "utf8") + ";({apps: APPS, groups: APP_GROUPS})");
const esc = (value) => String(value).replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]);
const link = (app, campaign) => {
  const url = new URL(app.url);
  if (!url.searchParams.get("referrer")) {
    url.searchParams.set("referrer", new URLSearchParams({ utm_source: "leanstart_hub", utm_medium: "website", utm_campaign: campaign }).toString());
  }
  return esc(url.href);
};
const drawer = apps.map((app) => `<a class="drawer-item" data-app-slug="${esc(app.slug)}" data-play-campaign="home_drawer" href="${link(app, "home_drawer")}" target="_blank" rel="noopener"><span class="ico"><img src="${esc(app.icon)}" alt="" width="62" height="62" loading="lazy"></span><span class="lbl">${esc(app.name)}</span></a>`).join("\n");
let number = 0;
const catalog = groups.map((group) => {
  const members = apps.filter((app) => app.group === group.id);
  const rows = members.map((app) => {
    number += 1;
    return `<a class="proc-row" data-app-slug="${esc(app.slug)}" data-play-campaign="home_catalog" href="${link(app, "home_catalog")}" target="_blank" rel="noopener"><span class="proc-no">${String(number).padStart(2, "0")}</span><span class="proc-ico"><img src="${esc(app.icon)}" alt="" width="36" height="36" loading="lazy"></span><span><span class="proc-name">${esc(app.name)}</span><span class="proc-slug">${esc(app.fn)}</span></span><span class="proc-desc">${esc(app.desc)}</span><span class="proc-rating">${app.rating ? esc(app.rating) + "★" : "new"}</span><span class="proc-open">open <span class="arr">↗</span></span></a>`;
  }).join("\n");
  return `<div class="app-group"><div class="group-slug"># ${esc(group.title)} — ${members.length}</div><div>${rows}</div></div>`;
}).join("\n");
let html = fs.readFileSync(path.join(root, "index.html"), "utf8");
for (const [marker, rendered] of [["app-drawer", drawer], ["app-catalog", catalog]]) {
  const pattern = new RegExp(`<!-- ${marker}:start -->[\\s\\S]*?<!-- ${marker}:end -->`);
  if (!pattern.test(html)) throw new Error(`Missing ${marker} markers`);
  html = html.replace(pattern, () => `<!-- ${marker}:start -->\n${rendered}\n<!-- ${marker}:end -->`);
}
fs.writeFileSync(path.join(root, "index.html"), html);
console.log(`Rendered ${apps.length} products in initial HTML.`);
