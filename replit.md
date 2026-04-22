# Media Lab Studio

## Overview
A lightweight, browser-based suite of media processing tools that runs entirely in the browser using native Web APIs.

## Features
- **Audio to Video**: Generates a waveform visualization video from an uploaded audio file
- **Photo to Video**: Creates a slow-zoom (Ken Burns effect) video from a static image
- **Text to Video**: Converts lines of text into a sequence of video frames
- **Text to Photo**: Renders text onto a canvas for download as an image
- **Text to Speech**: Uses the browser's speech synthesis engine to read text aloud
- **Random Video Generator**: Creates a generative video with moving patterns

## Tech Stack
- Pure HTML5, CSS3, and Vanilla JavaScript (ES6+)
- Canvas API, MediaRecorder API, Web Audio API, SpeechSynthesis API
- No build system, no external dependencies

## Project Structure
- `index.html` — Main entry point and UI
- `styles.css` — Dark-themed styles
- `script.js` — All application logic

## Running the App
The app is served via Python's built-in HTTP server on port 5000:
```
python3 -m http.server 5000 --bind 0.0.0.0
```

## Deployment
Configured as a static site deployment (publicDir: ".").
