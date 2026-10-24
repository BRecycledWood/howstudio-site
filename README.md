# HOWstud.io — Public Marketing Site

Source for the live site at howstud.io. Content baseline: **Website Design + Development Handoff v1.0 (24 Oct 2026)**.

Static, zero-dependency build. No Node, no bundler, no framework, no runtime CDN calls — open the files or upload them and the site works.

## Pages

| File | Page | Notes |
| --- | --- | --- |
| `index.html` | Home | Hero, intro, capability teaser, method band, closing CTA |
| `work.html` | Work | ONE MOE, Selected Web Experiences, Local Visibility Tools + disclosure policy |
| `capabilities.html` | Capabilities | Six services, "where we're useful" signals |
| `the-how.html` | The HOW | Discover / Design / Build / Operate & Evolve + five principles |
| `start-a-project.html` | Start a Project | Project inquiry form (validation, spam checks, success state) |
| `privacy.html` | Privacy Policy | Rewritten; needs legal sign-off |
| `terms.html` | Terms of Service | Rewritten; needs legal sign-off |
| `404.html` | Not found | Route as the host's 404 page |
| `contact.html`, `projects.html` | Redirects | Old URLs → `start-a-project.html` / `work.html` |
| `robots.txt`, `sitemap.xml` | SEO | Update URLs if the domain changes |

## Structure

```
/
├── index.html, work.html, capabilities.html, the-how.html,
│   start-a-project.html, privacy.html, terms.html, 404.html
├── contact.html, projects.html          ← client-side redirects for old URLs
├── robots.txt, sitemap.xml
└── assets/
    ├── css/site.css                     ← design tokens + all components
    ├── js/site.js                       ← nav, reveals, ticker, form logic
    ├── brand/
    │   ├── wordmark-ink.svg             ← nav (dark ink on paper)
    │   ├── wordmark-cream.svg           ← footer (cream on dark)
    │   ├── favicon.svg, favicon-32.png, favicon-192.png, favicon-512.png
    │   └── apple-touch-icon.png
    ├── img/og-image.png                 ← 1200×630 Open Graph / social preview
    └── fonts/                           ← self-hosted WOFF2 + OFL licences
        ├── archivo-latin-var.woff2      ← display (variable, wght + wdth)
        ├── dm-sans-latin-var.woff2      ← body (variable)
        ├── instrument-serif-latin-italic.woff2  ← editorial italic accents
        └── jetbrains-mono-latin-var.woff2       ← labels, eyebrows, meta
```

## Design direction implemented

The handoff suggested a blend of 60% bold editorial / 25% unexpected composition / 15% premium product tech. That is what this build is:

- **Type as the design.** Oversized tight-tracked Archivo display headlines, optional italic Instrument Serif for the emotional line ("Let's fix that."), DM Sans for body, JetBrains Mono for labels and metadata. All four are OFL-licensed and self-hosted (no Google Fonts request, so no third-party data transfer on page load).
- **Editorial grid.** Asymmetric 12-column layouts, ruled section heads with an index (`01 — Intro`), sticky column headings, generous whitespace, hairline rules instead of boxes and shadows.
- **Colour.** The handoff palette was exploratory: warm off-white `#F5F1E9`, charcoal `#202124`, electric orange `#F05A28`, muted gray `#77736E`. All four are used. A darker orange `#B03F0D` is used for small orange text so it clears WCAG AA on both cream backgrounds; `#F05A28` stays for fills, rules and accents.
- **Motion.** Short, intentional: staggered reveals on scroll, hover fills on capability rows, a pausable marquee band. Everything is disabled under `prefers-reduced-motion`, and content is visible without JS.
- **Project visuals.** No stock photography and no invented screenshots. The work cards use neutral "concept sketch" line art built from CSS, captioned as concept sketches — which is exactly the handoff's rule: concept imagery only, never fake case-study evidence.

Contrast, focus states, heading order, keyboard order, touch targets (≥44px for controls), and 320px-wide layouts were verified (details in "QA performed" below).

