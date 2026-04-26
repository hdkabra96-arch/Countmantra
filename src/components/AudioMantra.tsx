import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mic, Square, Play, Pause, Timer, Repeat, Trash2, Volume2, VolumeX, Gauge } from 'lucide-react';

interface AudioMantraProps {
  isDarkMode: boolean;
  onCycleComplete?: () => void;
  onAudioChange?: (hasAudio: boolean) => void;
  showOnlyPlayer?: boolean;
}

export const AudioMantra: React.FC<AudioMantraProps> = ({ isDarkMode, onCycleComplete, onAudioChange, showOnlyPlayer }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  useEffect(() => {
    if (onAudioChange) onAudioChange(!!audioUrl);
  }, [audioUrl, onAudioChange]);
  const [targetRepetitions, setTargetRepetitions] = useState(108);
  const [currentRepetition, setCurrentRepetition] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [isLooping, setIsLooping] = useState(false);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Load saved audio if any
  useEffect(() => {
    const loadAudio = () => {
      const savedAudio = localStorage.getItem('mantra_audio');
      setAudioUrl(savedAudio);
    };

    loadAudio();

    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'mantra_audio') {
        loadAudio();
      }
    };

    window.addEventListener('storage', handleStorage);
    // Also listen for custom events for same-window updates
    const handleCustom = () => loadAudio();
    window.addEventListener('mantra_audio_changed', handleCustom);

    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('mantra_audio_changed', handleCustom);
    };
  }, []);

  // Timer logic removed in favor of repetition logic
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleEnded = () => {
      if (isLooping) {
        const nextRep = currentRepetition + 1;
        setCurrentRepetition(nextRep);
        if (onCycleComplete) onCycleComplete();

        if (nextRep < targetRepetitions) {
          timerRef.current = setTimeout(() => {
            audio.play().catch(e => console.error("Error playing audio", e));
          }, 750); // 0.75 second delay between repetitions
        } else {
          stopLoop();
        }
      }
    };

    audio.addEventListener('ended', handleEnded);
    return () => audio.removeEventListener('ended', handleEnded);
  }, [isLooping, currentRepetition, targetRepetitions, onCycleComplete]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackSpeed;
    }
  }, [playbackSpeed, audioUrl]);

  const startRecording = async () => {
    setError(null);
    
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setError('Recording is not supported in this browser.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: mediaRecorder.mimeType || 'audio/wav' });
        
        // Convert to base64 for storage
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = reader.result as string;
          localStorage.setItem('mantra_audio', base64);
          setAudioUrl(base64);
          window.dispatchEvent(new Event('mantra_audio_changed'));
        };
        reader.readAsDataURL(audioBlob);
        
        // Stop all tracks to release microphone
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err: any) {
      console.error('Microphone Error:', err);
      const errMsg = (err.message || '').toLowerCase();
      const errName = err.name || '';
      
      if (errName === 'NotAllowedError' || errName === 'PermissionDeniedError' || errMsg.includes('denied') || errMsg.includes('dismissed') || errMsg.includes('permission')) {
        setError('Microphone access is needed. Please click "Allow" when the prompt appears.');
      } else if (errName === 'NotFoundError' || errName === 'DevicesNotFoundError') {
        setError('No microphone was found on this device.');
      } else if (errName === 'NotReadableError' || errName === 'TrackStartError') {
        setError('Microphone is busy or not working. Check other apps.');
      } else {
        setError('Could not access microphone. Please try again.');
      }
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
    }
  };

  const startLoop = () => {
    if (!audioUrl) return;
    setIsLooping(true);
    setCurrentRepetition(0);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.playbackRate = playbackSpeed;
      audioRef.current.play();
    }
  };

  const stopLoop = () => {
    setIsLooping(false);
    setCurrentRepetition(0);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  const deleteAudio = () => {
    stopLoop();
    setAudioUrl(null);
    localStorage.removeItem('mantra_audio');
    window.dispatchEvent(new Event('mantra_audio_changed'));
    setShowDeleteConfirm(false);
  };

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`${showOnlyPlayer ? 'space-y-3' : `p-6 rounded-3xl ${isDarkMode ? 'bg-zinc-800/50' : 'bg-zinc-100/50'} border border-white/5 space-y-6`}`}>
      {/* Remove the header in player mode to save space, LCD already shows it */}
      {!showOnlyPlayer && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Volume2 size={18} className="opacity-50" />
            <h3 className="text-sm font-bold uppercase tracking-widest opacity-70">Voice Mantra</h3>
          </div>
          {audioUrl && !showDeleteConfirm && (
            <button onClick={() => setShowDeleteConfirm(true)} className="text-red-500/50 hover:text-red-500 transition-colors">
              <Trash2 size={16} />
            </button>
          )}
        </div>
      )}

      {error && (
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-center">
          <p className="text-[10px] font-bold uppercase tracking-widest">{error}</p>
        </div>
      )}

      {showDeleteConfirm ? (
        <div className="flex flex-col items-center justify-center py-4 space-y-4">
          <p className="text-xs font-bold uppercase tracking-widest opacity-70">Delete recording?</p>
          <div className="flex gap-3 w-full">
            <button 
              onClick={() => setShowDeleteConfirm(false)}
              className={`flex-1 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest ${isDarkMode ? 'bg-zinc-700' : 'bg-zinc-200'}`}
            >
              Cancel
            </button>
            <button 
              onClick={deleteAudio}
              className="flex-1 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest bg-red-500 text-white"
            >
              Delete
            </button>
          </div>
        </div>
      ) : !audioUrl ? (
        !showOnlyPlayer && (
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={isRecording ? stopRecording : startRecording}
              className={`w-20 h-20 rounded-full flex items-center justify-center shadow-lg transition-colors ${
                isRecording ? 'bg-red-500 animate-pulse' : 'bg-teal-600'
              }`}
            >
              {isRecording ? (
                <div className="flex flex-col items-center">
                  <Square size={24} className="text-white mb-1" />
                  <span className="text-[10px] font-bold text-white uppercase">Done</span>
                </div>
              ) : (
                <Mic size={32} className="text-white" />
              )}
            </motion.button>
            <p className="text-xs font-medium opacity-50 uppercase tracking-widest">
              {isRecording ? 'Recording...' : 'Tap to record mantra'}
            </p>
          </div>
        )
      ) : (
        <div className={showOnlyPlayer ? "flex items-center gap-3 w-full" : "space-y-6"}>
          {/* Playback Controls */}
          <div className={`flex ${showOnlyPlayer ? 'flex-row' : 'flex-col'} items-center ${showOnlyPlayer ? 'gap-3' : 'space-y-4'}`}>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={isLooping ? stopLoop : startLoop}
              className={`${showOnlyPlayer ? 'w-10 h-10' : 'w-16 h-16'} rounded-full flex items-center justify-center shadow-lg transition-colors ${
                isLooping ? 'bg-red-500' : 'bg-teal-600'
              }`}
            >
              {isLooping ? <Square size={showOnlyPlayer ? 16 : 24} className="text-white" /> : <Play size={showOnlyPlayer ? 16 : 24} className="text-white ml-1" />}
            </motion.button>
            
            {isLooping && (
              <div className={showOnlyPlayer ? "text-left min-w-[40px]" : "text-center"}>
                <p className={`${showOnlyPlayer ? 'text-sm' : 'text-2xl'} font-mono font-bold leading-none`}>{currentRepetition}/{targetRepetitions}</p>
                <p className="text-[7px] uppercase tracking-widest opacity-40">Reps</p>
              </div>
            )}
          </div>

          {/* Repetition Selector */}
          <div className={`${showOnlyPlayer ? 'flex-1' : 'space-y-2'}`}>
            {!showOnlyPlayer && (
              <div className="flex items-center gap-2 opacity-50">
                <Repeat size={14} />
                <span className="text-[10px] font-bold uppercase tracking-widest">Repetitions</span>
              </div>
            )}
            <div className="flex flex-wrap gap-1">
              {[11, 21, 51, 108, 1008, 10000, 100000, 1000000, 10000000, 100000000].map((count) => (
                <button
                  key={count}
                  disabled={isLooping}
                  onClick={() => setTargetRepetitions(count)}
                  className={`flex-1 min-w-[28px] py-1 rounded-lg text-[7px] font-bold transition-all ${
                    targetRepetitions === count
                      ? 'bg-teal-600 text-white'
                      : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-500 dark:text-zinc-400'
                  } ${isLooping ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {count >= 1000000 ? `${count/1000000}M` : count >= 1000 ? `${count/1000}k` : count}
                </button>
              ))}
            </div>
            {!showOnlyPlayer && (
              <input
                type="number"
                disabled={isLooping}
                value={targetRepetitions}
                onChange={(e) => setTargetRepetitions(parseInt(e.target.value) || 0)}
                className={`w-full py-2 px-3 rounded-xl text-[10px] font-bold outline-none border transition-all ${isDarkMode ? 'bg-zinc-900 border-zinc-700 text-white' : 'bg-white border-zinc-200 text-zinc-900'} ${isLooping ? 'opacity-50' : ''}`}
                placeholder="Custom count..."
              />
            )}
          </div>

          {/* Speed Selector */}
          <div className={`${showOnlyPlayer ? 'flex-1' : 'space-y-2'}`}>
            {!showOnlyPlayer && (
              <div className="flex items-center gap-2 opacity-50">
                <Gauge size={14} />
                <span className="text-[10px] font-bold uppercase tracking-widest">Speed</span>
              </div>
            )}
            <div className="flex flex-wrap gap-1">
              {[0.5, 0.75, 1, 1.25, 1.5, 2].map((speed) => (
                <button
                  key={speed}
                  onClick={() => setPlaybackSpeed(speed)}
                  className={`flex-1 min-w-[28px] py-1 rounded-lg text-[7px] font-bold transition-all ${
                    playbackSpeed === speed
                      ? 'bg-teal-600 text-white'
                      : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-500 dark:text-zinc-400'
                  }`}
                >
                  {speed}x
                </button>
              ))}
            </div>
          </div>
          <audio ref={audioRef} src={audioUrl} />
        </div>
      )}
    </div>
  );
};
