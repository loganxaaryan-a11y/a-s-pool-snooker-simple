# A.S. Pool & Snooker Club — Kimi website redesign

GitHub Pages–ready, static HTML/CSS/JS website. No build command, database, or hosting subscription required.

## How to publish

1. Create a new public GitHub repository or open the existing website repository.
2. Upload the **contents of this folder** to the repository root (`index.html`, `assets/`, `data/`). The archival `reference/` folder is intentionally excluded from this publishing ZIP.
3. In GitHub **Settings → Pages**, select **Deploy from a branch**, branch `main`, folder `/(root)` and save.
4. Preview the published address on desktop and phone, click every location's map and phone links, and check every image. Add a custom domain later if desired.

For a quick local preview, open `index.html` or run `python -m http.server 8000` from this folder.

## What is included

- A photo-led, responsive homepage; modern forest-green/cream/amber visual language; responsive mobile navigation.
- 13 searchable club/location cards preserved from Kimi's version, with city filters, direct map links and contact links.
- Interactive Leaflet/OpenStreetMap branch map, synchronized with the filters and map-selection links.
- Individual club-detail overlays with three representative photos, contact and directions.
- Fully working gallery with filters, keyboard/lightbox controls and mobile swipe; optimized enhanced-image WebP assets.
- About, visit and events/contact sections, with a truthful **mailto** interaction (opens the visitor's email application; no backend/form submission).
- A dedicated optional WebGL 3D break scene with a moving perspective camera, a white ball striking the black 8-ball, the 8-ball scattering the rack, and 13 linked branch choices; no third-party animation libraries.
- The old Kimi/Argon reference HTML is intentionally excluded from this public upload package. Keep your previous archive separately for rollback.

## Important owner-verification checklist BEFORE going live

1. **Confirm all 13 locations with the owner.** Current names and order follow the owner-shared QR directory, not the discarded Kimi/Argon alternatives. Confirm that no branch has since opened, closed or changed its name.
2. **Confirm map pins and addresses.** The latitude/longitude points were inherited from Kimi and are approximate pending confirmation; the address and linked Google business listing may not match the exact pin. The map explicitly notes this.
3. **Confirm phone numbers** for each club and whether the listed contact is authorized for business inquiries. Kimi uses several shared numbers.
4. **Confirm the central contact email** (`arvindkhant3588@gmail.com`), especially before publishing the email links and the contact form.
5. **Confirm operating hours and prices.** Kimi's original draft has conflicting, unverified 24-hour/late-night and equipment claims. These are retained under `draftHours`, `draftRating`, and `draftTables` in the data for easy checking but intentionally not displayed on the public page.
6. **Approve photo use and branch attribution.** The provided enhanced assets are AI-retouched from user-shared visual references; some changed architecture, signage, table arrangements and people, so they are used here as representative brand/gallery visuals, not claims of exact interiors at particular branches. Replace with owner-approved photography when available. `data/image-credits.json` documents the imagery.
7. Validate permission to republish any source photographs captured from third-party listing websites.
8. Add the owner's social account, official branding file, analytics and domain once provided. None were invented.

## Maintaining the locations

`data/locations.json` is a readable master list. For the no-build static site, `data/locations.js` contains the same array assigned to `window.CLUB_LOCATIONS`; update **both files** after editing a branch, or regenerate the JavaScript with:

```bash
python -c "from pathlib import Path; p=Path('data'); (p/'locations.js').write_text('window.CLUB_LOCATIONS = '+(p/'locations.json').read_text().rstrip()+';\\n')"
```

Coordinates should come from the owner's verified Google Maps listings. Do not publish estimated geo-pins as exact.

## Image optimization

Images are stored as compressed WebP files in `assets/images/` and referenced by local relative paths. This avoids the dead `watermarked_img_*.jpg` paths and large image payloads in the original Kimi HTML. Replace a file at the same path or change its path in the data/gallery definition.

## Technical constraints

The page itself works as static files. The interactive map and fonts depend on CDNs (Leaflet/OpenStreetMap tiles and Google Fonts). If they fail, the map shows a fallback and individual Google Maps directions remain available. The contact form has no server and will not silently pretend to send a message.


## Owner QR list and 8-ball discovery (2026-10-31 update)

The 13 branch **names and ordering** in `data/locations.json` come from the owner-shared QR page:
https://qr2.me-qr.com/link-list/PR155wep/show

1. Vastral
2. Maninagar (Bhairavnath)
3. Nikol
4. Shahibaug
5. C.G. Road
6. Maninagar (Jawahar Chowk)
7. K.K. Nagar
8. Bopal (TRP Mall)
9. Chandkheda
10. Gandhinagar PDPU
11. Anand
12. Sindhu Bhavan
13. Nadiad

**Correction from previous Kimi draft:** the QR directory does **not** include Shela / Snooker Century or Vastral / Snooker Den. They were removed; K.K. Nagar and Sindhu Bhavan are now included.

**QR link quality:** the QR directory's K.K. Nagar Google link appears to point to Hocco Eatery; Bopal's points to TRP Mall rather than an A.S. club pin. For these we use explicit A.S. Google Maps search links instead of sending customers to the wrong business. Owner should confirm these, plus exact addresses for K.K. Nagar and Sindhu Bhavan.

### Optional 3D break experience (2026-10-31 iteration 3)
The black 8-ball photograph supplied for the project is the opening poster. The user chooses **Take your shot** or taps the photo; the photo moves forward and transitions to a **self-contained WebGL 3D illustration**, not a 2D canvas fake or a prerecorded video. The camera starts low near the black ball, a white cue ball rolls into it, the black ball moves into the rack, and the other balls scatter while the camera rises. After ~4.5 seconds the 13 existing location buttons are revealed, opening real club detail overlays.

- No autoplay, no audio, no required interaction. **Just show locations** reveals all 13 instantly; **Play again** resets. Respect reduced-motion settings.
- Uses WebGL 1 rather than a heavy third-party 3D package, so the whole static site can run on GitHub Pages without a build system, paid video generator, or third-party shader downloads.
- Browsers with disabled/unavailable WebGL immediately show the branch list on interaction instead of leaving a broken black canvas. The normal directory is independent in all cases.
- The 3D environment is a **stylized, physically inspired illustration**, not a photorealistic recording and not an exact 3D model of a particular branch. The real supplied 8-ball photo remains the opening poster.
- Performance and visual quality vary by device. Tested with Chromium/WebGL 1 using software GPU simulation and with mobile viewport, including location opening, replay, Skip and keyboard-friendly buttons. Verify on a real iPhone before client sign-off.
- Main animation source: `assets/break-cinematic.js`. The rest of the Kimi redesign and 13-branch data are preserved.


The remaining 11 map coordinates were carried over from the Kimi research draft and remain approximate until independently confirmed. The two new entries omit unverified coordinates and phone numbers rather than guessing.

## Pre-publication fixes applied (2026-10-31)

- Replaced Sindhu Bhavan’s questionable `kgmid` URL with an A.S.-specific Google Maps search; do not substitute a venue pin until owner confirms.
- Removed “(exact address to confirm)” from public cards and club detail views; these now display locality-level addresses only.
- Assigned different representative images to K.K. Nagar and Sindhu Bhavan, giving each of the 13 cards a distinct cover photo. Image-to-branch attribution is still not confirmed.
- Ensured the Enquire link inside a club popup dismisses it before taking the visitor to the contact form.
- Removed public “Pin pending” chips and kept missing map pins out of the interactive map.
- Excluded `reference/` from the publishing ZIP. The source files in this package are ready to upload at the GitHub repository root.

**Important:** Photos are AI-enhanced illustrations based on supplied venue references. Some reconstructed images materially differ from the original spaces. Owner approval and appropriate photo rights are still required before describing them as exact images of any particular branch. Eleven inherited map markers remain approximate. Contact email, numbers, addresses, and opening hours still require owner sign-off.
