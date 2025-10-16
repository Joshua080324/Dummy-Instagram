import { useState, useEffect } from 'react';
import { Modal, ListGroup, Button, Spinner, Form, InputGroup } from 'react-bootstrap';
import { PersonPlus, Search } from 'react-bootstrap-icons';
import http from '../helpers/http';
import Swal from 'sweetalert2';

const DiscoverUsersModal = ({ show, onHide, onChatCreated }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [creatingChat, setCreatingChat] = useState(null);

  useEffect(() => {
    if (show) {
      fetchUsers();
    }
  }, [show]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // Get users from posts (users who have posted)
      const { data: posts } = await http.get('/posts');
      
      // Extract unique users
      const uniqueUsers = [];
      const userIds = new Set();
      
      posts.forEach(post => {
        if (post.User && !userIds.has(post.User.id)) {
          userIds.add(post.User.id);
          uniqueUsers.push(post.User);
        }
      });

      // Get current user ID to filter out
      const token = localStorage.getItem('access_token');
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          const currentUserId = payload.id;
          setUsers(uniqueUsers.filter(u => u.id !== currentUserId));
        } catch (e) {
          setUsers(uniqueUsers);
        }
      } else {
        setUsers(uniqueUsers);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      Swal.fire({
        icon: 'error',
        title: 'Failed to load users',
        text: error.response?.data?.message || 'Something went wrong',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStartChat = async (userId) => {
    setCreatingChat(userId);
    try {
      const { data } = await http.post('/chats', { partnerId: userId });
      
      Swal.fire({
        icon: 'success',
        title: 'Chat created!',
        text: 'You can now start messaging',
        timer: 1500,
        showConfirmButton: false
      });

      if (onChatCreated) {
        onChatCreated(data);
      }
      
      onHide();
    } catch (error) {
      console.error('Error creating chat:', error);
      Swal.fire({
        icon: 'error',
        title: 'Failed to create chat',
        text: error.response?.data?.message || 'Something went wrong',
      });
    } finally {
      setCreatingChat(null);
    }
  };

  const filteredUsers = users.filter(user => 
    user.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Modal show={show} onHide={onHide} centered size="lg">
      <Modal.Header closeButton className="border-0">
        <Modal.Title className="d-flex align-items-center">
          <PersonPlus className="me-2" size={24} />
          Discover Users
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="p-0">
        {/* Search Bar */}
        <div className="p-3 border-bottom">
          <InputGroup>
            <InputGroup.Text className="bg-light border-end-0">
              <Search />
            </InputGroup.Text>
            <Form.Control
              type="text"
              placeholder="Search users by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border-start-0 ps-0"
            />
          </InputGroup>
        </div>

        {/* Users List */}
        <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-3 text-muted">Loading users...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-5">
              <PersonPlus size={48} className="text-muted mb-3" />
              <p className="text-muted">
                {searchQuery ? 'No users found matching your search' : 'No users available'}
              </p>
            </div>
          ) : (
            <ListGroup variant="flush">
              {filteredUsers.map((user) => (
                <ListGroup.Item 
                  key={user.id}
                  className="d-flex align-items-center justify-content-between py-3 px-4 hover-bg-light"
                  style={{ transition: 'background-color 0.2s' }}
                >
                  <div className="d-flex align-items-center">
                    {/* Avatar */}
                    <div 
                      className="rounded-circle d-flex align-items-center justify-content-center me-3"
                      style={{
                        width: '50px',
                        height: '50px',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        fontWeight: 'bold',
                        fontSize: '20px'
                      }}
                    >
                      {user.username?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    
                    {/* User Info */}
                    <div>
                      <div className="fw-bold">{user.username || 'Unknown User'}</div>
                      <small className="text-muted">{user.email}</small>
                    </div>
                  </div>

                  {/* Start Chat Button */}
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleStartChat(user.id)}
                    disabled={creatingChat === user.id}
                    className="px-3"
                    style={{
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      border: 'none'
                    }}
                  >
                    {creatingChat === user.id ? (
                      <>
                        <Spinner
                          as="span"
                          animation="border"
                          size="sm"
                          role="status"
                          aria-hidden="true"
                          className="me-2"
                        />
                        Starting...
                      </>
                    ) : (
                      <>
                        <PersonPlus size={16} className="me-1" />
                        Start Chat
                      </>
                    )}
                  </Button>
                </ListGroup.Item>
              ))}
            </ListGroup>
          )}
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default DiscoverUsersModal;
