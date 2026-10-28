import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { APP_NAME } from '../../config/env';
import { useAuth } from '../../hooks/useAuth';

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Overview' },
  { to: '/people', label: 'People' },
  { to: '/products', label: 'Products' },
  { to: '/finance', label: 'Finance' },
];

/** The frame around every signed-in page: sidebar navigation + the page itself. */
export function AppShell() {
  const { company, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/auth', { replace: true });
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand-mark">
          <span className="brand-mark__logo" aria-hidden="true">
            {APP_NAME.charAt(0)}
          </span>
          <span>{APP_NAME}</span>
        </div>

        <nav className="sidebar__nav" aria-label="Main">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `sidebar__link${isActive ? ' sidebar__link--active' : ''}`}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar__footer">
          <p className="sidebar__company">{company?.companyName}</p>
          <p className="sidebar__email">{company?.email}</p>
          <button type="button" className="btn btn--sidebar btn--block" onClick={handleLogout}>
            Sign out
          </button>
        </div>
      </aside>

      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
}
