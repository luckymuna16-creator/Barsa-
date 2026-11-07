# Barsa ❤️ PWA

A lightweight mobile PWA for downloading direct media-file URLs when the source permits it and allows browser CORS access.

## Features
- Minimal dark mobile UI
- Download manager with percentage (when file size is provided), downloaded size, total size, status and estimated remaining time
- Direct MP4, WebM, MOV, MP3, M4A, OGG and WAV URL support
- Custom filename
- Installable PWA shell and basic offline caching

## Instagram limitation
Instagram post/Reel page URLs are not extracted. This static frontend does not scrape Instagram, use session cookies, bypass login, or circumvent platform restrictions. For your own Instagram content, use Instagram's official download options or Accounts Center data export: https://accountscenter.instagram.com/info_and_permissions/. If you have a direct media-file URL that you are authorized to download, the normal direct-link downloader may work if the host allows CORS.

## Technical limitations
- GitHub Pages hosts only static files; it does not run Python or backend code.
- Direct downloads require the media host to allow cross-origin browser requests (CORS).
- If the server does not provide Content-Length, exact percentage, total size and remaining time cannot be calculated.
- The app buffers the downloaded file in browser memory before saving; very large files may use substantial device memory.
- Use only content you own or have permission to download. Respect copyright and service terms.

## GitHub Pages deployment
1. Create a GitHub repository named `barsa-pwa`.
2. Upload all files in this folder to the repository root.
3. Open Settings → Pages.
4. Choose Deploy from a branch, branch `main`, folder `/(root)`, then Save.
5. After deployment, open `https://YOUR-USERNAME.github.io/barsa-pwa/` in Chrome.
6. In Chrome's menu choose Install app or Add to Home screen.

## Local test
Run `python -m http.server 8000` in this folder, then open `http://localhost:8000`.
