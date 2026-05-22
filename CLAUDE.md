# ConnorWithHonor.com

## Voice
Connor MacIvor — direct, authoritative, SCV local authority. AI + real estate + personal brand. Daily Download show host. Speaks from experience (20yr LAPD, 23yrs total law enforcement, licensed Realtor, AI builder). No fluff.

## Standing Orders
- Blog posts are Daily Download series (numbered 2026-XXX)
- Every post gets 3-5 internal cross-links
- Blog URL always prominent in YouTube descriptions and social shares

## Deploy — git is canonical (changed 2026-05-21)
- **Netlify ID:** 86bf07f4-401a-46cd-a6d5-9ce7ef48b81c
- **Deploy mechanism:** auto-deploy from this repo's `main` branch via Netlify build hook. Push = deploy.
- **Snapshot-API uploads are FORBIDDEN.** The `nfp_*` Netlify token was used historically for "download → modify → re-upload full site" deploys; this pattern is deprecated because it caused content wipes (see commit `c3ffbb5` 2026-05-21 sync incident).
- **To add a blog post:** create the HTML file under `/blog/`, update `/blog/index.html`, update `/sitemap.xml`, commit, push. Netlify deploys automatically.
- **Build config:** `netlify.toml` at repo root. HTML post-processing is disabled to prevent injection drift.
- **Client sites (Talie/WHM, Marcela, Hittleman, Nicole)** follow a different mirror rule (see `claude-memory/client-sites-mirror-rule.md`). This site is one of Connor's OWN brands and uses git-canonical.

See `claude-memory/connor-own-sites-git-canonical.md` for the broader policy applied to all of Connor's own brand sites.
