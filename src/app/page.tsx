'use client';
// Build ID: 1777135246 - Command Center + Cloud Sync Pro

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap, 
  Shield, 
  LogOut,
  X,
  CheckCircle2,
  UploadCloud,
  Award,
  Activity,
  Skull,
  Clock,
  Bell,
  Check,
  Settings2,
  Trash2,
  Play,
  ClipboardList,
  Plus
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { INITIAL_SKILLS, Skill, calculateLevel } from '@/lib/gamification';
import Auth from '@/components/Auth';

export const dynamic = 'force-dynamic';

export default function Dashboard() {
  const [mounted, setMounted] = useState(false);
  const [session, setSession] = useState<any>(null);
  const [status, setStatus] = useState<'off-duty' | 'on-duty'>('off-duty');
  const [activeTab, setActiveTab] = useState('');
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
  const isInitialLoad = useRef(true);

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
        navigator.serviceWorker.register('/sw.js').then(() => console.log('SW Active'));
      }
    }

    const initSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      if (session) {
        // Load Profile from Supabase
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (profile) {
          if (profile.tasks && profile.tasks.length > 0) {
            setTasks(profile.tasks);
            setActiveTab(profile.tasks[0].id);
          }
          if (profile.health) setHealth(profile.health);
          if (profile.streak) setStreak(profile.streak);
          if (profile.mandate_name) setMandateName(profile.mandate_name);
        }
      }
      setLoading(false);
      isInitialLoad.current = false;
    };

    if (supabase) {
      initSession();
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

  // Cloud Sync Engine: Auto-save tasks to Supabase
  useEffect(() => {
    if (isInitialLoad.current) return;
    const syncToCloud = async () => {
      if (session && tasks.length > 0) {
        await supabase
          .from('profiles')
          .upsert({
            id: session.user.id,
            tasks,
            health,
            streak,
            mandate_name: mandateName,
            updated_at: new Date().toISOString()
          });
      }
    };
    const debounce = setTimeout(syncToCloud, 2000);
    return () => clearTimeout(debounce);
  }, [tasks, health, streak, mandateName, session]);

  // Notification Scheduler Engine
  useEffect(() => {
    if (!currentTime) return;
    const timeStr = currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    
    if (timeStr !== lastAlertTime.current) {
      lastAlertTime.current = timeStr;
      
      tasks.forEach(mission => {
        mission.tasks.forEach((task: any) => {
          if (task.time === timeStr && !task.completed) {
            if ('serviceWorker' in navigator) {
              navigator.serviceWorker.ready.then(reg => {
                reg.showNotification('MANDATE ALERT', {
                  body: `Mission Due: ${task.text}`,
                  icon: '/icon-192x192.png',
                  vibrate: [200, 100, 200]
                } as any);
              });
            }
          }
        });
      });
    }
  }, [currentTime, tasks]);

  useEffect(() => {
    if (session && !loading && mandateName === 'UNNAMED MANDATE' && !isInitialLoad.current) {
      setOnboarding(true);
    }
  }, [session, loading, mandateName]);

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
    setStatus('on-duty');
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

  const deleteTask = (taskId: string) => {
    setTasks(prev => prev.map(m => ({
      ...m,
      tasks: m.tasks.filter((t: any) => t.id !== taskId)
    })));
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
  const dailyTasks = activeMission?.tasks.filter((t: any) => t.type?.toLowerCase() === 'daily') || [];
  const milestones = activeMission?.tasks.filter((t: any) => 
    t.type?.toLowerCase() === 'milestone' || 
    t.type?.toLowerCase() === 'monthly' ||
    t.type?.toLowerCase() === 'mandate'
  ) || [];
  
  const dailyPct = dailyTasks.length ? (dailyTasks.filter((t: any) => t.completed).length / dailyTasks.length) * 100 : 0;
  const milestonePct = milestones.length ? (milestones.filter((t: any) => t.completed).length / milestones.length) * 100 : 0;
  const totalCompleted = tasks.reduce((acc, m) => acc + m.tasks.filter((t: any) => t.completed).length, 0);
  const totalXp = totalCompleted * 15;

  if (!mounted || loading) return (
    <div style={{ height: '100vh', background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '32px', height: '32px', border: '4px solid #3b82f6', borderTopColor: 'transparent', borderRadius: '50%' }} className="animate-spin" />
    </div>
  );

  if (!session) return <Auth />;

  const styles = {
    container: {
      height: '100vh',
      background: 'radial-gradient(circle at top right, #1e293b 0%, #020617 100%)',
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

  // Home Screen View
  if (status === 'off-duty') {
    return (
      <main style={styles.container}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.5 }}>
            <Shield size={80} color="#3b82f6" style={{ margin: '0 auto 2rem' }} />
            <p style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.3em', marginBottom: '0.5rem' }}>Current Status: Off-Duty</p>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '2rem', textTransform: 'uppercase' }}>Command Center</h1>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', width: '100%', maxWidth: '300px', margin: '0 auto 3rem' }}>
              <div style={styles.glassCard}>
                <p style={{ fontSize: '9px', color: '#94a3b8', fontWeight: 800 }}>STREAK</p>
                <div style={{ fontSize: '1.5rem', fontWeight: 900 }}>{streak}</div>
              </div>
              <div style={styles.glassCard}>
                <p style={{ fontSize: '9px', color: '#94a3b8', fontWeight: 800 }}>RANK</p>
                <div style={{ fontSize: '1.5rem', fontWeight: 900 }}>{calculateLevel(totalXp)}</div>
              </div>
            </div>

            <button onClick={() => setStatus('on-duty')} style={{ width: '100%', maxWidth: '280px', padding: '1.5rem', borderRadius: '20px', background: 'linear-gradient(to right, #3b82f6, #8b5cf6)', border: 'none', color: 'white', fontWeight: 900, fontSize: '1.1rem', textTransform: 'uppercase', letterSpacing: '0.1em', cursor: 'pointer', boxShadow: '0 15px 30px rgba(59, 130, 246, 0.3)' }}>
              <Play size={24} style={{ marginBottom: '-5px', marginRight: '10px' }} fill="white" /> Start Day
            </button>
          </motion.div>
        </div>
        
        <button onClick={() => setShowSettings(true)} style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', background: 'rgba(255,255,255,0.1)', border: 'none', padding: '0.75rem', borderRadius: '12px', color: 'white' }}>
          <Settings2 size={20}/>
        </button>
        
        {/* Settings Overlay for Home Screen */}
        <AnimatePresence>
          {showSettings && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: 'fixed', inset: 0, background: 'rgba(2,6,23,0.85)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1.5rem' }}>
              <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} style={{ ...styles.glassCard, width: '100%', maxWidth: '400px', padding: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 900, textTransform: 'uppercase' }}>System Config</h3>
                  <button onClick={() => setShowSettings(false)} style={{ background: 'none', border: 'none', color: '#94a3b8' }}><X size={18}/></button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <button onClick={() => supabase.auth.signOut()} style={{ padding: '1rem', borderRadius: '12px', background: '#ef444420', border: '1px solid #ef444440', color: '#f87171', fontWeight: 700, textTransform: 'uppercase' }}>Sign Out</button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    );
  }

  return (
    <main style={styles.container}>
      {/* Dashboard Header */}
      <header style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <div>
          <p style={{ fontSize: '8px', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.2em' }}>OPERATOR: {session?.user?.email?.split('@')[0]?.toUpperCase()}</p>
          <h1 style={{ fontSize: '1.35rem', fontWeight: 900, lineHeight: 1.1, marginTop: '0.3rem', textTransform: 'uppercase' }}>{mandateName}</h1>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.4rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ fontSize: '11px', fontWeight: 900, color: '#93c5fd', fontFamily: 'monospace' }}>
              {currentTime ? currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '--:--:--'}
            </div>
            <button onClick={() => setShowSettings(true)} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', padding: '0.4rem', borderRadius: '8px', color: 'white', cursor: 'pointer' }}>
              <Settings2 size={16}/>
            </button>
          </div>
          <div style={{ background: 'rgba(59, 130, 246, 0.2)', borderRadius: '99px', padding: '0.2rem 0.5rem', fontSize: '9px', fontWeight: 700, color: '#bfdbfe' }}>
            <Zap size={9} fill="currentColor" /> {streak} DAY STREAK
          </div>
        </div>
      </header>

      {/* Stats Bar */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem', marginBottom: '1.25rem' }}>
        <div style={styles.glassCard}>
          <p style={{ fontSize: '8px', fontWeight: 800, color: '#94a3b8', marginBottom: '0.3rem' }}>DAILY</p>
          <div style={{ fontSize: '1rem', fontWeight: 900 }}>{Math.round(dailyPct)}%</div>
          <div style={{ height: '4px', background: '#020617', borderRadius: '2px', marginTop: '0.4rem', overflow: 'hidden' }}>
            <motion.div animate={{ width: `${dailyPct}%` }} style={{ height: '100%', background: '#10b981' }} />
          </div>
        </div>
        <div style={styles.glassCard}>
          <p style={{ fontSize: '8px', fontWeight: 800, color: '#94a3b8', marginBottom: '0.3rem' }}>MANDATE</p>
          <div style={{ fontSize: '1rem', fontWeight: 900 }}>{Math.round(milestonePct)}%</div>
          <div style={{ height: '4px', background: '#020617', borderRadius: '2px', marginTop: '0.4rem', overflow: 'hidden' }}>
            <motion.div animate={{ width: `${milestonePct}%` }} style={{ height: '100%', background: '#f59e0b' }} />
          </div>
        </div>
        <div style={styles.glassCard}>
          <p style={{ fontSize: '8px', fontWeight: 800, color: '#94a3b8', marginBottom: '0.3rem' }}>XP</p>
          <div style={{ fontSize: '1rem', fontWeight: 900 }}>{totalXp}</div>
          <div style={{ height: '4px', background: '#020617', borderRadius: '2px', marginTop: '0.4rem', overflow: 'hidden' }}>
            <motion.div animate={{ width: `${(totalXp % 100)}%` }} style={{ height: '100%', background: '#3b82f6' }} />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.4rem', overflowX: 'auto', paddingBottom: '0.75rem', marginBottom: '0.75rem', scrollbarWidth: 'none' }}>
        {tasks.map(s => (
          <button key={s.id} onClick={() => setActiveTab(s.id)} style={{
              padding: '0.4rem 0.9rem', borderRadius: '99px', border: '1px solid rgba(255,255,255,0.2)',
              background: activeTab === s.id ? 'linear-gradient(to right, #3b82f6, #8b5cf6)' : '#1e293b',
              color: 'white', fontSize: '10px', fontWeight: 700, whiteSpace: 'nowrap'
            }}>{s.title.toUpperCase()}</button>
        ))}
      </div>

      {/* Task List */}
      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: '100px', scrollbarWidth: 'none' }}>
        {activeMission && (
          <>
            {dailyTasks.map((t: any) => (
              <div key={t.id} style={{ ...styles.glassCard, display: 'flex', alignItems: 'center', gap: '0.75rem', opacity: t.completed ? 0.4 : 1, marginBottom: '0.5rem' }}>
                <div onClick={() => toggleTask(activeMission.id, t.id)} style={{ width: '22px', height: '22px', borderRadius: '50%', border: t.completed ? 'none' : '2px solid #64748b', background: t.completed ? '#10b981' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {t.completed && <Check size={14} color="white" />}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: t.completed ? '#94a3b8' : 'white' }}>{t.text}</div>
                  <div style={{ fontSize: '9px', color: '#64748b', fontWeight: 700, marginTop: '2px' }}>{t.time} DAILY</div>
                </div>
                <button onClick={() => deleteTask(t.id)} style={{ background: 'none', border: 'none', color: '#ef444460' }}><Trash2 size={16}/></button>
              </div>
            ))}
            {milestones.map((t: any) => (
              <div key={t.id} style={{ ...styles.glassCard, display: 'flex', alignItems: 'center', gap: '0.75rem', opacity: t.completed ? 0.4 : 1, marginBottom: '0.5rem', borderLeft: '4px solid #f59e0b' }}>
                <div onClick={() => toggleTask(activeMission.id, t.id)} style={{ width: '22px', height: '22px', borderRadius: '50%', border: t.completed ? 'none' : '2px solid #64748b', background: t.completed ? '#f59e0b' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {t.completed && <Check size={14} color="white" />}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: t.completed ? '#94a3b8' : 'white' }}>{t.text}</div>
                  <div style={{ fontSize: '9px', color: '#f59e0b', fontWeight: 800, marginTop: '2px' }}>MONTHLY MANDATE</div>
                </div>
                <button onClick={() => deleteTask(t.id)} style={{ background: 'none', border: 'none', color: '#ef444460' }}><Trash2 size={16}/></button>
              </div>
            ))}
          </>
        )}
      </div>

      {/* Footer Actions */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, padding: '1.25rem', background: 'linear-gradient(to top, #020617 80%, transparent)', display: 'flex', gap: '0.75rem' }}>
        <button onClick={() => { setEditingTask(null); setShowAddModal(true); }} style={{ flex: 1, padding: '1rem', borderRadius: '16px', background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontWeight: 700, fontSize: '11px' }}>
          <Plus size={18} color="#60a5fa" style={{ marginBottom: '-4px', marginRight: '5px' }} /> ADD
        </button>
        <button onClick={() => setShowEndDay(true)} style={{ flex: 2, padding: '1rem', borderRadius: '16px', background: 'linear-gradient(to right, #3b82f6, #8b5cf6)', border: 'none', color: 'white', fontWeight: 900, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          <LogOut size={18} style={{ marginBottom: '-4px', marginRight: '8px' }} /> Clock Out
        </button>
      </div>

      {/* Reflection Modal */}
      <AnimatePresence>
        {showEndDay && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: 'fixed', inset: 0, background: 'rgba(2,6,23,0.95)', backdropFilter: 'blur(20px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1.5rem' }}>
            <motion.div initial={{ scale: 0.9, y: 30 }} animate={{ scale: 1, y: 0 }} style={{ ...styles.glassCard, width: '100%', maxWidth: '400px', padding: '2rem', textAlign: 'center' }}>
              <ClipboardList size={48} color="#3b82f6" style={{ marginBottom: '1.5rem' }} />
              <h3 style={{ fontSize: '1.5rem', fontWeight: 900, textTransform: 'uppercase' }}>End of Ops</h3>
              <p style={{ fontSize: '11px', color: '#94a3b8', marginTop: '0.5rem' }}>Log your operational reflections.</p>
              <textarea placeholder="How was your discipline today?" value={reflection} onChange={(e) => setReflection(e.target.value)} style={{ width: '100%', height: '100px', background: '#1e293b', border: '1px solid #475569', borderRadius: '12px', padding: '1rem', color: 'white', fontSize: '12px', marginTop: '1.5rem', outline: 'none' }} />
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <button onClick={() => setShowEndDay(false)} style={{ flex: 1, padding: '1rem', borderRadius: '12px', background: 'transparent', border: '1px solid #475569', color: 'white', fontWeight: 700 }}>STAY</button>
                <button onClick={() => { setStatus('off-duty'); setShowEndDay(false); }} style={{ flex: 2, padding: '1rem', borderRadius: '12px', background: 'white', color: 'black', fontWeight: 900, textTransform: 'uppercase' }}>Submit & Home</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Onboarding/Add Task Modals... */}
      <AnimatePresence>
        {onboarding && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ position: 'fixed', inset: 0, background: '#020617', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
            <div style={{ maxWidth: '400px', width: '100%' }}>
              <Shield size={64} color="#3b82f6" style={{ margin: '0 auto 1.5rem' }} />
              <h2 style={{ fontSize: '2rem', fontWeight: 900, textTransform: 'uppercase', textAlign: 'center' }}>Init Mandate</h2>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '2rem' }}>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Mandate Name</label>
                  <input value={mandateName} onChange={(e) => setMandateName(e.target.value.toUpperCase())} placeholder="MANDATE NAME" style={{ width: '100%', background: '#1e293b', border: '1px solid #475569', borderRadius: '12px', padding: '1rem', color: 'white', marginTop: '0.5rem', outline: 'none' }} />
                </div>

                <div>
                  <label style={{ fontSize: '11px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Operational Units (Tabs)</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
                    {obMissions.map(m => (
                      <div key={m} style={{ background: '#334155', padding: '0.4rem 0.8rem', borderRadius: '8px', fontSize: '10px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {m} <X size={12} onClick={() => setObMissions(obMissions.filter(x => x !== m))} style={{ cursor: 'pointer' }} />
                      </div>
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
                    <input value={newObMission} onChange={(e) => setNewObMission(e.target.value)} placeholder="Add Category..." style={{ flex: 1, background: '#1e293b', border: '1px solid #475569', borderRadius: '8px', padding: '0.6rem', color: 'white', fontSize: '11px' }} />
                    <button onClick={() => { if(newObMission) { setObMissions([...obMissions, newObMission]); setNewObMission(''); } }} style={{ background: '#3b82f6', border: 'none', color: 'white', borderRadius: '8px', padding: '0.6rem' }}><Plus size={16}/></button>
                  </div>
                </div>

                <button onClick={handleCreateMandate} style={{ width: '100%', padding: '1.25rem', borderRadius: '16px', background: 'linear-gradient(to right, #3b82f6, #8b5cf6)', border: 'none', color: 'white', fontWeight: 900, textTransform: 'uppercase', marginTop: '1rem' }}>Initialize Mandate</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showAddModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: 'fixed', inset: 0, background: 'rgba(2,6,23,0.9)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1.5rem' }}>
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} style={{ ...styles.glassCard, width: '100%', maxWidth: '400px', padding: '2rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 900, textTransform: 'uppercase', marginBottom: '1.5rem' }}>New Objective</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <input autoFocus placeholder="What is the objective?" value={newTaskText} onChange={(e) => setNewTaskText(e.target.value)} style={{ width: '100%', background: '#1e293b', border: '1px solid #475569', borderRadius: '12px', padding: '1rem', color: 'white', outline: 'none' }} />
                <div style={{ display: 'flex', background: '#020617', borderRadius: '10px', padding: '0.3rem' }}>
                  <button onClick={() => setNewTaskType('daily')} style={{ flex: 1, padding: '0.6rem', borderRadius: '8px', border: 'none', background: newTaskType === 'daily' ? '#1e293b' : 'transparent', color: 'white', fontSize: '10px', fontWeight: 700 }}>DAILY</button>
                  <button onClick={() => setNewTaskType('milestone')} style={{ flex: 1, padding: '0.6rem', borderRadius: '8px', border: 'none', background: newTaskType === 'milestone' ? '#1e293b' : 'transparent', color: 'white', fontSize: '10px', fontWeight: 700 }}>MONTHLY</button>
                </div>
                {newTaskType === 'daily' && (
                  <input type="time" value={newTaskTime} onChange={(e) => setNewTaskTime(e.target.value)} style={{ width: '100%', background: '#1e293b', border: '1px solid #475569', borderRadius: '8px', padding: '0.6rem', color: 'white' }} />
                )}
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button onClick={() => setShowAddModal(false)} style={{ flex: 1, padding: '1rem', borderRadius: '12px', background: 'transparent', border: '1px solid #475569', color: '#94a3b8' }}>CANCEL</button>
                  <button onClick={addTask} style={{ flex: 2, padding: '1rem', borderRadius: '12px', background: 'white', color: 'black', fontWeight: 900 }}>INITIALIZE</button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Global Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: 'fixed', inset: 0, background: 'rgba(2,6,23,0.85)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3000, padding: '1.5rem' }}>
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
