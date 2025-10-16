import { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Card, Form, Button, Spinner, InputGroup, Badge } from 'react-bootstrap';
import { 
  Search, 
  Send, 
  ArrowLeft, 
  PersonCircle,
  CheckAll,
  Clock,
  EmojiSmile,
  PlusCircleFill
} from 'react-bootstrap-icons';
import { useNavigate } from 'react-router-dom';
import http from '../helpers/http';
import Swal from 'sweetalert2';
import StartChatModal from '../components/StartChatModal';
import DiscoverUsersModal from '../components/DiscoverUsersModal';

const Messages = () => {
  const navigate = useNavigate();
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showStartChatModal, setShowStartChatModal] = useState(false);
  const [showDiscoverModal, setShowDiscoverModal] = useState(false);
  const messagesEndRef = useRef(null);
  
  // Safe way to get current user ID
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
  
  const currentUserId = getCurrentUserId();

  // Fetch all user chats
  useEffect(() => {
    console.log('Messages component mounted');
    console.log('Current User ID:', currentUserId);
    
    if (!currentUserId) {
      console.error('No user ID found! Redirecting to login...');
      navigate('/login');
      return;
    }
    
    fetchChats();
  }, []);

  // Fetch messages when chat is selected
  useEffect(() => {
    if (selectedChat) {
      fetchMessages(selectedChat.id);
    }
  }, [selectedChat]);

  // Auto scroll to bottom
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchChats = async () => {
    try {
      setLoading(true);
      console.log('Fetching chats...');
      const { data } = await http.get('/chats');
      console.log('Chats received:', data);
      
      // Filter only non-AI chats
      const userChats = data.filter(chat => !chat.isAIChat);
      console.log('User chats (non-AI):', userChats);
      setChats(userChats);
    } catch (error) {
      console.error('Error fetching chats:', error);
      console.error('Error details:', error.response?.data);
      
      // Set empty array jika error (normal jika belum ada chat)
      setChats([]);
      
      // Only show error alert if it's not a server error
      if (error.response?.status !== 500) {
        Swal.fire({
          icon: 'info',
          title: 'No chats yet',
          text: 'Start a new conversation by clicking the "New Chat" button',
          background: 'rgba(255, 255, 255, 0.95)',
          backdrop: 'rgba(102, 126, 234, 0.4)',
          timer: 3000
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (chatId) => {
    try {
      console.log('Fetching messages for chat:', chatId);
      const { data } = await http.get(`/chats/${chatId}/messages`);
      console.log('Messages received:', data);
      setMessages(data);
    } catch (error) {
      console.error('Error fetching messages:', error);
      console.error('Error details:', error.response?.data);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedChat) return;

    try {
      setSending(true);
      const { data } = await http.post(`/chats/${selectedChat.id}/messages`, {
        content: newMessage.trim()
      });
      
      setMessages([...messages, data]);
      setNewMessage('');
      
      // Update chat list order
      fetchChats();
    } catch (error) {
      console.error('Error sending message:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to send message',
        background: 'rgba(255, 255, 255, 0.95)',
        backdrop: 'rgba(102, 126, 234, 0.4)'
      });
    } finally {
      setSending(false);
    }
  };

  const getPartner = (chat) => {
    if (!chat) return null;
    return chat.UserId === currentUserId ? chat.partner : chat.creator;
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const formatMessageTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const filteredChats = chats.filter(chat => {
    const partner = getPartner(chat);
    return partner?.username.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div style={{ 
      minHeight: '100vh',
      background: 'linear-gradient(-45deg, #667eea, #764ba2, #f093fb, #4facfe)',
      backgroundSize: '400% 400%',
      animation: 'gradient 15s ease infinite'
    }}>
      <Container fluid className="py-4" style={{ maxWidth: '1400px' }}>
        {/* Header */}
        <div className="d-flex align-items-center justify-content-between mb-4">
          <div className="d-flex align-items-center">
            <Button
              variant="link"
              onClick={() => navigate('/')}
              className="text-white p-0 me-3"
              style={{ fontSize: '28px', textDecoration: 'none' }}
            >
              <ArrowLeft />
            </Button>
            <h2 className="text-white mb-0 fw-bold">Messages</h2>
          </div>
          <div className="d-flex gap-2">
            <Button
              onClick={() => setShowDiscoverModal(true)}
              className="d-flex align-items-center fw-semibold"
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none',
                borderRadius: '12px',
                padding: '10px 20px',
                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)'
              }}
            >
              <PlusCircleFill className="me-2" size={20} />
              Discover Users
            </Button>
          </div>
        </div>

        <Row className="g-3">
          {/* Chat List Sidebar */}
          <Col lg={4} md={5}>
            <Card 
              className="shadow-lg border-0"
              style={{
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(20px)',
                borderRadius: '20px',
                height: '80vh',
                overflow: 'hidden'
              }}
            >
              <Card.Header 
                className="border-0 bg-transparent p-3"
                style={{ borderBottom: '2px solid rgba(102, 126, 234, 0.1)' }}
              >
                <h5 className="mb-3 fw-bold">Chats</h5>
                <InputGroup>
                  <InputGroup.Text 
                    className="bg-white border-0"
                    style={{ borderRadius: '15px 0 0 15px' }}
                  >
                    <Search />
                  </InputGroup.Text>
                  <Form.Control
                    type="text"
                    placeholder="Search conversations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="border-0"
                    style={{ borderRadius: '0 15px 15px 0' }}
                  />
                </InputGroup>
              </Card.Header>

              <Card.Body className="p-0 overflow-auto">
                {loading ? (
                  <div className="text-center py-5">
                    <Spinner animation="border" variant="primary" />
                  </div>
                ) : filteredChats.length === 0 ? (
                  <div className="text-center py-5 px-3">
                    <PersonCircle size={60} className="text-muted mb-3" />
                    <p className="text-muted">No conversations yet</p>
                    <small className="text-muted">Start chatting by clicking on a user's profile</small>
                  </div>
                ) : (
                  filteredChats.map((chat) => {
                    const partner = getPartner(chat);
                    return (
                      <div
                        key={chat.id}
                        onClick={() => setSelectedChat(chat)}
                        className="p-3 border-bottom"
                        style={{
                          cursor: 'pointer',
                          background: selectedChat?.id === chat.id 
                            ? 'linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1))'
                            : 'transparent',
                          transition: 'all 0.3s ease'
                        }}
                        onMouseEnter={(e) => {
                          if (selectedChat?.id !== chat.id) {
                            e.currentTarget.style.background = 'rgba(102, 126, 234, 0.05)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (selectedChat?.id !== chat.id) {
                            e.currentTarget.style.background = 'transparent';
                          }
                        }}
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
                            {partner?.username.charAt(0).toUpperCase()}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div className="d-flex justify-content-between align-items-center">
                              <h6 className="mb-0 fw-bold text-truncate">
                                {partner?.username}
                              </h6>
                              <small className="text-muted ms-2" style={{ fontSize: '11px' }}>
                                {formatTime(chat.updatedAt)}
                              </small>
                            </div>
                            <small className="text-muted text-truncate d-block">
                              Click to open chat
                            </small>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </Card.Body>
            </Card>
          </Col>

          {/* Chat Window */}
          <Col lg={8} md={7}>
            <Card 
              className="shadow-lg border-0"
              style={{
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(20px)',
                borderRadius: '20px',
                height: '80vh',
                overflow: 'hidden'
              }}
            >
              {!selectedChat ? (
                <div className="d-flex flex-column align-items-center justify-content-center h-100">
                  <EmojiSmile size={80} className="text-muted mb-3" />
                  <h4 className="text-muted mb-2">Select a conversation</h4>
                  <p className="text-muted">Choose a chat from the list to start messaging</p>
                </div>
              ) : (
                <>
                  {/* Chat Header */}
                  <Card.Header 
                    className="border-0 p-3"
                    style={{ 
                      background: 'linear-gradient(135deg, #667eea, #764ba2)',
                      borderRadius: '20px 20px 0 0'
                    }}
                  >
                    <div className="d-flex align-items-center">
                      <div
                        className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold me-3"
                        style={{
                          width: '45px',
                          height: '45px',
                          background: 'rgba(255, 255, 255, 0.3)',
                          backdropFilter: 'blur(10px)',
                          fontSize: '18px'
                        }}
                      >
                        {getPartner(selectedChat)?.username.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h6 className="mb-0 text-white fw-bold">
                          {getPartner(selectedChat)?.username}
                        </h6>
                        <small className="text-white" style={{ opacity: 0.9 }}>
                          Active now
                        </small>
                      </div>
                    </div>
                  </Card.Header>

                  {/* Messages Area */}
                  <Card.Body 
                    className="p-4 overflow-auto"
                    style={{ 
                      background: 'linear-gradient(to bottom, rgba(102, 126, 234, 0.03), rgba(118, 75, 162, 0.03))',
                      maxHeight: 'calc(80vh - 200px)'
                    }}
                  >
                    {messages.length === 0 ? (
                      <div className="text-center py-5">
                        <EmojiSmile size={50} className="text-muted mb-3" />
                        <p className="text-muted">No messages yet. Start the conversation!</p>
                      </div>
                    ) : (
                      messages.map((msg, index) => {
                        const isOwn = msg.senderId === currentUserId;
                        return (
                          <div
                            key={msg.id || index}
                            className={`mb-3 d-flex ${isOwn ? 'justify-content-end' : 'justify-content-start'}`}
                          >
                            <div
                              className="message-bubble"
                              style={{
                                maxWidth: '70%',
                                padding: '12px 18px',
                                borderRadius: isOwn ? '20px 20px 5px 20px' : '20px 20px 20px 5px',
                                background: isOwn
                                  ? 'linear-gradient(135deg, #667eea, #764ba2)'
                                  : 'white',
                                color: isOwn ? 'white' : '#333',
                                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                                border: isOwn ? 'none' : '1px solid rgba(102, 126, 234, 0.2)',
                                animation: 'fadeInUp 0.3s ease'
                              }}
                            >
                              <div style={{ 
                                whiteSpace: 'pre-wrap',
                                wordBreak: 'break-word',
                                lineHeight: '1.5',
                                marginBottom: '4px'
                              }}>
                                {msg.content}
                              </div>
                              <div className="d-flex align-items-center justify-content-end gap-1">
                                <small 
                                  style={{ 
                                    fontSize: '10px',
                                    opacity: isOwn ? 0.9 : 0.6
                                  }}
                                >
                                  {formatMessageTime(msg.createdAt)}
                                </small>
                                {isOwn && (
                                  <CheckAll size={14} style={{ opacity: 0.9 }} />
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                    <div ref={messagesEndRef} />
                  </Card.Body>

                  {/* Message Input */}
                  <Card.Footer 
                    className="border-0 p-3"
                    style={{ background: 'white' }}
                  >
                    <Form onSubmit={handleSendMessage}>
                      <div className="d-flex gap-2 align-items-end">
                        <Form.Control
                          as="textarea"
                          rows={2}
                          placeholder="Type a message..."
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          disabled={sending}
                          style={{ 
                            flex: 1,
                            borderRadius: '20px',
                            resize: 'none',
                            padding: '12px 18px',
                            fontSize: '15px',
                            lineHeight: '1.5',
                            border: '2px solid #e0e0e0',
                            transition: 'all 0.3s ease',
                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
                          }}
                          onFocus={(e) => {
                            e.target.style.borderColor = '#667eea';
                            e.target.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.15)';
                          }}
                          onBlur={(e) => {
                            e.target.style.borderColor = '#e0e0e0';
                            e.target.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.05)';
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleSendMessage(e);
                            }
                          }}
                        />
                        <Button
                          type="submit"
                          disabled={!newMessage.trim() || sending}
                          className="rounded-circle mb-1"
                          style={{
                            width: '50px',
                            height: '50px',
                            minWidth: '50px',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            border: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                            boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
                            transition: 'all 0.3s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.transform = 'scale(1.05)';
                            e.target.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.5)';
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.transform = 'scale(1)';
                            e.target.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.4)';
                          }}
                        >
                          {sending ? (
                            <Spinner animation="border" size="sm" />
                          ) : (
                            <Send size={20} />
                          )}
                        </Button>
                      </div>
                      <small className="text-muted d-block mt-2 ms-1">
                        💡 Press <strong>Enter</strong> to send, <strong>Shift + Enter</strong> for new line
                      </small>
                    </Form>
                  </Card.Footer>
                </>
              )}
            </Card>
          </Col>
        </Row>
      </Container>

      {/* Start Chat Modal */}
      <StartChatModal 
        show={showStartChatModal} 
        handleClose={() => {
          setShowStartChatModal(false);
          fetchChats(); // Refresh chats after closing modal
        }} 
      />

      <DiscoverUsersModal
        show={showDiscoverModal}
        onHide={() => setShowDiscoverModal(false)}
        onChatCreated={() => {
          setShowDiscoverModal(false);
          fetchChats(); // Refresh chat list when new chat is created
        }}
      />
    </div>
  );
};

export default Messages;
