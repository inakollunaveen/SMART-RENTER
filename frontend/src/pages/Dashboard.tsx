import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Redirect based on user role
  switch (user.role) {
    case 'owner':
      return <Navigate to="/owner-dashboard" replace />;
    case 'admin':
      return <Navigate to="/admin-dashboard" replace />;
    case 'user':
    default:
      return <Navigate to="/search" replace />;
  }
};

export default Dashboard;