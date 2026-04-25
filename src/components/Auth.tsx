'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { motion } from 'framer-motion';
import { Mail, Lock, ShieldCheck, ArrowRight } from 'lucide-react';

export default function Auth() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        alert('Check your email for confirmation!');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const eliteStyles = {
    container: {
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'radial-gradient(circle at center, #1a1a1c 0%, #0a0a0b 100%)',
      padding: '2rem'
    },
    card: {
      width: '100%',
      maxWidth: '400px',
      background: 'rgba(255, 255, 255, 0.03)',
      backdropFilter: 'blur(25px)',
      border: '1px solid rgba(255, 255, 255, 0.08)',
      borderRadius: '28px',
      padding: '3rem 2.5rem',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: 'stretch'
    },
    inputGroup: {
      position: 'relative' as const,
      width: '100%',
      display: 'flex',
      alignItems: 'center'
    },
    input: {
      width: '100%',
      background: 'rgba(255, 255, 255, 0.04)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '14px',
      padding: '1.1rem 1rem 1.1rem 3.2rem',
      color: 'white',
      fontSize: '0.9rem',
      outline: 'none',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.2)'
    },
    button: {
      width: '100%',
      background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
      color: 'white',
      padding: '1.1rem',
      borderRadius: '14px',
      border: 'none',
      fontWeight: '900',
      textTransform: 'uppercase' as const,
      letterSpacing: '0.15em',
      fontSize: '0.75rem',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.6rem',
      boxShadow: '0 10px 20px -5px rgba(59, 130, 246, 0.4)',
      marginTop: '1rem'
    }
  };

  return (
    <div style={eliteStyles.container}>
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', damping: 20 }}
        style={eliteStyles.card}
      >
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
            style={{ 
              width: '72px', height: '72px', margin: '0 auto 1.25rem', 
              background: 'rgba(59, 130, 246, 0.1)', borderRadius: '20px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '1px solid rgba(59, 130, 246, 0.2)',
              boxShadow: '0 0 20px rgba(59, 130, 246, 0.1)'
            }}
          >
            <ShieldCheck size={36} color="#3b82f6" />
          </motion.div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-0.02em', margin: 0 }}>Access Mandate</h2>
          <p style={{ fontSize: '0.65rem', fontWeight: 800, color: '#555', marginTop: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.2em' }}>Secure Entry Point</p>
        </div>

        <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '10px', fontWeight: 700, color: '#444', textTransform: 'uppercase', letterSpacing: '0.1em', marginLeft: '4px' }}>Email Address</label>
            <div style={eliteStyles.inputGroup}>
              <Mail size={18} color="#444" style={{ position: 'absolute', left: '1.1rem' }} />
              <input 
                type="email"
                placeholder="operator@mandate.com"
                style={eliteStyles.input}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
              />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '10px', fontWeight: 700, color: '#444', textTransform: 'uppercase', letterSpacing: '0.1em', marginLeft: '4px' }}>Secure Password</label>
            <div style={eliteStyles.inputGroup}>
              <Lock size={18} color="#444" style={{ position: 'absolute', left: '1.1rem' }} />
              <input 
                type="password"
                placeholder="••••••••"
                style={eliteStyles.input}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
              />
            </div>
          </div>

          <button type="submit" style={eliteStyles.button} disabled={loading}>
            {loading ? 'Authenticating...' : isSignUp ? 'Initialize Account' : 'Authenticate'}
            <ArrowRight size={20} />
          </button>
        </form>

        <div style={{ marginTop: '2.5rem', textAlign: 'center' }}>
          <button 
            onClick={() => setIsSignUp(!isSignUp)}
            style={{ background: 'none', border: 'none', color: '#444', fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', cursor: 'pointer', transition: 'color 0.2s', letterSpacing: '0.05em' }}
            onMouseOver={(e) => e.currentTarget.style.color = '#3b82f6'}
            onMouseOut={(e) => e.currentTarget.style.color = '#444'}
          >
            {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Create One"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
