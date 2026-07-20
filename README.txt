SPRITE CHECKLIST — PUBLIC-ONLY BUILD

WHAT CHANGED
- All owner access, Edit Mode, Design Studio, upload, drag-and-drop editing, publishing, cloud sync, and code-updater features were removed.
- The public tracker remains: Rare, Epic, Legendary, and Mythic pages; search; collection and mastery tracking; native horizontal rows; mobile scrolling; installed artwork; and offline support.
- The app no longer reads a private browser copy of the design. Every browser uses the files published on GitHub Pages.
- On first use, the app removes only retired editor/design/owner/sync browser records. Checklist progress is preserved.
- The smaller public app loads less JavaScript and no longer embeds a second full copy of the design in index.html.

FILES TO REPLACE FOR THIS UPDATE
- index.html
- styles.css
- app.js
- service-worker.js
- manifest.webmanifest
- README.txt

FILE TO ADD
- art-config.js

DO NOT DELETE OR REPLACE UNLESS YOU INTEND TO CHANGE THEIR CONTENT
- data.js
- published-design.js
- assets/
- published-assets/
- fonts/
- icons/

SAFE CLEANUP FROM THE PREVIOUS REPOSITORY SCREEN
- Delete card-1200x1500/
- Delete well-1200x1200/
- Delete variant-background-map.json
- If they ever appear, delete snorky_sprite_tracker_local_editor/, Sprite-Checklist-safe-publisher.html, sprite-code-update.json, and repository ZIP files.

ADDING OR CHANGING ARTWORK
1. Put the new image inside assets/custom/ or another clearly named folder in the repository.
2. Open art-config.js.
3. Enter the repository-relative image path in the matching setting.
   Example: "assets/custom/rare-header.webp"
4. Commit the file changes. GitHub Pages will publish them for every browser.

ART-CONFIG RULES
- null keeps the value from published-design.js.
- "" intentionally removes an image or text value.
- Image fits are cover, contain, tile, repeat, or stretch.
- You can set the site background, main header, separate rarity headers and page backgrounds, all variant backgrounds, group backgrounds, individual sprite art, individual card backgrounds, side art, header text, labels, mastery prompt, footer text, and page titles.
- Family and variant IDs are listed in data.js. Keep those IDs lowercase and unchanged.

RECOMMENDED SOURCE-ART SIZES
- Site or rarity background: 2400 × 1350 px for Cover, or 1200 × 1200 px for Seamless tile.
- Header artwork: 2000 × 1000 px; keep important content near the center.
- Group background: 2000 × 1400 px.
- Sprite-card background: 1200 × 1500 px.
- Sprite artwork or image-area background: 1200 × 1200 px; transparent WebP or PNG is preferred for sprite art.
- Side artwork: 1200 × 2400 px.
- App icon: 512 × 512 px.

Use high-resolution originals. The app fits artwork to its area but cannot restore detail missing from a small or heavily compressed source.

BROWSER AND PROGRESS BEHAVIOR
- Everyone receives the same artwork and layout from the GitHub Pages files.
- Collection and mastery progress remains private to each browser/device.
- Mastering a sprite also adds it to the collection.
- Removing a sprite from the collection also removes mastery.
- The service worker checks the network first for updated app files, then falls back to its offline copy.

REVIEW CHECKLIST
1. Open Rare, Epic, Legendary, and Mythic and confirm each page background appears.
2. Swipe vertically while starting over a sprite image; the page should scroll normally.
3. Swipe each sprite row left and right; it should use native momentum and reveal the complete final card.
4. Mark one sprite In Collection and Mastered, reload, and confirm it remains marked.
5. Search for Grim and confirm the result opens Mythic and highlights the sprite.
6. Confirm there is no Owner Access, Edit Mode, Design Studio, upload, publishing, or sync interface.
7. Test once in Safari and once in Chrome.
