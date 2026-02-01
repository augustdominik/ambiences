# Ambient Sound Mixer

A React-based web application for playing and mixing ambient sounds.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Add your audio files to the `public/sounds/` directory

3. Update the sound list in `src/App.jsx` with your audio file names

4. Start the development server:
   ```bash
   npm run dev
   ```

## Adding Your Sounds

1. Place your audio files (mp3, wav, etc.) in the `public/sounds/` folder
2. Edit `src/App.jsx` and update the `sounds` array with your file names:

```javascript
const sounds = [
  { id: 1, name: 'Your Sound Name', src: '/sounds/your-file.mp3' },
  // Add more sounds here
];
```

## Features

- Play/pause individual sounds
- Adjust volume for each sound independently
- Sounds loop automatically
- Mix multiple sounds together
- Responsive design

## Building for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.
