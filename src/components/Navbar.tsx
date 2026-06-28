import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/">UniMarket</Link>
      </div>

      <div className="navbar-links">
        <Link to="/?category=apuntes">Apuntes</Link>
        <Link to="/?category=laptops">Laptops</Link>
        <Link to="/?category=accesorios">Accesorios</Link>
      </div>

      <div className="navbar-actions">
        {user ? (
          <>
            <Link to="/products/new" className="btn btn-primary btn-sm">+ Publicar</Link>
            <Link to="/chat">Chat</Link>
            <Link to="/favorites">Favoritos</Link>
            <div className="navbar-user">
              <Link to="/profile">
                {user.avatarUrl
                  ? <img src={`http://localhost:4000${user.avatarUrl}`} alt={user.name} className="avatar-sm" />
                  : <span className="avatar-placeholder">{user.name[0].toUpperCase()}</span>
                }
              </Link>
              <button onClick={handleLogout} className="btn-link">Salir</button>
            </div>
          </>
        ) : (
          <>
            <Link to="/login" className="btn btn-outline btn-sm">Ingresar</Link>
            <Link to="/register" className="btn btn-primary btn-sm">Registrarse</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
