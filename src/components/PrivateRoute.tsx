import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface Props { children: JSX.Element; }

const PrivateRoute = ({ children }: Props) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-screen">Cargando...</div>;
  return user ? children : <Navigate to="/login" replace />;
};

export default PrivateRoute;
