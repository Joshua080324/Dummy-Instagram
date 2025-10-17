import { useState, useEffect } from 'react';
import { Modal, Form, Button, Spinner, ListGroup } from 'react-bootstrap';
import { PersonCircle, Search } from 'react-bootstrap-icons';
import http from '../helpers/http';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';

const StartChatModal = ({ show, onHide }) => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [creating, setCreating] = useState(false);
  
  // Safe way to get current user ID
  const getCurrentUserId = () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return null;
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.id;
    } catch (error) {
      return null;
    }
  };
  
  const currentUserId = getCurrentUserId();

  useEffect(() => {
    if (show) {
      fetchUsers();
    }
  }, [show]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      // Fetch posts to get unique users
      const { data } = await http.get('/posts');
      
      // Extract unique users from posts (excluding current user)
      const uniqueUsers = [];
      const userIds = new Set();
      
      data.forEach(post => {
        if (post.User && post.User.id !== currentUserId && !userIds.has(post.User.id)) {
          userIds.add(post.User.id);
          uniqueUsers.push({
            id: post.User.id,
            username: post.User.username,
            email: post.User.email
          });
        }
      });

      setUsers(uniqueUsers);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const handleStartChat = async (partnerId) => {
    try {
      setCreating(true);
      const { data } = await http.post('/chats', { partnerId });
      
      Swal.fire({
        icon: 'success',
        title: 'Chat started!',
        timer: 1500,
        showConfirmButton: false,
        background: 'rgba(255, 255, 255, 0.95)',
        backdrop: 'rgba(102, 126, 234, 0.4)'
      });

      onHide();
      navigate('/messages');
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || 'Failed to start chat',
        background: 'rgba(255, 255, 255, 0.95)',
        backdrop: 'rgba(102, 126, 234, 0.4)'
      });
    } finally {
      setCreating(false);
    }
  };

  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Modal show={show} onHide={onHide} centered size="md">
      <Modal.Header 
        closeButton
        style={{
          background: 'linear-gradient(135deg, #667eea, #764ba2)',
          border: 'none'
        }}
      >
        <Modal.Title className="text-white fw-bold">Start New Chat</Modal.Title>
      </Modal.Header>
      <Modal.Body className="p-4">
        {/* Search Bar */}
        <Form.Group className="mb-3">
          <div className="position-relative">
            <Search 
              className="position-absolute text-muted"
              style={{ left: '15px', top: '50%', transform: 'translateY(-50%)' }}
            />
            <Form.Control
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="ps-5"
              style={{
                borderRadius: '15px',
                border: '2px solid #e0e0e0',
                padding: '12px 12px 12px 45px'
              }}
            />
          </div>
        </Form.Group>

        {/* Users List */}
        <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-3 text-muted">Loading users...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-5">
              <PersonCircle size={60} className="text-muted mb-3" />
              <p className="text-muted">
                {searchQuery ? 'No users found' : 'No users available'}
              </p>
            </div>
          ) : (
            <ListGroup variant="flush">
              {filteredUsers.map((user) => (
                <ListGroup.Item
                  key={user.id}
                  className="border-0 px-0 py-3"
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleStartChat(user.id)}
                >
                  <div className="d-flex align-items-center">
                    <div
                      className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold me-3"
                      style={{
                        width: '50px',
                        height: '50px',
                        background: 'linear-gradient(135deg, #667eea, #764ba2)',
                        fontSize: '20px',
                        flexShrink: 0
                      }}
                    >
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                    <div style={{ flex: 1 }}>
                      <h6 className="mb-0 fw-bold">{user.username}</h6>
                      <small className="text-muted">{user.email}</small>
                    </div>
                    <Button
                      size="sm"
                      disabled={creating}
                      style={{
                        background: 'linear-gradient(135deg, #667eea, #764ba2)',
                        border: 'none',
                        borderRadius: '10px',
                        padding: '6px 16px'
                      }}
                    >
                      Chat
                    </Button>
                  </div>
                </ListGroup.Item>
              ))}
            </ListGroup>
          )}
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default StartChatModal;
