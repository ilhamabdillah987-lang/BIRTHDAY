import { useState, useEffect, useRef, FormEvent, ChangeEvent } from 'react';
import confetti from 'canvas-confetti';
import { 
  Heart, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  ArrowRight, 
  ArrowLeft, 
  Camera, 
  Settings, 
  Gift, 
  Upload, 
  Trash2, 
  Flame, 
  Check, 
  RotateCcw, 
  Edit3, 
  Send,
  Music,
  Info
} from 'lucide-react';

// Default Unsplash aesthetic images for beautiful initial design
const DEFAULT_PHOTOS = [
  { id: '1', url: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=600&q=80', caption: 'Momen penuh kehangatan' },
  { id: '2', url: 'https://images.unsplash.com/photo-1533750349088-cd871a92f311?auto=format&fit=crop&w=600&q=80', caption: 'Hari yang seindah bunga mekar' },
  { id: '3', url: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=600&q=80', caption: 'Pijar harapan yang menyala terang' },
  { id: '4', url: 'https://images.unsplash.com/photo-1498804103079-a6351b050096?auto=format&fit=crop&w=600&q=80', caption: 'Menikmati setiap detak langkah waktu' }
];

interface CustomPhoto {
  id: string;
  url: string;
  caption: string;
}

export default function App() {
  // Navigation / Step State
  // Step 0: Initial Screen (ONLY "Selamat Ulang Tahun" as requested)
  // Step 1: Birthday Person's Name Page
  // Step 2: Photo Gallery Page
  // Step 3: Cake, Candle Blowing, Letter & Wish Jar Page
  const [step, setStep] = useState<number>(0);

  // Customization State (Stored in LocalStorage for persistence)
  const [birthdayName, setBirthdayName] = useState<string>(() => {
    return localStorage.getItem('bday_name') || 'Adinda Kirana';
  });
  const [senderName, setSenderName] = useState<string>(() => {
    return localStorage.getItem('bday_sender') || 'Seseorang yang Menyayangimu';
  });
  const [customLetter, setCustomLetter] = useState<string>(() => {
    return localStorage.getItem('bday_letter') || 
      'Di hari yang sangat istimewa ini, aku hanya ingin mengucapkan betapa bersyukurnya dunia ini memilikimu. Semoga setiap langkahmu selalu diiringi kebahagiaan, senyumanmu tak pernah pudar, dan seluruh impian indahmu segera menjadi kenyataan. Selamat merayakan hari kelahiranmu! 🌸✨';
  });
  const [selectedTheme, setSelectedTheme] = useState<string>(() => {
    return localStorage.getItem('bday_theme') || 'sakura'; // 'sakura', 'warm', 'sunset', 'cozy', 'midnight'
  });
  const [photos, setPhotos] = useState<CustomPhoto[]>(() => {
    const saved = localStorage.getItem('bday_photos');
    return saved ? JSON.parse(saved) : DEFAULT_PHOTOS;
  });

  // Settings Panel Toggle
  const [showSettings, setShowSettings] = useState<boolean>(false);

  // Interactive Birthday Cake State
  const [candleLit, setCandleLit] = useState<boolean>(true);
  const [candleBlown, setCandleBlown] = useState<boolean>(false);
  const [micBlowSupported, setMicBlowSupported] = useState<boolean>(false);
  const [isListeningForBlow, setIsListeningForBlow] = useState<boolean>(false);
  
  // Wish Jar / Dream Board State
  const [wishes, setWishes] = useState<string[]>(() => {
    const saved = localStorage.getItem('bday_wishes');
    return saved ? JSON.parse(saved) : [
      'Semoga sehat dan bahagia selalu! 🌟',
      'Sukses terus dalam mengejar cita-cita! ❤️',
      'Selalu dikelilingi orang-orang baik ✨'
    ];
  });
  const [newWish, setNewWish] = useState<string>('');

  // Audio Synth & Music State
  const [isMusicPlaying, setIsMusicPlaying] = useState<boolean>(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const musicNodeRef = useRef<OscillatorNode[]>([]);
  const musicGainRef = useRef<GainNode | null>(null);
  const isPlayingRef = useRef<boolean>(false);
  const synthIntervalRef = useRef<any>(null);

  // Save changes to localStorage helper
  useEffect(() => {
    localStorage.setItem('bday_name', birthdayName);
    localStorage.setItem('bday_sender', senderName);
    localStorage.setItem('bday_letter', customLetter);
    localStorage.setItem('bday_theme', selectedTheme);
    localStorage.setItem('bday_photos', JSON.stringify(photos));
  }, [birthdayName, senderName, customLetter, selectedTheme, photos]);

  useEffect(() => {
    localStorage.setItem('bday_wishes', JSON.stringify(wishes));
  }, [wishes]);

  // Audio Context Laziness
  const getAudioContext = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioCtxRef.current;
  };

  // Web Audio Synthesizer: Sweet background ambient piano/lofi
  const startAmbientMusic = () => {
    if (isPlayingRef.current) return;
    try {
      const ctx = getAudioContext();
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.12, ctx.currentTime);
      masterGain.connect(ctx.destination);
      musicGainRef.current = masterGain;

      isPlayingRef.current = true;
      setIsMusicPlaying(true);

      // Simple cozy 4-chord progression: Cmaj7 - Am7 - Fmaj7 - G6 in soft sinusoidal tones
      const chords = [
        [130.81, 164.81, 196.00, 246.94], // Cmaj7 (C3, E3, G3, B3)
        [110.00, 130.81, 164.81, 220.00], // Am7 (A2, C3, E3, A3)
        [87.31, 130.81, 174.61, 218.27],  // Fmaj7 (F2, C3, F3, A3)
        [98.00, 146.83, 196.00, 246.94]   // G6 (G2, D3, G3, B3)
      ];

      // Romantic happy birthday melody line
      const birthdayMelody = [
        { note: 261.63, dur: 0.5 }, { note: 261.63, dur: 0.5 }, // C4, C4
        { note: 293.66, dur: 1 }, // D4
        { note: 261.63, dur: 1 }, // C4
        { note: 349.23, dur: 1 }, // F4
        { note: 329.63, dur: 2 }, // E4
        
        { note: 261.63, dur: 0.5 }, { note: 261.63, dur: 0.5 }, // C4, C4
        { note: 293.66, dur: 1 }, // D4
        { note: 261.63, dur: 1 }, // C4
        { note: 392.00, dur: 1 }, // G4
        { note: 349.23, dur: 2 }, // F4
      ];

      let chordIndex = 0;
      let melodyIndex = 0;

      const playStep = () => {
        if (!isPlayingRef.current) return;
        
        const now = ctx.currentTime;
        const currentChord = chords[chordIndex];

        // Play chord pad
        currentChord.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const oscGain = ctx.createGain();

          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now);

          // Soft lowpass filter to make it "cozy lofi" style
          const filter = ctx.createBiquadFilter();
          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(600, now);

          osc.connect(filter);
          filter.connect(oscGain);
          oscGain.connect(masterGain);

          // Soft envelope
          oscGain.gain.setValueAtTime(0, now);
          oscGain.gain.linearRampToValueAtTime(idx === 0 ? 0.3 : 0.15, now + 0.8);
          oscGain.gain.exponentialRampToValueAtTime(0.001, now + 3.8);

          osc.start(now);
          osc.stop(now + 4);
        });

        // Play a random sweet bell note in pentatonic scale or melody note
        if (Math.random() > 0.3) {
          const melodyNotes = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25];
          const randomNote = melodyNotes[Math.floor(Math.random() * melodyNotes.length)];
          
          const bellOsc = ctx.createOscillator();
          const bellGain = ctx.createGain();
          
          bellOsc.type = 'sine';
          bellOsc.frequency.setValueAtTime(randomNote, now + 0.5);
          
          bellOsc.connect(bellGain);
          bellGain.connect(masterGain);
          
          bellGain.gain.setValueAtTime(0, now + 0.5);
          bellGain.gain.linearRampToValueAtTime(0.4, now + 0.7);
          bellGain.gain.exponentialRampToValueAtTime(0.001, now + 2.5);
          
          bellOsc.start(now + 0.5);
          bellOsc.stop(now + 3);
        }

        chordIndex = (chordIndex + 1) % chords.length;
      };

      // Trigger chord progression every 4 seconds
      playStep();
      synthIntervalRef.current = setInterval(playStep, 4000);

    } catch (e) {
      console.error("Audio context initialization failed:", e);
    }
  };

  const stopAmbientMusic = () => {
    isPlayingRef.current = false;
    setIsMusicPlaying(false);
    if (synthIntervalRef.current) {
      clearInterval(synthIntervalRef.current);
      synthIntervalRef.current = null;
    }
    if (musicGainRef.current) {
      try {
        musicGainRef.current.gain.setValueAtTime(0, getAudioContext().currentTime);
      } catch (e) {}
    }
  };

  const toggleMusic = () => {
    if (isMusicPlaying) {
      stopAmbientMusic();
    } else {
      startAmbientMusic();
    }
  };

  // Play a beautiful "sparkle chime" SFX on actions
  const playSparkleSound = () => {
    try {
      const ctx = getAudioContext();
      if (ctx.state === 'suspended') ctx.resume();

      const now = ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6 arpeggio

      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + i * 0.08);

        osc.connect(gain);
        gain.connect(ctx.destination);

        gain.gain.setValueAtTime(0, now + i * 0.08);
        gain.gain.linearRampToValueAtTime(0.08, now + i * 0.08 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.4);

        osc.start(now + i * 0.08);
        osc.stop(now + i * 0.08 + 0.5);
      });
    } catch(e) {}
  };

  // Play magical celebratory birthday horn
  const playBirthdaySuccessSound = () => {
    try {
      const ctx = getAudioContext();
      if (ctx.state === 'suspended') ctx.resume();
      const now = ctx.currentTime;

      // Happy Birthday Melody arpeggio + cheering sound synth
      const notes = [261.63, 261.63, 293.66, 261.63, 349.23, 329.63]; 
      const durs = [0.15, 0.15, 0.3, 0.3, 0.3, 0.6];

      let cumulativeTime = 0;
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + cumulativeTime);

        osc.connect(gain);
        gain.connect(ctx.destination);

        gain.gain.setValueAtTime(0, now + cumulativeTime);
        gain.gain.linearRampToValueAtTime(0.12, now + cumulativeTime + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, now + cumulativeTime + durs[i]);

        osc.start(now + cumulativeTime);
        osc.stop(now + cumulativeTime + durs[i]);

        // Add harmonizer oscillator for rich brass sound
        const oscHarmonic = ctx.createOscillator();
        const gainHarmonic = ctx.createGain();
        oscHarmonic.type = 'sine';
        oscHarmonic.frequency.setValueAtTime(freq * 1.5, now + cumulativeTime);
        oscHarmonic.connect(gainHarmonic);
        gainHarmonic.connect(ctx.destination);
        gainHarmonic.gain.setValueAtTime(0, now + cumulativeTime);
        gainHarmonic.gain.linearRampToValueAtTime(0.04, now + cumulativeTime + 0.05);
        gainHarmonic.gain.exponentialRampToValueAtTime(0.001, now + cumulativeTime + durs[i]);
        oscHarmonic.start(now + cumulativeTime);
        oscHarmonic.stop(now + cumulativeTime + durs[i]);

        cumulativeTime += durs[i] + 0.05;
      });
    } catch(e) {}
  };

  // Microphone Listener to Blow out the candles
  useEffect(() => {
    // Check if mic permission is already granted or can be queried
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      setMicBlowSupported(true);
    }
  }, []);

  const startListeningForBlow = async () => {
    if (isListeningForBlow) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      setIsListeningForBlow(true);
      
      const audioCtx = getAudioContext();
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      let isChecking = true;
      const checkVolume = () => {
        if (!isChecking || candleBlown) {
          stream.getTracks().forEach(track => track.stop());
          setIsListeningForBlow(false);
          return;
        }

        analyser.getByteFrequencyData(dataArray);
        
        // Sum high-frequency bands (which correlate to wind blowing sound)
        let totalVal = 0;
        for (let i = 8; i < bufferLength; i++) {
          totalVal += dataArray[i];
        }
        const average = totalVal / (bufferLength - 8);

        // If high blow volume is detected, blow out candles!
        if (average > 65) {
          triggerBlowCandle();
          isChecking = false;
          stream.getTracks().forEach(track => track.stop());
          setIsListeningForBlow(false);
          return;
        }

        requestAnimationFrame(checkVolume);
      };

      checkVolume();

    } catch (e) {
      console.warn("User microhphone permission declined or unsupported in sandbox. Falling back to button tap.");
      setIsListeningForBlow(false);
    }
  };

  // Blow candle action
  const triggerBlowCandle = () => {
    if (candleBlown) return;
    setCandleLit(false);
    setCandleBlown(true);
    playBirthdaySuccessSound();
    
    // Multi-angled Confetti Explosion!
    const duration = 3 * 1000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.8 },
        colors: ['#ffd700', '#ff69b4', '#87ceeb', '#ffb6c1', '#dda0dd']
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.8 },
        colors: ['#ffd700', '#ff69b4', '#87ceeb', '#ffb6c1', '#dda0dd']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  };

  const resetCandle = () => {
    setCandleLit(true);
    setCandleBlown(false);
    playSparkleSound();
  };

  // Add Wish action
  const handleAddWish = (e: FormEvent) => {
    e.preventDefault();
    if (!newWish.trim()) return;
    setWishes([newWish.trim(), ...wishes]);
    setNewWish('');
    playSparkleSound();
    
    // Little puff of confetti for encouragement
    confetti({
      particleCount: 30,
      spread: 60,
      origin: { y: 0.7 }
    });
  };

  const removeWish = (index: number) => {
    const updated = [...wishes];
    updated.splice(index, 1);
    setWishes(updated);
  };

  // File Upload converting to base64 so it fits easily in localStorage
  const handlePhotoUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const filesUploaded = e.target.files;
    if (!filesUploaded || filesUploaded.length === 0) return;

    const fileArray = Array.from(filesUploaded);
    fileArray.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        const newPhoto: CustomPhoto = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
          url: base64String,
          caption: 'Momen berharga bersama ✨'
        };
        setPhotos(prev => [...prev, newPhoto]);
        playSparkleSound();
      };
      reader.readAsDataURL(file as File);
    });
  };

  const handleDeletePhoto = (id: string) => {
    setPhotos(prev => prev.filter(p => p.id !== id));
  };

  const handleUpdateCaption = (id: string, newCaption: string) => {
    setPhotos(prev => prev.map(p => p.id === id ? { ...p, caption: newCaption } : p));
  };

  // Navigation handlers
  const handleNextStep = () => {
    // Start music on first click to bypass browser audio block
    if (!isMusicPlaying && step === 0) {
      startAmbientMusic();
    }
    playSparkleSound();
    setStep(prev => prev + 1);
  };

  const handlePrevStep = () => {
    playSparkleSound();
    setStep(prev => Math.max(0, prev - 1));
  };

  // Render Theme specific class mappings
  const getThemeBgClass = () => {
    switch (selectedTheme) {
      case 'sakura': return 'bg-aesthetic-sakura';
      case 'warm': return 'bg-aesthetic-warm';
      case 'sunset': return 'bg-aesthetic-sunset';
      case 'cozy': return 'bg-aesthetic-cozy text-stone-800';
      case 'midnight': return 'bg-aesthetic-midnight text-white dark';
      default: return 'bg-aesthetic-sakura';
    }
  };

  const getCardGlassClass = () => {
    return selectedTheme === 'midnight' 
      ? 'bg-slate-900/60 border border-white/10 text-white backdrop-blur-xl shadow-2xl shadow-indigo-950/40'
      : 'bg-white/50 border border-white/60 text-stone-800 backdrop-blur-md shadow-xl shadow-rose-100/30';
  };

  const getAccentBtnClass = () => {
    switch (selectedTheme) {
      case 'sakura': return 'bg-rose-400 hover:bg-rose-500 text-white shadow-rose-300/40';
      case 'warm': return 'bg-amber-400 hover:bg-amber-500 text-stone-900 shadow-amber-300/40';
      case 'sunset': return 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-400/40';
      case 'cozy': return 'bg-stone-700 hover:bg-stone-800 text-white shadow-stone-500/20';
      case 'midnight': return 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/40';
      default: return 'bg-rose-400 hover:bg-rose-500 text-white';
    }
  };

  const getSecBtnClass = () => {
    return selectedTheme === 'midnight'
      ? 'bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-white/5'
      : 'bg-white/80 hover:bg-white text-stone-700 border border-stone-200/50';
  };

  return (
    <div id="aesthetic_birthday_container" className={`min-h-screen relative flex flex-col justify-between transition-all duration-1000 ${getThemeBgClass()}`}>
      
      {/* Gentle Floating Particle Stars in Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
        {[...Array(15)].map((_, i) => (
          <div 
            key={i} 
            className="sparkle-particle"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 10}s`,
              animationDuration: `${10 + Math.random() * 10}s`,
              transform: `scale(${0.3 + Math.random() * 1})`
            }}
          >
            <Sparkles className={`w-6 h-6 ${selectedTheme === 'midnight' ? 'text-indigo-300' : 'text-rose-300'} opacity-30`} />
          </div>
        ))}
      </div>

      {/* HEADER BAR: Settings icon, Music toggle, Branding */}
      <header id="app_header" className="w-full max-w-7xl mx-auto px-4 py-4 flex justify-between items-center z-40">
        <button 
          id="music_toggle_btn"
          onClick={toggleMusic}
          className={`flex items-center gap-2 px-3 py-2 rounded-full transition-all text-sm font-medium ${
            isMusicPlaying 
              ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 animate-pulse' 
              : 'bg-stone-500/10 text-stone-500 border border-stone-200'
          }`}
          title="Nyalakan/Matikan Musik Lofi Pengiring"
        >
          {isMusicPlaying ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          <span className="hidden sm:inline text-xs">
            {isMusicPlaying ? 'Musik Pengiring Aktif' : 'Musik Mati'}
          </span>
        </button>

        <div className="flex items-center gap-3">
          <button
            id="settings_toggle_btn"
            onClick={() => {
              setShowSettings(!showSettings);
              playSparkleSound();
            }}
            className="flex items-center gap-1 px-4 py-2 rounded-full bg-white/70 hover:bg-white text-stone-700 shadow-sm border border-stone-200/40 text-xs font-semibold transition-all hover:scale-105"
            title="Konfigurasi Ucapan & Foto Anda"
          >
            <Settings className="w-4 h-4 text-rose-400" />
            <span>Atur Ucapan / Foto</span>
          </button>
        </div>
      </header>

      {/* SETUP / CONFIGURATION DRAWER PANEL (Only shown when configured by user) */}
      {showSettings && (
        <div id="settings_panel" className="fixed inset-0 bg-stone-900/40 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[85vh] overflow-y-auto p-6 md:p-8 shadow-2xl relative border border-stone-100 text-stone-800">
            
            <button 
              id="close_settings_btn"
              onClick={() => {
                setShowSettings(false);
                playSparkleSound();
              }}
              className="absolute top-4 right-4 bg-stone-100 hover:bg-stone-200 w-10 h-10 rounded-full flex items-center justify-center text-stone-500 hover:text-stone-800 font-bold transition-all text-sm"
            >
              ✕
            </button>

            <div className="flex items-center gap-3 mb-6">
              <Gift className="w-6 h-6 text-rose-500" />
              <h2 className="text-2xl font-serif-aesthetic font-bold">Sesuaikan Ucapan & Foto</h2>
            </div>

            <p className="text-xs text-stone-500 mb-6 bg-rose-50/50 p-3 rounded-xl border border-rose-100/50 flex gap-2">
              <Info className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>Semua data disimpan di browser lokal Anda. Silakan atur nama penerima, pilih palet warna estetik, edit surat tulus Anda, dan unggah foto kenangan untuk disajikan ke penerima!</span>
            </p>

            <div className="space-y-6">
              
              {/* Tema Warna Estetik */}
              <div>
                <label className="block text-sm font-semibold mb-2 text-stone-700">1. Pilih Palet Warna Estetik</label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {[
                    { id: 'sakura', name: '🌸 Sakura', desc: 'Soft Pink Romantic' },
                    { id: 'warm', name: '✨ Warm Gold', desc: 'Elegant Pastel Blend' },
                    { id: 'sunset', name: '🌅 Sunset', desc: 'Calm Twilight Rose' },
                    { id: 'cozy', name: '🪵 Cozy Clay', desc: 'Warm Earthy Tone' },
                    { id: 'midnight', name: '🌌 Midnight', desc: 'Dreamy Starry Night' }
                  ].map(th => (
                    <button
                      key={th.id}
                      onClick={() => setSelectedTheme(th.id)}
                      className={`p-3 rounded-2xl border text-left transition-all ${
                        selectedTheme === th.id 
                          ? 'border-rose-500 bg-rose-50 text-rose-900 ring-2 ring-rose-200' 
                          : 'border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-700'
                      }`}
                    >
                      <div className="font-bold text-xs">{th.name}</div>
                      <div className="text-[10px] opacity-70 mt-1">{th.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Nama Yang Ulang Tahun */}
                <div>
                  <label className="block text-sm font-semibold mb-1 text-stone-700">2. Nama yang Berulang Tahun</label>
                  <input 
                    type="text" 
                    value={birthdayName}
                    onChange={(e) => setBirthdayName(e.target.value)}
                    placeholder="Contoh: Adinda Kirana"
                    className="w-full px-4 py-3 rounded-2xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-rose-300 text-stone-800"
                  />
                </div>

                {/* Nama Pengirim */}
                <div>
                  <label className="block text-sm font-semibold mb-1 text-stone-700">3. Nama Pengirim (Anda)</label>
                  <input 
                    type="text" 
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    placeholder="Contoh: Dari Pacarmu / Sahabatmu"
                    className="w-full px-4 py-3 rounded-2xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-rose-300 text-stone-800"
                  />
                </div>
              </div>

              {/* Surat Harapan / Letter */}
              <div>
                <label className="block text-sm font-semibold mb-1 text-stone-700">4. Isi Surat Panjang & Harapan Tulus</label>
                <textarea 
                  value={customLetter}
                  onChange={(e) => setCustomLetter(e.target.value)}
                  rows={4}
                  placeholder="Tuliskan ucapan panjang lebar yang paling romantis dan menyentuh..."
                  className="w-full px-4 py-3 rounded-2xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-rose-300 text-stone-800 text-sm"
                />
              </div>

              {/* Unggah Foto Estetik */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-semibold text-stone-700">5. Foto Galeri Kenangan ({photos.length})</label>
                  <label className="flex items-center gap-1 text-xs text-rose-500 hover:text-rose-600 font-semibold cursor-pointer bg-rose-50 px-3 py-1.5 rounded-full border border-rose-100">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Unggah Foto</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      multiple 
                      onChange={handlePhotoUpload} 
                      className="hidden" 
                    />
                  </label>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-h-[160px] overflow-y-auto p-1 bg-stone-50 rounded-2xl border border-stone-100">
                  {photos.map((p, idx) => (
                    <div key={p.id} className="relative group rounded-xl overflow-hidden aspect-square border border-stone-200 bg-white shadow-sm">
                      <img src={p.url} alt="thumbnail" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-1.5">
                        <input 
                          type="text" 
                          value={p.caption} 
                          onChange={(e) => handleUpdateCaption(p.id, e.target.value)}
                          className="w-full bg-white/90 text-[10px] px-1 py-0.5 rounded text-stone-800 font-medium mb-1 focus:outline-none"
                          title="Ubah Caption Foto"
                        />
                        <button 
                          onClick={() => handleDeletePhoto(p.id)}
                          className="bg-red-500 hover:bg-red-600 text-white p-1 rounded self-center shadow"
                          title="Hapus Foto"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                  {photos.length === 0 && (
                    <div className="col-span-full py-8 text-center text-xs text-stone-400">
                      Belum ada foto. Unggah beberapa foto berharga Anda!
                    </div>
                  )}
                </div>
              </div>

            </div>

            <div className="mt-8 pt-4 border-t border-stone-100 flex justify-end">
              <button
                onClick={() => {
                  setShowSettings(false);
                  playSparkleSound();
                }}
                className="px-6 py-3 rounded-full bg-stone-900 text-white font-semibold hover:bg-stone-800 transition-all text-sm flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Simpan & Terapkan Perubahan</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* CORE DISPLAY STAGES (wizard steps) */}
      <main id="main_content_stage" className="flex-grow flex items-center justify-center p-4 max-w-4xl mx-auto w-full z-10">
        
        {/* STEP 0: INITIAL VIEW (ONLY "SELAMAT ULANG TAHUN" + NEXT BUTTON) */}
        {step === 0 && (
          <div id="step_0_container" className="text-center animate-fadeIn flex flex-col items-center justify-center gap-10 max-w-lg">
            <div className="relative">
              {/* Soft decorative elements floating */}
              <div className="absolute -top-12 -left-12 text-5xl animate-bounce duration-1000">🎉</div>
              <div className="absolute -bottom-8 -right-8 text-5xl animate-bounce delay-300">✨</div>
              
              <h1 id="title_selamat_ulang_tahun" className="text-5xl sm:text-7xl font-serif-aesthetic font-extrabold tracking-wide drop-shadow-sm leading-tight text-center">
                Selamat <br/>
                <span className={`inline-block py-2 ${
                  selectedTheme === 'midnight' 
                    ? 'text-transparent bg-clip-text bg-gradient-to-r from-pink-300 via-indigo-200 to-amber-200' 
                    : 'text-transparent bg-clip-text bg-gradient-to-r from-rose-500 via-amber-500 to-rose-600'
                }`}>
                  Ulang Tahun
                </span>
              </h1>
            </div>

            <button 
              id="start_journey_btn"
              onClick={handleNextStep}
              className={`group flex items-center gap-3 px-8 py-4 rounded-full text-base font-bold transition-all duration-300 hover:scale-105 shadow-lg ${getAccentBtnClass()}`}
            >
              <span>Next</span>
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        )}

        {/* STEP 1: BIRTHDAY PERSON'S NAME */}
        {step === 1 && (
          <div id="step_1_container" className={`w-full max-w-xl p-8 rounded-3xl ${getCardGlassClass()} text-center animate-fadeIn relative overflow-hidden`}>
            
            {/* Absolute decorative circle blobs */}
            <div className="absolute -top-16 -left-16 w-32 h-32 bg-rose-200/20 rounded-full blur-2xl"></div>
            <div className="absolute -bottom-16 -right-16 w-32 h-32 bg-amber-200/20 rounded-full blur-2xl"></div>

            <div className="flex justify-center mb-6">
              <span className="text-4xl animate-pulse">🎂</span>
            </div>

            <p className="text-xs tracking-widest uppercase font-bold opacity-60 mb-2">Hari Ini Adalah Milikmu,</p>
            
            <h1 id="birthday_person_name_display" className="text-3xl sm:text-5xl font-serif-aesthetic font-black mb-6 leading-tight select-all">
              {birthdayName || 'Adinda Kirana'}
            </h1>

            <div className="w-16 h-1 bg-gradient-to-r from-rose-400 to-amber-300 mx-auto mb-6 rounded-full"></div>

            <p className="text-sm italic opacity-80 leading-relaxed max-w-md mx-auto mb-8 font-serif-aesthetic">
              &ldquo;Semoga seiring bertambahnya angka, senyumanmu semakin merekah, hatimu semakin diteduhkan, dan duniamu selalu diisi oleh kedamaian serta cinta tulus.&rdquo;
            </p>

            {/* Custom Interactive Heart Click */}
            <div className="mb-8">
              <button 
                id="floating_heart_tap_btn"
                onClick={() => {
                  playSparkleSound();
                  confetti({
                    particleCount: 20,
                    angle: 90,
                    spread: 45,
                    origin: { y: 0.6 }
                  });
                }}
                className="mx-auto w-16 h-16 rounded-full bg-rose-50 hover:bg-rose-100 flex items-center justify-center border border-rose-200 shadow-md group active:scale-95 transition-all"
                title="Kirimkan Cinta Kasih Anda"
              >
                <Heart className="w-8 h-8 text-rose-500 fill-rose-500/20 group-hover:scale-110 group-hover:fill-rose-500 transition-all animate-float" />
              </button>
              <span className="text-[10px] block mt-2 opacity-50 font-semibold uppercase tracking-wider">Tekan untuk kirim cinta</span>
            </div>

            {/* Step Controls */}
            <div className="flex justify-between items-center pt-4 border-t border-stone-200/10">
              <button 
                id="step1_back_btn"
                onClick={handlePrevStep}
                className={`flex items-center gap-1 px-4 py-2.5 rounded-full text-xs font-semibold ${getSecBtnClass()}`}
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Kembali</span>
              </button>
              
              <button 
                id="step1_next_btn"
                onClick={handleNextStep}
                className={`flex items-center gap-1.5 px-6 py-2.5 rounded-full text-xs font-bold shadow-md transition-all hover:scale-105 ${getAccentBtnClass()}`}
              >
                <span>Lihat Foto Kenangan</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>
        )}

        {/* STEP 2: PHOTO GALLERY SCRAPBOOK */}
        {step === 2 && (
          <div id="step_2_container" className="w-full animate-fadeIn flex flex-col gap-6">
            
            <div className="text-center">
              <span className="inline-block px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold uppercase tracking-widest mb-2">Galeri Estetik</span>
              <h2 className="text-3xl font-serif-aesthetic font-bold">Momen-Momen Indah Kita</h2>
              <p className="text-xs text-stone-500 dark:text-stone-300 mt-1">Mengintip kembali senyuman dan kenangan manis yang telah terlewati</p>
            </div>

            {/* Aesthetic Scrapbook Collage of Polaroids */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 py-4">
              {photos.map((p, idx) => {
                // Generate unique rotating angle based on index for natural polaroid aesthetic look
                const angles = ['-rotate-3', 'rotate-2', '-rotate-1', 'rotate-3'];
                const currentAngle = angles[idx % angles.length];

                return (
                  <div 
                    key={p.id}
                    className={`bg-white p-4 pb-6 rounded-md shadow-lg border border-stone-100 transition-all duration-300 hover:scale-105 hover:rotate-0 hover:z-20 ${currentAngle}`}
                  >
                    <div className="aspect-square w-full overflow-hidden bg-stone-50 rounded-sm relative group">
                      <img 
                        src={p.url} 
                        alt={p.caption} 
                        className="w-full h-full object-cover grayscale-[20%] hover:grayscale-0 transition-all duration-500" 
                      />
                      <div className="absolute inset-0 bg-stone-900/10 opacity-0 group-hover:opacity-100 transition-all"></div>
                    </div>
                    {/* Caption area */}
                    <div className="mt-4 text-center">
                      <p className="font-handwriting text-xl text-stone-700 leading-snug break-words px-1">
                        {p.caption || 'Momen manis ✨'}
                      </p>
                    </div>
                  </div>
                );
              })}

              {/* Empty state or upload suggestion in-grid */}
              {photos.length === 0 && (
                <div className="col-span-full bg-white/40 border border-dashed border-stone-300 rounded-3xl p-12 text-center text-stone-500">
                  <Camera className="w-12 h-12 text-stone-300 mx-auto mb-2" />
                  <p className="text-sm font-semibold">Belum Ada Foto Terunggah</p>
                  <p className="text-xs opacity-70 mt-1 mb-4">Mulai dengan klik tombol "Atur Ucapan / Foto" di pojok kanan atas!</p>
                  <button 
                    onClick={() => setShowSettings(true)}
                    className="px-4 py-2 bg-rose-400 text-white rounded-full text-xs font-semibold"
                  >
                    Buka Konfigurasi
                  </button>
                </div>
              )}
            </div>

            {/* Step controls */}
            <div className="flex justify-between items-center mt-6">
              <button 
                id="step2_back_btn"
                onClick={handlePrevStep}
                className={`flex items-center gap-1 px-4 py-2.5 rounded-full text-xs font-semibold ${getSecBtnClass()}`}
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Kembali</span>
              </button>
              
              <button 
                id="step2_next_btn"
                onClick={handleNextStep}
                className={`flex items-center gap-1.5 px-6 py-2.5 rounded-full text-xs font-bold shadow-md transition-all hover:scale-105 ${getAccentBtnClass()}`}
              >
                <span>Halaman Kejutan Utama 🎁</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>
        )}

        {/* STEP 3: CAKE, BLOW CANDLES, HARAPAN & WISHLIST */}
        {step === 3 && (
          <div id="step_3_container" className="w-full animate-fadeIn grid grid-cols-1 md:grid-cols-2 gap-8 items-start pb-8">
            
            {/* COLUMN 1: INTERACTIVE CAKE & CELEBRATION BOX */}
            <div className={`p-6 sm:p-8 rounded-3xl ${getCardGlassClass()} flex flex-col items-center justify-center text-center relative overflow-hidden`}>
              
              <span className="inline-block px-3 py-1 rounded-full bg-rose-100 text-rose-800 text-[10px] font-bold uppercase tracking-widest mb-4">Interaktif</span>
              
              <h2 className="text-2xl font-serif-aesthetic font-bold mb-1">Kue Ulang Tahunku</h2>
              <p className="text-xs text-stone-500 dark:text-stone-300 mb-6">Tiup lilinnya untuk meledakkan kejutan indah!</p>

              {/* 3D-ish CSS Birthday Cake */}
              <div className="relative w-48 h-48 my-6 flex flex-col items-center justify-end">
                
                {/* CANDLE FLAME & WICK */}
                <div className="absolute top-8 z-20 flex flex-col items-center">
                  {candleLit ? (
                    <div className="w-4 h-6 rounded-full candle-flame animate-pulse"></div>
                  ) : (
                    // Smoke trace when blown
                    <div className="w-1.5 h-6 bg-stone-300/60 rounded-full blur-[1.5px] animate-bounce duration-1000 origin-bottom"></div>
                  )}
                  {/* Wick */}
                  <div className="w-0.5 h-2 bg-stone-800"></div>
                  {/* Wax Candle Bar */}
                  <div className="w-3 h-10 bg-gradient-to-r from-amber-200 via-rose-300 to-amber-300 rounded-sm relative">
                    <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.4)_25%,rgba(255,255,255,0.4)_50%,transparent_50%,transparent_75%,rgba(255,255,255,0.4)_75%)] bg-[length:6px_6px]"></div>
                  </div>
                </div>

                {/* CAKE LAYERS */}
                {/* Layer Top */}
                <div className="w-28 h-8 bg-gradient-to-r from-rose-200 to-rose-300 rounded-full border-b border-rose-400 z-10 flex items-center justify-center relative">
                  {/* Decorative frosting white dots */}
                  <div className="absolute -top-1 left-2 w-2.5 h-2.5 bg-white rounded-full"></div>
                  <div className="absolute -top-1 left-8 w-2.5 h-2.5 bg-white rounded-full"></div>
                  <div className="absolute -top-1 left-14 w-2.5 h-2.5 bg-white rounded-full"></div>
                  <div className="absolute -top-1 left-20 w-2.5 h-2.5 bg-white rounded-full"></div>
                  <div className="absolute -top-1 left-24 w-2.5 h-2.5 bg-white rounded-full"></div>
                </div>

                {/* Layer Middle */}
                <div className="w-36 h-12 bg-gradient-to-r from-rose-300 to-rose-400 -mt-4 border-b border-rose-500 rounded-full z-8 relative flex items-center justify-center">
                  <div className="absolute top-1 w-full h-1 bg-yellow-200/50"></div>
                  <div className="absolute top-3 w-full h-1 bg-white/40"></div>
                </div>

                {/* Layer Base Cream */}
                <div className="w-44 h-16 bg-gradient-to-r from-stone-100 to-stone-200 -mt-6 border-b border-stone-300 rounded-full z-5 relative">
                  {/* Strawberry pieces sticked to cake */}
                  <div className="absolute bottom-4 left-6 w-3 h-3 bg-red-500 rounded-full shadow-inner"></div>
                  <div className="absolute bottom-6 left-16 w-3.5 h-3.5 bg-red-500 rounded-full shadow-inner"></div>
                  <div className="absolute bottom-5 left-28 w-3 h-3 bg-red-500 rounded-full shadow-inner"></div>
                  <div className="absolute bottom-4 left-36 w-3.5 h-3.5 bg-red-500 rounded-full shadow-inner"></div>
                </div>

                {/* Cake Stand Tray */}
                <div className="w-52 h-4 bg-stone-300 rounded-full shadow-md z-2 -mt-4"></div>
              </div>

              {/* CANDLE CONTROL BUTTONS */}
              <div className="w-full flex flex-col gap-2 mt-4">
                {candleLit ? (
                  <div className="space-y-3">
                    <button 
                      id="blow_candle_tap_btn"
                      onClick={triggerBlowCandle}
                      className="px-6 py-2.5 rounded-full bg-stone-900 text-white font-bold hover:bg-stone-800 transition-all flex items-center gap-1.5 justify-center mx-auto shadow-md"
                    >
                      <Flame className="w-4 h-4 text-amber-400" />
                      <span>Tiup Lilin 🕯️💨</span>
                    </button>

                    {micBlowSupported && (
                      <button
                        onClick={startListeningForBlow}
                        className={`text-xs block mx-auto underline font-medium ${isListeningForBlow ? 'text-rose-500 animate-pulse' : 'text-stone-500'}`}
                      >
                        {isListeningForBlow ? '🔴 Dekatkan mulut ke mic & ditiup...' : '🎤 Atau tiup langsung pakai microphone'}
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2 animate-fadeIn">
                    <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">✨ Selamat! Lilin Berhasil Ditiup! ✨</p>
                    <button 
                      onClick={resetCandle}
                      className="px-4 py-1.5 rounded-full border border-stone-200 bg-white/90 text-stone-700 text-xs font-semibold hover:bg-stone-100 transition-all flex items-center gap-1 justify-center mx-auto shadow-sm"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Nyalakan Lilin Lagi</span>
                    </button>
                  </div>
                )}
              </div>

              {/* THE SENDER LETTER BOX */}
              <div className="w-full mt-8 p-5 rounded-2xl bg-white/80 border border-stone-100 text-left relative shadow-inner">
                <span className="absolute -top-3 left-4 bg-rose-400 text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">Surat Dari {senderName || 'Kami'}</span>
                <p className="font-handwriting text-2xl text-stone-800 leading-relaxed pt-2 whitespace-pre-line">
                  {customLetter}
                </p>
                <div className="text-right mt-4 font-serif-aesthetic font-bold text-xs text-rose-500 tracking-wider">
                  — {senderName}
                </div>
              </div>

              {/* Navigation Back */}
              <button 
                id="final_back_btn"
                onClick={handlePrevStep}
                className={`flex items-center gap-1 mt-6 px-4 py-2 rounded-full text-xs font-semibold ${getSecBtnClass()}`}
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Ulangi Kenangan</span>
              </button>

            </div>

            {/* COLUMN 2: WISH JAR / HARAPAN YANG MAU DITULIS */}
            <div className={`p-6 sm:p-8 rounded-3xl ${getCardGlassClass()} flex flex-col justify-start text-left relative`}>
              
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">🌟</div>
                <div>
                  <h3 className="text-xl font-serif-aesthetic font-bold">Papan Harapan & Doa</h3>
                  <p className="text-xs text-stone-500">Tuliskan doa serta impian terindahmu di bawah ini!</p>
                </div>
              </div>

              {/* Add Wish Form */}
              <form onSubmit={handleAddWish} className="flex gap-2 mb-6">
                <input 
                  type="text" 
                  value={newWish}
                  onChange={(e) => setNewWish(e.target.value)}
                  placeholder="Contoh: Semoga impian kuliah/kerja tercapai..."
                  className="flex-grow px-4 py-2.5 rounded-full border border-stone-200 bg-white/90 text-stone-800 focus:outline-none focus:ring-2 focus:ring-rose-300 text-xs"
                />
                <button 
                  type="submit"
                  className="bg-stone-900 text-white p-2.5 rounded-full hover:bg-stone-800 transition-all shrink-0 shadow"
                  title="Tambahkan Doa"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>

              {/* List of Wishes */}
              <div className="space-y-3 overflow-y-auto max-h-[300px] pr-1">
                {wishes.map((wish, index) => (
                  <div 
                    key={index} 
                    className="flex justify-between items-start gap-2 bg-white/70 hover:bg-white p-3 rounded-2xl border border-stone-200/40 text-xs transition-all shadow-sm animate-fadeIn"
                  >
                    <span className="leading-relaxed text-stone-700 font-medium break-all">{wish}</span>
                    <button 
                      type="button"
                      onClick={() => removeWish(index)}
                      className="text-stone-400 hover:text-rose-500 shrink-0 self-center"
                      title="Hapus Doa"
                    >
                      ✕
                    </button>
                  </div>
                ))}

                {wishes.length === 0 && (
                  <div className="text-center py-12 text-stone-400 text-xs">
                    Papan harapan masih kosong. Tulis harapan pertamamu!
                  </div>
                )}
              </div>

              {/* Decorative note info */}
              <div className="mt-8 bg-amber-50/50 p-4 rounded-2xl border border-amber-100 text-[11px] text-amber-900 leading-relaxed">
                🍰 <strong>Cara Kirim Link Ini:</strong> <br/>
                Kalian bisa mengisi data ucapan di atas lalu membagikan URL preview aplikasi ini ke teman yang sedang berulang tahun. Seluruh ucapan dan foto yang Anda simpan akan tampil persis di layar mereka!
              </div>

            </div>

          </div>
        )}

      </main>

      {/* FOOTER: copyright/author branding */}
      <footer id="app_footer_credit" className="w-full text-center py-6 opacity-60 text-xs tracking-wider font-semibold z-10">
        Dibuat dengan penuh ❤️ oleh {senderName || 'Sahabatmu'} | © {new Date().getFullYear()}
      </footer>

    </div>
  );
}
