/* ============================================================================
   app.js  |  builds every page from data.js.
   You should not need to edit this file to change content.
   ========================================================================= */

(function () {
  "use strict";

  const el = (id) => document.getElementById(id);

  const esc = (s) =>
    String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");

  /* Some data fields intentionally allow <strong> and links. */
  const raw = (s) => String(s == null ? "" : s);

  const PAGES = [
    { file: "index.html",       label: "Home" },
    { file: "schedule.html",    label: "Schedule" },
    { file: "tournaments.html", label: "Tournaments" },
    { file: "gallery.html",     label: "Photos" },
    { file: "videos.html",      label: "Videos" },
    { file: "rules.html",       label: "Rules & Info" },
    { file: "index.html#contact", label: "Contact" }
  ];

  const tournaments = TOURNAMENTS.slice()
    .sort((a, b) => String(b.date).localeCompare(String(a.date)));

  const tById = (id) => tournaments.find((t) => t.id === id) || null;

  /* Only entries flagged visible ever reach the page. */
  const schedule = SCHEDULE
    .filter((s) => s.visible)
    .sort((a, b) => String(a.date).localeCompare(String(b.date)));

  const TYPE_LABEL = {
    meeting: "Club Meeting",
    training: "Training Day",
    tournament: "Tournament",
    event: "Event"
  };

  /* ---------------------------------------------------------------- dates -- */

  function parseDate(iso) {
    const p = String(iso).split("-");
    if (p.length !== 3) return null;
    const d = new Date(+p[0], +p[1] - 1, +p[2]);
    return isNaN(d) ? null : d;
  }

  function fmtLong(iso) {
    const d = parseDate(iso);
    return d ? d.toLocaleDateString("en-US",
      { weekday: "long", month: "long", day: "numeric", year: "numeric" }) : iso;
  }

  function fmtShort(iso) {
    const d = parseDate(iso);
    return d ? d.toLocaleDateString("en-US",
      { weekday: "long", month: "long", day: "numeric" }) : iso;
  }

  function fmtDay(iso) {
    const d = parseDate(iso);
    return d ? d.toLocaleDateString("en-US",
      { month: "long", day: "numeric", year: "numeric" }) : iso;
  }

  function midnight(d) { return new Date(d.getFullYear(), d.getMonth(), d.getDate()); }

  /* Monday based week key, so a week groups Mon to Sun. */
  function weekStart(iso) {
    const d = parseDate(iso);
    if (!d) return "";
    const off = (d.getDay() + 6) % 7;
    const m = new Date(d.getFullYear(), d.getMonth(), d.getDate() - off);
    return m.getFullYear() + "-" + String(m.getMonth() + 1).padStart(2, "0") +
           "-" + String(m.getDate()).padStart(2, "0");
  }

  function todayISO() {
    const n = new Date();
    return n.getFullYear() + "-" + String(n.getMonth() + 1).padStart(2, "0") +
           "-" + String(n.getDate()).padStart(2, "0");
  }

  function relativeLabel(iso) {
    const d = parseDate(iso);
    if (!d) return "";
    const days = Math.round((midnight(d) - midnight(new Date())) / 86400000);
    if (days < 0) return "Past";
    if (days === 0) return "Today";
    if (days === 1) return "Tomorrow";
    if (days < 7) return "In " + days + " days";
    return "";
  }

  /* --------------------------------------------------------------- photos -- */

  function photosFor(id) {
    const list = PHOTOS.filter((p) => p.tournament === id);
    const real = list.filter((p) => p.file);
    real.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
    return real.concat(list.filter((p) => !p.file));
  }

  const realPhotosFor = (id) => photosFor(id).filter((p) => p.file);
  const coverFor = (id) => realPhotosFor(id)[0] || null;
  const thumbSrc = (p) => "assets/img/thumbs/" + p.file + ".jpg";
  const fullSrc  = (p) => "assets/img/photos/" + p.file + ".jpg";
  const rankClass = (r) => (r >= 1 && r <= 3 ? " rank-" + r : "");

  /* --------------------------------------------------------------- chrome -- */

  function buildHeader() {
    const host = el("site-header");
    if (!host) return;
    const active = document.body.dataset.page;

    host.innerHTML = `
      <div class="wrap">
        <a class="brand" href="index.html">
          <img src="assets/img/logo.png" alt="${esc(CLUB.fullName)} logo">
          <span class="brand-text">
            <span class="brand-school">${esc(CLUB.school)}</span>
            <span class="brand-name">${esc(CLUB.name)}</span>
          </span>
        </a>
        <button class="nav-toggle" id="nav-toggle" aria-expanded="false" aria-label="Menu">&#9776;</button>
        <nav class="nav" id="nav">
          ${PAGES.map((p) => {
            const cur = p.file === active ? ' aria-current="page"' : "";
            const cls = p.label === "Contact" ? ' class="nav-contact"' : "";
            return `<a href="${p.file}"${cur}${cls}>${esc(p.label)}</a>`;
          }).join("")}
        </nav>
      </div>`;

    const btn = el("nav-toggle"), nav = el("nav");
    btn.addEventListener("click", () => {
      btn.setAttribute("aria-expanded", String(nav.classList.toggle("is-open")));
    });
  }

  function buildFooter() {
    const host = el("site-footer");
    if (!host) return;

    const social = [];
    if (CLUB.discord) {
      social.push(`<a href="${esc(CLUB.discord)}" target="_blank" rel="noopener">
        <img src="assets/img/discord.svg" alt="">Discord</a>`);
    }
    if (CLUB.instagram) {
      social.push(`<a href="https://instagram.com/${esc(CLUB.instagram)}" target="_blank" rel="noopener">
        <img src="assets/img/instagram.svg" alt="">@${esc(CLUB.instagram)}</a>`);
    }
    if (CLUB.email) {
      social.push(`<a href="mailto:${esc(CLUB.email)}">
        <img src="assets/img/gmail.svg" alt="">${esc(CLUB.email)}</a>`);
    }

    const links = PAGES.filter((p) => p.label !== "Contact");

    host.innerHTML = `
      <div class="wrap">
        <div class="footer-top">
          <div>
            <div class="footer-brand">
              <img src="assets/img/logo.png" alt="">
              <span>${esc(CLUB.fullName)}</span>
            </div>
            <div>${esc(CLUB.tagline)}</div>
            <div class="footer-social">${social.join("")}</div>
          </div>
          <div class="footer-links">
            ${links.map((p) => `<a href="${p.file}">${esc(p.label)}</a>`).join("")}
          </div>
        </div>
        <div class="footer-bottom">
          &copy; ${new Date().getFullYear()} ${esc(CLUB.fullName)}
          <a class="officer-link" href="admin.html" title="Officers only">Officer login</a>
        </div>
      </div>`;
  }

  /* ------------------------------------------------------------- lightbox -- */

  let lbList = [], lbIndex = 0;

  function ensureLightbox() {
    if (el("lightbox")) return;
    const d = document.createElement("div");
    d.className = "lightbox";
    d.id = "lightbox";
    d.innerHTML = `
      <button class="lb-btn lb-close" id="lb-close" aria-label="Close">&times;</button>
      <button class="lb-btn lb-prev" id="lb-prev" aria-label="Previous">&#8249;</button>
      <button class="lb-btn lb-next" id="lb-next" aria-label="Next">&#8250;</button>
      <div class="lightbox-inner"><img id="lb-img" alt=""><div class="lightbox-cap" id="lb-cap"></div></div>`;
    document.body.appendChild(d);

    el("lb-close").addEventListener("click", closeLb);
    el("lb-prev").addEventListener("click", (e) => { e.stopPropagation(); step(-1); });
    el("lb-next").addEventListener("click", (e) => { e.stopPropagation(); step(1); });
    d.addEventListener("click", (e) => { if (e.target === d) closeLb(); });

    document.addEventListener("keydown", (e) => {
      if (!d.classList.contains("is-open")) return;
      if (e.key === "Escape") closeLb();
      if (e.key === "ArrowLeft") step(-1);
      if (e.key === "ArrowRight") step(1);
    });
  }

  function openLb(list, i) {
    ensureLightbox();
    lbList = list; lbIndex = i; paintLb();
    el("lightbox").classList.add("is-open");
    document.body.style.overflow = "hidden";
  }

  function closeLb() {
    el("lightbox").classList.remove("is-open");
    document.body.style.overflow = "";
  }

  function step(n) {
    if (!lbList.length) return;
    lbIndex = (lbIndex + n + lbList.length) % lbList.length;
    paintLb();
  }

  function paintLb() {
    const p = lbList[lbIndex];
    if (!p) return;
    const t = tById(p.tournament);
    el("lb-img").src = fullSrc(p);
    el("lb-img").alt = p.caption || "";
    el("lb-cap").innerHTML = esc(p.caption || "") +
      (t ? ` <span style="opacity:.65">${esc(t.short)}</span>` : "");
  }

  /* ------------------------------------------------------------ fragments -- */

  function dayCardHtml(s) {
    const rel = relativeLabel(s.date);
    return `<article class="day-card t-${esc(s.type)}">
        <span class="type-pill">${esc(TYPE_LABEL[s.type] || s.type)}</span>
        <div class="day-when">${esc(rel || fmtShort(s.date))}</div>
        <h3>${esc(s.title)}</h3>
        <div class="day-meta">
          <span>&#128197; ${esc(fmtShort(s.date))}</span>
          <span>&#128336; ${esc(s.time)}</span>
          <span>&#128205; ${esc(s.place)}</span>
        </div>
        <p class="day-note">${esc(s.note || "")}</p>
      </article>`;
  }

  function photoCardHtml(p, showTag) {
    const t = tById(p.tournament);
    const tag = showTag && t ? `<span class="photo-tag">${esc(t.short)}</span>` : "";
    if (!p.file) {
      return `<div class="photo-card is-placeholder">
                <span class="ph-icon">&#128247;</span>
                <span class="ph-text">${esc(p.caption || "Photo coming soon")}</span>${tag}
              </div>`;
    }
    return `<button class="photo-card" data-file="${esc(p.file)}">
              <img src="${esc(thumbSrc(p))}" alt="${esc(p.caption || "")}" loading="lazy">
              ${tag}<span class="photo-cap">${esc(p.caption || "")}</span>
            </button>`;
  }

  function connectCardsHtml() {
    const out = [];

    if (CLUB.discord) {
      out.push(`<div class="connect-card">
          <img class="brand-icon" src="assets/img/discord.svg" alt="Discord">
          <h3>Discord</h3>
          <p>This is where everything gets announced. Scan the code or tap the button.</p>
          <div class="qr-box"><img src="assets/img/discord-qr.png" alt="QR code linking to our Discord server"></div>
          <a class="btn btn-primary" href="${esc(CLUB.discord)}" target="_blank" rel="noopener">Join the Discord</a>
        </div>`);
    }

    if (CLUB.instagram) {
      out.push(`<div class="connect-card">
          <img class="brand-icon" src="assets/img/instagram.svg" alt="Instagram">
          <h3>Instagram</h3>
          <p>Photos, results and event announcements.</p>
          <div class="handle">@${esc(CLUB.instagram)}</div>
          <a class="btn btn-navy" href="https://instagram.com/${esc(CLUB.instagram)}" target="_blank" rel="noopener">Follow us</a>
        </div>`);
    }

    if (CLUB.email) {
      out.push(`<div class="connect-card">
          <img class="brand-icon" src="assets/img/gmail.svg" alt="Gmail">
          <h3>Email</h3>
          <p>Questions, or want to set up a match against your school?</p>
          <div class="handle">${esc(CLUB.email)}</div>
          <a class="btn btn-navy" href="mailto:${esc(CLUB.email)}">Email us</a>
        </div>`);
    }

    return out.join("");
  }

  /* ----------------------------------------------------------------- HOME -- */

  function renderHome() {
    const years = new Date().getFullYear() - CLUB.founded;

    const hero = el("hero-body");
    if (hero) {
      hero.innerHTML = `
        <div class="hero-copy">
          <span class="hero-eyebrow">${esc(CLUB.school)}</span>
          <h1>Ping Pong<span class="l2">Club</span></h1>
          <p>${esc(CLUB.tagline)} ${esc(CLUB.intro)}</p>
          <div class="hero-cta">
            <a class="btn btn-primary" href="schedule.html">See the schedule</a>
            <a class="btn btn-ghost" href="#contact">Contact us</a>
          </div>
          <p class="hero-hint">Discord, Instagram and email are all at the bottom of this page.</p>
        </div>
        <img class="hero-logo" src="assets/img/logo.png" alt="${esc(CLUB.fullName)} logo">`;
    }

    const strip = el("record-strip");
    if (strip) {
      const cards = tournaments.slice(0, 2).map((t) => `
        <div class="record-card${rankClass(t.rank)}">
          <div class="val">${esc(t.placement)}</div>
          <div class="label">${esc(t.short)} &middot; ${esc(t.location)}</div>
        </div>`);
      cards.push(`<div class="record-card">
          <div class="val">${years} years</div>
          <div class="label">Running since ${esc(CLUB.founded)}</div>
        </div>`);
      strip.innerHTML = cards.join("");
    }

    const next = el("nextup");
    if (next) {
      const today = midnight(new Date());
      const upcoming = schedule.filter((s) => {
        const d = parseDate(s.date);
        return d && midnight(d) >= today;
      });
      const show = (upcoming.length ? upcoming : schedule).slice(0, 3);
      next.innerHTML = show.length
        ? show.map(dayCardHtml).join("")
        : `<div class="empty-note">No days posted yet, check back soon.</div>`;
    }

    const feeds = el("feeds");
    if (feeds) {
      feeds.innerHTML = tournaments.slice(0, 2).map((t) => {
        const pics = realPhotosFor(t.id);
        if (!pics.length) {
          return `<div class="feed-block">${feedHeadHtml(t)}
            <div class="empty-note">Photos from ${esc(t.short)} are coming soon.</div></div>`;
        }
        let run = [];
        while (run.length < 8) run = run.concat(pics);
        const cells = run.concat(run).map((p) =>
          `<button class="feed-item" data-file="${esc(p.file)}">
             <img src="${esc(thumbSrc(p))}" alt="${esc(p.caption || "")}" loading="lazy"></button>`
        ).join("");
        return `<div class="feed-block">${feedHeadHtml(t)}
          <div class="feed"><div class="feed-track" style="--feed-duration:${Math.max(28, run.length * 4)}s">${cells}</div></div></div>`;
      }).join("");

      const all = PHOTOS.filter((p) => p.file);
      feeds.addEventListener("click", (e) => {
        const c = e.target.closest("[data-file]");
        if (!c) return;
        const i = all.findIndex((p) => p.file === c.dataset.file);
        if (i > -1) openLb(all, i);
      });
    }

    const tl = el("timeline");
    if (tl) {
      tl.innerHTML = HISTORY.map((h) => `
        <div class="tl-item${h.highlight ? " hl" : ""}">
          <div class="tl-year">${esc(h.year)}</div>
          <h3>${esc(h.title)}</h3>
          <p>${esc(h.text)}</p>
        </div>`).join("");
    }

    const connect = el("connect-grid");
    if (connect) connect.innerHTML = connectCardsHtml();
  }

  function feedHeadHtml(t) {
    return `<div class="feed-head">
        <div class="feed-title">
          <h3>${esc(t.short)}</h3>
          <span class="medal${rankClass(t.rank)}" style="position:static">${esc(t.placement)}</span>
        </div>
        <span class="feed-meta">${esc(t.venue)} &middot; ${esc(fmtDay(t.date))}</span>
      </div>`;
  }

  /* ------------------------------------------------------------- SCHEDULE -- */

  function renderSchedule() {
    const host = el("schedule-list");
    if (!host) return;

    const note = el("schedule-note");
    if (note && typeof SCHEDULE_NOTE === "string") note.textContent = SCHEDULE_NOTE;

    if (!schedule.length) {
      host.innerHTML = `<div class="empty-note">Nothing posted yet, check back soon.</div>`;
      return;
    }

    const weeks = [];
    schedule.forEach((s) => {
      const k = weekStart(s.date);
      let w = weeks.find((x) => x.key === k);
      if (!w) weeks.push((w = { key: k, items: [] }));
      w.items.push(s);
    });

    const thisWeek = weekStart(todayISO());

    host.innerHTML = weeks.map((w) => {
      const d = parseDate(w.key);
      const end = d ? new Date(d.getFullYear(), d.getMonth(), d.getDate() + 6) : null;
      const range = d && end
        ? d.toLocaleDateString("en-US", { month: "short", day: "numeric" }) + " to " +
          end.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
        : "";
      return `<section class="week-block">
          <div class="week-head">
            <h3>${w.key === thisWeek ? "This week" : "Week of " + esc(fmtDay(w.key))}</h3>
            <span class="sub">${esc(range)}</span>
          </div>
          <div class="nextup">${w.items.map(dayCardHtml).join("")}</div>
        </section>`;
    }).join("");
  }

  /* ---------------------------------------------------------- TOURNAMENTS -- */

  function renderTournaments() {
    const host = el("tourney-list");
    if (!host) return;

    host.innerHTML = tournaments.map((t) => {
      const cover = coverFor(t.id);
      const nPhotos = realPhotosFor(t.id).length;

      const coverHtml = cover
        ? `<img src="${esc(thumbSrc(cover))}" alt="${esc(t.short)}" loading="lazy">`
        : `<div class="is-placeholder" style="height:100%">
             <span class="ph-icon">&#127955;</span><span class="ph-text">Photos coming soon</span></div>`;

      return `<article class="tourney-card">
          <div class="tourney-cover">${coverHtml}
            <span class="medal${rankClass(t.rank)}">${esc(t.placement)}</span></div>
          <div class="tourney-body">
            <span class="level-chip">${esc(t.level)}</span>
            <h3>${esc(t.name)}</h3>
            <div class="fact-grid">
              <div class="fact"><div class="k">Date</div><div class="v">${esc(fmtLong(t.date))}</div></div>
              <div class="fact"><div class="k">Time</div><div class="v">${esc(t.time || "TBA")}</div></div>
              <div class="fact"><div class="k">Venue</div><div class="v">${esc(t.venue)}</div></div>
              <div class="fact"><div class="k">Location</div><div class="v">${esc(t.location)}</div></div>
            </div>
            <div class="blk"><h4>The event</h4><p>${esc(t.about)}</p></div>
            <div class="blk"><h4>How we did</h4><p>${esc(t.performance)}</p></div>
            <div class="tourney-links">
              <a class="chip-link" href="gallery.html?t=${encodeURIComponent(t.id)}">${nPhotos} photo${nPhotos === 1 ? "" : "s"}</a>
              <a class="chip-link" href="videos.html?t=${encodeURIComponent(t.id)}">Videos</a>
            </div>
          </div>
        </article>`;
    }).join("");
  }

  /* -------------------------------------------------------------- GALLERY -- */

  function renderGallery() {
    const grid = el("photo-grid");
    const bar = el("filters");
    if (!grid) return;

    const start = new URLSearchParams(location.search).get("t") || "all";
    let current = tById(start) ? start : "all";
    let list = [];

    if (bar) {
      bar.innerHTML = `<button class="filter-btn" data-t="all">All photos</button>` +
        tournaments.map((t) => `<button class="filter-btn" data-t="${esc(t.id)}">${esc(t.short)}</button>`).join("");
      bar.addEventListener("click", (e) => {
        const b = e.target.closest(".filter-btn");
        if (b) { current = b.dataset.t; draw(); }
      });
    }

    function draw() {
      if (bar) bar.querySelectorAll(".filter-btn").forEach((b) =>
        b.classList.toggle("is-active", b.dataset.t === current));

      const items = current === "all"
        ? tournaments.flatMap((t) => photosFor(t.id))
        : photosFor(current);

      grid.innerHTML = items.length
        ? items.map((p) => photoCardHtml(p, current === "all")).join("")
        : `<div class="empty-note">No photos here yet.</div>`;

      list = items.filter((p) => p.file);
    }

    grid.addEventListener("click", (e) => {
      const c = e.target.closest("[data-file]");
      if (!c) return;
      const i = list.findIndex((p) => p.file === c.dataset.file);
      if (i > -1) openLb(list, i);
    });

    draw();
  }

  /* --------------------------------------------------------------- VIDEOS -- */

  function renderVideos() {
    const host = el("video-list");
    if (!host) return;

    const start = new URLSearchParams(location.search).get("t") || "all";
    const shown = tById(start) ? tournaments.filter((t) => t.id === start) : tournaments;

    host.innerHTML = shown.map((t) => {
      const vids = VIDEOS.filter((v) => v.tournament === t.id);
      const cards = vids.length
        ? `<div class="video-grid">${vids.map((v) => videoCard(v, t)).join("")}</div>`
        : `<div class="empty-note">No videos for ${esc(t.short)} yet.</div>`;
      return `<section class="group-block">
          <div class="group-head"><h3>${esc(t.short)}</h3>
            <span class="sub">${esc(t.venue)} &middot; ${esc(fmtDay(t.date))}</span></div>
          ${cards}</section>`;
    }).join("");
  }

  function videoCard(v, t) {
    const frame = v.youtubeId
      ? `<iframe src="https://www.youtube-nocookie.com/embed/${encodeURIComponent(v.youtubeId)}"
                 title="${esc(v.title)}" loading="lazy" allowfullscreen
                 allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"></iframe>`
      : `<div class="is-placeholder" style="height:100%">
           <span class="ph-icon">&#9654;</span><span class="ph-text">Video coming soon</span></div>`;
    return `<div class="video-card"><div class="video-frame">${frame}</div>
        <div class="video-body"><h3>${esc(v.title)}</h3><div class="sub">${esc(t.short)}</div></div></div>`;
  }

  /* ---------------------------------------------------------------- RULES -- */

  function renderRules() {
    const rl = el("rules-list");
    if (rl) rl.innerHTML = RULES.map((r) => `<li>${raw(r.text)}</li>`).join("");

    const paddle = el("paddle-feature");
    if (paddle && typeof PADDLE_RENTAL === "object") {
      paddle.innerHTML = `
        <div class="feature-head">
          <span class="feature-badge">Free to members</span>
          <h2>${raw(PADDLE_RENTAL.title)}</h2>
          <p>${raw(PADDLE_RENTAL.intro)}</p>
        </div>
        <div class="feature-grid">
          ${(PADDLE_RENTAL.points || []).map((p) => `
            <div class="feature-item">
              <div class="fi-lead">${raw(p.lead)}</div>
              <div class="fi-text">${raw(p.text)}</div>
            </div>`).join("")}
        </div>`;
    }

    const info = el("info-blocks");
    if (info) {
      info.innerHTML = INFO_SECTIONS.map((s) => `
        <div class="info-block">
          <h3><span class="blk-icon">${raw(s.icon)}</span>${raw(s.title)}</h3>
          <p class="blk-intro">${raw(s.intro)}</p>
          <div class="point-list">
            ${(s.points || []).map((p) => `
              <div class="point">
                <div class="p-lead">${raw(p.lead)}</div>
                <div class="p-text">${raw(p.text)}</div>
              </div>`).join("")}
          </div>
        </div>`).join("");
    }

    const off = el("officer-grid");
    if (off) off.innerHTML = OFFICERS.map((o) => `<span class="officer">${esc(o.name)}</span>`).join("");
  }

  /* ----------------------------------------------------------------- boot -- */

  function boot() {
    document.title = document.title.replace("{{CLUB}}", CLUB.fullName);
    buildHeader();
    buildFooter();

    switch (document.body.dataset.page) {
      case "index.html":       renderHome();        break;
      case "schedule.html":    renderSchedule();    break;
      case "tournaments.html": renderTournaments(); break;
      case "gallery.html":     renderGallery();     break;
      case "videos.html":      renderVideos();      break;
      case "rules.html":       renderRules();       break;
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
