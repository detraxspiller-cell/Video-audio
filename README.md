# Media Lab Studio

A lightweight browser-based website that supports:

- Audio to video
- Photo to video
- Text to video
- Text to photo
- Text to speech
- Random video generator

## Run locally

Because this app uses browser APIs (`MediaRecorder`, `SpeechSynthesis`, `Canvas`), run it from a local web server:

```bash
python3 -m http.server 8000
```

Then open: <http://localhost:8000>

## Notes

- Generated videos are exported as `.webm`.
- Text-to-speech uses the browser's voice engine.
- Some browser/security settings may affect audio capture/playback.
