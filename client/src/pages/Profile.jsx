import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Button, Card, Spinner, Nav } from 'react-bootstrap';
import { ArrowLeft, GearFill, GridFill, BookmarkFill } from 'react-bootstrap-icons';
import Swal from 'sweetalert2';
import http from '../helpers/http';
import PostCard from '../components/PostCard';

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('posts'); // 'posts' or 'liked'

  useEffect(() => {
    fetchUserData();
    fetchUserPosts();
  }, []);

  const getCurrentUserId = () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return null;
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.id;
    } catch (error) {
      console.error('Error parsing token:', error);
      return null;
    }
  };

  const fetchUserData = async () => {
    try {
      const userId = getCurrentUserId();
      if (!userId) {
        navigate('/login');
        return;
      }

      // Kita ambil info user dari token atau bisa buat endpoint /users/me
      const token = localStorage.getItem('access_token');
      const payload = JSON.parse(atob(token.split('.')[1]));
      setUser(payload);
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const fetchUserPosts = async () => {
    try {
      setLoading(true);
      const userId = getCurrentUserId();
      
      // Fetch all posts dan filter by user
      const { data } = await http.get('/posts');
      const userPosts = data.filter(post => post.UserId === userId);
      setPosts(userPosts);
    } catch (error) {
      console.error('Error fetching posts:', error);
      Swal.fire({
        icon: 'error',
        title: 'Failed to load posts',
        text: error.response?.data?.message || 'Something went wrong',
        background: 'rgba(255, 255, 255, 0.95)',
        backdrop: 'rgba(102, 126, 234, 0.4)',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Swal.fire({
      title: 'Are you sure?',
      text: 'You will be logged out',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#667eea',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, logout',
      cancelButtonText: 'Cancel',
      background: 'rgba(255, 255, 255, 0.95)',
      backdrop: 'rgba(102, 126, 234, 0.4)',
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem('access_token');
        Swal.fire({
          icon: 'success',
          title: 'Logged out successfully!',
          timer: 1500,
          showConfirmButton: false,
          background: 'rgba(255, 255, 255, 0.95)',
          backdrop: 'rgba(102, 126, 234, 0.4)',
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
      background: 'linear-gradient(-45deg, #667eea, #764ba2, #f093fb, #4facfe)',
      backgroundSize: '400% 400%',
      animation: 'gradient 15s ease infinite'
    }}>
      <Container fluid className="py-4" style={{ maxWidth: '800px' }}>
        {/* Simple Header with Username */}
        <Card 
          className="shadow-lg border-0 mb-4"
          style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            borderRadius: '20px',
          }}
        >
          <Card.Body className="p-3">
            <div className="d-flex align-items-center justify-content-between">
              <Button
                variant="link"
                onClick={() => navigate('/')}
                className="text-dark p-0"
                style={{ fontSize: '24px', textDecoration: 'none' }}
              >
                <ArrowLeft />
              </Button>
              <div className="d-flex align-items-center">
                <div 
                  className="rounded-circle d-flex align-items-center justify-content-center me-2"
                  style={{
                    width: '40px',
                    height: '40px',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    fontSize: '18px',
                    color: 'white',
                    fontWeight: 'bold'
                  }}
                >
                  {user?.username?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div>
                  <h5 className="mb-0 fw-bold">{user?.username || 'My Posts'}</h5>
                  <small className="text-muted">{posts.length} posts</small>
                </div>
              </div>
              <Button
                variant="link"
                onClick={handleLogout}
                className="text-danger p-0"
                style={{ fontSize: '20px', textDecoration: 'none' }}
              >
                <GearFill />
              </Button>
            </div>
          </Card.Body>
        </Card>

        {/* Posts Section Title */}
        <div className="mb-3">
          <h4 className="text-white fw-bold">
            <GridFill className="me-2" />
            My Posts
          </h4>
        </div>

        {/* Posts Grid */}
        {loading ? (
          <Card 
            className="shadow-lg border-0 text-center py-5"
            style={{
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              borderRadius: '20px',
            }}
          >
            <Card.Body>
              <Spinner animation="border" variant="primary" size="lg" />
              <p className="mt-3 text-muted">Loading posts...</p>
            </Card.Body>
          </Card>
        ) : posts.length === 0 ? (
          <Card 
            className="shadow-lg border-0 text-center py-5"
            style={{
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              borderRadius: '20px',
            }}
          >
            <Card.Body>
              <GridFill size={60} className="text-muted mb-3" />
              <h5 className="text-muted">No posts yet</h5>
              <p className="text-muted mb-4">Start sharing your moments!</p>
              <Button
                onClick={() => navigate('/')}
                style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '10px 30px',
                  fontWeight: 'bold'
                }}
              >
                Create Post
              </Button>
            </Card.Body>
          </Card>
        ) : (
          <Row>
            {posts.map((post) => (
              <Col xs={12} key={post.id} className="mb-4">
                <PostCard post={post} onLikeToggle={fetchUserPosts} />
              </Col>
            ))}
          </Row>
        )}

        {/* Tabs removed - keeping it simple */}
        <Nav variant="tabs" className="mb-4 d-none" style={{ borderBottom: '2px solid rgba(255,255,255,0.3)' }}>
          <Nav.Item>
            <Nav.Link 
              active={activeTab === 'posts'}
              onClick={() => setActiveTab('liked')}
              className="d-flex align-items-center"
              style={{
                color: activeTab === 'liked' ? '#667eea' : 'white',
                fontWeight: activeTab === 'liked' ? 'bold' : 'normal',
                borderBottom: activeTab === 'liked' ? '3px solid #667eea' : 'none',
                background: 'transparent'
              }}
            >
              <BookmarkFill className="me-2" />
              Liked
            </Nav.Link>
          </Nav.Item>
        </Nav>

        {/* Posts Grid */}
        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="light" size="lg" />
          </div>
        ) : posts.length === 0 ? (
          <Card 
            className="shadow-lg border-0 text-center py-5"
            style={{
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              borderRadius: '20px',
            }}
          >
            <Card.Body>
              <GridFill size={60} className="text-muted mb-3" />
              <h5 className="text-muted">No posts yet</h5>
              <p className="text-muted mb-4">Start sharing your moments!</p>
              <Button
                onClick={() => navigate('/')}
                style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '10px 30px',
                  fontWeight: 'bold'
                }}
              >
                Create Post
              </Button>
            </Card.Body>
          </Card>
        ) : (
          <Row>
            {posts.map((post) => (
              <Col xs={12} key={post.id} className="mb-4">
                <PostCard post={post} onLikeToggle={fetchUserPosts} />
              </Col>
            ))}
          </Row>
        )}
      </Container>
    </div>
  );
};

export default Profile;
