import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  BellIcon, 
  MagnifyingGlassIcon,
  SunIcon,
  MoonIcon,
  Squares2X2Icon,
  ListBulletIcon,
  ChevronDownIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { useProjectStore } from '../store/projectStore';
import './Navbar.css';

const Navbar = () => {
  const navigate = useNavigate();
  const { searchProjects, searchResults, isSearching } = useProjectStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const searchRef = useRef(null);
  const profileRef = useRef(null);
  const [notifications] = useState([
    { id: 1, message: 'Task overdue in Project X', read: false },
    { id: 2, message: 'New comment on Task Y', read: false },
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
        setIsSearchVisible(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim()) {
        searchProjects(searchQuery);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, searchProjects]);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setShowResults(true);
  };

  const handleResultClick = (projectId) => {
    navigate(`/projects/${projectId}`);
    setShowResults(false);
    setSearchQuery('');
    setIsSearchVisible(false);
  };

  const toggleSearch = () => {
    setIsSearchVisible(!isSearchVisible);
    if (!isSearchVisible) {
      // Focus the input when opening
      setTimeout(() => {
        searchRef.current?.querySelector('input')?.focus();
      }, 100);
    } else {
      setSearchQuery('');
      setShowResults(false);
    }
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <nav className="navbar">
      <div className="site-title-container">
        <Link to="/" className="site-title-link">
          Plan<span className="accent">Pro</span>
        </Link>
      </div>

      <div className="inspiration-text">
        "Plan today, achieve tomorrow"
      </div>

      <div className="navbar-right">
        <div className="search-container" ref={searchRef}>
          <button 
            className="search-icon-btn"
            onClick={toggleSearch}
            title="Search"
          >
            <MagnifyingGlassIcon className="w-5 h-5" />
          </button>
          
          {isSearchVisible && (
            <div className="search-wrapper">
              <input
                type="text"
                className="search-input"
                placeholder="Search projects..."
                value={searchQuery}
                onChange={handleSearch}
              />
              {showResults && (searchQuery.trim() || isSearching) && (
                <div className="search-results-dropdown">
                  {isSearching ? (
                    <div className="search-loading">Searching...</div>
                  ) : searchResults.length > 0 ? (
                    searchResults.map((project) => (
                      <div
                        key={project._id}
                        className="search-result-item"
                        onClick={() => handleResultClick(project._id)}
                      >
                        <div className="search-result-title">{project.name}</div>
                        <div className="search-result-description">{project.description}</div>
                        {project.tags && project.tags.length > 0 && (
                          <div className="search-result-tags">
                            {project.tags.map((tag) => (
                              <span key={tag} className="search-result-tag">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="search-no-results">No projects found</div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        <button
          className="theme-toggle-btn"
          onClick={toggleTheme}
          title={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
        >
          {isDarkMode ? (
            <SunIcon className="w-5 h-5" />
          ) : (
            <MoonIcon className="w-5 h-5" />
          )}
        </button>

        <div className="profile-menu" ref={profileRef}>
          <button
            className="profile-btn"
            onClick={() => setShowProfileMenu(!showProfileMenu)}
          >
            <div className="profile-avatar">AK</div>
            <ChevronDownIcon className="profile-arrow" />
          </button>

          {showProfileMenu && (
            <div className="profile-panel">
              <Link to="/profile" className="profile-item">Profile</Link>
              <Link to="/settings" className="profile-item">Settings</Link>
              <button className="profile-item">Sign out</button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 