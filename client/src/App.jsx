import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Messages from './pages/Messages';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '426382311425-flmdrhl6n7tmqcamg1lj8c8cmrkqgtpa.apps.googleusercontent.com';

function App() {
  const ProtectedRoute = ({ children }) => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      return <Navigate to="/login" replace />;
    }
    return children;
  };

  const AuthRoute = ({ children }) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      return <Navigate to="/" replace />;
    }
    return children;
  };

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <Router>
        <Routes>
          <Route 
            path="/login" 
            element={
              <AuthRoute>
                <Login />
              </AuthRoute>
            } 
          />
          <Route 
            path="/register" 
            element={
              <AuthRoute>
                <Register />
              </AuthRoute>
            } 
          />
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/messages" 
            element={
              <ProtectedRoute>
                <Messages />
              </ProtectedRoute>
            } 
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </GoogleOAuthProvider>
  );
}

export default App;