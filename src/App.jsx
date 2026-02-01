import SoundPlayer from './components/SoundPlayer'
import './App.css'

function App() {
  const baseUrl = import.meta.env.BASE_URL;
  
  const sounds = [
    { id: 1, name: 'Sizzling Lasagna', src: `${baseUrl}sounds/sizzling_lasagna.WAV` },
    { id: 2, name: 'Odense Å 1', src: `${baseUrl}sounds/odense_aa1_cleaned.WAV` },
    { id: 3, name: 'Odense Å 2', src: `${baseUrl}sounds/odense_aa2_cleaned.WAV` },
  ];

  return (
    <div className="app">
      <header>
        <h1>Zehong Ambience</h1>
        <p>recorded with love</p>
      </header>
      <div className="sound-grid">
        {sounds.map((sound) => (
          <SoundPlayer
            key={sound.id}
            name={sound.name}
            audioSrc={sound.src}
          />
        ))}
      </div>
    </div>
  )
}

export default App
