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
import { BACKGROUND_COLORS, DARK_MODE_COLORS } from '../constants/colors';
import { useTheme } from '../context/ThemeContext';
import './Navbar.css';

const Navbar = () => {
  const navigate = useNavigate();
  const { searchProjects, searchResults, isSearching } = useProjectStore();
  const { theme, handleThemeChange } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const searchRef = useRef(null);
  const profileRef = useRef(null);
  const [notifications] = useState([
    { id: 1, message: 'Task overdue in Project X', read: false },
    { id: 2, message: 'New comment on Task Y', read: false },
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  // Get colors based on current theme
  const colors = theme === 'dark' ? DARK_MODE_COLORS : {
    PAGE_BG: BACKGROUND_COLORS.MAIN,
    PANEL_BG: '#FFFFFF',
    CARD_INNER_BG: '#FFFFFF',
    BORDER: '#E5E5E5',
    TEXT_PRIMARY: '#1A1A1A',
    TEXT_SECONDARY: '#666666',
    TEXT_DISABLED: '#999999',
    ACCENT_PURPLE: '#7C3AED',
    ACCENT_TEAL: '#0D9488',
    ACCENT_ORANGE: '#D97706',
    ACCENT_RED: '#DC2626',
    ACCENT_GREEN: '#059669',
    ICON_DEFAULT: '#666666',
    ICON_HOVER: '#1A1A1A'
  };

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

  return (
    <nav className={`navbar bg-[${colors.PANEL_BG}] border-b border-[${colors.BORDER}]`}>
      <div className="site-title-container">
        <Link to="/" className={`site-title-link text-[${colors.TEXT_PRIMARY}]`}>
          Plan<span className={`accent italic text-[${colors.ACCENT_PURPLE}]`}>Pro</span>
        </Link>
      </div>

      <div className={`inspiration-text text-[${colors.TEXT_SECONDARY}]`}>
        "Plan today, achieve tomorrow"
      </div>

      <div className="navbar-right">
        <div className="search-container" ref={searchRef}>
          <button 
            className={`search-icon-btn text-[${colors.ICON_DEFAULT}] hover:text-[${colors.ICON_HOVER}]`}
            onClick={toggleSearch}
            title="Search"
          >
            <MagnifyingGlassIcon className="w-5 h-5" />
          </button>
          
          {isSearchVisible && (
            <div className={`search-wrapper bg-[${colors.CARD_INNER_BG}] border border-[${colors.BORDER}]`}>
              <input
                type="text"
                className={`search-input bg-[${colors.CARD_INNER_BG}] text-[${colors.TEXT_PRIMARY}] placeholder:text-[${colors.TEXT_DISABLED}]`}
                placeholder="Search projects..."
                value={searchQuery}
                onChange={handleSearch}
              />
              {showResults && (searchQuery.trim() || isSearching) && (
                <div className={`search-results-dropdown bg-[${colors.CARD_INNER_BG}] border border-[${colors.BORDER}]`}>
                  {isSearching ? (
                    <div className={`search-loading text-[${colors.TEXT_SECONDARY}]`}>Searching...</div>
                  ) : searchResults.length > 0 ? (
                    searchResults.map((project) => (
                      <div
                        key={project._id}
                        className={`search-result-item hover:bg-[${colors.PANEL_BG}]`}
                        onClick={() => handleResultClick(project._id)}
                      >
                        <div className={`search-result-title text-[${colors.TEXT_PRIMARY}]`}>{project.name}</div>
                        <div className={`search-result-description text-[${colors.TEXT_SECONDARY}]`}>{project.description}</div>
                        {project.tags && project.tags.length > 0 && (
                          <div className="search-result-tags">
                            {project.tags.map((tag) => (
                              <span key={tag} className={`search-result-tag bg-[${colors.ACCENT_PURPLE}]/10 text-[${colors.ACCENT_PURPLE}]`}>
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className={`search-no-results text-[${colors.TEXT_SECONDARY}]`}>No projects found</div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        <button
          className={`theme-toggle-btn text-[${colors.ICON_DEFAULT}] hover:text-[${colors.ICON_HOVER}]`}
          onClick={() => handleThemeChange(theme === 'dark' ? 'light' : 'dark')}
          title={theme === 'dark' ? "Switch to light mode" : "Switch to dark mode"}
        >
          {theme === 'dark' ? (
            <SunIcon className="w-5 h-5" />
          ) : (
            <MoonIcon className="w-5 h-5" />
          )}
        </button>

        <div className="profile-menu" ref={profileRef}>
          <button
            className={`profile-btn text-[${colors.TEXT_PRIMARY}]`}
            onClick={() => setShowProfileMenu(!showProfileMenu)}
          >
            <div className={`profile-avatar bg-[${colors.ACCENT_PURPLE}] text-[${colors.PAGE_BG}]`}>AK</div>
            <ChevronDownIcon className={`profile-arrow text-[${colors.ICON_DEFAULT}]`} />
          </button>

          {showProfileMenu && (
            <div className={`profile-panel bg-[${colors.CARD_INNER_BG}] border border-[${colors.BORDER}]`}>
              <Link to="/profile" className={`profile-item text-[${colors.TEXT_PRIMARY}] hover:bg-[${colors.PANEL_BG}]`}>Profile</Link>
              <Link to="/settings" className={`profile-item text-[${colors.TEXT_PRIMARY}] hover:bg-[${colors.PANEL_BG}]`}>Settings</Link>
              <button className={`profile-item text-[${colors.ACCENT_RED}] hover:bg-[${colors.PANEL_BG}]`}>Sign out</button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 