# HOWstud.io — Public Marketing Site

Source for the live site at howstud.io. Hosted on Hostinger. DNS via Cloudflare.

## Structure

```
/
├── index.html          ← Main home page
├── contact.html        ← Contact page
├── privacy.html        ← Privacy policy
├── terms.html          ← Terms of service
└── assets/
    ├── how-studio-logo-full-wh.png     ← White logo (nav + footer)
        ├── how-studio-logo-full.png        ← Dark logo
            ├── how-studio-seal.png             ← Favicon
                ├── how-seal-logo-wh.png            ← Alternate white seal
                    ├── palettes.css                    ← Color palette reference
                        └── Sixtyfour-Regular-VariableFont_BLED,SCAN.ttf
                        ```

                        ## Deployment

                        1. Log into Hostinger hPanel
                        2. Go to Files > File Manager > public_html
                        3. Open index.html in the editor
                        4. Paste contents of index.html from this repo
                        5. Save

                        Assets live in public_html/assets/ — already uploaded to Hostinger.
                        Do NOT rename asset files without updating references in index.html.

                        ## Asset Reference

                        - how-studio-logo-full-wh.png → Nav bar, Footer
                        - how-studio-logo-full.png → Light background contexts
                        - how-studio-seal.png → Browser favicon (link rel=icon)
                        - how-seal-logo-wh.png → Alternate/fallback
                        - palettes.css → Brand color reference

                        ## Colors

                        - Dark (hero/sections): #1A2530
                        - Teal: #2BBFBF
                        - Pink/Magenta: #E91E8C
                        - Gold: #F5B800
                        - Navy: #3D4F63
                        - Slate (nav): #2A3A4A
                        - Cream (body bg): #F5F0E8

                        ## Notes

                        - Single-file site — no build step, no dependencies, no Node
                        - Fonts loaded via Google Fonts CDN (Inter + JetBrains Mono)
                        - All animations respect prefers-reduced-motion
                        - Fully responsive down to 860px breakpoint
