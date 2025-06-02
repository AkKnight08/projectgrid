import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useUserStore } from './store/userStore'
import Layout from './components/layout/Layout'
import Auth from './components/Auth'
import Dashboard from './pages/Dashboard'
import ProjectDetails from './pages/ProjectDetails'
import Profile from './pages/Profile'
import NewProject from './pages/NewProject'
import CalendarView from './pages/CalendarView'
import Analytics from './pages/Analytics'
import { useEffect } from 'react'

const PrivateRoute = ({ children }) => {
  const { user, getCurrentUser } = useUserStore()
  
  useEffect(() => {
    if (!user) {
      getCurrentUser()
    }
  }, [user, getCurrentUser])

  return user ? children : <Navigate to="/auth" />
}

const App = () => {

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
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        <Route path="/auth" element={<Auth />} />
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Layout />
            </PrivateRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="projects" element={<Dashboard />} />
          <Route path="projects/new" element={<NewProject />} />
          <Route path="projects/:id" element={<ProjectDetails />} />
          <Route path="calendar" element={<CalendarView />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="profile" element={<Profile />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
