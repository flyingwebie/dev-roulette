# Dev Roulette 🎲

![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Framer Motion](https://img.shields.io/badge/Framer_Motion-black?style=for-the-badge&logo=framer&logoColor=blue)

**Dev Roulette** is a sleek, modern web application designed for developer
"speed networking" events. It was built specifically to help organizations (like
**Cork Devs**) host perfectly timed, engaging, and seamless networking sessions.

Instead of manually keeping track of time, blowing a whistle, or struggling to
come up with conversation topics, Dev Roulette automates the entire flow with a
beautiful highly-visible UI, dev-centric icebreakers, and crisp audio cues.

## ✨ Features

- **Configurable Sessions:** Set the number of rounds, minutes per round, and
  break duration (in seconds) between rounds.
- **Massive Countdown Timer:** A highly visible timer that fluidly transitions
  states. As time runs low (under 10s and 5s), the timer grows exponentially
  larger, turns red, and pulses to signal the round is ending.
- **Built-in Icebreakers:** Features a curated list of developer-focused
  discussion prompts (e.g., "What's your tech stack?", "Tabs or spaces?",
  "What's a tiny win this week?"). A new random prompt is shown each round.
- **Synthesized Audio Cues:** Uses the native Web Audio API to generate
  high-quality sounds without needing to load external assets:
  - _"Start Event"_ harmonic chime
  - Countdown _"Ticks"_ for the final 5 seconds
  - Round-ending _"Buzzer"_
- **Orchestrated Flow:** Automatically transitions between the `Setup`, `Round`,
  `Switch`, and `Done` phases, taking the mental load off the event organizer.
- **Zero Scroll Constraints:** The UI is strictly bounded to the viewport with
  absolute scaling, ensuring the screen never scrolls awkwardly during
  presentations.

## 🛠️ How it's Built

The codebase is highly modular, strongly typed, and built for modern web
performance:

### Core Tech Stack

- **Framework:** [React 19](https://react.dev/)
- **Build Tool:** [Vite](https://vitejs.dev/)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
- **Animations:** [Framer Motion](https://motion.dev/)

### Architecture

The monolithic application logic was heavily decoupled into a clean component
architecture:

- `src/App.tsx`: The overarching State Orchestrator. Keeps track of the current
  phase and manages timers.
- `src/components/`: Contains the isolated UI screens:
  - `SetupScreen.tsx`: The initial configuration menu.
  - `RoundScreen.tsx`: The primary timer, prompt, and pause/skip controls.
  - `SwitchScreen.tsx`: The brief intermittent screen telling users to find
    their next partner.
  - `DoneScreen.tsx`: The wrap-up screen with a restart trigger.
- `src/utils/`: Handles headless logic:
  - `audio.ts`: Web Audio API synthesizers for the buzzer, ticks, and start
    sounds.
  - `helpers.ts`: Time formatters and array shuffling logic.
- `src/constants/`: Stores static strings like the `ICE_BREAKERS` array and
  phase enum constants.

## 🚀 Getting Started

**Prerequisites:** Node.js & npm/bun/yarn.

1. **Install dependencies:**
   ```bash
   npm install
   ```
2. **Run the local development server:**
   ```bash
   npm run dev
   ```
3. **Build for production:**
   ```bash
   npm run build
   ```

_Made with ❤️ by Cork Devs - Version 1.1.0_
