/* ============================================================================
   admin.js  |  the officer editor.

   Reads whatever is currently in data.js, lets an officer edit it through a
   form, then writes a complete replacement data.js file for them to paste
   into GitHub.

   Nothing in here touches the live site. It only produces text.
   ========================================================================= */

(function () {
  "use strict";

  /* ---------------------------------------------------------------------
     PASSWORD
     This is the SHA-256 hash of the password, not the password itself, so
     the actual number is not sitting in this file in plain sight.
     --------------------------------------------------------------------- */
  var PASSWORD_HASH = "5e91d06b087ae4db6ac08a34615b5961eff49855a72f6dff654bd112802f1143";

  var LS_KEY = "whs_pp_admin_draft";
  var LS_UNLOCK = "whs_pp_admin_open";

  var $ = function (id) { return document.getElementById(id); };

  /* ------------------------------------------------------------ hashing -- */

  async function sha256(txt) {
    var buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(txt));
    return Array.from(new Uint8Array(buf))
      .map(function (b) { return b.toString(16).padStart(2, "0"); }).join("");
  }

  async function tryUnlock(pw) {
    try { return (await sha256(pw)) === PASSWORD_HASH; }
    catch (e) { return pw === "683293"; }   // fallback if opened via file://
  }

  function unlock() {
    $("gate").classList.add("hide");
    $("app").style.display = "";
    try { sessionStorage.setItem(LS_UNLOCK, "1"); } catch (e) {}
  }

  $("pw-go").addEventListener("click", go);
  $("pw").addEventListener("keydown", function (e) { if (e.key === "Enter") go(); });

  async function go() {
    if (await tryUnlock($("pw").value)) { unlock(); boot(); }
    else {
      $("pw-err").textContent = "Wrong password.";
      $("pw").value = "";
      $("pw").focus();
    }
  }

  $("lock-btn").addEventListener("click", function () {
    try { sessionStorage.removeItem(LS_UNLOCK); } catch (e) {}
    location.reload();
  });

  /* --------------------------------------------------------------- state -- */

  var D = null;
  var ORIGINAL = null;   /* what data.js held when this page loaded */

  function clone(x) { return JSON.parse(JSON.stringify(x)); }

  function loadFromSite() {
    return {
      club: clone(CLUB),
      history: clone(HISTORY),
      officers: clone(OFFICERS),
      schedule: clone(SCHEDULE),
      scheduleNote: String(SCHEDULE_NOTE || ""),
      tournaments: clone(TOURNAMENTS),
      photos: clone(PHOTOS),
      videos: clone(VIDEOS),
      rules: clone(RULES),
      paddle: clone(PADDLE_RENTAL),
      info: clone(INFO_SECTIONS)
    };
  }

  function save() {
    try { localStorage.setItem(LS_KEY, JSON.stringify(D)); } catch (e) {}
    build();
    drawStatus();
  }

  function restore() {
    var fresh = loadFromSite();
    try {
      var raw = localStorage.getItem(LS_KEY);
      if (!raw) return fresh;
      var saved = JSON.parse(raw);
      Object.keys(fresh).forEach(function (k) {
        if (saved[k] !== undefined) fresh[k] = saved[k];
      });
    } catch (e) {}
    return fresh;
  }

  /* -------------------------------------------------------------- helpers -- */

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;")
      .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  var TYPES = [
    ["meeting", "Club Meeting"], ["training", "Training Day"],
    ["tournament", "Tournament"], ["event", "Event"]
  ];

  function field(label, path, val, hint, type) {
    return '<div class="f"><label>' + label +
      (hint ? ' <span class="hint">' + hint + "</span>" : "") + "</label>" +
      '<input type="' + (type || "text") + '" data-p="' + path + '" value="' + esc(val) + '"></div>';
  }

  function area(label, path, val, hint) {
    return '<div class="f"><label>' + label +
      (hint ? ' <span class="hint">' + hint + "</span>" : "") + "</label>" +
      '<textarea data-p="' + path + '">' + esc(val) + "</textarea></div>";
  }

  function pick(label, path, val, opts) {
    return '<div class="f"><label>' + label + "</label><select data-p=\"" + path + '">' +
      opts.map(function (o) {
        return '<option value="' + esc(o[0]) + '"' + (val === o[0] ? " selected" : "") +
               ">" + esc(o[1]) + "</option>";
      }).join("") + "</select></div>";
  }

  function tourneyOpts() {
    return D.tournaments.map(function (t) { return [t.id, t.short || t.id]; });
  }

  function tools(kind, i, extra) {
    return '<div class="foot">' + (extra || "") +
      '<button class="mini push" data-up="' + kind + ":" + i + '">Move up</button>' +
      '<button class="mini" data-down="' + kind + ":" + i + '">Move down</button>' +
      '<button class="mini danger" data-del="' + kind + ":" + i + '">Delete</button></div>';
  }

  /* --------------------------------------------------------------- render -- */

  function drawAll() {
    drawClub(); drawSchedule(); drawTourneys(); drawPhotos();
    drawVideos(); drawHistory(); drawRules(); drawInfo();
    build();
  }

  function drawClub() {
    var c = D.club;
    $("club-form").innerHTML =
      '<div class="card"><div class="grid two">' +
        field("School", "club.school", c.school) +
        field("Club name", "club.name", c.name) +
        field("Full name", "club.fullName", c.fullName, "used in the footer and page titles") +
        field("Short name", "club.shortName", c.shortName) +
        field("Founded", "club.founded", c.founded, "year, used for the X years counter") +
      "</div>" +
        area("Tagline", "club.tagline", c.tagline, "one line, shows under the logo everywhere") +
        area("Intro paragraph", "club.intro", c.intro, "the big paragraph on the home page") +
      '<div class="grid two" style="margin-top:13px">' +
        field("Discord invite link", "club.discord", c.discord, "the full https link") +
        field("Instagram handle", "club.instagram", c.instagram, "no @ sign") +
        field("Email", "club.email", c.email) +
      "</div>" +
      '<div class="foot"><span style="font-size:.88rem;color:var(--ink-soft)">' +
        "Leave a contact field empty to hide it across the whole site." +
      "</span></div></div>";
  }

  function drawSchedule() {
    $("schedule-rows").innerHTML = D.schedule.map(function (s, i) {
      return '<div class="card t-' + esc(s.type) + (s.visible ? "" : " dim") + '">' +
        '<div class="grid">' +
          field("Date", "schedule." + i + ".date", s.date, "", "date") +
          pick("Type", "schedule." + i + ".type", s.type, TYPES) +
          field("Title", "schedule." + i + ".title", s.title) +
          field("Time", "schedule." + i + ".time", s.time) +
          field("Place", "schedule." + i + ".place", s.place) +
        "</div>" +
        area("Description", "schedule." + i + ".note", s.note) +
        tools("schedule", i,
          '<label class="tog"><input type="checkbox" data-p="schedule.' + i + '.visible"' +
          (s.visible ? " checked" : "") + "> Show on website</label>" +
          '<span class="tag ' + (s.visible ? "on" : "off") + '">' +
          (s.visible ? "Live" : "Hidden") + "</span>") +
        "</div>";
    }).join("") || '<div class="warn">No days yet. Click Add a day.</div>';
  }

  function drawTourneys() {
    $("tourney-rows").innerHTML = D.tournaments.map(function (t, i) {
      return '<div class="card t-tournament">' +
        '<div class="grid">' +
          field("Short name", "tournaments." + i + ".short", t.short, "eg State 2026") +
          field("ID", "tournaments." + i + ".id", t.id, "no spaces, links photos to it") +
          field("Level", "tournaments." + i + ".level", t.level, "State, National...") +
          field("Date", "tournaments." + i + ".date", t.date, "", "date") +
          field("Time", "tournaments." + i + ".time", t.time) +
          field("Placement", "tournaments." + i + ".placement", t.placement, "eg 1st Place") +
          field("Medal", "tournaments." + i + ".rank", t.rank, "1 gold, 2 silver, 3 bronze, 0 none") +
          field("Venue", "tournaments." + i + ".venue", t.venue) +
          field("Location", "tournaments." + i + ".location", t.location, "city and state") +
        "</div>" +
        area("Full event name", "tournaments." + i + ".name", t.name) +
        area("What the event is", "tournaments." + i + ".about", t.about) +
        area("How we did", "tournaments." + i + ".performance", t.performance) +
        tools("tournaments", i) +
        "</div>";
    }).join("") || '<div class="warn">No tournaments yet.</div>';
  }

  function drawPhotos() {
    var opts = tourneyOpts();
    $("photo-rows").innerHTML = D.photos.map(function (p, i) {
      var real = !!p.file;
      return '<div class="card' + (real ? "" : " dim") + '">' +
        '<div class="grid">' +
          field("File name", "photos." + i + ".file", p.file || "", "no .jpg on the end") +
          pick("Tournament", "photos." + i + ".tournament", p.tournament, opts) +
        "</div>" +
        area("Caption", "photos." + i + ".caption", p.caption) +
        tools("photos", i,
          '<label class="tog"><input type="checkbox" data-p="photos.' + i + '.featured"' +
          (p.featured ? " checked" : "") + "> Featured</label>" +
          '<span class="tag ' + (real ? "on" : "off") + '">' +
          (real ? "Has image" : "Placeholder") + "</span>") +
        "</div>";
    }).join("") || '<div class="warn">No photos yet.</div>';
  }

  function drawVideos() {
    var opts = tourneyOpts();
    $("video-rows").innerHTML = D.videos.map(function (v, i) {
      return '<div class="card' + (v.youtubeId ? "" : " dim") + '">' +
        '<div class="grid">' +
          field("YouTube ID", "videos." + i + ".youtubeId", v.youtubeId, "just the ID") +
          pick("Tournament", "videos." + i + ".tournament", v.tournament, opts) +
        "</div>" +
        field("Title", "videos." + i + ".title", v.title) +
        tools("videos", i, '<span class="tag ' + (v.youtubeId ? "on" : "off") + '">' +
          (v.youtubeId ? "Live" : "Coming soon") + "</span>") +
        "</div>";
    }).join("") || '<div class="warn">No videos yet.</div>';
  }

  function drawHistory() {
    $("history-rows").innerHTML = D.history.map(function (h, i) {
      return '<div class="card">' +
        '<div class="grid">' +
          field("Year", "history." + i + ".year", h.year) +
          field("Headline", "history." + i + ".title", h.title) +
        "</div>" +
        area("Description", "history." + i + ".text", h.text) +
        tools("history", i,
          '<label class="tog"><input type="checkbox" data-p="history.' + i + '.highlight"' +
          (h.highlight ? " checked" : "") + "> Highlight</label>") +
        "</div>";
    }).join("") || '<div class="warn">No milestones yet.</div>';
  }

  function drawRules() {
    $("rule-rows").innerHTML = D.rules.map(function (r, i) {
      return '<div class="card">' +
        area("Rule " + (i + 1), "rules." + i + ".text", r.text,
             "you can use &lt;strong&gt;bold&lt;/strong&gt;") +
        tools("rules", i) + "</div>";
    }).join("") || '<div class="warn">No rules yet.</div>';

    var p = D.paddle;
    $("paddle-form").innerHTML = '<div class="card">' +
      field("Heading", "paddle.title", p.title) +
      area("Intro", "paddle.intro", p.intro) +
      '<div style="margin-top:14px">' +
      (p.points || []).map(function (pt, j) {
        return '<div class="sub-item"><div class="sub-head"><strong>Point ' + (j + 1) + "</strong>" +
          '<button class="mini danger" data-delsub="paddle.points:' + j + '">Delete</button></div>' +
          '<div class="grid two">' +
            field("Short heading", "paddle.points." + j + ".lead", pt.lead) +
            field("Detail", "paddle.points." + j + ".text", pt.text) +
          "</div></div>";
      }).join("") +
      '<button class="mini" data-addsub="paddle.points">+ Add a point</button>' +
      "</div></div>";

    $("officer-rows").innerHTML = D.officers.map(function (o, i) {
      return '<div class="card"><div class="grid">' +
        field("Name", "officers." + i + ".name", o.name) + "</div>" +
        tools("officers", i) + "</div>";
    }).join("") || '<div class="warn">No officers yet.</div>';
  }

  function drawInfo() {
    $("info-rows").innerHTML = D.info.map(function (s, i) {
      return '<div class="card">' +
        '<div class="grid two">' +
          field("Title", "info." + i + ".title", s.title) +
          field("Icon", "info." + i + ".icon", s.icon, "an emoji code, leave alone if unsure") +
        "</div>" +
        area("Intro line", "info." + i + ".intro", s.intro) +
        '<div style="margin-top:14px">' +
        (s.points || []).map(function (pt, j) {
          return '<div class="sub-item"><div class="sub-head"><strong>Point ' + (j + 1) + "</strong>" +
            '<button class="mini danger" data-delsub="info.' + i + '.points:' + j + '">Delete</button></div>' +
            '<div class="grid two">' +
              field("Short heading", "info." + i + ".points." + j + ".lead", pt.lead, "3 or 4 words") +
              field("Detail", "info." + i + ".points." + j + ".text", pt.text) +
            "</div></div>";
        }).join("") +
        '<button class="mini" data-addsub="info.' + i + '.points">+ Add a point</button>' +
        "</div>" + tools("info", i) + "</div>";
    }).join("") || '<div class="warn">No sections yet.</div>';
  }

  /* ------------------------------------------------------------- editing -- */

  function setPath(path, val) {
    var parts = path.split(".");
    var o = D;
    for (var i = 0; i < parts.length - 1; i++) o = o[parts[i]];
    o[parts[parts.length - 1]] = val;
  }

  function getParent(path) {
    var parts = path.split(".");
    var o = D;
    for (var i = 0; i < parts.length; i++) o = o[parts[i]];
    return o;
  }

  document.addEventListener("input", function (e) {
    var t = e.target, p = t.dataset.p;
    if (!p) return;
    var v = (t.type === "checkbox") ? t.checked : t.value;
    if (p.endsWith(".rank") || p === "club.founded") {
      var n = parseInt(v, 10);
      v = isNaN(n) ? 0 : n;
    }
    setPath(p, v);
    save();
    if (t.type === "checkbox" || t.tagName === "SELECT") drawAll();
  });

  document.addEventListener("click", function (e) {
    var b = e.target.closest("button");
    if (!b) return;

    var add = b.dataset.add;
    var del = b.dataset.del, up = b.dataset.up, dn = b.dataset.down;
    var addsub = b.dataset.addsub, delsub = b.dataset.delsub;

    if (add) { addItem(add); return; }

    if (addsub) {
      getParent(addsub).push({ lead: "New heading", text: "The detail goes here." });
      save(); drawAll(); return;
    }

    if (delsub) {
      var s = delsub.split(":");
      if (confirm("Delete this point?")) { getParent(s[0]).splice(+s[1], 1); save(); drawAll(); }
      return;
    }

    if (del) {
      var d = del.split(":");
      if (confirm("Delete this? It cannot be undone.")) { D[d[0]].splice(+d[1], 1); save(); drawAll(); }
      return;
    }

    if (up || dn) {
      var m = (up || dn).split(":");
      var arr = D[m[0]], i = +m[1], j = up ? i - 1 : i + 1;
      if (j < 0 || j >= arr.length) return;
      var tmp = arr[i]; arr[i] = arr[j]; arr[j] = tmp;
      save(); drawAll();
    }
  });

  function addItem(kind) {
    var firstT = D.tournaments[0] ? D.tournaments[0].id : "";
    var d = new Date(); d.setDate(d.getDate() + 7);
    var iso = d.toISOString().slice(0, 10);

    if (kind === "schedule") {
      D.schedule.push({ date: iso, type: "meeting", title: "Club Meeting",
        time: "After school", place: "E Building", visible: false,
        note: "Open play, first to 5 rotation on every table." });
    } else if (kind === "tourney") {
      D.tournaments.unshift({ id: "new-event-" + d.getFullYear(), name: "Full event name",
        short: "New Event", level: "Invitational", date: iso, time: "All day",
        venue: "Venue name", location: "City, State", placement: "1st Place", rank: 1,
        about: "What the event is.", performance: "How we did." });
    } else if (kind === "photo") {
      D.photos.push({ file: "", tournament: firstT, featured: false, caption: "Photo coming soon" });
    } else if (kind === "video") {
      D.videos.push({ tournament: firstT, youtubeId: "", title: "New video" });
    } else if (kind === "history") {
      D.history.unshift({ year: String(d.getFullYear()), title: "Headline",
        text: "What happened.", highlight: false });
    } else if (kind === "rule") {
      D.rules.push({ text: "New rule." });
    } else if (kind === "officer") {
      D.officers.push({ name: "New officer" });
    } else if (kind === "info") {
      D.info.push({ icon: "&#127955;", title: "New section", intro: "One line intro.",
        points: [{ lead: "Short heading", text: "The detail goes here." }] });
    }
    save(); drawAll();
  }

  /* ------------------------------------------------------------ generate -- */

  /* Turn any value into a safe JavaScript string literal. Also strips the
     dashes Daniel does not want anywhere on the site. */
  function q(v) {
    return '"' + String(v == null ? "" : v)
      .replace(/\\/g, "\\\\")
      .replace(/"/g, '\\"')
      .replace(/\r?\n/g, " ")
      .replace(/\u2014|\u2013/g, ",")
      .replace(/\s+/g, " ")
      .trim() + '"';
  }

  function num(v) { var n = parseInt(v, 10); return isNaN(n) ? 0 : n; }
  function bool(v) { return v ? "true" : "false"; }

  function hdr(n, title, lines) {
    var out = "\n/* " + "-".repeat(73) + "\n   " + n + ". " + title + "\n";
    (lines || []).forEach(function (l) { out += "   " + l + "\n"; });
    return out + "   " + "-".repeat(70) + " */\n";
  }

  function build() {
    var s = "";

    s += "/* " + "=".repeat(73) + "\n";
    s += "   data.js  |  WOODINVILLE HIGH SCHOOL PING PONG CLUB\n";
    s += "   " + "=".repeat(73) + "\n\n";
    s += "   This file was written by the officer editor at admin.html\n";
    s += "   Last updated: " + new Date().toLocaleString("en-US") + "\n\n";
    s += "   You can edit it by hand, but the editor is safer because it cannot\n";
    s += "   produce a typo that breaks the site.\n";
    s += "   " + "=".repeat(70) + " */\n\n";

    /* 1 club */
    s += hdr(1, "CLUB INFO AND CONTACT");
    s += "const CLUB = {\n";
    s += "  school:    " + q(D.club.school) + ",\n";
    s += "  name:      " + q(D.club.name) + ",\n";
    s += "  fullName:  " + q(D.club.fullName) + ",\n";
    s += "  shortName: " + q(D.club.shortName) + ",\n";
    s += "  founded:   " + num(D.club.founded) + ",\n\n";
    s += "  tagline:   " + q(D.club.tagline) + ",\n\n";
    s += "  intro:     " + q(D.club.intro) + ",\n\n";
    s += "  discord:   " + q(D.club.discord) + ",\n";
    s += "  instagram: " + q(D.club.instagram) + ",\n";
    s += "  email:     " + q(D.club.email) + "\n};\n\n";

    /* 2 history */
    s += hdr(2, "HISTORY", ["The timeline on the home page. Newest first."]);
    s += "const HISTORY = [\n" + D.history.map(function (h) {
      return "  {\n    year:      " + q(h.year) +
             ",\n    title:     " + q(h.title) +
             ",\n    text:      " + q(h.text) +
             ",\n    highlight: " + bool(h.highlight) + "\n  }";
    }).join(",\n") + "\n];\n\n";

    /* 3 officers */
    s += hdr(3, "OFFICERS", ["The only people allowed to take out or keep out tables."]);
    s += "const OFFICERS = [\n" + D.officers.map(function (o) {
      return "  { name: " + q(o.name) + " }";
    }).join(",\n") + "\n];\n\n";

    /* 4 schedule */
    s += hdr(4, "SCHEDULE", [
      "visible: true   shows the day on the website",
      "visible: false  hides it completely, nobody can see it",
      "",
      "types: meeting, training, tournament, event"
    ]);
    var sched = D.schedule.slice().sort(function (a, b) {
      return String(a.date).localeCompare(String(b.date));
    });
    s += "const SCHEDULE = [\n" + sched.map(function (x) {
      return "  {\n    date:    " + q(x.date) +
             ",\n    type:    " + q(x.type) +
             ",\n    title:   " + q(x.title) +
             ",\n    time:    " + q(x.time) +
             ",\n    place:   " + q(x.place) +
             ",\n    visible: " + bool(x.visible) +
             ",\n    note:    " + q(x.note) + "\n  }";
    }).join(",\n") + "\n];\n\n";

    s += "const SCHEDULE_NOTE =\n  " + q(D.scheduleNote) + ";\n\n";

    /* 5 tournaments */
    s += hdr(5, "TOURNAMENTS", [
      "Newest first. The top two get the photo feeds on the home page.",
      "rank: 1 gold, 2 silver, 3 bronze, 0 for no medal."
    ]);
    var tor = D.tournaments.slice().sort(function (a, b) {
      return String(b.date).localeCompare(String(a.date));
    });
    s += "const TOURNAMENTS = [\n" + tor.map(function (t) {
      return "  {\n    id:        " + q(t.id) +
             ",\n    name:      " + q(t.name) +
             ",\n    short:     " + q(t.short) +
             ",\n    level:     " + q(t.level) +
             ",\n    date:      " + q(t.date) +
             ",\n    time:      " + q(t.time) +
             ",\n    venue:     " + q(t.venue) +
             ",\n    location:  " + q(t.location) +
             ",\n    placement: " + q(t.placement) +
             ",\n    rank:      " + num(t.rank) +
             ",\n\n    about:       " + q(t.about) +
             ",\n    performance: " + q(t.performance) + "\n  }";
    }).join(",\n") + "\n];\n\n";

    /* 6 photos */
    s += hdr(6, "PHOTOS", [
      "file is the image name with no .jpg on the end.",
      "An empty file shows a grey coming soon tile."
    ]);
    s += "const PHOTOS = [\n" + D.photos.map(function (p) {
      var f = p.file ? q(p.file) : "null";
      return "  { file: " + f + ", tournament: " + q(p.tournament) +
             ", featured: " + bool(p.featured) + ",\n    caption: " + q(p.caption) + " }";
    }).join(",\n") + "\n];\n\n";

    /* 7 videos */
    s += hdr(7, "VIDEOS", [
      "youtubeId is just the ID from the YouTube link, not the whole link.",
      "The video must be Public or Unlisted."
    ]);
    s += "const VIDEOS = [\n" + D.videos.map(function (v) {
      return "  { tournament: " + q(v.tournament) + ", youtubeId: " + q(v.youtubeId) +
             ",\n    title: " + q(v.title) + " }";
    }).join(",\n") + "\n];\n\n";

    /* 8 rules */
    s += hdr(8, "RULES");
    s += "const RULES = [\n" + D.rules.map(function (r) {
      return "  { text: " + q(r.text) + " }";
    }).join(",\n") + "\n];\n\n";

    /* 9 paddles */
    s += hdr(9, "PADDLE RENTALS", ["The green box on the Rules and Info page."]);
    s += "const PADDLE_RENTAL = {\n";
    s += "  title: " + q(D.paddle.title) + ",\n";
    s += "  intro: " + q(D.paddle.intro) + ",\n";
    s += "  points: [\n" + (D.paddle.points || []).map(function (p) {
      return "    { lead: " + q(p.lead) + ",\n      text: " + q(p.text) + " }";
    }).join(",\n") + "\n  ]\n};\n\n";

    /* 10 info */
    s += hdr(10, "INFO SECTIONS", [
      "The cards on the Rules and Info page.",
      "Each point is a short bold lead plus the detail."
    ]);
    s += "const INFO_SECTIONS = [\n" + D.info.map(function (x) {
      return "  {\n    icon:  " + q(x.icon) +
             ",\n    title: " + q(x.title) +
             ",\n    intro: " + q(x.intro) +
             ",\n    points: [\n" + (x.points || []).map(function (p) {
               return "      { lead: " + q(p.lead) + ",\n        text: " + q(p.text) + " }";
             }).join(",\n") + "\n    ]\n  }";
    }).join(",\n") + "\n];\n";

    $("out").textContent = s;
    return s;
  }

  /* ------------------------------------------------------ change tracking -- */

  var SECTIONS = [
    ["club", "Club info"], ["history", "History"], ["officers", "Officers"],
    ["schedule", "Schedule"], ["scheduleNote", "Schedule note"],
    ["tournaments", "Tournaments"], ["photos", "Photos"], ["videos", "Videos"],
    ["rules", "Rules"], ["paddle", "Paddle rentals"], ["info", "Info sections"]
  ];

  function changedSections() {
    if (!ORIGINAL) return [];
    return SECTIONS.filter(function (s) {
      return JSON.stringify(D[s[0]]) !== JSON.stringify(ORIGINAL[s[0]]);
    }).map(function (s) {
      var a = ORIGINAL[s[0]], b = D[s[0]], note = "";
      if (Array.isArray(a) && Array.isArray(b)) {
        var d = b.length - a.length;
        if (d > 0) note = d + " added";
        else if (d < 0) note = (-d) + " removed";
        else note = "edited";
      } else note = "edited";
      return { name: s[1], note: note };
    });
  }

  /* The status strip appears on every tab so it is impossible to miss. */
  function drawStatus() {
    var host = $("status");
    if (!host) return;
    var ch = changedSections();

    if (!ch.length) {
      host.className = "warn";
      host.innerHTML = "<strong>No unsaved changes.</strong> " +
        "What you see here matches the file the website is currently using.";
      return;
    }

    host.className = "warn green";
    host.innerHTML = "<strong>You have " + ch.length +
      " unpublished change" + (ch.length === 1 ? "" : "s") + ":</strong> " +
      ch.map(function (c) { return c.name + " (" + c.note + ")"; }).join(", ") +
      ".<br>Nothing is live until you finish the <strong>Publish</strong> tab.";
  }

  /* -------------------------------------------------------------- download -- */

  function downloadFile() {
    var blob = new Blob([build()], { type: "text/javascript;charset=utf-8" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = "data.js";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(url); }, 2000);
  }

  /* --------------------------------------------------------- sync checking -- */

  async function checkPublished() {
    var box = $("sync-out");
    box.innerHTML = '<div class="warn">Checking the live website...</div>';

    try {
      var res = await fetch("assets/js/data.js?cb=" + Date.now(), { cache: "no-store" });
      var txt = await res.text();

      var ctx = {};
      new Function("with(this){" + txt + "; return {CLUB:CLUB,HISTORY:HISTORY," +
        "OFFICERS:OFFICERS,SCHEDULE:SCHEDULE,SCHEDULE_NOTE:SCHEDULE_NOTE," +
        "TOURNAMENTS:TOURNAMENTS,PHOTOS:PHOTOS,VIDEOS:VIDEOS,RULES:RULES," +
        "PADDLE_RENTAL:PADDLE_RENTAL,INFO_SECTIONS:INFO_SECTIONS};}")
        .call(ctx);

      var pub = new Function(txt + "; return {club:CLUB,history:HISTORY," +
        "officers:OFFICERS,schedule:SCHEDULE,scheduleNote:SCHEDULE_NOTE," +
        "tournaments:TOURNAMENTS,photos:PHOTOS,videos:VIDEOS,rules:RULES," +
        "paddle:PADDLE_RENTAL,info:INFO_SECTIONS};")();

      var diff = SECTIONS.filter(function (s) {
        return JSON.stringify(D[s[0]]) !== JSON.stringify(pub[s[0]]);
      });

      if (!diff.length) {
        box.innerHTML = '<div class="warn green"><strong>You are in sync.</strong> ' +
          "The published file matches what is in this editor. Your changes are live. " +
          "Remember to hard refresh the site with Ctrl+Shift+R if you still see the old version.</div>";
      } else {
        box.innerHTML = '<div class="warn"><strong>Not published yet.</strong> ' +
          "These sections are different from what the website is using: <strong>" +
          diff.map(function (s) { return s[1]; }).join(", ") +
          "</strong>.<br>Finish the steps above, then check again.</div>";
      }
    } catch (e) {
      box.innerHTML = '<div class="warn red">Could not read the live file. ' +
        "If you are opening this page straight from your hard drive, this check " +
        "will not work. Open the published website instead.</div>";
    }
  }

  /* ---------------------------------------------------------------- copy -- */

  $("copy-btn").addEventListener("click", function () {
    var btn = this, txt = $("out").textContent;
    function done() {
      var old = btn.textContent;
      btn.textContent = "Copied";
      btn.classList.add("copied");
      setTimeout(function () { btn.textContent = old; btn.classList.remove("copied"); }, 1800);
    }
    function fallback() {
      var r = document.createRange();
      r.selectNodeContents($("out"));
      var sel = window.getSelection();
      sel.removeAllRanges(); sel.addRange(r);
      try { document.execCommand("copy"); done(); }
      catch (e) { alert("Click the black box, press Ctrl+A then Ctrl+C."); }
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(txt).then(done, fallback);
    } else fallback();
  });

  $("dl-btn").addEventListener("click", downloadFile);
  $("sync-btn").addEventListener("click", checkPublished);

  $("discard-btn").addEventListener("click", function () {
    if (!confirm("Throw away every change you have made and go back to what the website is currently using?")) return;
    try { localStorage.removeItem(LS_KEY); } catch (e) {}
    location.reload();
  });

  /* ---------------------------------------------------------------- tabs -- */

  var TABS = [
    ["club", "Club info"], ["schedule", "Schedule"], ["tourneys", "Tournaments"],
    ["photos", "Photos"], ["videos", "Videos"], ["history", "History"],
    ["rules", "Rules"], ["info", "Info sections"], ["publish", "Publish"]
  ];

  function setupTabs() {
    $("tabbar").innerHTML = TABS.map(function (t, i) {
      return '<button class="tab' + (i === 0 ? " on" : "") +
        (t[0] === "publish" ? " publish-tab" : "") + '" data-tab="' + t[0] + '">' +
        t[1] + "</button>";
    }).join("");

    $("tabbar").addEventListener("click", function (e) {
      var b = e.target.closest(".tab");
      if (!b) return;
      document.querySelectorAll(".tab").forEach(function (x) { x.classList.remove("on"); });
      document.querySelectorAll(".panel").forEach(function (x) { x.classList.remove("on"); });
      b.classList.add("on");
      $("p-" + b.dataset.tab).classList.add("on");
      window.scrollTo({ top: 0 });
    });

    $("p-club").classList.add("on");
  }

  /* ---------------------------------------------------------------- boot -- */

  var booted = false;

  function boot() {
    if (booted) return;
    booted = true;
    ORIGINAL = loadFromSite();
    D = restore();
    setupTabs();
    drawAll();
    drawStatus();
    showOriginNote();
  }

  /* Warn when the editor is running somewhere other than the published site,
     because drafts are stored per website and do not carry across. */
  function showOriginNote() {
    var note = $("origin-note");
    if (!note) return;
    var host = location.hostname;
    if (host === "localhost" || host === "127.0.0.1" || location.protocol === "file:") {
      note.className = "warn red";
      note.innerHTML = "<strong>You are using a local test copy, not the real website.</strong> " +
        "Changes you make here are stored only in this browser on this address, and they " +
        "will not appear in an editor opened on the live site. " +
        "To avoid confusion, do your editing at " +
        "<strong>https://whspingpong.github.io/admin.html</strong> instead.";
      note.style.display = "";
    } else {
      note.style.display = "none";
    }
  }

  try {
    if (sessionStorage.getItem(LS_UNLOCK) === "1") { unlock(); boot(); }
  } catch (e) {}

  $("pw").focus();
})();
