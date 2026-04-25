'use client';
// Build ID: 1777132439 - Forced Deployment Trigger

import React, { useState, useEffect } from 'react';
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

  // New/Edit Task State
  const [newTaskText, setNewTaskText] = useState('');
  const [newTaskType, setNewTaskType] = useState<'daily' | 'milestone'>('daily');
  const [newTaskTime, setNewTaskTime] = useState('08:00');

  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    
    // Request Notification Permission
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session && tasks.length === 0) setOnboarding(true);
      setLoading(false);
    });

    return () => clearInterval(timer);
  }, []);

  const handleImport = async (e: any) => {
    const file = e.target.files[0];
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

  const styles = {
    container: {
      height: '100vh',
      background: 'radial-gradient(circle at top right, #1e1b4b 0%, #0a0a0b 100%)',
      color: 'white',
      display: 'flex',
      flexDirection: 'column' as const,
      padding: '1.25rem',
      overflow: 'hidden',
      fontFamily: "'Inter', sans-serif"
    },
    glassCard: {
      background: 'rgba(255, 255, 255, 0.03)',
      backdropFilter: 'blur(20px)',
      border: '1px solid rgba(255, 255, 255, 0.05)',
      borderRadius: '20px',
      padding: '1rem'
    }
  };

  return (
    <main style={styles.container}>
      {/* Header */}
      <header style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <div>
          <p style={{ fontSize: '8px', color: '#444', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.2em' }}>
            OPERATOR: {session?.user?.email?.split('@')[0]?.toUpperCase() || 'OPERATOR'}
          </p>
          <h1 style={{ fontSize: '1.35rem', fontWeight: 900, lineHeight: 1.1, marginTop: '0.3rem', textTransform: 'uppercase' }}>
            {mandateName}
          </h1>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.4rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ fontSize: '11px', fontWeight: 900, color: '#3b82f6', fontFamily: 'monospace' }}>
              {currentTime ? currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '--:--:--'}
            </div>
            <button onClick={() => setShowSettings(true)} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', padding: '0.4rem', borderRadius: '8px', color: '#444', cursor: 'pointer' }}>
              <Settings2 size={16}/>
            </button>
          </div>
          <div style={{ background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.2)', borderRadius: '99px', padding: '0.2rem 0.5rem', fontSize: '9px', fontWeight: 700, color: '#60a5fa', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <Zap size={9} fill="currentColor" /> {streak} DAY STREAK
          </div>
        </div>
      </header>

      {/* Stats Bar */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem', marginBottom: '1.25rem' }}>
        <div style={styles.glassCard}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
            <span style={{ fontSize: '8px', fontWeight: 700, color: '#555', textTransform: 'uppercase' }}>Daily</span>
            <Activity size={10} color="#10b981" />
          </div>
          <div style={{ fontSize: '1rem', fontWeight: 900 }}>{Math.round(dailyPct)}%</div>
          <div style={{ height: '4px', background: '#111', borderRadius: '2px', marginTop: '0.4rem', overflow: 'hidden' }}>
            <motion.div animate={{ width: `${dailyPct}%` }} style={{ height: '100%', background: '#10b981' }} />
          </div>
        </div>
        <div style={styles.glassCard}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
            <span style={{ fontSize: '8px', fontWeight: 700, color: '#555', textTransform: 'uppercase' }}>Mandate</span>
            <Award size={10} color="#f59e0b" />
          </div>
          <div style={{ fontSize: '1rem', fontWeight: 900 }}>{Math.round(milestonePct)}%</div>
          <div style={{ height: '4px', background: '#111', borderRadius: '2px', marginTop: '0.4rem', overflow: 'hidden' }}>
            <motion.div animate={{ width: `${milestonePct}%` }} style={{ height: '100%', background: '#f59e0b' }} />
          </div>
        </div>
        <div style={styles.glassCard}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
            <span style={{ fontSize: '8px', fontWeight: 700, color: '#555', textTransform: 'uppercase' }}>Rank {calculateLevel(totalXp)}</span>
            <Shield size={10} color="#3b82f6" />
          </div>
          <div style={{ fontSize: '1rem', fontWeight: 900 }}>{totalXp}</div>
          <div style={{ height: '4px', background: '#111', borderRadius: '2px', marginTop: '0.4rem', overflow: 'hidden' }}>
            <motion.div animate={{ width: `${(totalXp % 100)}%` }} style={{ height: '100%', background: 'linear-gradient(to right, #3b82f6, #8b5cf6)' }} />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.4rem', overflowX: 'auto', paddingBottom: '0.75rem', marginBottom: '0.75rem', scrollbarWidth: 'none' }}>
        {tasks.map(s => (
          <button key={s.id} onClick={() => setActiveTab(s.id)} style={{
              padding: '0.4rem 0.9rem', borderRadius: '99px', border: '1px solid rgba(255,255,255,0.05)',
              background: activeTab === s.id ? 'linear-gradient(to right, #2563eb, #7c3aed)' : '#161618',
              color: activeTab === s.id ? 'white' : '#555',
              fontSize: '10px', fontWeight: 700, whiteSpace: 'nowrap', cursor: 'pointer'
            }}>{s.title.toUpperCase()}</button>
        ))}
      </div>

      {/* Task List */}
      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: '100px', scrollbarWidth: 'none' }}>
        {activeMission && (
          <>
            {dailyTasks.length > 0 && (
              <div style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '9px', fontWeight: 800, color: '#444', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.75rem' }}>Daily Progression</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {dailyTasks.map((t: any) => (
                    <div key={t.id} style={{ ...styles.glassCard, display: 'flex', alignItems: 'center', gap: '0.75rem', opacity: t.completed ? 0.3 : 1 }}>
                      <div onClick={() => toggleTask(activeMission.id, t.id)} style={{ width: '18px', height: '18px', borderRadius: '50%', border: t.completed ? 'none' : '2px solid #333', background: t.completed ? '#10b981' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                        {t.completed && <CheckCircle2 size={12} color="white" />}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '11px', fontWeight: 600, textDecoration: t.completed ? 'line-through' : 'none' }}>{t.text}</div>
                        <div onClick={() => startEdit(t)} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '4px', cursor: 'pointer' }}>
                          <Clock size={10} color={t.time ? "#3b82f6" : "#333"} />
                          <span style={{ fontSize: '8px', color: t.time ? "#3b82f6" : "#333", fontWeight: 700 }}>{t.time || 'SET REMINDER'}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {milestones.length > 0 && (
              <div style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '9px', fontWeight: 800, color: '#444', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.75rem' }}>Monthly Mandates</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {milestones.map((t: any) => (
                    <div key={t.id} style={{ ...styles.glassCard, border: t.completed ? '1px solid transparent' : '1px solid rgba(245, 158, 11, 0.2)', display: 'flex', alignItems: 'center', gap: '0.75rem', opacity: t.completed ? 0.3 : 1 }}>
                      <div onClick={() => toggleTask(activeMission.id, t.id)} style={{ width: '18px', height: '18px', borderRadius: '4px', border: t.completed ? 'none' : '2px solid #333', background: t.completed ? '#f59e0b' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                        {t.completed && <CheckCircle2 size={12} color="white" />}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '11px', fontWeight: 600, textDecoration: t.completed ? 'line-through' : 'none' }}>{t.text}</div>
                        <div onClick={() => startEdit(t)} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '4px', cursor: 'pointer' }}>
                          <Clock size={10} color="#333" />
                          <span style={{ fontSize: '8px', color: "#333", fontWeight: 700 }}>EDIT</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, padding: '1.25rem', background: 'linear-gradient(to top, #0a0a0b 80%, transparent)', display: 'flex', gap: '0.75rem' }}>
        <button onClick={() => { setEditingTask(null); setShowAddModal(true); }} style={{ flex: 1, padding: '0.9rem', borderRadius: '14px', background: '#161618', border: '1px solid rgba(255,255,255,0.05)', color: 'white', fontWeight: 700, fontSize: '11px', cursor: 'pointer' }}>
          <Plus size={16} color="#3b82f6" style={{ marginBottom: '-3px' }} /> ADD
        </button>
        <button onClick={() => incompleteDailyCount > 0 ? setShowEndDay(true) : alert('Mission Clear!')} style={{ flex: 2, padding: '0.9rem', borderRadius: '14px', background: 'linear-gradient(to right, #2563eb, #7c3aed)', border: 'none', color: 'white', fontWeight: 900, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.15em', cursor: 'pointer' }}>
          <Moon size={16} style={{ marginBottom: '-3px' }} /> CLOCK OUT
        </button>
      </div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1.5rem' }}>
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} style={{ ...styles.glassCard, width: '100%', maxWidth: '400px', padding: '2rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 900, textTransform: 'uppercase', marginBottom: '1.5rem' }}>{editingTask ? 'Update Objective' : 'New Objective'}</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <input autoFocus placeholder="What is the objective?" value={newTaskText} onChange={(e) => setNewTaskText(e.target.value)} style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid #333', borderRadius: '12px', padding: '1rem', color: 'white', outline: 'none' }} />
                <div style={{ display: 'flex', background: '#111', borderRadius: '10px', padding: '0.3rem' }}>
                  <button onClick={() => setNewTaskType('daily')} style={{ flex: 1, padding: '0.6rem', borderRadius: '8px', border: 'none', background: newTaskType === 'daily' ? '#333' : 'transparent', color: newTaskType === 'daily' ? 'white' : '#555', fontSize: '10px', fontWeight: 700, cursor: 'pointer' }}>DAILY</button>
                  <button onClick={() => setNewTaskType('milestone')} style={{ flex: 1, padding: '0.6rem', borderRadius: '8px', border: 'none', background: newTaskType === 'milestone' ? '#333' : 'transparent', color: newTaskType === 'milestone' ? 'white' : '#555', fontSize: '10px', fontWeight: 700, cursor: 'pointer' }}>MONTHLY</button>
                </div>
                <div>
                  <label style={{ fontSize: '9px', fontWeight: 800, color: '#444', textTransform: 'uppercase' }}>Push Alert Time</label>
                  <input type="time" value={newTaskTime} onChange={(e) => setNewTaskTime(e.target.value)} style={{ width: '100%', background: '#111', border: '1px solid #222', borderRadius: '8px', padding: '0.6rem', color: 'white', marginTop: '0.4rem' }} />
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                  <button onClick={() => { setShowAddModal(false); setEditingTask(null); }} style={{ flex: 1, padding: '1rem', borderRadius: '12px', background: 'transparent', border: '1px solid #333', color: '#555', fontWeight: 700 }}>CANCEL</button>
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
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 500, padding: '1.5rem' }}>
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} style={{ ...styles.glassCard, width: '100%', maxWidth: '400px', padding: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 900, textTransform: 'uppercase' }}>System Config</h3>
                <button onClick={() => setShowSettings(false)} style={{ background: 'none', border: 'none', color: '#555' }}><X size={18}/></button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <button 
                  onClick={() => Notification.requestPermission()}
                  style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '12px', border: '1px solid rgba(59, 130, 246, 0.2)', color: '#60a5fa', textAlign: 'left' }}
                >
                  <Bell size={20} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '11px', fontWeight: 700 }}>ENABLE SYSTEM ALERTS</div>
                    <div style={{ fontSize: '8px', opacity: 0.7 }}>Allow background push notifications</div>
                  </div>
                </button>
                <label style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px dashed #333', cursor: 'pointer' }}>
                  <UploadCloud size={20} color="#3b82f6" />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase' }}>Restore Mandate</div>
                    <div style={{ fontSize: '9px', color: '#444' }}>Import JSON backup</div>
                  </div>
                  <input type="file" onChange={handleImport} style={{ display: 'none' }} />
                </label>
                <button onClick={() => supabase.auth.signOut()} style={{ padding: '0.9rem', borderRadius: '12px', background: '#ef444410', border: '1px solid #ef444420', color: '#ef4444', fontWeight: 700, fontSize: '11px', textTransform: 'uppercase' }}>Sign Out</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
