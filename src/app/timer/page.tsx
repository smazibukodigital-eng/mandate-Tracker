'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Play, Pause, Square, ArrowLeft, RotateCcw } from 'lucide-react';
import { motion } from 'framer-motion';

function TimerContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const taskName = searchParams.get('task') || 'Focus Session';

  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [initialTime, setInitialTime] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [inputMinutes, setInputMinutes] = useState('25');

  useEffect(() => {
    let interval: any = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => time - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      setIsActive(false);
      if (typeof window !== 'undefined' && "Notification" in window && Notification.permission === "granted") {
        new Notification("Timer Complete", { body: `${taskName} session is over!` });
      }
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft, taskName]);

  const toggleTimer = () => {
    if (timeLeft === 0) return;
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(initialTime);
  };

  const setCustomTime = () => {
    const mins = parseInt(inputMinutes, 10);
    if (!isNaN(mins) && mins > 0) {
      const newTime = mins * 60;
      setInitialTime(newTime);
      setTimeLeft(newTime);
      setIsEditing(false);
      setIsActive(false);
    }
  };

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) {
      return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const progress = initialTime > 0 ? ((initialTime - timeLeft) / initialTime) * 100 : 0;

  return (
    <main style={{
      height: '100dvh',
      background: 'radial-gradient(circle at top right, #1e293b 0%, #020617 100%)',
      color: '#f8fafc',
      display: 'flex',
      flexDirection: 'column',
      padding: '1.25rem',
      fontFamily: "'Inter', sans-serif"
    }}>
      <header style={{ display: 'flex', alignItems: 'center', marginBottom: '2rem' }}>
        <button onClick={() => router.push('/')} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', padding: '0.6rem', borderRadius: '12px', color: 'white', display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
          <ArrowLeft size={20} />
        </button>
        <div style={{ marginLeft: '1rem' }}>
          <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.2em' }}>CURRENT OBJECTIVE</div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 900, textTransform: 'uppercase' }}>{taskName}</h1>
        </div>
      </header>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        {/* Timer Circle */}
        <div style={{ position: 'relative', width: '280px', height: '280px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '3rem' }}>
          <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
            <circle cx="140" cy="140" r="130" stroke="rgba(255,255,255,0.1)" strokeWidth="8" fill="none" />
            <motion.circle 
              cx="140" cy="140" r="130" 
              stroke="#3b82f6" strokeWidth="8" fill="none" 
              strokeDasharray={2 * Math.PI * 130}
              strokeDashoffset={2 * Math.PI * 130 * (1 - progress / 100)}
              style={{ transition: 'stroke-dashoffset 1s linear' }}
              strokeLinecap="round"
            />
          </svg>
          
          <div style={{ zIndex: 10, textAlign: 'center' }}>
            {isEditing ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                <input 
                  type="number" 
                  value={inputMinutes}
                  onChange={(e) => setInputMinutes(e.target.value)}
                  style={{ background: 'transparent', border: 'none', color: 'white', fontSize: '3rem', fontWeight: 900, width: '100px', textAlign: 'center', outline: 'none', borderBottom: '2px solid #3b82f6' }}
                  autoFocus
                  onBlur={setCustomTime}
                  onKeyDown={(e) => e.key === 'Enter' && setCustomTime()}
                />
                <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 700 }}>MINUTES</div>
              </div>
            ) : (
              <div onClick={() => !isActive && setIsEditing(true)} style={{ cursor: !isActive ? 'pointer' : 'default' }}>
                <div style={{ fontSize: '4rem', fontWeight: 900, fontFamily: 'monospace', letterSpacing: '-0.05em' }}>
                  {formatTime(timeLeft)}
                </div>
                {!isActive && <div style={{ fontSize: '10px', color: '#60a5fa', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '0.5rem' }}>Tap to edit time</div>}
              </div>
            )}
          </div>
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <button onClick={resetTimer} style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', cursor: 'pointer' }}>
            <RotateCcw size={24} />
          </button>
          
          <button onClick={toggleTimer} style={{ width: '80px', height: '80px', borderRadius: '50%', background: isActive ? 'rgba(239, 68, 68, 0.2)' : 'linear-gradient(to right, #3b82f6, #8b5cf6)', border: isActive ? '1px solid rgba(239, 68, 68, 0.5)' : 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', color: isActive ? '#ef4444' : 'white', cursor: 'pointer', boxShadow: isActive ? 'none' : '0 15px 30px rgba(59, 130, 246, 0.3)' }}>
            {isActive ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="white" style={{ marginLeft: '4px' }} />}
          </button>

          <button onClick={() => { setIsActive(false); setTimeLeft(0); }} style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', cursor: 'pointer' }}>
            <Square size={20} fill="currentColor" />
          </button>
        </div>
      </div>
    </main>
  );
}

export default function TimerPage() {
  return (
    <Suspense fallback={<div style={{ height: '100dvh', background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div className="animate-spin" style={{ width: '32px', height: '32px', border: '4px solid #3b82f6', borderTopColor: 'transparent', borderRadius: '50%' }} /></div>}>
      <TimerContent />
    </Suspense>
  );
}
