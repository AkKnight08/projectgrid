import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useUserStore } from './store/userStore'
import Layout from './components/layout/Layout'
import Auth from './components/Auth'
import Dashboard from './components/Dashboard'
import ProjectDetails from './components/ProjectDetails'
import Profile from './components/Profile'
import Settings from './components/Settings'
import AllProjects from './pages/AllProjects'
import NewProject from './pages/NewProject'

const PrivateRoute = ({ children }) => {
  const { user } = useUserStore()
  return user ? children : <Navigate to="/auth" />
}

const App = () => {
  return (
    <Router>
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
          <Route path="projects" element={<AllProjects />} />
          <Route path="projects/new" element={<NewProject />} />
          <Route path="projects/:id" element={<ProjectDetails />} />
          <Route path="profile" element={<Profile />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App
