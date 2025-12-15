# 🤖 AI Dual Debater (Bengali Edition)

A cinematic, turn-based AI debate platform powered by Google's **Gemini 2.0 Flash**. This application orchestrates a structured debate between two AI agents ("Affirmative" vs "Negative") on any given topic, strictly localized in **Bengali (Bangla)**.

![AI Debater UI](https://github.com/HMZiyad/AI---DUO-debater/assets/placeholder-image.png)

## ✨ Features

- **🎭 Dual AI Personas**: distinct personalities for Affirmative (Optimistic/Tech) and Negative (Skeptic/Industrial) agents.
- **🇧🇩 Full Bengali Localization**: All UI elements, inputs, and AI-generated arguments are in Bengali.
- **🎬 Cinematic UI**:
  - Animated "Battle" intro screen.
  - Immersive split-toned background.
  - Custom generated 3D avatars.
  - Smooth `framer-motion` animations for chat bubbles and typing indicators.
- **⚡ Real-time Streaming**: Chat-style interface with "typing" effects.
- **🧠 Advanced Logic**: 10-step structured debate format (Thesis -> Rebuttals -> Closing).
- **🛡️ Robust Error Handling**: Manual retry mechanism for network/API interruptions.

## 🛠️ Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **AI Model**: [Google Gemini 1.5 Flash](https://ai.google.dev/) (via `@google/generative-ai`)

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed.
- A Google Gemini API Key (Get one [here](https://aistudio.google.com/app/apikey)).

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/HMZiyad/AI---DUO-debater.git
   cd AI---DUO-debater
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment**:
   Create a `.env.local` file in the root directory and add your API key:
   ```env
   GEMINI_API_KEY=your_actual_api_key_here
   ```

4. **Run the Development Server**:
   ```bash
   npm run dev
   ```

5. **Open various Usage**:
   Navigate to [http://localhost:3000](http://localhost:3000) in your browser.

## 🎨 Customization

### Modifying the Debate Logic
The debate structure is defined in `app/api/debate/route.ts` inside the `TURN_MAP` object. You can adjust the instructions there to change the debate format or style.

### Changing Puppeteers/Avatars
Replace the images in `public/avatars/` to change the agent personas:
- `affirmative.png`: Avatar for Agent 1 (Left/Blue)
- `negative.png`: Avatar for Agent 2 (Right/Red)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
