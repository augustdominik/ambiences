import SoundPlayer from './components/SoundPlayer'
import Newsletter from './components/Newsletter'
import './App.css'

function App() {
  const baseUrl = import.meta.env.BASE_URL;

  const sounds = [
    {
      id: -1,
      name: 'Crispy leaves and birds at Esrum Sø',
      src: `${baseUrl}sounds/zoom_i_træ_blade_fugle_esrum_sø.WAV`,
      date: 'February 8th, 2026',
      place: 'Esrum Sø'
    },
    {
      id: 0,
      name: 'Crispy crusty footsteps in the snow',
      src: `${baseUrl}sounds/crispy_crusty_walk_in_the_snow.WAV`,
      date: 'February 7th, 2026',
      place: 'Helsingør'
    },
    {
      id: 1,
      name: 'Sizzling Lasagna',
      src: `${baseUrl}sounds/sizzling_lasagna.WAV`,
      date: 'January 30th, 2026',
      place: 'Odense'
    },
    {
      id: 2,
      name: 'Odense Å 1',
      src: `${baseUrl}sounds/odense_aa1_cleaned.WAV`,
      date: 'January 30th, 2026',
      place: 'Odense'
    },
    {
      id: 3,
      name: 'Odense Å 2',
      src: `${baseUrl}sounds/odense_aa2_cleaned.WAV`,
      date: 'January 30th, 2026',
      place: 'Odense'
    },
  ];

  return (
    <div className="app">
      <header>
        <h1>August's Ambiences</h1>
        <p>a diary of sounds - recorded with love</p>
      </header>
      <div className="sound-grid">
        {sounds.map((sound) => (
          <SoundPlayer
            key={sound.id}
            name={sound.name}
            audioSrc={sound.src}
            date={sound.date}
            place={sound.place}
          />
        ))}
      </div>
      {/* <Newsletter /> */}
    </div>
  )
}

export default App
