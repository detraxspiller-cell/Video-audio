const audioInput = document.getElementById("audioInput");
const photoInput = document.getElementById("photoInput");
const photoDuration = document.getElementById("photoDuration");
const videoText = document.getElementById("videoText");
const photoText = document.getElementById("photoText");
const speechText = document.getElementById("speechText");
const randomDuration = document.getElementById("randomDuration");

const previewVideo = document.getElementById("previewVideo");
const previewImage = document.getElementById("previewImage");
const previewAudio = document.getElementById("previewAudio");
const downloadLink = document.getElementById("downloadLink");
const statusEl = document.getElementById("status");

function setStatus(message) {
  statusEl.textContent = message;
}

function resetPreview() {
  previewVideo.hidden = true;
  previewImage.hidden = true;
  previewAudio.hidden = true;
  downloadLink.hidden = true;
}

async function recordCanvas({ drawFrame, durationSec = 6, audioBlob = null, fps = 30 }) {
  const canvas = document.createElement("canvas");
  canvas.width = 1280;
  canvas.height = 720;
  const ctx = canvas.getContext("2d");

  const videoStream = canvas.captureStream(fps);
  const mixedStream = new MediaStream([...videoStream.getVideoTracks()]);

  let audioElement;
  if (audioBlob) {
    const audioURL = URL.createObjectURL(audioBlob);
    audioElement = new Audio(audioURL);
    audioElement.crossOrigin = "anonymous";
    const audioCtx = new AudioContext();
    const destination = audioCtx.createMediaStreamDestination();
    const source = audioCtx.createMediaElementSource(audioElement);
    source.connect(destination);
    source.connect(audioCtx.destination);

    destination.stream.getAudioTracks().forEach((t) => mixedStream.addTrack(t));
    await audioElement.play();
  }

  const chunks = [];
  const recorder = new MediaRecorder(mixedStream, {
    mimeType: "video/webm;codecs=vp9,opus",
  });

  recorder.ondataavailable = (e) => {
    if (e.data.size > 0) chunks.push(e.data);
  };

  recorder.start(250);

  const start = performance.now();
  await new Promise((resolve) => {
    function frame(now) {
      const t = (now - start) / 1000;
      drawFrame(ctx, t, canvas.width, canvas.height);
      if (t < durationSec) {
        requestAnimationFrame(frame);
      } else {
        recorder.stop();
        resolve();
      }
    }
    requestAnimationFrame(frame);
  });

  if (audioElement) {
    audioElement.pause();
  }

  await new Promise((resolve) => (recorder.onstop = resolve));
  return new Blob(chunks, { type: "video/webm" });
}

function showVideo(blob, name) {
  resetPreview();
  const url = URL.createObjectURL(blob);
  previewVideo.src = url;
  previewVideo.hidden = false;
  downloadLink.href = url;
  downloadLink.download = name;
  downloadLink.textContent = `Download ${name}`;
  downloadLink.hidden = false;
}

function showImage(blob, name) {
  resetPreview();
  const url = URL.createObjectURL(blob);
  previewImage.src = url;
  previewImage.hidden = false;
  downloadLink.href = url;
  downloadLink.download = name;
  downloadLink.textContent = `Download ${name}`;
  downloadLink.hidden = false;
}

document.getElementById("makeAudioVideoBtn").addEventListener("click", async () => {
  const file = audioInput.files?.[0];
  if (!file) return setStatus("Upload an audio file first.");

  setStatus("Creating audio video...");
  const arrayBuffer = await file.arrayBuffer();
  const audioCtx = new AudioContext();
  const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
  const duration = Math.min(20, Math.ceil(audioBuffer.duration));
  const data = audioBuffer.getChannelData(0);

  const blob = await recordCanvas({
    durationSec: duration,
    audioBlob: file,
    drawFrame(ctx, t, w, h) {
      ctx.fillStyle = "#0b1020";
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#58a6ff";
      const centerY = h / 2;
      const samples = 260;
      const offset = Math.floor((t / duration) * data.length);
      for (let i = 0; i < samples; i++) {
        const idx = Math.min(data.length - 1, offset + i * 100);
        const amp = Math.abs(data[idx]) * 230;
        const x = (i / samples) * w;
        ctx.fillRect(x, centerY - amp / 2, 3, amp);
      }
      ctx.fillStyle = "#e6edf3";
      ctx.font = "36px sans-serif";
      ctx.fillText("Audio Visualizer", 40, 60);
    },
  });

  showVideo(blob, "audio-to-video.webm");
  setStatus("Done: Audio to video created.");
});

