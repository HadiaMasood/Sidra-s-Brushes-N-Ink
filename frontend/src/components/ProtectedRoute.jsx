import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('auth_token') || localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  
  // If no token, redirect to login
  if (!token) {
    return <Navigate to="/admin/login" replace />;
  }
  
  // Parse user data
  let user = {};
  try {
    user = JSON.parse(userStr || '{}');
  } catch (e) {
    console.error('Error parsing user data:', e);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return <Navigate to="/admin/login" replace />;
  }
  
  // Check if user is admin
  if (user.role !== 'admin') {
    console.error('Access denied: User is not an admin');
    localStorage.removeItem('auth_token');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return <Navigate to="/admin/login" replace />;
  }
  
  // All checks passed, render protected component
  return children;
};

export default ProtectedRoute;
