import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function PenyuplaiRoute({ children }) {
  const { isAuthenticated, role } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (role !== 'PENYUPLAI') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
