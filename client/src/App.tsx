import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Pages — will be added in subsequent tasks
const Home = () => (
  <div style={{
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    gap: '16px',
    background: 'var(--color-bg)',
    color: 'var(--color-text)',
    fontFamily: 'var(--font-display)',
  }}>
    <div style={{ fontSize: '48px' }}>🛒</div>
    <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--color-primary)' }}>
      E-Commerce Platform
    </h1>
    <p style={{ color: 'var(--color-text-muted)', fontSize: '1.1rem' }}>
      Full-stack monorepo — setup complete ✅
    </p>
    <div style={{
      marginTop: '16px',
      padding: '12px 24px',
      background: 'var(--color-surface)',
      borderRadius: 'var(--radius-md)',
      border: '1px solid var(--color-border)',
      color: 'var(--color-text-muted)',
      fontSize: '0.9rem',
    }}>
      React + Vite + TypeScript | Node.js + Express + MongoDB
    </div>
  </div>
);

function App() {
  return (
    <Router>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'var(--color-surface)',
            color: 'var(--color-text)',
            border: '1px solid var(--color-border)',
          },
        }}
      />
      <Routes>
        <Route path="/" element={<Home />} />
        {/* Routes will be added in subsequent tasks */}
      </Routes>
    </Router>
  );
}

export default App;
