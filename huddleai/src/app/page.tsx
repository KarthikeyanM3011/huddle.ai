'use client';

import { useState } from 'react';
import { authClient } from '@/lib/auth-client';
import { Button } from '@/components/ui/button';

export default function AuthForm() {
  const {data: session} = authClient.useSession();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [status, setStatus] = useState('');
  const [isLogin, setIsLogin] = useState(true);

  const styles = {
    main: {
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f9fafb',
      padding: '16px'
    },
    form: {
      width: '100%',
      maxWidth: '400px',
      backgroundColor: 'white',
      padding: '32px',
      borderRadius: '8px',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '24px'
    },
    title: {
      fontSize: '24px',
      fontWeight: '600',
      textAlign: 'center' as const,
      color: '#111827',
      margin: 0
    },
    input: {
      width: '100%',
      padding: '12px 16px',
      border: '1px solid #d1d5db',
      borderRadius: '8px',
      fontSize: '16px',
      outline: 'none',
      transition: 'border-color 0.2s, box-shadow 0.2s',
      boxSizing: 'border-box' as const
    },
    inputFocus: {
      borderColor: '#3b82f6',
      boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)'
    },
    button: {
      width: '100%',
      padding: '12px 16px',
      backgroundColor: '#3b82f6',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      fontSize: '16px',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'background-color 0.2s'
    },
    buttonHover: {
      backgroundColor: '#2563eb'
    },
    toggleButton: {
      background: 'none',
      border: 'none',
      color: '#3b82f6',
      fontSize: '14px',
      cursor: 'pointer',
      textDecoration: 'underline',
      padding: '8px 0'
    },
    toggleText: {
      textAlign: 'center' as const,
      fontSize: '14px',
      color: '#6b7280',
      margin: 0
    },
    successStatus: {
      fontSize: '14px',
      textAlign: 'center' as const,
      color: '#059669',
      margin: 0
    },
    errorStatus: {
      fontSize: '14px',
      textAlign: 'center' as const,
      color: '#dc2626',
      margin: 0
    },
    welcomeContainer: {
      textAlign: 'center' as const,
      marginTop: '20px',
      padding: '32px',
      backgroundColor: 'white',
      borderRadius: '8px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      maxWidth: '400px',
      margin: '20px auto'
    },
    welcomeTitle: {
      fontSize: '24px',
      fontWeight: '600',
      color: '#111827',
      marginBottom: '8px'
    },
    welcomeText: {
      fontSize: '16px',
      color: '#6b7280',
      marginBottom: '20px'
    }
  };

  if (session) {
    return (
      <div style={styles.welcomeContainer}>
        <h2 style={styles.welcomeTitle}>Welcome, {session.user.name}!</h2>
        <p style={styles.welcomeText}>You are already logged in.</p>
        <Button onClick={() => authClient.signOut()}>
          Sign out
        </Button>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(isLogin ? 'Signing in...' : 'Creating account...');

    try {
      if (isLogin) {
        await authClient.signIn.email({
          email,
          password
        });
        setStatus('Signed in successfully!');
        window.alert('🎉 Signed in successfully!');
      } else {
        await authClient.signUp.email({
          email,
          password,
          name
        });
        setStatus('Account created successfully!');
        window.alert('🎉 Account created successfully!');
      }
      
      setEmail('');
      setPassword('');
      setName('');
    } catch (err: any) {
      console.error(`Error ${isLogin ? 'signing in' : 'creating account'}:`, err);
      const errorMessage = err.message || `Failed to ${isLogin ? 'sign in' : 'create account'}. Please try again.`;
      setStatus(errorMessage);
      window.alert(`❌ Error: ${errorMessage}`);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setStatus('');
    setEmail('');
    setPassword('');
    setName('');
  };

  return (
    <main style={styles.main}>
      <form onSubmit={handleSubmit} style={styles.form}>
        <h1 style={styles.title}>
          {isLogin ? 'Sign In' : 'Create Account'}
        </h1>

        {!isLogin && (
          <input
            type="text"
            placeholder="Full Name"
            required
            style={styles.input}
            value={name}
            onChange={(e) => setName(e.target.value)}
            onFocus={(e) => Object.assign(e.target.style, styles.inputFocus)}
            onBlur={(e) => Object.assign(e.target.style, { borderColor: '#d1d5db', boxShadow: 'none' })}
          />
        )}
        
        <input
          type="email"
          placeholder="Email"
          required
          style={styles.input}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onFocus={(e) => Object.assign(e.target.style, styles.inputFocus)}
          onBlur={(e) => Object.assign(e.target.style, { borderColor: '#d1d5db', boxShadow: 'none' })}
        />

        <input
          type="password"
          placeholder="Password"
          required
          style={styles.input}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onFocus={(e) => Object.assign(e.target.style, styles.inputFocus)}
          onBlur={(e) => Object.assign(e.target.style, { borderColor: '#d1d5db', boxShadow: 'none' })}
        />

        <button
          type="submit"
          style={styles.button}
        >
          {isLogin ? 'Sign In' : 'Create Account'}
        </button>

        {status && (
          <p style={status.includes('successfully') ? styles.successStatus : styles.errorStatus}>
            {status}
          </p>
        )}

        <div style={{ textAlign: 'center' }}>
          <p style={styles.toggleText}>
            {isLogin ? "Don't have an account?" : "Already have an account?"}
          </p>
          <button
            type="button"
            onClick={toggleMode}
            style={styles.toggleButton}
          >
            {isLogin ? 'Create one here' : 'Sign in here'}
          </button>
        </div>
      </form>
    </main>
  );
}