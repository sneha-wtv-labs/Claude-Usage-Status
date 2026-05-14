# Claude Usage Info – Browser Extension

© 2026 Sneha. All rights reserved.

A lightweight browser extension designed to enhance the Claude.ai experience by displaying real-time (approximate) usage statistics directly in the message bar.

### 📥 [**Download the latest version (ZIP)**](https://github.com/sneha-wtv-labs/Claude-Usage-Status/archive/refs/heads/master.zip)

## 🚀 Features
- **Token Tracking**: Real-time display of tokens used vs. limit.
- **Cache Timer**: Countdown timer for cache expiration.
- **Usage Bars**: Visual session and weekly usage progress.
- **Model Identity**: Clearly shows which Claude model is currently active.
- **Daily Routine**: Automatically refreshes statistics once a day (at midnight) to ensure accuracy.
- **Cross-Platform**: Compatible with Chrome, Edge, Brave, and the Claude desktop application.

## 🛠 Installation

### For Developers / Manual Install:
1. **Download** or clone this repository.
2. Unzip the folder if downloaded as a ZIP.
3. Open your browser's Extensions page:
   - **Chrome/Edge/Brave**: `chrome://extensions`
4. Enable **Developer Mode** (usually a toggle in the top-right).
5. Click **Load Unpacked** and select the root folder of this project (the one containing `manifest.json`).
6. Refresh your Claude.ai tab to see the changes.

## 📁 Project Structure
- `manifest.json`: Extension metadata and permissions.
- `background.js`: Handles daily background refresh routines.
- `content.js`: Injects the UI elements into Claude.ai.
- `style.css`: Modern styling for the usage dashboard.
- `LICENSE`: MIT License information.
- `README.md`: Documentation and setup guide.

## 📝 Usage Notes
- The usage data is currently an approximation pulled from the Claude.ai UI.
- Accuracy may vary based on UI updates by Anthropic.

## ⚖️ License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
