import React, { Component, ReactNode } from 'react';
import { BrowserRouter, Routes, Route, NavLink, useLocation } from 'react-router-dom';
import { AppProvider } from './contexts/AppContext';
import { ToastProvider } from './components/Toast';
import DashboardPage from './pages/DashboardPage';
import AFunctionPage from './pages/AFunctionPage';
import BFunctionPage from './pages/BFunctionPage';
import HistoryPage from './pages/HistoryPage';
import ProfilePage from './pages/ProfilePage';
import { LayoutDashboard, Sparkles, Languages, Clock, User } from 'lucide-react';

class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean; error: string }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: '' };
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error: error.message };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-8">
          <h2 className="text-lg font-bold text-red-400 mb-2">页面出错了</h2>
          <p className="text-xs text-slate-400 mb-4">{this.state.error}</p>
          <button onClick={() => this.setState({ hasError: false, error: '' })} className="text-xs bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg">
            重试
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function AppLayout() {
  const location = useLocation();
  const currentPath = location.pathname;

  const navItems = [
    { to: '/', label: '看板', icon: LayoutDashboard },
    { to: '/a', label: 'A·工作台', icon: Sparkles },
    { to: '/b', label: 'B·数字人', icon: Languages },
    { to: '/history', label: '历史', icon: Clock },
    { to: '/profile', label: '账号', icon: User },
  ];

  const isActive = (to: string) => {
    if (to === '/') return currentPath === '/';
    return currentPath.startsWith(to);
  };

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-100 font-sans antialiased flex flex-col justify-between">
      <header className="border-b border-[#334155] bg-[#1E293B] sticky top-0 z-40 px-4 md:px-8 py-3 shadow-lg shadow-slate-950/25">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-8 h-8 bg-[#3B82F6] rounded-lg flex items-center justify-center font-bold text-white text-lg">C</div>
            <h1 className="text-base font-bold tracking-tight text-white">出海AI视频平台</h1>
          </div>

          <nav className="flex items-center gap-1 bg-[#0F172A] p-1 rounded-xl border border-[#334155] text-xs">
            {navItems.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
                  isActive(to) ? 'bg-[#3B82F6] text-white' : 'text-[#94A3B8] hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-8 py-6">
        <ErrorBoundary>
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/a" element={<AFunctionPage />} />
            <Route path="/b" element={<BFunctionPage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Routes>
        </ErrorBoundary>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <ToastProvider>
          <AppLayout />
        </ToastProvider>
      </AppProvider>
    </BrowserRouter>
  );
}
