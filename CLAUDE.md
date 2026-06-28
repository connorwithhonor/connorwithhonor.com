# ConnorWithHonor.com

## Voice
Connor MacIvor — direct, authoritative, SCV local authority. AI + real estate + personal brand. Daily Download show host. Speaks from experience (20yr LAPD, 23yrs total law enforcement, licensed Realtor, AI builder). No fluff.

## Standing Orders
- Blog posts are Daily Download series (numbered 2026-XXX)
- Every post gets 3-5 internal cross-links
- Blog URL always prominent in YouTube descriptions and social shares

## Deploy — git is canonical, host is CLOUDFLARE PAGES (migrated off Netlify 2026-06-22)
- **Host:** Cloudflare Pages, project `connorwithhonor`, account `8d19fd09c66903840c347da43306673e`. DNS is on Cloudflare (apex/www → the Pages project).
- **Deploy mechanism:** push to `main` triggers `.github/workflows/deploy.yml`, which stages publishable files, runs an anti-wipe guard, then deploys via `cloudflare/wrangler-action` using the scoped `CLOUDFLARE_API_TOKEN` secret (Cloudflare Pages:Edit). Push = deploy. Local equivalent: `./deploy-cf.sh`.
- **NETLIFY IS DEAD here.** The site is NOT on Netlify anymore. Any `netlify.toml`, `nfp_*` token, Netlify build hook, or Netlify Forms reference is vestigial. Forms were re-platformed to the HonorElevate embed (`api.honorelevate.com/widget/form/mGUSifFd4c8kL442n86x`) because CF Pages cannot run Netlify Forms.
- **Snapshot / full-site re-upload deploys are FORBIDDEN** (caused the 2026-05-21 wipe). Git push is the only deploy path; the GitHub Action's anti-wipe guard refuses near-empty or non-HTML homepages.
- **To add a blog post:** create the HTML under `/blog/`, update `/blog/index.html`, update `/sitemap.xml`, commit, push. The Action deploys to Cloudflare Pages automatically and verifies the homepage + /blog/ are live.
- **Client sites (Talie/WHM, Marcela, Hittleman, Nicole)** follow a different mirror rule (see `claude-memory/client-sites-mirror-rule.md`). This site is one of Connor's OWN brands and uses git-canonical.

See `claude-memory/connor-own-sites-git-canonical.md` for the broader policy applied to all of Connor's own brand sites.
