# Deploying UMWSC to Vercel

Written for `github.com/umwomensclubsoccer/umwsc`, branch `main`.

The site is plain HTML, CSS and JS with **no build step** — no `package.json`, no
bundler config. That makes it about as simple as a Vercel deploy gets: Vercel just
serves the files in the repo as they are.

---

## Before you start: the site is currently on GitHub Pages

`.github/workflows/static.yml` deploys the whole repo to GitHub Pages on every push
to `main`. If you set up Vercel and leave that running, you end up with **two live
copies of the site** at two different URLs, and they drift apart the moment one
deploy fails.

I've already edited that workflow to remove its automatic `push` trigger, so Pages
will stop republishing on every commit. It can still be run by hand from the
Actions tab if you ever want the Pages copy back.

Two things still to do on GitHub's side, which I can't do from here:

1. **Turn Pages off:** repo → **Settings** → **Pages** → under "Build and
   deployment", set Source to **None**.
2. **Optionally delete the workflow** entirely once Vercel is confirmed working:
   ```
   git rm .github/workflows/static.yml
   git commit -m "Remove GitHub Pages deploy in favour of Vercel"
   ```

If the club's domain is currently pointed at GitHub Pages, **don't change DNS until
Vercel is live and working on its `.vercel.app` URL.** Otherwise the site goes dark
in between.

---

## Step 1 — Connect the repo

1. Go to <https://vercel.com/signup> and sign up **with GitHub**.
   - Use an account that has access to the `umwomensclubsoccer` org, or you won't
     see the repo. If you don't own that org, an owner will need to approve the
     Vercel GitHub app.
   - The Hobby plan is free and is fine for this site. Note Vercel's Hobby plan is
     for non-commercial use — a student club site qualifies.
2. **Add New… → Project**, then **Import** `umwomensclubsoccer/umwsc`.
3. On the configure screen:

   | Setting | Value |
   |---|---|
   | Framework Preset | **Other** |
   | Root Directory | `./` |
   | Build Command | *leave empty* (disable the override) |
   | Output Directory | *leave empty* |
   | Install Command | *leave empty* |

   The one thing that will break this deploy is letting Vercel guess a framework.
   It should be **Other**, with no build command.

4. **Deploy.** You'll get a URL like `umwsc.vercel.app`. Every push to `main` now
   redeploys automatically; pull requests get their own preview URLs.

### Check these pages specifically

Vercel serves from a **case-sensitive** filesystem. macOS is not case-sensitive, so
a filename that works on your laptop can 404 in production. Click through:

- `/roster.html` — both season tabs, and check no photos are broken
- A player bio (e.g. `/players/25_26_Barkes.html`) and the **Back to Roster** button
- `/players/wilkowski.html` — this was recently renamed, worth confirming
- A coach page (e.g. `/coaches/hijazi.html`)
- `/contact.html` — submit the form once; it posts to Formspree, not to Vercel

---

## Step 2 — Work out whether the club already has a domain

You said you weren't sure. Ways to find out, cheapest first:

1. **Ask the outgoing board / club president.** Domains are usually bought on
   someone's personal card and quietly renew for years. This is by far the most
   common answer.
2. **Check what the Instagram bio links to** (`instagram.com/umwsc`) — if it points
   at something other than a `github.io` URL, that's your domain.
3. **Look it up.** Run `whois umwsc.com` in Terminal, or use
   <https://lookup.icann.org>. If it's registered, you'll see a registrar name and
   an expiry date, though the owner will likely be redacted for privacy.
4. **Ask UMich Club Sports.** If the club ever had a `*.umich.edu` address, that's
   controlled by university IT, not by you — you'd need to go through them, and
   they may not permit pointing it at an outside host. A separate `.com` you
   control is usually far less friction.

### If there's no domain

You can buy one straight from Vercel (**Domains** in the dashboard), which skips
all the DNS work below — it's wired up automatically. It costs a little more than a
budget registrar.

Otherwise Cloudflare or Namecheap are the usual picks, roughly $10–15/year for a
`.com`. Whatever you choose:

> **Put the renewal on a club account, not a personal one, and set a calendar
> reminder.** Club sites die every year because the one person who owned the domain
> graduated and the auto-renew card expired.

---

## Step 3 — Point the domain at Vercel

In Vercel: **Project → Settings → Domains → Add Domain**. Enter the apex
(`umwsc.com`) and accept the prompt to also add `www`.

Vercel then shows you a **domain card** with the exact DNS records to create. Two
routes:

### Option A — DNS records (keeps your registrar in charge)

Add these at your registrar's DNS panel:

| Type | Name | Value |
|---|---|---|
| `A` | `@` | *the IP shown on your domain card* |
| `CNAME` | `www` | *the target shown on your domain card* |

**Use the values Vercel shows you, not values from a blog post or from me.** Vercel
now issues per-project addresses from an anycast pool — older projects were given
`76.76.21.21` and a shared `cname.vercel-dns.com`, while newer ones get different
IPs (e.g. `216.198.79.1`) and a project-specific CNAME like
`d1d4fc829fe7bc7c.vercel-dns-017.com`. Copying a stale value is the single most
common reason a domain sits on "Invalid Configuration".

### Option B — Vercel nameservers (Vercel runs your DNS)

Replace the nameservers at your registrar with the ones Vercel lists. Simpler, but
**it moves all DNS for that domain to Vercel** — so if the club has email on that
domain (Google Workspace, etc.), you must recreate those MX records in Vercel or
club email stops working. Prefer Option A if email exists.

### Then

- Propagation is usually minutes, but can take up to 48 hours. Vercel's domain page
  will flip from "Invalid Configuration" to a green check on its own.
- HTTPS certificates are issued automatically once DNS resolves — don't buy one.
- Pick a primary in Vercel so `umwsc.com` and `www.umwsc.com` don't both serve the
  site independently; Vercel will redirect one to the other.

---

## Troubleshooting

| Symptom | Cause |
|---|---|
| Stuck on "Invalid Configuration" | Wrong A/CNAME value — recheck against the domain card. Also check your registrar didn't append the domain to the record name, creating `www.umwsc.com.umwsc.com`. |
| Apex works, `www` doesn't (or vice versa) | Only one of the two records was added. |
| A page 404s on Vercel but works locally | Filename case mismatch. |
| Images broken in production only | Same — check `.jpg` vs `.JPG` and capitalised names like `Blank.png`. |
| Old site still showing | Browser or DNS cache. Try an incognito window, or `dig umwsc.com` to see the live record. |
| Changes not deploying | Check the repo is on `main` and the commit actually pushed. |

---

## Sources

- [Adding & Configuring a Custom Domain — Vercel Docs](https://vercel.com/docs/domains/working-with-domains/add-a-domain)
- [Can I use my domain on Vercel with A records? — Vercel KB](https://vercel.com/kb/guide/use-domain-vercel-a-records)
- [Troubleshooting domains — Vercel Docs](https://vercel.com/docs/domains/troubleshooting)
