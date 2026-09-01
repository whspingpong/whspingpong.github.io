# Woodinville High School Ping Pong Club Website

Plain HTML, CSS and JavaScript. No build step, no frameworks, no server. It runs
anywhere you can host static files, including free GitHub Pages.

---

## The one file you edit

**`assets/js/data.js`**

Schedule, tournaments, photos, videos, rules, history, officers and contact info
all live in that one file. Every page is generated from it. You should never
need to open a `.html` file.

---

## Changing the schedule (the weekly job)

Open `assets/js/data.js` and scroll to **section 4, `SCHEDULE`**.

Each day looks like this:

```js
{
  date:    "2026-09-03",
  type:    "training",
  title:   "Training Day",
  time:    "After school",
  place:   "E Building",
  visible: true,
  note:    "Drills and match practice for varsity and JV."
},
```

### `visible` is the important one

| Value | What happens |
|---|---|
| `visible: true` | Shows on the website |
| `visible: false` | Completely hidden, not on the page at all |

This lets you **plan a month ahead and reveal one week at a time**. Hidden
entries are not just visually hidden, they never get rendered, so nobody can
find them by viewing the page source.

### `type` controls the colour and label

| Type | Label | Colour |
|---|---|---|
| `"meeting"` | Club Meeting | Green |
| `"training"` | Training Day | Navy |
| `"tournament"` | Tournament | Gold |
| `"event"` | Event | Bronze |

### To change this week's training days

1. Find the two `type: "training"` entries.
2. Change the `date` to the new days (format is `YYYY-MM-DD`).
3. Update `time`, `place` and `note` if they changed.
4. Save, then push.

Days sort themselves by date and group into weeks automatically, so you can
paste new entries anywhere in the list.

---

## The easy way: the Officer Editor

Open **`admin.html`** (there is a faint **Officer login** link at the very bottom
of every page, or go to `yoursite.com/admin.html` directly).

Password: **`683293`**

It has a tab for everything: club info, schedule, tournaments, photos, videos,
history, rules, officers and info sections. You fill in boxes, it writes the code
for you, and the **Publish** tab walks you through getting it onto GitHub in six
numbered steps.

Your work is saved in your browser as you type, so closing the tab will not lose
anything.

### About that password

It stops a random student who finds the page from messing around. It is **not**
real security, because anyone who knows how to read a page's source can get past
it. That is unavoidable on a site with no server.

**The thing that actually protects the site is GitHub.** The editor only produces
text. Nothing goes live until someone with repo access commits it. So a stranger
getting the password still cannot change the website.

To change it later, generate a new SHA-256 hash of the password you want and
replace the `PASSWORD_HASH` line near the top of `assets/js/admin.js`:

```
python -c "import hashlib; print(hashlib.sha256('yournewpassword'.encode()).hexdigest())"
```

---

## Who can change the schedule

Publishing requires **write access to the GitHub repository**. That is the whole
gate. If someone is not a collaborator on the repo, they cannot change a single
thing on the live site.

**Why there is no proper login:** this is a static site, so any password stored
in the code is readable by anyone who views the page source. A real login needs
a server, which GitHub Pages does not provide. GitHub accounts are the login
instead, which is both safer and free.

To give an officer edit access:

> Repo, then **Settings**, then **Collaborators**, then **Add people**, then
> their GitHub username

Give them the **Write** role. That lets them edit files but not delete the repo
or change its settings. To remove someone, take them off that same list. Their
access is gone immediately.

**Easiest way to edit without installing anything:** open `assets/js/data.js` on
github.com, click the **pencil icon**, make the change, and hit **Commit
changes**. The site updates about a minute later. This works fine from a phone.

Every edit is logged under the repo's **Commits** tab, so you can always see who
changed what, and roll back anything that goes wrong.

---

## Other common jobs

### Add a tournament
Copy the commented template at the bottom of `TOURNAMENTS`. Put new ones at the
**top**. `rank: 1/2/3` gives a gold, silver or bronze badge.

The **two most recent tournaments** automatically get the scrolling photo feeds
on the home page. Nothing to configure.

### Add photos

```
1. Copy your photos into  tools/incoming/
2. Run:  python tools/add-photos.py
3. Paste the printed lines into the PHOTOS list in data.js
4. Fix the tournament id and write a real caption
```

The script shrinks 8 MB camera files to around 200 KB and makes both the
full size and thumbnail versions. **Do not skip it.** Full size photos will make
the site painfully slow.

Lines with `file: null` are grey "coming soon" tiles. Delete them as real photos
come in.

### Add a video
Upload in YouTube Studio, then copy the ID out of the URL:

```
https://www.youtube.com/watch?v=dQw4w9WgXcQ
                                ^^^^^^^^^^^
```

Paste it into the matching `VIDEOS` entry. Set the video to **Public** or
**Unlisted**. Private videos will not embed.

### Add a history milestone
Add an entry to the top of `HISTORY`. Set `highlight: true` for a solid green
dot on the timeline.

### Change rules, paddle rentals, gear info, or officers
`RULES`, `PADDLE_RENTAL`, `INFO_SECTIONS` and `OFFICERS` near the bottom of
`data.js`. Info points are written as a short bold `lead` plus a `text`, which
is what keeps that page scannable. Keep the leads short.

---

## Preview before publishing

```
python -m http.server 8000
```

Then open <http://localhost:8000>.

---

## Publishing to GitHub Pages

1. Push this folder to the repo.
2. Repo, then **Settings**, then **Pages**. Source: **Deploy from a branch**,
   `main` / `/ (root)`, then **Save**.
3. Live in about a minute.

Give it a minute or two after each push. Seeing an old version? Hard refresh
with **Ctrl+Shift+R**.

---

## If the site goes blank

Almost always a typo in `data.js`. Press **F12**, click **Console**, and read
the red error. It gives you the line number.

Usual suspects: a missing comma between `{ ... }` blocks, a missing quote, or a
stray comma at the end of a list.

---

## Still worth filling in

- **Tournament times** for State and Nationals are currently just "All day"
- **Video IDs** are empty, so the Videos page shows placeholders
- Only 4 real photos so far, the rest of the gallery is placeholder tiles

---

## Files

```
index.html          Home. Record, this week, photo feeds, history, contact
schedule.html       Meetings, training days, tournaments, events
tournaments.html    Results with event description and how we did
gallery.html        Filterable photo gallery with lightbox
videos.html         YouTube embeds grouped by tournament
rules.html          Rules, paddle rentals, how everything works, officers
admin.html          Officer editor. Password protected, linked in the footer.

assets/js/data.js   <-- ALL CONTENT LIVES HERE
assets/js/app.js    Renderer. No need to touch.
assets/js/admin.js  The officer editor. Password hash is at the top.
assets/css/style.css  Theme. Colours are the variables at the top.
assets/css/admin.css  Styling for the editor only.

assets/img/logo.png        Club logo
assets/img/discord-qr.png  QR code for the Discord invite
assets/img/discord.svg     Discord logo
assets/img/instagram.svg   Instagram logo
assets/img/gmail.svg       Gmail logo
assets/img/photos/         Full size images (max 1600px)
assets/img/thumbs/         Thumbnails (max 700px)

tools/add-photos.py Resizes new photos for you
.nojekyll           Tells GitHub Pages to serve files as-is
```

### Regenerating the Discord QR

Only needed if the invite link ever changes. Update `discord:` in `data.js`,
then:

```
pip install qrcode pillow
python -c "import qrcode; qrcode.make('YOUR_NEW_LINK').save('assets/img/discord-qr.png')"
```
