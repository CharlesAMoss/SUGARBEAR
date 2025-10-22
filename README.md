# 🐻 SUGARBEAR - Web Audio Sequencer & Drum Machine

A professional-grade drum machine and step sequencer built with React, TypeScript, and the Web Audio API. Create, compose, and perform beat patterns with precision timing, smooth animations, and an elegant user interface.

## 🎯 Project Overview

SUGARBEAR is a browser-based drum machine that allows users to:
- **Chart sequences** of multiple drum sounds on a step grid
- **Compose loops** with precise timing control
- **Perform live** with real-time playback and visual feedback
- **Export and share** patterns and compositions

### Key Features

- 🥁 **Multi-track step sequencer** with configurable drum instruments
- ⏱️ **Precise timing** using Web Audio API scheduling
- 🎨 **Smooth, elegant animations** with visual playback feedback
- 🎵 **Pattern management** with save/load capabilities
- 🎛️ **Transport controls** (play, pause, stop, tempo)
- 🔊 **Per-track controls** (volume, mute, solo)
- 📦 **Sample-based synthesis** with custom sample support

## 🏗️ Technical Stack

- **React 19** - UI framework with modern concurrent features
- **TypeScript 5.9** - Type-safe development with strict typing
- **Web Audio API** - Low-latency audio engine and scheduling
- **Vite 7** - Fast build tooling and HMR
- **CSS3** - Animations and responsive design

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Run tests
npm run test
```

## 📚 Documentation

- [ARCHITECTURE.md](./ARCHITECTURE.md) - System architecture and technical design
- [DEVELOPMENT_PLAN.md](./DEVELOPMENT_PLAN.md) - Phased development roadmap

## 🗺️ Development Roadmap

The project follows a phased development approach:

- **Phase 0**: Foundation & TypeScript setup ⏳
- **Phase 1**: Web Audio API core engine
- **Phase 2**: Sequencer logic & state management
- **Phase 3**: UI components & visualization
- **Phase 4**: Advanced features & polish

See [DEVELOPMENT_PLAN.md](./DEVELOPMENT_PLAN.md) for detailed phase descriptions and progress tracking.

## 🤝 Contributing

This is a personal project, but feedback and suggestions are welcome!

## 📄 License

MIT

---

**Built with 💜 by the SUGARBEAR team**


## React Compiler

The React Compiler is currently not compatible with SWC. See [this issue](https://github.com/vitejs/vite-plugin-react/issues/428) for tracking the progress.

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
