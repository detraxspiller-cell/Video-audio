const statusEl = document.getElementById("status");
const previewImage = document.getElementById("previewImage");
const previewAudio = document.getElementById("previewAudio");
const downloadLink = document.getElementById("downloadLink");
const chatLog = document.getElementById("chatLog");

const toolData = [
  "AI Caption Generator", "AI Hashtag Generator", "AI Business Name", "AI Email Writer",
  "AI Blog Outline", "AI Script Writer", "AI Story Generator", "AI Study Notes",
  "AI Resume Helper", "AI Ad Copy", "AI Video Hook", "AI Product Description",
  "AI Keyword Ideas", "AI Meta Description", "AI Landing Copy", "AI Tagline",
  "AI Headline", "AI Rewrite Tool", "AI Tone Converter", "AI Summarizer"
];

function setStatus(message) {
  statusEl.textContent = message;
}

function resetPreview() {
  previewImage.hidden = true;
  previewAudio.hidden = true;
  downloadLink.hidden = true;
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

function appendChat(role, text) {
  const p = document.createElement("p");
  p.className = role;
  p.textContent = `${role === "user" ? "You" : "AI"}: ${text}`;
  chatLog.appendChild(p);
  chatLog.scrollTop = chatLog.scrollHeight;
}

document.getElementById("sendChatBtn").addEventListener("click", () => {
  const prompt = document.getElementById("chatPrompt").value.trim();
  const model = document.getElementById("modelSelect").value;
  if (!prompt) return setStatus("Type a question first.");

  appendChat("user", prompt);
  const response = `(${model}) Quick answer: ${prompt.slice(0, 90)}... Try refining with specific goals, audience, and output format.`;
  setTimeout(() => appendChat("assistant", response), 250);
  setStatus("AI responded.");
});

document.getElementById("makeImageBtn").addEventListener("click", () => {
  const prompt = document.getElementById("imagePrompt").value.trim();
  const style = document.getElementById("imageStyle").value;
  if (!prompt) return setStatus("Enter an image prompt first.");

  const canvas = document.createElement("canvas");
  canvas.width = 1280;
  canvas.height = 720;
  const ctx = canvas.getContext("2d");

  const hue = Math.floor(Math.random() * 360);
  const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  gradient.addColorStop(0, `hsl(${hue}, 70%, 40%)`);
  gradient.addColorStop(1, `hsl(${(hue + 80) % 360}, 60%, 22%)`);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "rgba(255,255,255,0.9)";
  ctx.font = "bold 52px sans-serif";
  ctx.fillText(style, 54, 90);
  ctx.font = "32px sans-serif";
  wrapText(ctx, prompt, 64, 180, 1150, 44);

  canvas.toBlob((blob) => {
    showImage(blob, "ai-image.png");
    setStatus("Image generated.");
  }, "image/png");
});

document.getElementById("removeBgBtn").addEventListener("click", async () => {
  const file = document.getElementById("bgInput").files?.[0];
  if (!file) return setStatus("Upload an image first.");

  const img = new Image();
  img.src = URL.createObjectURL(file);
  await img.decode();

  const canvas = document.createElement("canvas");
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0);

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i], g = data[i + 1], b = data[i + 2];
    if (r > 230 && g > 230 && b > 230) {
      data[i + 3] = 0;
    }
  }
  ctx.putImageData(imageData, 0, 0);

  canvas.toBlob((blob) => {
    showImage(blob, "background-removed.png");
    setStatus("Background removed.");
  }, "image/png");
});

document.getElementById("transcribeBtn").addEventListener("click", () => {
  const file = document.getElementById("audioInput").files?.[0];
  if (!file) return setStatus("Upload an audio file first.");

  const output = document.getElementById("transcriptOutput");
  output.value = "Processing audio...";
  setTimeout(() => {
    output.value = `Demo transcript for ${file.name}:\nThis is a simulated transcription preview. Connect a speech-to-text API (e.g. Whisper) for accurate transcripts.`;
    setStatus("Transcription complete (demo).");
  }, 850);
});

document.getElementById("improvePromptBtn").addEventListener("click", () => {
  const raw = document.getElementById("rawPrompt").value.trim();
  if (!raw) return setStatus("Add a rough prompt first.");

  const improved = `Role: Expert creator\nGoal: ${raw}\nConstraints: concise, practical, example-driven\nOutput format: bullet steps + final checklist`;
  document.getElementById("improvedPrompt").value = improved;
  setStatus("Prompt improved.");
});

document.getElementById("speakBtn").addEventListener("click", () => {
  const text = document.getElementById("speechText").value.trim();
  if (!text) return setStatus("Type text first.");

  const utterance = new SpeechSynthesisUtterance(text);
  speechSynthesis.speak(utterance);
  setStatus("Speaking...");
});

document.getElementById("stopSpeakBtn").addEventListener("click", () => {
  speechSynthesis.cancel();
  setStatus("Speech stopped.");
});

document.getElementById("themeToggle").addEventListener("click", () => {
  document.body.classList.toggle("light");
});

function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = text.split(" ");
  let line = "";
  let vertical = y;
  for (const word of words) {
    const test = `${line}${word} `;
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line.trim(), x, vertical);
      line = `${word} `;
      vertical += lineHeight;
    } else {
      line = test;
    }
  }
  if (line) ctx.fillText(line.trim(), x, vertical);
}

function renderTools(filter = "") {
  const grid = document.getElementById("toolGrid");
  grid.innerHTML = "";
  toolData
    .filter((tool) => tool.toLowerCase().includes(filter.toLowerCase()))
    .forEach((tool) => {
      const card = document.createElement("div");
      card.className = "tool";
      card.textContent = tool;
      grid.appendChild(card);
    });
}

document.getElementById("toolSearch").addEventListener("input", (event) => {
  renderTools(event.target.value);
});

renderTools();
setStatus("Ready.");
