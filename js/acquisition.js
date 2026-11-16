/* Play link attribution and website outbound events. */
(function () {
  "use strict";
  var config = window.LEANSTART_MEASUREMENT || {};
  var storageKey = "leanstart-entry-v1";
  var now = Date.now();
  var locationUrl = new URL(window.location.href);
  var diagnostic = locationUrl.searchParams.get("measurement_debug") === "1";

  function label(value) {
    return String(value || "").replace(/[^a-zA-Z0-9._/-]/g, "_").slice(0, 100);
  }
  function campaignLabel(value) {
    return /^[a-zA-Z0-9._-]{1,64}$/.test(value || "") ? value : "other_tagged";
  }
  function externalHost(value) {
    try {
      var url = new URL(value);
      return /^https?:$/.test(url.protocol) && url.origin !== locationUrl.origin ? url.hostname.toLowerCase() : "";
    } catch (_) { return ""; }
  }
  function readEntry() {
    var source = locationUrl.searchParams.get("utm_source");
    var host = externalHost(document.referrer);
    var entry;
    if (source) {
      var medium = locationUrl.searchParams.get("utm_medium");
      entry = { source: campaignLabel(source), medium: medium ? campaignLabel(medium) : "unknown", basis: "utm" };
    } else if (host) {
      entry = { source: host, medium: "referral", basis: "referrer_host" };
      if (host === "chatgpt.com" || host.endsWith(".chatgpt.com") || host === "chat.openai.com") {
        entry.source = "chatgpt.com";
      } else if (/(^|\.)google\.[a-z.]+$/.test(host)) {
        entry.source = "google";
        entry.medium = locationUrl.searchParams.has("gclid") ? "paid_link" : "search_referral";
      }
    }
    if (!entry) {
      try {
        var saved = JSON.parse(window.sessionStorage.getItem(storageKey));
        if (saved && now - saved.seenAt < 30 * 60 * 1000) entry = saved;
      } catch (_) {}
    }
    if (!entry) entry = { source: "unknown", medium: "unknown", basis: "unavailable" };
    if (!entry.path) entry.path = locationUrl.pathname.slice(0, 100);
    entry.seenAt = now;
    try { window.sessionStorage.setItem(storageKey, JSON.stringify(entry)); } catch (_) {}
    return entry;
  }
  var entry = readEntry();

  if (config.enabled && /^G-[A-Z0-9]+$/.test(config.measurementId || "")) {
    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
    window.gtag("js", new Date());
    window.gtag("config", config.measurementId, Object.assign({
      send_page_view: false,
      allow_google_signals: false,
      allow_ad_personalization_signals: false,
      page_location: locationUrl.origin + locationUrl.pathname,
      page_referrer: externalHost(document.referrer) ? new URL(document.referrer).origin : ""
    }, diagnostic ? { debug_mode: true } : {}));
    window.gtag("event", "page_view", Object.assign({
      send_to: config.measurementId,
      entry_source: entry.source,
      entry_medium: entry.medium,
      entry_path: entry.path,
      attribution_basis: entry.basis
    }, diagnostic ? { debug_mode: true } : {}));
    var analytics = document.createElement("script");
    analytics.async = true;
    analytics.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(config.measurementId);
    document.head.appendChild(analytics);
  }

  function playUrl(anchor) {
    try {
      var url = new URL(anchor.href, window.location.href);
      if (url.protocol !== "https:" || url.hostname !== "play.google.com" || url.pathname !== "/store/apps/details" || !url.searchParams.get("id")) return null;
      return url;
    } catch (_) { return null; }
  }
  function position(anchor) {
    if (anchor.dataset.playCampaign) return label(anchor.dataset.playCampaign);
    if (anchor.closest("#appDrawer")) return "home_drawer";
    if (anchor.closest("#appGroups")) return "home_catalog";
    return "";
  }
  function tag(anchor) {
    var url = playUrl(anchor);
    var campaign = position(anchor);
    if (!url || !campaign) return;
    if (!url.searchParams.get("referrer")) {
      var referrer = new URLSearchParams({ utm_source: "leanstart_hub", utm_medium: "website", utm_campaign: campaign });
      url.searchParams.set("referrer", referrer.toString());
      anchor.href = url.toString();
    }
  }
  function tagLinks() { document.querySelectorAll('a[href*="play.google.com"]').forEach(tag); }
  tagLinks();
  // Homepage content can be rendered by the existing script in the first release.
  if (typeof MutationObserver !== "undefined") {
    new MutationObserver(tagLinks).observe(document.body, { childList: true, subtree: true });
  }

  function clicked(event) {
    if (event.type === "auxclick" && event.button !== 1) return;
    var anchor = event.target.closest && event.target.closest("a[href]");
    if (!anchor || !playUrl(anchor)) return;
    tag(anchor);
    var campaign = position(anchor);
    if (!campaign) return;
    var referral = new URLSearchParams(playUrl(anchor).searchParams.get("referrer") || "");
    var payload = {
      target_app: label(anchor.dataset.appSlug) || "unknown",
      page_path: locationUrl.pathname.slice(0, 100),
      button_position: campaign,
      entry_source: entry.source,
      entry_medium: entry.medium,
      entry_path: entry.path,
      attribution_basis: entry.basis,
      outbound_campaign: label(referral.get("utm_campaign")) || "unknown"
    };
    // This diagnostic event is not a stored analytics record.
    document.dispatchEvent(new CustomEvent("leanstart:play-click", { detail: payload }));
    if (config.enabled && /^G-[A-Z0-9]+$/.test(config.measurementId || "") && typeof window.gtag === "function") {
      window.gtag("event", "play_store_click", Object.assign({ send_to: config.measurementId, transport_type: "beacon" }, payload, diagnostic ? { debug_mode: true } : {}));
    }
  }
  document.addEventListener("click", clicked);
  document.addEventListener("auxclick", clicked);
})();
