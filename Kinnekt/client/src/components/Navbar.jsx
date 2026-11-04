import { Link, NavLink } from 'react-router-dom'
import './Navbar.css'

const linkClass = ({ isActive }) =>
  isActive ? 'navbar__link navbar__link--active' : 'navbar__link'

function Navbar() {
  return (
    <header className="navbar">
      <div className="navbar__inner">
        <div className="navbar__left">
          <Link to="/" className="navbar__brand" aria-label="Kinnekt home">
            <span className="navbar__logo">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
            </span>
            <span className="navbar__name">Kinnekt</span>
          </Link>

          <nav className="navbar__links" aria-label="Primary">
            <NavLink to="/discover" className={linkClass}>
              Discover
            </NavLink>
          </nav>
        </div>

        <div className="navbar__right">
          <Link to="/events/new" className="navbar__cta">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <path d="M12 5v14M5 12h14" />
            </svg>
            Create event
          </Link>

          <NavLink to="/account" className={linkClass}>
            My account
          </NavLink>

          <Link
            to="/account"
            className="navbar__avatar"
            aria-label="Go to your profile"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="12" cy="8" r="4" />
              <path d="M4 21a8 8 0 0 1 16 0" />
            </svg>
          </Link>
        </div>
      </div>
    </header>
  )
}

export default Navbar