const form = document.querySelector("#download-form");
const urlInput = document.querySelector("#media-url");
const nameInput = document.querySelector("#file-name");
const button = document.querySelector("#download-btn");
const message = document.querySelector("#message");
const manager = document.querySelector("#manager");
const statusPill = document.querySelector("#status-pill");
const progressBar = document.querySelector("#progress-bar");
const progressLabel = document.querySelector("#progress-label");
const progressValue = document.querySelector("#progress-value");
const downloadedSize = document.querySelector("#downloaded-size");
const fileSize = document.querySelector("#file-size");
const remainingTime = document.querySelector("#remaining-time");

function showMessage(text, kind = "") { message.textContent = text; message.className = `message ${kind}`; }
function formatBytes(bytes) {
  if (!Number.isFinite(bytes) || bytes < 0) return "Unknown";
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB", "TB"];
  let value = bytes, i = -1;
  do { value /= 1024; i++; } while (value >= 1024 && i < units.length - 1);
  return `${value.toFixed(1)} ${units[i]}`;
}
function formatTime(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return "Calculating…";
  if (seconds < 1) return "Almost done";
  const s = Math.ceil(seconds), h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), r = s % 60;
  return h ? `${h}h ${m}m` : m ? `${m}m ${r}s` : `${r}s`;
}
function setStatus(text, kind = "") { statusPill.textContent = text; statusPill.className = `status-pill ${kind}`; }
function safeFilename(value) { return value.replace(/[\\/:*?"<>|]+/g, "_").trim().slice(0, 100) || "barsa-download"; }
function filenameFromUrl(url) {
  try { return decodeURIComponent(new URL(url).pathname.split("/").pop() || "barsa-download"); }
  catch { return "barsa-download"; }
}
function isDirectMediaUrl(url) {
  try {
    const parsed = new URL(url);
    if (!["http:", "https:"].includes(parsed.protocol)) return false;
    if (/(^|\\.)youtube\\.com$|(^|\\.)youtu\\.be$|(^|\\.)instagram\\.com$/i.test(parsed.hostname)) return false;
    return /\\.(mp4|webm|mov|mp3|m4a|ogg|wav)$/i.test(parsed.pathname);
  } catch { return false; }
}
function resetManager() {
  manager.hidden = false; progressBar.style.width = "0%"; progressValue.textContent = "0%";
  progressLabel.textContent = "Connecting…"; downloadedSize.textContent = "0 B";
  fileSize.textContent = "Unknown"; remainingTime.textContent = "Calculating…"; setStatus("Connecting");
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const url = urlInput.value.trim();
  let parsed;
  try { parsed = new URL(url); } catch {}
  if (parsed && /(^|\\.)instagram\\.com$/i.test(parsed.hostname)) {
    manager.hidden = true;
    showMessage("Instagram post and Reel page links are not supported by this static app. For your own content, use Instagram’s official download or Accounts Center export. Authorized direct media-file links can be pasted here.", "error");
    return;
  }
  if (!isDirectMediaUrl(url)) {
    manager.hidden = true;
    showMessage("Enter a direct MP4, WebM, MOV, MP3, M4A, OGG or WAV file URL. Social-media page links are not direct media files.", "error");
    return;
  }

  button.disabled = true; resetManager(); showMessage("Starting download…");
  const started = Date.now();
  try {
    const response = await fetch(url, { mode: "cors" });
    if (!response.ok) throw new Error(`The source returned HTTP ${response.status}.`);
    const type = response.headers.get("content-type") || "";
    if (type.includes("text/html")) throw new Error("The link returned a webpage, not a media file.");
    const total = Number(response.headers.get("content-length")) || 0;
    fileSize.textContent = total ? formatBytes(total) : "Not provided";
    const reader = response.body?.getReader();
    let blob;
    if (!reader) {
      blob = await response.blob();
      downloadedSize.textContent = formatBytes(blob.size);
      progressBar.style.width = "100%"; progressValue.textContent = "100%";
    } else {
      const chunks = []; let received = 0;
      while (true) {
        const {done, value} = await reader.read();
        if (done) break;
        chunks.push(value); received += value.byteLength;
        const elapsed = (Date.now() - started) / 1000;
        const speed = elapsed > 0 ? received / elapsed : 0;
        downloadedSize.textContent = formatBytes(received);
        if (total) {
          const pct = Math.min(99, Math.floor(received / total * 100));
          progressBar.style.width = `${pct}%`; progressValue.textContent = `${pct}%`;
          remainingTime.textContent = speed > 0 ? formatTime((total - received) / speed) : "Calculating…";
          progressLabel.textContent = "Downloading";
        } else {
          progressValue.textContent = "—";
          remainingTime.textContent = "Unavailable";
          progressLabel.textContent = "Downloading · size not provided";
        }
      }
      blob = new Blob(chunks, {type: type || "application/octet-stream"});
    }

    const objectUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = objectUrl; a.download = safeFilename(nameInput.value.trim() || filenameFromUrl(url));
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(objectUrl), 60000);
    downloadedSize.textContent = formatBytes(blob.size);
    fileSize.textContent = formatBytes(total || blob.size);
    remainingTime.textContent = "Complete";
    progressBar.style.width = "100%"; progressValue.textContent = "100%";
    progressLabel.textContent = "Download ready"; setStatus("Completed", "done");
    showMessage("The file is ready. Check your browser downloads or Files app.", "success");
  } catch (error) {
    setStatus("Failed", "failed"); progressLabel.textContent = "Download failed";
    remainingTime.textContent = "—";
    showMessage(`${error.message} The host may block browser access (CORS), require sign-in, or protect the stream.`, "error");
  } finally { button.disabled = false; }
});

if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
  window.addEventListener("load", () => navigator.serviceWorker.register("./sw.js").catch(() => {}));
}
