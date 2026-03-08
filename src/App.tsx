/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RotateCcw, Settings, History, Moon, Sun, Volume2, Vibrate, Lightbulb } from 'lucide-react';

// Types
type Theme = 'teal' | 'silver' | 'black' | 'gold';

interface HistoryItem {
  id: string;
  count: number;
  timestamp: number;
}

export default function App() {
  // State
  const [count, setCount] = useState<number>(0);
  const [goal, setGoal] = useState<number>(100000);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [vibrationEnabled, setVibrationEnabled] = useState<boolean>(true);
  const [showHistory, setShowHistory] = useState<boolean>(false);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [theme, setTheme] = useState<Theme>('teal');
  const [isBacklightOn, setIsBacklightOn] = useState<boolean>(false);

  // Load data from localStorage
  useEffect(() => {
    const savedCount = localStorage.getItem('tasbih_count');
    const savedHistory = localStorage.getItem('tasbih_history');
    const savedSettings = localStorage.getItem('tasbih_settings');

    if (savedCount) setCount(parseInt(savedCount, 10));
    if (savedHistory) setHistory(JSON.parse(savedHistory));
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      setIsDarkMode(settings.isDarkMode ?? true);
      setSoundEnabled(settings.soundEnabled ?? true);
      setVibrationEnabled(settings.vibrationEnabled ?? true);
      setTheme(settings.theme ?? 'teal');
    }
  }, []);

  // Save data to localStorage
  useEffect(() => {
    localStorage.setItem('tasbih_count', count.toString());
  }, [count]);

  useEffect(() => {
    localStorage.setItem('tasbih_history', JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    localStorage.setItem('tasbih_settings', JSON.stringify({
      isDarkMode,
      soundEnabled,
      vibrationEnabled,
      theme
    }));
  }, [isDarkMode, soundEnabled, vibrationEnabled, theme]);

  // Handlers
  const playClickSound = useCallback(() => {
    if (!soundEnabled) return;
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      
      const audioCtx = new AudioContextClass();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(1200, audioCtx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(40, audioCtx.currentTime + 0.1);

      gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);

      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.1);
      
      // Close context to save resources
      setTimeout(() => audioCtx.close(), 200);
    } catch (e) {
      console.error('Audio error:', e);
    }
  }, [soundEnabled]);

  const handleIncrement = useCallback(() => {
    if (goal > 0 && count >= goal) {
      // Optional: Add a subtle "limit reached" vibration
      if (vibrationEnabled && navigator.vibrate) {
        navigator.vibrate(10);
      }
      return;
    }

    setCount(prev => prev + 1);
    
    // Feedback
    if (vibrationEnabled && navigator.vibrate) {
      navigator.vibrate(40);
    }
    
    playClickSound();

    if (count + 1 === goal) {
      if (vibrationEnabled && navigator.vibrate) {
        navigator.vibrate([100, 50, 100]);
      }
    }
  }, [count, goal, vibrationEnabled, playClickSound]);

  const handleReset = () => {
    if (count > 0) {
      const newItem: HistoryItem = {
        id: Date.now().toString(),
        count: count,
        timestamp: Date.now(),
      };
      setHistory(prev => [newItem, ...prev].slice(0, 20));
    }
    setCount(0);
    if (vibrationEnabled && navigator.vibrate) {
      navigator.vibrate(80);
    }
  };

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);
  const toggleBacklight = () => setIsBacklightOn(!isBacklightOn);

  // Theme styles for the physical device
  const deviceThemes = {
    teal: {
      body: 'bg-teal-700',
      bodyLight: 'bg-teal-600',
      bodyDark: 'bg-teal-900',
      button: 'bg-zinc-300',
      buttonActive: 'bg-zinc-400',
    },
    silver: {
      body: 'bg-zinc-400',
      bodyLight: 'bg-zinc-300',
      bodyDark: 'bg-zinc-600',
      button: 'bg-zinc-100',
      buttonActive: 'bg-zinc-200',
    },
    black: {
      body: 'bg-zinc-800',
      bodyLight: 'bg-zinc-700',
      bodyDark: 'bg-zinc-950',
      button: 'bg-zinc-400',
      buttonActive: 'bg-zinc-500',
    },
    gold: {
      body: 'bg-amber-600',
      bodyLight: 'bg-amber-500',
      bodyDark: 'bg-amber-800',
      button: 'bg-zinc-200',
      buttonActive: 'bg-zinc-300',
    }
  };

  const currentTheme = deviceThemes[theme];

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-zinc-950' : 'bg-zinc-100'} transition-colors duration-500 flex flex-col items-center justify-center p-4 font-sans overflow-hidden`}>
      
      {/* Top Navigation Bar */}
      <div className="fixed top-0 left-0 right-0 p-6 flex justify-between items-center max-w-2xl mx-auto w-full z-10">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => setShowSettings(true)}
          className={`p-3 rounded-full ${isDarkMode ? 'bg-zinc-900 text-zinc-400' : 'bg-white text-zinc-600'} shadow-lg`}
        >
          <Settings size={20} />
        </motion.button>

        <div className="flex gap-3">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={toggleDarkMode}
            className={`p-3 rounded-full ${isDarkMode ? 'bg-zinc-900 text-zinc-400' : 'bg-white text-zinc-600'} shadow-lg`}
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowHistory(true)}
            className={`p-3 rounded-full ${isDarkMode ? 'bg-zinc-900 text-zinc-400' : 'bg-white text-zinc-600'} shadow-lg`}
          >
            <History size={20} />
          </motion.button>
        </div>
      </div>

      {/* The Physical Device Container */}
      <div className="relative flex flex-col items-center">
        
        {/* Device Body (Pebble Shape) */}
        <motion.div 
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className={`relative w-[280px] h-[360px] md:w-[320px] md:h-[420px] ${currentTheme.body} rounded-[80px] md:rounded-[100px] shadow-[0_30px_60px_-12px_rgba(0,0,0,0.5),inset_0_4px_12px_rgba(255,255,255,0.3),inset_0_-8px_16px_rgba(0,0,0,0.4)] flex flex-col items-center pt-10 md:pt-14 overflow-hidden border-t border-white/20`}
        >
          {/* Brand Name / Logo */}
          <div className="text-[10px] md:text-xs font-bold tracking-[0.2em] text-white/40 uppercase mb-4 md:mb-6">
            Digital Tasbih
          </div>

          {/* LCD Screen Container */}
          <div className="relative w-[80%] h-24 md:h-32 bg-zinc-900 rounded-2xl p-1 shadow-[inset_0_4px_8px_rgba(0,0,0,0.8),0_1px_1px_rgba(255,255,255,0.1)] border border-white/5 overflow-hidden">
            {/* LCD Glass Effect */}
            <div className={`absolute inset-0 transition-colors duration-300 ${isBacklightOn ? 'bg-emerald-400/80 shadow-[inset_0_0_40px_rgba(0,0,0,0.2)]' : 'bg-[#a3b18a]'}`}>
              {/* LCD Grid Pattern */}
              <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)', backgroundSize: '4px 4px' }}></div>
              
              {/* LCD Content */}
              <div className="h-full flex flex-col items-end justify-center px-4 font-mono">
                <div className={`text-[10px] md:text-xs font-bold uppercase tracking-tighter transition-colors duration-300 ${isBacklightOn ? 'text-emerald-950/60' : 'text-zinc-800/40'}`}>
                  Count / Goal: {goal}
                </div>
                <div className={`text-5xl md:text-6xl font-bold tracking-tighter transition-colors duration-300 ${isBacklightOn ? 'text-emerald-950' : 'text-zinc-900'}`}>
                  {count}
                </div>
              </div>

              {/* Screen Reflection */}
              <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/10 to-transparent pointer-events-none"></div>
            </div>
          </div>

          {/* Buttons Area */}
          <div className="flex-1 w-full flex flex-col items-center justify-center gap-6 md:gap-8 pb-8">
            
            {/* Main Count Button */}
            <motion.button
              whileTap={{ scale: 0.92, y: 4 }}
              onClick={handleIncrement}
              className={`w-32 h-32 md:w-40 md:h-40 rounded-full ${currentTheme.button} shadow-[0_10px_0_rgb(161,161,170),0_15px_30px_rgba(0,0,0,0.4),inset_0_2px_4px_rgba(255,255,255,0.8)] flex items-center justify-center relative active:shadow-[0_2px_0_rgb(161,161,170),0_5px_15px_rgba(0,0,0,0.4)] transition-all`}
              id="count-button"
            >
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/40 to-black/10 pointer-events-none"></div>
              <div className="w-[85%] h-[85%] rounded-full border border-black/5 flex items-center justify-center">
                <span className="text-zinc-600 font-bold text-lg md:text-xl tracking-widest uppercase opacity-80">Count</span>
              </div>
            </motion.button>

            {/* Secondary Buttons Row */}
            <div className="flex items-center gap-10 md:gap-14">
              {/* Reset Button */}
              <div className="flex flex-col items-center gap-1">
                <motion.button
                  whileTap={{ scale: 0.85 }}
                  onClick={handleReset}
                  className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-zinc-300 shadow-[0_4px_0_rgb(161,161,170),0_8px_16px_rgba(0,0,0,0.3),inset_0_1px_2px_rgba(255,255,255,0.8)] flex items-center justify-center active:shadow-none active:translate-y-1 transition-all"
                  id="reset-button"
                >
                  <RotateCcw size={16} className="text-zinc-600" />
                </motion.button>
                <span className="text-[8px] md:text-[10px] font-bold uppercase tracking-widest text-white/40">Reset</span>
              </div>

              {/* Light Button */}
              <div className="flex flex-col items-center gap-1">
                <motion.button
                  whileTap={{ scale: 0.85 }}
                  onClick={toggleBacklight}
                  className={`w-10 h-10 md:w-12 md:h-12 rounded-full shadow-[0_4px_0_rgb(161,161,170),0_8px_16px_rgba(0,0,0,0.3),inset_0_1px_2px_rgba(255,255,255,0.8)] flex items-center justify-center active:shadow-none active:translate-y-1 transition-all ${isBacklightOn ? 'bg-emerald-400' : 'bg-zinc-300'}`}
                  id="light-button"
                >
                  <Lightbulb size={16} className={isBacklightOn ? 'text-emerald-900' : 'text-zinc-600'} />
                </motion.button>
                <span className="text-[8px] md:text-[10px] font-bold uppercase tracking-widest text-white/40">Light</span>
              </div>
            </div>
          </div>

          {/* Finger Strap Hole (Visual Detail) */}
          <div className="absolute bottom-6 w-12 h-2 bg-black/20 rounded-full blur-[1px]"></div>
        </motion.div>

        {/* Device Shadow on Floor */}
        <div className="w-48 h-8 bg-black/20 blur-2xl rounded-full mt-4"></div>
      </div>

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className={`w-full max-w-sm rounded-3xl p-8 ${isDarkMode ? 'bg-zinc-900 text-white' : 'bg-white text-zinc-900'} shadow-2xl`}
            >
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold">Settings</h2>
                <button onClick={() => setShowSettings(false)} className="opacity-50 hover:opacity-100">✕</button>
              </div>

              <div className="space-y-6">
                {/* Goal Setting */}
                <div className="space-y-3">
                  <label className="text-xs font-bold uppercase tracking-widest opacity-50">Target Goal</label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {[33, 99, 100, 1000].map(g => (
                      <button
                        key={g}
                        onClick={() => setGoal(g)}
                        className={`flex-1 min-w-[60px] py-2 rounded-xl text-sm font-medium transition-all ${goal === g ? 'bg-teal-600 text-white' : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'}`}
                      >
                        {g >= 1000 ? `${g/1000}k` : g}
                      </button>
                    ))}
                  </div>
                  <div className="relative">
                    <input
                      type="number"
                      value={goal}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        if (!isNaN(val) && val >= 0) setGoal(val);
                        else if (e.target.value === '') setGoal(0);
                      }}
                      className={`w-full py-3 px-4 rounded-xl text-sm font-medium outline-none border-2 transition-all ${isDarkMode ? 'bg-zinc-800 border-zinc-700 text-white focus:border-teal-500' : 'bg-zinc-100 border-zinc-200 text-zinc-900 focus:border-teal-600'}`}
                      placeholder="Enter custom goal..."
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold uppercase tracking-widest opacity-30 pointer-events-none">
                      Custom
                    </div>
                  </div>
                </div>

                {/* Theme Selection */}
                <div className="space-y-3">
                  <label className="text-xs font-bold uppercase tracking-widest opacity-50">Device Color</label>
                  <div className="flex gap-3">
                    {(['teal', 'silver', 'black', 'gold'] as Theme[]).map(t => (
                      <button
                        key={t}
                        onClick={() => setTheme(t)}
                        className={`w-10 h-10 rounded-full border-2 transition-all ${theme === t ? 'border-teal-500 scale-110' : 'border-transparent opacity-60'} ${
                          t === 'teal' ? 'bg-teal-700' : 
                          t === 'silver' ? 'bg-zinc-400' : 
                          t === 'black' ? 'bg-zinc-800' : 'bg-amber-600'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Toggles */}
                <div className="space-y-4 pt-4 border-t border-white/10">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <Volume2 size={18} className="opacity-50" />
                      <span className="font-medium">Sound Effects</span>
                    </div>
                    <button 
                      onClick={() => setSoundEnabled(!soundEnabled)}
                      className={`w-12 h-6 rounded-full relative transition-colors ${soundEnabled ? 'bg-teal-600' : 'bg-zinc-700'}`}
                    >
                      <motion.div 
                        animate={{ x: soundEnabled ? 26 : 4 }}
                        className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm"
                      />
                    </button>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <Vibrate size={18} className="opacity-50" />
                      <span className="font-medium">Haptic Feedback</span>
                    </div>
                    <button 
                      onClick={() => setVibrationEnabled(!vibrationEnabled)}
                      className={`w-12 h-6 rounded-full relative transition-colors ${vibrationEnabled ? 'bg-teal-600' : 'bg-zinc-700'}`}
                    >
                      <motion.div 
                        animate={{ x: vibrationEnabled ? 26 : 4 }}
                        className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm"
                      />
                    </button>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowSettings(false)}
                className="w-full mt-8 py-4 rounded-2xl font-bold uppercase tracking-widest bg-teal-600 text-white shadow-lg shadow-teal-500/20"
              >
                Done
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* History Modal */}
      <AnimatePresence>
        {showHistory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className={`w-full max-w-sm rounded-3xl p-8 ${isDarkMode ? 'bg-zinc-900 text-white' : 'bg-white text-zinc-900'} shadow-2xl max-h-[80vh] flex flex-col`}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">History</h2>
                <button onClick={() => setShowHistory(false)} className="opacity-50 hover:opacity-100">✕</button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                {history.length === 0 ? (
                  <div className="text-center py-12 opacity-30">
                    <History size={48} className="mx-auto mb-4" />
                    <p>No history yet</p>
                  </div>
                ) : (
                  history.map(item => (
                    <div key={item.id} className={`p-4 rounded-2xl ${isDarkMode ? 'bg-zinc-800' : 'bg-zinc-100'} flex justify-between items-center`}>
                      <div>
                        <p className="text-2xl font-bold">{item.count}</p>
                        <p className="text-[10px] uppercase tracking-widest opacity-40">
                          {new Date(item.timestamp).toLocaleDateString()} • {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      <div className="w-2 h-2 rounded-full bg-teal-500"></div>
                    </div>
                  ))
                )}
              </div>

              <button
                onClick={() => {
                  if (confirm('Clear all history?')) setHistory([]);
                }}
                className="mt-6 text-xs font-bold uppercase tracking-widest opacity-40 hover:opacity-100 transition-opacity text-center"
              >
                Clear History
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
}
