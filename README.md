# Naimish Kanpata — Video Editor

Run `npm ci` and then `npm run dev` from this folder. Open the URL printed by Vite. To produce the static site, run `npm run build`. The output is in `dist/`.

Edit the profile, skills and contact details in `portfolio/page.html`. The four video selections and the “More videos on Google Drive” button are configured in `portfolio/media.json`. The MP4s and posters in `public/media/` come from these four Drive files. Each plays locally and links back to the original. “Download résumé” serves the supplied PDF.

To add the owner’s portrait, copy the photo to `public/media/portrait.jpg` and set `portrait` in `portfolio/media.json` to `"/media/portrait.jpg"`. Until a photo is supplied, the hero features Hanuman, one of the four selected edits.

The configured React component lives in `src/Scene.tsx`. The build checks every source and binary checksum in `upstream/SHA256SUMS`, uses the original Kage renderer for the portfolio, and makes the byte-exact original temple document available at `/landing-pages/kage-original.html`. The supplied license files are in `licenses/`.

The Google AI Studio editing prompt is in `public/downloads/Google_AI_Studio_Prompt.txt`.
