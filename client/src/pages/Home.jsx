import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Container, Row, Col, Button, Navbar, Spinner, Nav } from 'react-bootstrap';
import { PlusCircleFill, ChatDotsFill, ChatLeftTextFill, PersonCircle, Stars, HouseFill } from 'react-bootstrap-icons';
import Swal from 'sweetalert2';
import http from '../helpers/http';
import PostCard from '../components/PostCard';
import CreatePostModal from '../components/CreatePostModal';
import AIChatModal from '../components/AIChatModal';
import { fetchPosts } from '../store/postsSlice';
import { logout, initializeAuth } from '../store/authSlice';

const Home = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // Redux state
  const { posts, loading } = useSelector(state => state.posts);
  const { user, isAuthenticated } = useSelector(state => state.auth);
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);
  const [activeTab, setActiveTab] = useState('all'); // 'all' or 'recommended'
  const [recommendedPosts, setRecommendedPosts] = useState([]);
  const [loadingRecommended, setLoadingRecommended] = useState(false);

  useEffect(() => {
    dispatch(initializeAuth());
    dispatch(fetchPosts());
  }, [dispatch]);

  useEffect(() => {
    // Redirect if not authenticated
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  const fetchRecommendations = async () => {
    try {
      setLoadingRecommended(true);
      const { data } = await http.get('/ai/recommendations');
      setRecommendedPosts(data.data || []);
    } catch (error) {
      setRecommendedPosts(posts);
    } finally {
      setLoadingRecommended(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'recommended' && recommendedPosts.length === 0) {
      fetchRecommendations();
    }
  }, [activeTab]);

  const handlePostCreated = () => {
    dispatch(fetchPosts());
  };

  const handleLikeToggle = (postId) => {
    // Posts will be updated via Redux, no need to refetch
  };

  const handleLogout = () => {
    Swal.fire({
      title: 'Are you sure?',
      text: 'You will be logged out',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#0095f6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, logout',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        dispatch(logout());
        Swal.fire({
          icon: 'success',
          title: 'Logged out successfully!',
          timer: 1500,
          showConfirmButton: false,
        });
        setTimeout(() => {
          navigate('/login');
        }, 1500);
      }
    });
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(-45deg, #667eea, #764ba2, #f093fb, #f5576c)',
      backgroundSize: '400% 400%',
      animation: 'gradient 15s ease infinite'
    }}>
      {/* Header */}
      <Navbar className="border-bottom sticky-top shadow-sm">
        <Container>
          <Navbar.Brand>
            <div className="instagram-gradient float-animation" style={{ fontSize: '24px', padding: '8px 16px' }}>
              Instagram
            </div>
          </Navbar.Brand>
          <div className="d-flex gap-2">
            <Button 
              variant="primary"
              onClick={() => navigate('/profile')}
              className="d-flex align-items-center fw-semibold"
              style={{
                background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                border: 'none',
                borderRadius: '12px',
                padding: '8px 16px'
              }}
            >
              <PersonCircle className="me-2" />
              Profile
            </Button>
            <Button 
              variant="primary"
              onClick={() => navigate('/messages')}
              className="d-flex align-items-center fw-semibold"
              style={{
                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                border: 'none',
                borderRadius: '12px',
                padding: '8px 16px'
              }}
            >
              <ChatLeftTextFill className="me-2" />
              Messages
            </Button>
            <Button 
              variant="primary"
              onClick={() => setShowCreateModal(true)}
              className="d-flex align-items-center fw-semibold"
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none',
                borderRadius: '12px',
                padding: '8px 16px'
              }}
            >
              <PlusCircleFill className="me-2" />
              Create Post
            </Button>
            <Button 
              variant="danger" 
              onClick={handleLogout}
              className="fw-semibold"
            >
              Logout
            </Button>
          </div>
        </Container>
      </Navbar>

      {/* Main Content */}
      <Container className="py-4">
        <Row className="justify-content-center">
          <Col xs={12} md={8} lg={6}>
            {/* Tabs for All Posts / For You */}
            <Nav variant="pills" className="mb-4 justify-content-center">
              <Nav.Item>
                <Nav.Link
                  active={activeTab === 'all'}
                  onClick={() => setActiveTab('all')}
                  className="d-flex align-items-center fw-semibold"
                  style={{
                    borderRadius: '12px',
                    padding: '10px 20px',
                    background: activeTab === 'all' 
                      ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                      : 'rgba(255, 255, 255, 0.1)',
                    color: 'white',
                    border: 'none'
                  }}
                >
                  <HouseFill className="me-2" />
                  All Posts
                </Nav.Link>
              </Nav.Item>
              <Nav.Item className="ms-2">
                <Nav.Link
                  active={activeTab === 'recommended'}
                  onClick={() => setActiveTab('recommended')}
                  className="d-flex align-items-center fw-semibold"
                  style={{
                    borderRadius: '12px',
                    padding: '10px 20px',
                    background: activeTab === 'recommended'
                      ? 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
                      : 'rgba(255, 255, 255, 0.1)',
                    color: 'white',
                    border: 'none'
                  }}
                >
                  <Stars className="me-2" />
                  For You
                </Nav.Link>
              </Nav.Item>
            </Nav>

            {/* Loading State */}
            {(loading || (activeTab === 'recommended' && loadingRecommended)) ? (
              <div className="text-center py-5">
                <Spinner 
                  animation="border" 
                  variant="primary"
                  style={{ 
                    width: '3rem', 
                    height: '3rem',
                    borderWidth: '4px'
                  }}
                />
                <p className="mt-3 text-white fw-semibold">
                  {activeTab === 'recommended' ? 'Loading recommendations...' : 'Loading posts...'}
                </p>
              </div>
            ) : (activeTab === 'all' ? posts : recommendedPosts).length === 0 ? (
              /* Empty State */
              <div className="instagram-card text-center p-5">
                <div className="mb-4">
                  {activeTab === 'recommended' ? (
                    <Stars size={80} className="text-warning" />
                  ) : (
                    <svg 
                      className="mx-auto text-secondary" 
                      width="100" 
                      height="100"
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth="2" 
                        d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                      />
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth="2" 
                        d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  )}
                </div>
                <h3 className="fw-bold mb-3 text-gradient">
                  {activeTab === 'recommended' 
                    ? 'Like 3+ Posts to Get Recommendations!' 
                    : 'No Posts Yet!'}
                </h3>
                <p className="mb-4" style={{ color: '#666' }}>
                  {activeTab === 'recommended'
                    ? 'Start liking posts you enjoy, and AI will recommend content just for you! ✨'
                    : 'Be the first to share your moments! 📸'}
                </p>
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => activeTab === 'recommended' ? setActiveTab('all') : setShowCreateModal(true)}
                  className="instagram-button"
                >
                  {activeTab === 'recommended' ? (
                    <>
                      <HouseFill className="me-2" />
                      Browse All Posts
                    </>
                  ) : (
                    <>
                      <PlusCircleFill className="me-2" />
                      Create Your First Post
                    </>
                  )}
                </Button>
              </div>
            ) : (
              /* Posts Feed */
              <div className="posts-feed">
                {(activeTab === 'all' ? posts : recommendedPosts).map(post => (
                  <PostCard 
                    key={post.id} 
                    post={post}
                    onLikeToggle={handleLikeToggle}
                  />
                ))}
              </div>
            )}
          </Col>
        </Row>
      </Container>

      {/* Create Post Modal */}
      <CreatePostModal
        show={showCreateModal}
        onHide={() => setShowCreateModal(false)}
        onPostCreated={handlePostCreated}
      />

      {/* AI Chat Modal */}
      <AIChatModal
        show={showChatModal}
        onHide={() => setShowChatModal(false)}
      />

      {/* Floating Chat Button */}
      <button
        className="floating-chat-btn"
        onClick={() => setShowChatModal(true)}
        title="Chat with AI Assistant"
      >
        <ChatDotsFill size={28} color="white" />
      </button>
    </div>
  );
};

export default Home;