document.getElementById("makePhotoVideoBtn").addEventListener("click", async () => {
  const file = photoInput.files?.[0];
  if (!file) return setStatus("Upload a photo first.");
  const duration = Number(photoDuration.value) || 6;

  const imageURL = URL.createObjectURL(file);
  const img = new Image();
  img.src = imageURL;
  await img.decode();

  setStatus("Creating photo video...");
  const blob = await recordCanvas({
    durationSec: duration,
    drawFrame(ctx, t, w, h) {
      const scale = 1 + t * 0.03;
      const drawW = w * scale;
      const drawH = (img.height / img.width) * drawW;
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, w, h);
      ctx.drawImage(img, (w - drawW) / 2, (h - drawH) / 2, drawW, drawH);
    },
  });

  showVideo(blob, "photo-to-video.webm");
  setStatus("Done: Photo to video created.");
});

document.getElementById("makeTextVideoBtn").addEventListener("click", async () => {
  const lines = videoText.value
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  if (!lines.length) return setStatus("Type at least one line.");

  const duration = Math.max(4, lines.length * 2);
  setStatus("Creating text video...");

  const blob = await recordCanvas({
    durationSec: duration,
    drawFrame(ctx, t, w, h) {
      const idx = Math.min(lines.length - 1, Math.floor(t / 2));
      const hue = (t * 45) % 360;
      ctx.fillStyle = `hsl(${hue}, 45%, 16%)`;
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#f0f6fc";
      ctx.font = "bold 64px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(lines[idx], w / 2, h / 2);
    },
  });

  showVideo(blob, "text-to-video.webm");
  setStatus("Done: Text to video created.");
});

document.getElementById("makeTextPhotoBtn").addEventListener("click", async () => {
  const text = photoText.value.trim();
  if (!text) return setStatus("Type text first.");

  setStatus("Generating image...");
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext("2d");

  const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  gradient.addColorStop(0, "#1f6feb");
  gradient.addColorStop(1, "#9333ea");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "white";
  ctx.textAlign = "center";
  ctx.font = "bold 56px sans-serif";
  wrapText(ctx, text, canvas.width / 2, canvas.height / 2, 800, 68);

  canvas.toBlob((blob) => {
    showImage(blob, "text-to-photo.png");
    setStatus("Done: Text to photo created.");
  }, "image/png");
});

function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = text.split(" ");
  const lines = [];
  let line = "";

  for (const word of words) {
    const testLine = `${line}${word} `;
    if (ctx.measureText(testLine).width > maxWidth && line) {
      lines.push(line);
      line = `${word} `;
    } else {
      line = testLine;
    }
  }
  lines.push(line);

  const totalHeight = lines.length * lineHeight;
  let currentY = y - totalHeight / 2;
  for (const l of lines) {
    ctx.fillText(l.trim(), x, currentY);
    currentY += lineHeight;
  }
}

document.getElementById("speakBtn").addEventListener("click", () => {
  const text = speechText.value.trim();
  if (!text) return setStatus("Type text first.");

  const utter = new SpeechSynthesisUtterance(text);
  speechSynthesis.speak(utter);
  setStatus("Speaking...");
});

document.getElementById("stopSpeakBtn").addEventListener("click", () => {
  speechSynthesis.cancel();
  setStatus("Speech stopped.");
});

document.getElementById("makeRandomVideoBtn").addEventListener("click", async () => {
  const duration = Number(randomDuration.value) || 8;
  setStatus("Generating random video...");

  const blob = await recordCanvas({
    durationSec: duration,
    drawFrame(ctx, t, w, h) {
      ctx.fillStyle = `hsl(${(t * 50) % 360}, 35%, 12%)`;
      ctx.fillRect(0, 0, w, h);

      for (let i = 0; i < 30; i++) {
        const seed = i * 77;
        const x = ((Math.sin(t + seed) + 1) / 2) * w;
        const y = ((Math.cos(t * 0.8 + seed) + 1) / 2) * h;
        const size = 18 + ((Math.sin(t * 2 + i) + 1) / 2) * 45;
        ctx.fillStyle = `hsla(${(i * 30 + t * 70) % 360}, 90%, 60%, 0.7)`;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 42px sans-serif";
      ctx.fillText("Random Video", 30, 60);
    },
  });

  showVideo(blob, "random-video.webm");
  setStatus("Done: Random video generated.");
});
