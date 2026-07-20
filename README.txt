SPRITE CHECKLIST — CLEAN REVIEW BUILD

What is included
- Four rarity pages: Rare, Epic, Legendary, and Mythic.
- The current published design and all artwork it references.
- Owner-only visual editing, live previews, save confirmations, and automatic GitHub publishing.
- Search, collection/mastery tracking, custom groups and boxes, image drop zones, and reorder controls.
- Shared Base, Gold, Gummy, Galaxy, Cube, Gem, Quack, and Holofoil image-area backgrounds that apply automatically by variant name.
- Native mobile scrolling, horizontal sprite rows, installable app icons, and offline caching.

Clean first upload
1. Extract the full-site ZIP on your computer.
2. Open the new GitHub repository.
3. Upload the contents of the extracted folder, not the ZIP itself and not an extra enclosing folder.
4. Confirm that index.html is visible at the repository root.
5. Confirm that assets, published-assets, fonts, and icons remain folders.
6. Commit the upload.
7. In Settings > Pages, choose Deploy from a branch, main, /(root), then Save.
8. Keep the old repository until the new site has passed the review checklist below.

Expected root files
- index.html
- styles.css
- app.js
- data.js
- published-design.js
- service-worker.js
- manifest.webmanifest
- README.txt

Expected folders
- assets — bundled interface artwork, including the shared variant-background pack
- published-assets — public design artwork and the custom font
- fonts — bundled fallback fonts
- icons — home-screen and app icons

Important protection rule for later updates
- A full clean-site upload includes published-design.js and published-assets.
- A normal code-only update must not replace published-design.js or published-assets.
- Download a complete backup from Edit Mode before a large design change or repository move.

Owner editing and publishing
1. Unlock Owner access, then turn on Edit Mode.
2. Use the blue Edit button on the exact header, rarity page, group, or sprite you want to change.
3. Use Whole-site defaults only for settings shared by every page.
4. In Whole-site defaults, open Sprite image areas & variant backgrounds to replace a background once for every matching variant.
5. Save buttons close a successful editor and show a visible saved notification.
6. Automatic Sync detects the GitHub Pages repository name from the site address. Review the owner, repository, and branch before connecting.
7. The owner key only unlocks this browser's editor. GitHub repository permissions and the repository-limited token protect the public site.

Browser storage behavior
- Collection and mastery progress is private to each browser/device.
- The public design comes from published-design.js and is shared by every browser after GitHub Pages deploys it.
- Each GitHub Pages repository now has isolated design and sync storage, so an older project at the same github.io domain cannot overwrite the clean site.
- Existing checklist progress is migrated when possible; use Download complete backup and Restore from backup when deliberately moving all local editor data.

Recommended source-art sizes
- Site or rarity background: 2400 × 1350 px.
- Header artwork: 2000 × 1000 px; keep important text/art near the center.
- Group background: 2000 × 1400 px.
- Sprite-card background: 1200 × 1500 px.
- Sprite artwork or image-well background: 1200 × 1200 px, preferably transparent for sprite art.
- Side artwork: 1200 × 2400 px.
- App icon: 512 × 512 px.
- Custom font: WOFF2 preferred; WOFF, TTF, and OTF are supported up to 1.8 MB.

Images smaller than these sizes still work, but the app does not invent missing detail by enlarging them. High-resolution originals look sharper on Retina phones and tablets.

Review checklist
1. Open Rare, Epic, Legendary, and Mythic.
2. Confirm every visible sprite image loads.
3. Swipe vertically starting over sprite artwork; the page should move.
4. Swipe a sprite row left and right; the row should coast natively and reveal a complete final card.
5. Mark one sprite In Collection and Mastered, reload, and confirm the mark remains.
6. Search for Grim and confirm the result opens Mythic and highlights the exact sprite.
7. Unlock Owner access, change one harmless text field, save, and confirm the editor closes and the saved notification appears.
8. Confirm Automatic Sync shows the new repository before connecting it.
9. Test once in Safari and once in Chrome before deleting the old repository.

Notes
- Mastering a sprite also marks it collected.
- Removing collection status also removes mastery status.
- Hidden groups and sprites remain available in Edit Mode unless they were explicitly deleted.
