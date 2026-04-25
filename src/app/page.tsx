'use client';
// Build ID: 1777133170 - Ultra-High Contrast + Notification Engine

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap, 
  Target, 
  Heart, 
  Settings, 
  Plus, 
  Moon,
  ChevronRight,
  Shield,
  LogOut,
  X,
  CheckCircle2,
  UploadCloud,
  TrendingUp,
  Award,
  Activity,
  Skull,
  Clock,
  Bell,
  Check,
  PlusCircle,
  Settings2,
  Calendar
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { INITIAL_SKILLS, Skill, calculateLevel } from '@/lib/gamification';
import Auth from '@/components/Auth';

export const dynamic = 'force-dynamic';

export default function Dashboard() {
  const [mounted, setMounted] = useState(false);
  const [session, setSession] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('');
  const [skills, setSkills] = useState<Skill[]>(INITIAL_SKILLS);
  const [health, setHealth] = useState(100);
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState<any[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [showEndDay, setShowEndDay] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTask, setEditingTask] = useState<any>(null);
  const [reflection, setReflection] = useState('');
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const [mandateName, setMandateName] = useState('UNNAMED MANDATE');
  const [onboarding, setOnboarding] = useState(false);
  
  const lastAlertTime = useRef<string | null>(null);

  // Onboarding missions
  const [obMissions, setObMissions] = useState<string[]>(['Dailies']);
  const [newObMission, setNewObMission] = useState('');

  // New/Edit Task State
  const [newTaskText, setNewTaskText] = useState('');
  const [newTaskType, setNewTaskType] = useState<'daily' | 'milestone'>('daily');
  const [newTaskTime, setNewTaskTime] = useState('08:00');

  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    
    // Notification & SW Registration
    if (typeof window !== 'undefined') {
      if ("Notification" in window && Notification.permission === "default") {
        Notification.requestPermission();
      }
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js').then(reg => {
          console.log('SW Registered', reg);
        });
      }
    }

    if (supabase) {
      supabase.auth.getSession().then(({ data: { session } }: any) => {
        setSession(session);
        setLoading(false);
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
        setSession(session);
      });

      return () => {
        clearInterval(timer);
        subscription.unsubscribe();
      };
    } else {
      setLoading(false);
    }
  }, []);

  // Notification Scheduler Engine
  useEffect(() => {
    if (!currentTime) return;
    const timeStr = currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    
    if (timeStr !== lastAlertTime.current) {
      lastAlertTime.current = timeStr;
      
      // Check for tasks due at this minute
      tasks.forEach(mission => {
        mission.tasks.forEach((task: any) => {
          if (task.time === timeStr && !task.completed) {
            new Notification('MANDATE ALERT', {
              body: `Mission Due: ${task.text}`,
              icon: '/icon-192x192.png'
            });
          }
        });
      });
    }
  }, [currentTime, tasks]);

  // Monitor for onboarding needs
  useEffect(() => {
    if (session && !loading && tasks.length === 0) {
      setOnboarding(true);
    }
  }, [session, loading, tasks.length]);

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event: any) => {
      try {
        const data = JSON.parse(event.target.result);
        if (data.state) {
          setTasks(data.state);
          if (data.cfg?.health) setHealth(data.cfg.health);
          if (data.cfg?.streak) setStreak(data.cfg.streak);
          if (data.cfg?.mandateName) setMandateName(data.cfg.mandateName);
          setActiveTab(data.state[0].id);
          setShowSettings(false);
          setOnboarding(false);
        }
      } catch (err) {
        alert('Invalid backup file.');
      }
    };
    reader.readAsText(file);
  };

  const handleCreateMandate = () => {
    if (!mandateName.trim()) return;
    const initialTasks = obMissions.map(m => ({
      id: m.toLowerCase().replace(/\s+/g, '-'),
      title: m,
      tasks: []
    }));
    setTasks(initialTasks);
    setActiveTab(initialTasks[0].id);
    setOnboarding(false);
  };

  const addTask = () => {
    if (!newTaskText.trim()) return;
    if (editingTask) {
      setTasks(prev => prev.map(m => ({
        ...m,
        tasks: m.tasks.map((t: any) => t.id === editingTask.id ? { ...t, text: newTaskText, type: newTaskType, time: newTaskTime } : t)
      })));
      setEditingTask(null);
    } else {
      const newTask = {
        id: Math.random().toString(36).substr(2, 9),
        text: newTaskText,
        type: newTaskType,
        time: newTaskTime,
        completed: false
      };
      setTasks(prev => prev.map(m => m.id === activeTab ? { ...m, tasks: [...m.tasks, newTask] } : m));
    }
    setNewTaskText('');
    setShowAddModal(false);
  };

  const startEdit = (task: any) => {
    setEditingTask(task);
    setNewTaskText(task.text);
    setNewTaskType(task.type);
    setNewTaskTime(task.time || '08:00');
    setShowAddModal(true);
  };

  const toggleTask = (missionId: string, taskId: string) => {
    setTasks(prev => prev.map(m => {
      if (m.id === missionId) {
        return {
          ...m,
          tasks: m.tasks.map((t: any) => t.id === taskId ? { ...t, completed: !t.completed } : t)
        };
      }
      return m;
    }));
  };

  const activeMission = tasks.find(m => m.id === activeTab);
  const dailyTasks = activeMission?.tasks.filter((t: any) => t.type === 'daily') || [];
  const milestones = activeMission?.tasks.filter((t: any) => t.type === 'milestone') || [];
  
  const dailyPct = dailyTasks.length ? (dailyTasks.filter((t: any) => t.completed).length / dailyTasks.length) * 100 : 0;
  const milestonePct = milestones.length ? (milestones.filter((t: any) => t.completed).length / milestones.length) * 100 : 0;
  const totalCompleted = tasks.reduce((acc, m) => acc + m.tasks.filter((t: any) => t.completed).length, 0);
  const totalXp = totalCompleted * 15;
  const incompleteDailyCount = tasks.reduce((acc, m) => acc + m.tasks.filter((t: any) => t.type === 'daily' && !t.completed).length, 0);

  if (!mounted || loading) return (
    <div style={{ height: '100vh', background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '32px', height: '32px', border: '4px solid #3b82f6', borderTopColor: 'transparent', borderRadius: '50%' }} className="animate-spin" />
    </div>
  );

  if (!session) return <Auth />;

  const styles = {
    container: {
      height: '100vh',
      background: 'radial-gradient(circle at top right, #334155 0%, #0f172a 100%)',
      color: '#f8fafc',
      display: 'flex',
      flexDirection: 'column' as const,
      padding: '1.25rem',
      overflow: 'hidden',
      fontFamily: "'Inter', sans-serif"
    },
    glassCard: {
      background: 'rgba(255, 255, 255, 0.12)',
      backdropFilter: 'blur(20px)',
      border: '1px solid rgba(255, 255, 255, 0.25)',
      borderRadius: '20px',
      padding: '1rem'
    }
  };

  return (
    <main style={styles.container}>
      {/* Header */}
      <header style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <div>
          <p style={{ fontSize: '8px', color: '#cbd5e1', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.2em' }}>
            OPERATOR: {session?.user?.email?.split('@')[0]?.toUpperCase() || 'OPERATOR'}
          </p>
          <h1 style={{ fontSize: '1.35rem', fontWeight: 900, lineHeight: 1.1, marginTop: '0.3rem', textTransform: 'uppercase', color: 'white' }}>
            {mandateName}
          </h1>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.4rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ fontSize: '11px', fontWeight: 900, color: '#93c5fd', fontFamily: 'monospace' }}>
              {currentTime ? currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '--:--:--'}
            </div>
            <button onClick={() => setShowSettings(true)} style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', padding: '0.4rem', borderRadius: '8px', color: '#cbd5e1', cursor: 'pointer' }}>
              <Settings2 size={16}/>
            </button>
          </div>
          <div style={{ background: 'rgba(59, 130, 246, 0.2)', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '99px', padding: '0.2rem 0.5rem', fontSize: '9px', fontWeight: 700, color: '#bfdbfe', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <Zap size={9} fill="currentColor" /> {streak} DAY STREAK
          </div>
        </div>
      </header>

      {/* Stats Bar */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem', marginBottom: '1.25rem' }}>
        <div style={styles.glassCard}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
            <span style={{ fontSize: '8px', fontWeight: 700, color: '#cbd5e1', textTransform: 'uppercase' }}>Daily</span>
            <Activity size={10} color="#10b981" />
          </div>
          <div style={{ fontSize: '1rem', fontWeight: 900 }}>{Math.round(dailyPct)}%</div>
          <div style={{ height: '4px', background: '#020617', borderRadius: '2px', marginTop: '0.4rem', overflow: 'hidden' }}>
            <motion.div animate={{ width: `${dailyPct}%` }} style={{ height: '100%', background: '#10b981' }} />
          </div>
        </div>
        <div style={styles.glassCard}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
            <span style={{ fontSize: '8px', fontWeight: 700, color: '#cbd5e1', textTransform: 'uppercase' }}>Mandate</span>
            <Award size={10} color="#f59e0b" />
          </div>
          <div style={{ fontSize: '1rem', fontWeight: 900 }}>{Math.round(milestonePct)}%</div>
          <div style={{ height: '4px', background: '#020617', borderRadius: '2px', marginTop: '0.4rem', overflow: 'hidden' }}>
            <motion.div animate={{ width: `${milestonePct}%` }} style={{ height: '100%', background: '#f59e0b' }} />
          </div>
        </div>
        <div style={styles.glassCard}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
            <span style={{ fontSize: '8px', fontWeight: 700, color: '#cbd5e1', textTransform: 'uppercase' }}>Rank {calculateLevel(totalXp)}</span>
            <Shield size={10} color="#3b82f6" />
          </div>
          <div style={{ fontSize: '1rem', fontWeight: 900 }}>{totalXp}</div>
          <div style={{ height: '4px', background: '#020617', borderRadius: '2px', marginTop: '0.4rem', overflow: 'hidden' }}>
            <motion.div animate={{ width: `${(totalXp % 100)}%` }} style={{ height: '100%', background: 'linear-gradient(to right, #3b82f6, #8b5cf6)' }} />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.4rem', overflowX: 'auto', paddingBottom: '0.75rem', marginBottom: '0.75rem', scrollbarWidth: 'none' }}>
        {tasks.map(s => (
          <button key={s.id} onClick={() => setActiveTab(s.id)} style={{
              padding: '0.4rem 0.9rem', borderRadius: '99px', border: '1px solid rgba(255,255,255,0.2)',
              background: activeTab === s.id ? 'linear-gradient(to right, #3b82f6, #8b5cf6)' : '#1e293b',
              color: 'white',
              fontSize: '10px', fontWeight: 700, whiteSpace: 'nowrap', cursor: 'pointer'
            }}>{s.title.toUpperCase()}</button>
        ))}
      </div>

      {/* Task List */}
      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: '100px', scrollbarWidth: 'none' }}>
        {activeMission && (
          <>
            {dailyTasks.map((t: any) => (
              <div key={t.id} style={{ ...styles.glassCard, display: 'flex', alignItems: 'center', gap: '0.75rem', opacity: t.completed ? 0.4 : 1, marginBottom: '0.5rem' }}>
                <div onClick={() => toggleTask(activeMission.id, t.id)} style={{ width: '20px', height: '20px', borderRadius: '50%', border: t.completed ? 'none' : '2px solid #64748b', background: t.completed ? '#10b981' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                  {t.completed && <CheckCircle2 size={14} color="white" />}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '11px', fontWeight: 600, textDecoration: t.completed ? 'line-through' : 'none', color: t.completed ? '#94a3b8' : 'white' }}>{t.text}</div>
                  <div onClick={() => startEdit(t)} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '4px', cursor: 'pointer' }}>
                    <Clock size={10} color={t.time ? "#93c5fd" : "#64748b"} />
                    <span style={{ fontSize: '8px', color: t.time ? "#93c5fd" : "#64748b", fontWeight: 700 }}>{t.time || 'SET REMINDER'}</span>
                  </div>
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      {/* Footer */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, padding: '1.25rem', background: 'linear-gradient(to top, #0f172a 80%, transparent)', display: 'flex', gap: '0.75rem' }}>
        <button onClick={() => { setEditingTask(null); setShowAddModal(true); }} style={{ flex: 1, padding: '0.9rem', borderRadius: '14px', background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontWeight: 700, fontSize: '11px', cursor: 'pointer' }}>
          <Plus size={16} color="#60a5fa" style={{ marginBottom: '-3px' }} /> ADD
        </button>
        <button onClick={() => incompleteDailyCount > 0 ? setShowEndDay(true) : alert('Mission Clear!')} style={{ flex: 2, padding: '0.9rem', borderRadius: '14px', background: 'linear-gradient(to right, #3b82f6, #8b5cf6)', border: 'none', color: 'white', fontWeight: 900, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.15em', cursor: 'pointer' }}>
          <Moon size={16} style={{ marginBottom: '-3px' }} /> CLOCK OUT
        </button>
      </div>

      {/* Onboarding Modal */}
      <AnimatePresence>
        {onboarding && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ position: 'fixed', inset: 0, background: '#020617', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
            <div style={{ maxWidth: '400px', width: '100%' }}>
              <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                <Shield size={64} color="#3b82f6" style={{ margin: '0 auto 1.5rem' }} />
                <h2 style={{ fontSize: '2rem', fontWeight: 900, textTransform: 'uppercase', color: 'white' }}>Initialize Base</h2>
                <p style={{ color: '#94a3b8', fontSize: '12px', marginTop: '0.5rem' }}>Configure your operational missions.</p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                  <label style={{ fontSize: '11px', fontWeight: 800, color: '#cbd5e1', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Mandate Name</label>
                  <input value={mandateName} onChange={(e) => setMandateName(e.target.value.toUpperCase())} placeholder="E.G. SIBCO EMPIRE" style={{ width: '100%', background: '#1e293b', border: '1px solid #475569', borderRadius: '12px', padding: '1rem', color: 'white', marginTop: '0.5rem', outline: 'none' }} />
                </div>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 800, color: '#cbd5e1', textTransform: 'uppercase' }}>Operational Missions</label>
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                    {obMissions.map(m => (
                      <div key={m} style={{ background: '#334155', border: '1px solid #475569', borderRadius: '8px', padding: '0.4rem 0.8rem', fontSize: '10px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {m} <X size={12} onClick={() => setObMissions(obMissions.filter(x => x !== m))} style={{ cursor: 'pointer' }} />
                      </div>
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
                    <input value={newObMission} onChange={(e) => setNewObMission(e.target.value)} placeholder="Type mission name..." style={{ flex: 1, background: '#1e293b', border: '1px solid #475569', borderRadius: '8px', padding: '0.6rem', color: 'white', fontSize: '11px', outline: 'none' }} />
                    <button onClick={() => { if(newObMission) { setObMissions([...obMissions, newObMission]); setNewObMission(''); } }} style={{ background: '#3b82f6', border: 'none', color: 'white', borderRadius: '8px', padding: '0.6rem 1rem', cursor: 'pointer' }}><Plus size={16}/></button>
                  </div>
                </div>
                <button onClick={handleCreateMandate} style={{ width: '100%', padding: '1.25rem', borderRadius: '16px', background: 'linear-gradient(to right, #3b82f6, #8b5cf6)', border: 'none', color: 'white', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', cursor: 'pointer', marginTop: '1rem' }}>Confirm Initialization</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Accountability Modal */}
      <AnimatePresence>
        {showEndDay && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: 'fixed', inset: 0, background: 'rgba(2,6,23,0.95)', backdropFilter: 'blur(20px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1.5rem' }}>
            <motion.div initial={{ scale: 0.9, y: 30 }} animate={{ scale: 1, y: 0 }} style={{ ...styles.glassCard, width: '100%', maxWidth: '400px', padding: '2rem', textAlign: 'center' }}>
              <Skull size={48} color="#ef4444" style={{ marginBottom: '1.5rem' }} />
              <h3 style={{ fontSize: '1.25rem', fontWeight: 900, textTransform: 'uppercase', color: '#f87171' }}>Mission Failure</h3>
              <p style={{ fontSize: '11px', color: '#cbd5e1', marginTop: '0.5rem' }}>Incomplete objectives detected.</p>
              <textarea placeholder="Log the blocker..." value={reflection} onChange={(e) => setReflection(e.target.value)} style={{ width: '100%', height: '80px', background: '#1e293b', border: '1px solid #475569', borderRadius: '12px', padding: '1rem', color: 'white', fontSize: '12px', marginTop: '1.5rem', outline: 'none' }} />
              <button onClick={() => { setStreak(0); setShowEndDay(false); }} style={{ width: '100%', padding: '1rem', borderRadius: '12px', background: 'white', color: 'black', fontWeight: 900, textTransform: 'uppercase', fontSize: '11px', marginTop: '1.5rem' }}>Accept Penalty</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: 'fixed', inset: 0, background: 'rgba(2,6,23,0.9)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1.5rem' }}>
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} style={{ ...styles.glassCard, width: '100%', maxWidth: '400px', padding: '2rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 900, textTransform: 'uppercase', marginBottom: '1.5rem', color: 'white' }}>{editingTask ? 'Update Objective' : 'New Objective'}</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <input autoFocus placeholder="What is the objective?" value={newTaskText} onChange={(e) => setNewTaskText(e.target.value)} style={{ width: '100%', background: '#1e293b', border: '1px solid #475569', borderRadius: '12px', padding: '1rem', color: 'white', outline: 'none' }} />
                <div style={{ display: 'flex', background: '#020617', borderRadius: '10px', padding: '0.3rem' }}>
                  <button onClick={() => setNewTaskType('daily')} style={{ flex: 1, padding: '0.6rem', borderRadius: '8px', border: 'none', background: newTaskType === 'daily' ? '#1e293b' : 'transparent', color: 'white', fontSize: '10px', fontWeight: 700, cursor: 'pointer' }}>DAILY</button>
                  <button onClick={() => setNewTaskType('milestone')} style={{ flex: 1, padding: '0.6rem', borderRadius: '8px', border: 'none', background: newTaskType === 'milestone' ? '#1e293b' : 'transparent', color: 'white', fontSize: '10px', fontWeight: 700, cursor: 'pointer' }}>MONTHLY</button>
                </div>
                <div>
                  <label style={{ fontSize: '9px', fontWeight: 800, color: '#cbd5e1', textTransform: 'uppercase' }}>Push Alert Time</label>
                  <input type="time" value={newTaskTime} onChange={(e) => setNewTaskTime(e.target.value)} style={{ width: '100%', background: '#1e293b', border: '1px solid #475569', borderRadius: '8px', padding: '0.6rem', color: 'white', marginTop: '0.4rem' }} />
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                  <button onClick={() => { setShowAddModal(false); setEditingTask(null); }} style={{ flex: 1, padding: '1rem', borderRadius: '12px', background: 'transparent', border: '1px solid #475569', color: '#94a3b8', fontWeight: 700 }}>CANCEL</button>
                  <button onClick={addTask} style={{ flex: 2, padding: '1rem', borderRadius: '12px', background: 'white', color: 'black', fontWeight: 900 }}>{editingTask ? 'UPDATE' : 'INITIALIZE'}</button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Settings */}
      <AnimatePresence>
        {showSettings && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: 'fixed', inset: 0, background: 'rgba(2,6,23,0.85)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 500, padding: '1.5rem' }}>
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} style={{ ...styles.glassCard, width: '100%', maxWidth: '400px', padding: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 900, textTransform: 'uppercase', color: 'white' }}>System Config</h3>
                <button onClick={() => setShowSettings(false)} style={{ background: 'none', border: 'none', color: '#cbd5e1' }}><X size={18}/></button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <button 
                  onClick={() => Notification.requestPermission()}
                  style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: 'rgba(59, 130, 246, 0.2)', borderRadius: '12px', border: '1px solid rgba(59, 130, 246, 0.3)', color: '#93c5fd', textAlign: 'left' }}
                >
                  <Bell size={20} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '11px', fontWeight: 700 }}>ENABLE SYSTEM ALERTS</div>
                    <div style={{ fontSize: '8px', color: '#cbd5e1' }}>Allow background push notifications</div>
                  </div>
                </button>
                <label style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', border: '1px dashed #475569', cursor: 'pointer' }}>
                  <UploadCloud size={20} color="#60a5fa" />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'white' }}>Restore Mandate</div>
                    <div style={{ fontSize: '9px', color: '#94a3b8' }}>Import JSON backup</div>
                  </div>
                  <input type="file" onChange={handleImport} style={{ display: 'none' }} />
                </label>
                <button onClick={() => supabase.auth.signOut()} style={{ padding: '0.9rem', borderRadius: '12px', background: '#ef444420', border: '1px solid #ef444440', color: '#f87171', fontWeight: 700, fontSize: '11px', textTransform: 'uppercase' }}>Sign Out</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