## Form behaviour

`start-a-project.html` posts to whatever endpoint is set on the form:

```html
<form novalidate data-project-form data-endpoint="">
```

- **Empty `data-endpoint` (current state):** the visitor's message is handed to their mail app addressed to `hello@howstud.io`, and a copy is kept in `localStorage` (`howstudio:pending-leads`) so nothing is silently lost. A success panel confirms the message and offers a direct-email fallback.
- **With an endpoint (HubSpot, Formspree, a serverless function, etc.):** set `data-endpoint="https://…"`, and the same payload is POSTed as JSON (`name`, `email`, `company`, `service`, `budget`, `timeline`, `message`, `consent`, `page`, `submittedAt`). Errors keep the visitor's input, show a retry message, and still store the lead locally.

Included regardless of endpoint: inline validation with `aria-invalid` + error text, loading state on submit, honeypot field, submit-timing check, accessible status region, and a `mailto` includes the full inquiry as a recoverable record.

## Deployment

Any static host works (Hostinger `public_html`, Vercel, Netlify, Cloudflare Pages).

1. Upload the repository contents (keep the `assets/` folder structure).
2. Set `404.html` as the not-found document, and `index.html` as the directory index.
3. Serve over HTTPS and keep the `.html` URLs (or add rewrites if extensionless URLs are preferred — canonical tags currently point at the `.html` files).
4. Confirm the email alias `hello@howstud.io` exists, then replace the display-only mentions if the mailbox changes.

## QA performed

- **Accessibility:** axe-core (WCAG 2.0/2.1 A + AA + best practice) — **0 violations** on all eight pages, including with the mobile menu open. Skip link, visible focus rings, semantic landmarks, one `h1` per page, labelled form controls, `aria-live` feedback.
- **Responsive:** 320, 390, 720, 960, 1080, 1440px — no horizontal overflow on any page; layouts tested with the real announcement ticker and mobile menu open.
- **Behaviour:** form validation, bad email, consent, success path, mobile menu open/close/Escape/resize, keyboard tab order, reduced-motion mode, sticky header state.
- **Performance:** ~270 KB total for the home page including fonts; no layout shift (CLS 0.000); JS is one deferred 8 KB file; fonts are preloaded and self-hosted; `prefers-reduced-motion` respected.
- **SEO:** unique titles and meta descriptions, canonicals, Open Graph + Twitter cards with a real 1200×630 image, `ProfessionalService` structured data on the home page, `robots.txt`, `sitemap.xml`.

## Open items before launch (from the handoff)

1. **Legal review.** Privacy and Terms were rewritten from the previous placeholders; a lawyer should sign off before publishing. Terms now say Hudson County, New Jersey (the old page said "Hudson County, NH", which is wrong).
2. **Form destination.** Choose the CRM/endpoint (HubSpot Free was proposed) and add the URL to `data-endpoint`. Until then, inquiries go through the visitor's mail app.
3. **Work page evidence.** ONE MOE and the other cards may only show real names, screenshots and results once permission is confirmed. Current cards are honest placeholders with concept art.
4. **Email address.** `hello@howstud.io` is displayed throughout; verify the mailbox is live.
5. **Brand assets.** The wordmark, favicon and OG image in `assets/brand` and `assets/img` are generated for this build. Replace them with the official logo files if the studio has them — the CSS references only the filenames above.
6. **Analytics.** Deliberately not installed. Add after the privacy/cookie review, and update `privacy.html` if that changes.
7. **Fallback for old inbound links.** `contact.html` and `projects.html` now redirect; add server-side 301s once the host is configured.

## Conventions

- Edit copy in the HTML; layout and tokens live in `assets/css/site.css` (`:root` at the top).
- Reuse the existing classes (`.h1`/`.h2`/`.btn`/`.cap-row`/`.service`/`.field`) instead of adding page-specific CSS.
- Font licences: SIL Open Font License, copies in `assets/fonts/OFL-*.txt`.
