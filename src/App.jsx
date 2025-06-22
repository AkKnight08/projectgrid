import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useUserStore } from './store/userStore'
import Layout from './components/layout/Layout'
import Auth from './components/Auth'
import Dashboard from './pages/Dashboard'
import ProjectDetails from './pages/ProjectDetails'
import Profile from './pages/Profile'
import NewProject from './pages/NewProject'
import CalendarView from './pages/CalendarView'
import Analytics from './pages/Analytics'
import Settings from './pages/Settings'
import VerifyEmail from './pages/VerifyEmail'
import TaskPage from './pages/TaskPage'
import { useEffect } from 'react'
import { ThemeProvider, useTheme } from './context/ThemeContext'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/auth/ProtectedRoute'
import Login from './pages/Login'
import Signup from './pages/Signup'
import ProjectGrid from './components/ProjectGrid'

const PrivateRoute = ({ children }) => {
  const { user, getCurrentUser } = useUserStore()
  
  useEffect(() => {
    if (!user) {
      getCurrentUser()
    }
  }, [user, getCurrentUser])

  return user ? children : <Navigate to="/login" />
}

function App() {
  const { theme } = useTheme()

  // Apply theme from localStorage on initial load
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'system';
    const applyTheme = (theme) => {
      if (theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    };

    applyTheme(savedTheme);

    // Listen for system theme changes if 'system' is selected
    let mediaQuery;
    if (savedTheme === 'system') {
      mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handler = () => applyTheme('system');
      mediaQuery.addEventListener('change', handler);
      return () => mediaQuery.removeEventListener('change', handler);
    }
  }, []); // Empty dependency array ensures this runs only once on mount

  return (
    <div className={`app ${theme}`}>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/verify-email/:token" element={<VerifyEmail />} />

        {/* Protected Routes */}
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="projects" element={<ProjectGrid />} />
          <Route path="projects/new" element={<NewProject />} />
          <Route path="projects/:id" element={<ProjectDetails />} />
          <Route path="calendar" element={<CalendarView />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="settings" element={<Settings />} />
          <Route path="profile" element={<Profile />} />
          <Route path="tasks" element={<TaskPage />} />
        </Route>
      </Routes>
    </div>
  )
}

// Wrap App in Router and ThemeProvider in main.jsx or a root component
// For now, let's try to wrap it here to satisfy the immediate need.

const Root = () => (
  <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </Router>
);

export default Root;
