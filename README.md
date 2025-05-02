# Email Improver AI – Chrome Extension for Gmail

Latest download link can be found at https://github.com/djoglekar893/ToneTune/releases/tag/v1.0-alpha

Email Improver AI is a Chrome extension that helps you write better emails in Gmail using AI. It adds an "Improve with AI" button to your email composer and rewrites your drafts with improved clarity, tone, and grammar — all tailored to your preferences.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

## Features

- Seamless integration with Gmail
- Adds an "Improve with AI" button directly in the Gmail compose window
- Supports multiple AI providers:
  - OpenAI (ChatGPT)
  - Google Gemini
  - Hugging Face
- Customizable options:
  - Improvement Level: Light, Medium, Thorough
  - Tone: Professional, Friendly, Confident, Concise
- Works with free-tier API keys
- Saves your settings using Chrome Storage

## Installation

1. Clone or download this repository to your local machine.
2. Open `chrome://extensions` in your Chrome browser.
3. Enable **Developer Mode** in the top-right corner.
4. Click **Load unpacked** and select the folder containing the extension files.
5. Navigate to Gmail and refresh the page. The "Improve with AI" button should appear in the compose window.

## Project Structure

- `manifest.json` – Extension configuration
- `popup.html`, `popup.js`, `styles.css` – Settings UI
- `content.js` – Injects AI functionality into Gmail
- `background.js` – Handles background tasks (optional)
- `images/` – Extension icons

## License

This project is licensed under the [MIT License](https://opensource.org/licenses/MIT).
