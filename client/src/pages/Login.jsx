import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { Container, Row, Col, Form, Button, Spinner } from 'react-bootstrap';
import http from '../helpers/http';
import Swal from 'sweetalert2';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data } = await http.post('/users/login', formData);
      localStorage.setItem('access_token', data.access_token);
      
      Swal.fire({
        icon: 'success',
        title: 'Login Successful!',
        text: 'Welcome back!',
        timer: 1500,
        showConfirmButton: false,
      });

      setTimeout(() => {
        navigate('/');
      }, 1500);
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Login Failed',
        text: error.response?.data?.message || 'Invalid email or password',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    console.log('Google Login Success:', credentialResponse);
    setLoading(true);
    try {
      console.log('Sending Google token to backend...');
      const { data } = await http.post('/users/auth/google', {
        google_token: credentialResponse.credential,
      });
      
      console.log('Backend response:', data);
      localStorage.setItem('access_token', data.access_token);
      
      Swal.fire({
        icon: 'success',
        title: 'Login Successful!',
        text: 'Welcome!',
        timer: 1500,
        showConfirmButton: false,
        background: 'rgba(255, 255, 255, 0.95)',
        backdrop: 'rgba(102, 126, 234, 0.4)',
      });

      setTimeout(() => {
        navigate('/');
      }, 1500);
    } catch (error) {
      console.error('Google Login Error:', error);
      console.error('Error response:', error.response?.data);
      Swal.fire({
        icon: 'error',
        title: 'Google Login Failed',
        text: error.response?.data?.message || 'Something went wrong. Please try again.',
        background: 'rgba(255, 255, 255, 0.95)',
        backdrop: 'rgba(102, 126, 234, 0.4)',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = (error) => {
    console.error('Google OAuth Error:', error);
    Swal.fire({
      icon: 'error',
      title: 'Google Login Failed',
      text: 'Could not connect to Google. Please try again.',
      background: 'rgba(255, 255, 255, 0.95)',
      backdrop: 'rgba(102, 126, 234, 0.4)',
    });
  };

  return (
    <div className="auth-container">
      <Container>
        <Row className="justify-content-center">
          <Col xs={12} md={6} lg={5} xl={4}>
            <div className="auth-box">
              {/* Logo and Title */}
              <div className="text-center mb-4">
                <div className="instagram-gradient mb-3 float-animation" style={{ fontSize: '32px' }}>
                  Instagram
                </div>
                <p className="text-muted" style={{ fontSize: '15px' }}>
                  Sign in to see photos and videos from your friends.
                </p>
              </div>

              {/* Card */}
              <div className="instagram-card mb-3">
                {/* Google Login */}
                <div className="google-login-wrapper">
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={handleGoogleError}
                    useOneTap
                    size="large"
                    width="100%"
                    text="signin_with"
                    shape="rectangular"
                  />
                </div>

                {/* Divider */}
                <div className="divider">
                  <span>OR</span>
                </div>

                {/* Login Form */}
                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Control
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Email"
                      
                      className="instagram-input"
                      disabled={loading}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Control
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Password"
                      
                      className="instagram-input"
                      disabled={loading}
                    />
                  </Form.Group>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="instagram-button"
                  >
                    {loading ? (
                      <>
                        <Spinner
                          as="span"
                          animation="border"
                          size="sm"
                          role="status"
                          aria-hidden="true"
                          className="me-2"
                        />
                        Logging in...
                      </>
                    ) : (
                      'Log In'
                    )}
                  </Button>
                </Form>

                {/* Forgot Password */}
                <div className="text-center mt-3">
                  <a href="#" className="text-muted" style={{ fontSize: '12px' }}>
                    Forgot password?
                  </a>
                </div>
              </div>

              {/* Sign Up Link */}
              <div className="instagram-card text-center" style={{ padding: '20px' }}>
                <p className="mb-0">
                  Don't have an account?{' '}
                  <Link to="/register" style={{ fontWeight: '600' }}>
                    Sign up
                  </Link>
                </p>
              </div>

              {/* Get the App */}
              <div className="text-center mt-4">
                <p style={{ fontSize: '14px' }} className="mb-3">Get the app.</p>
                <Row className="justify-content-center g-2">
                  <Col xs={6}>
                    <img
                      src="https://www.instagram.com/static/images/appstore-install-badges/badge_ios_english-en.png/180ae7a0bcf7.png"
                      alt="Download on App Store"
                      className="img-fluid"
                      style={{ maxHeight: '40px' }}
                    />
                  </Col>
                  <Col xs={6}>
                    <img
                      src="https://www.instagram.com/static/images/appstore-install-badges/badge_android_english-en.png/e9cd846dc748.png"
                      alt="Get it on Google Play"
                      className="img-fluid"
                      style={{ maxHeight: '40px' }}
                    />
                  </Col>
                </Row>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Login;
