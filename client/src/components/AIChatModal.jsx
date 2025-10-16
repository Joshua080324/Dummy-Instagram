import { useState, useEffect, useRef } from 'react';
import { Modal, Form, Button, ListGroup, Badge, Spinner } from 'react-bootstrap';
import { ChatDotsFill, Send, Robot, XCircle } from 'react-bootstrap-icons';
import http from '../helpers/http';
import Swal from 'sweetalert2';

const AIChatModal = ({ show, onHide }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [chatId, setChatId] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (show) {
      initializeChat();
    }
  }, [show]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const initializeChat = async () => {
    try {
      setLoading(true);
      // Create or get AI chat
      const { data: chat } = await http.post('/chats/ai');
      setChatId(chat.id);
      
      // Load existing messages
      const { data: msgs } = await http.get(`/chats/${chat.id}/messages`);
      setMessages(msgs);
      
      // Welcome message if no messages
      if (msgs.length === 0) {
        setMessages([{
          id: 'welcome',
          content: "Hello! I'm your AI assistant. How can I help you today? 🤖",
          senderId: null,
          createdAt: new Date().toISOString()
        }]);
      }
    } catch (error) {
      console.error('Error initializing chat:', error);
      Swal.fire({
        icon: 'error',
        title: 'Failed to start chat',
        text: error.response?.data?.message || 'Something went wrong',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !chatId) return;

    const messageContent = newMessage.trim();
    setNewMessage('');
    setSending(true);

    // Add user message to UI immediately
    const userMsg = {
      id: Date.now(),
      content: messageContent,
      senderId: 'user',
      createdAt: new Date().toISOString()
    };
    setMessages(prev => [...prev, userMsg]);

    try {
      // Send message to backend
      const { data: aiResponse } = await http.post(`/chats/${chatId}/messages`, {
        content: messageContent
      });

      // Add AI response to messages
      setMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      console.error('Error sending message:', error);
      Swal.fire({
        icon: 'error',
        title: 'Failed to send message',
        text: error.response?.data?.message || 'Something went wrong',
        toast: true,
        position: 'top-end',
        timer: 3000,
        showConfirmButton: false
      });
    } finally {
      setSending(false);
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Modal 
      show={show} 
      onHide={onHide}
      size="lg"
      centered
      className="ai-chat-modal"
    >
      <Modal.Header 
        className="border-0"
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white'
        }}
      >
        <Modal.Title className="d-flex align-items-center fw-bold">
          <Robot size={28} className="me-2" />
          AI Assistant
        </Modal.Title>
        <Button 
          variant="link" 
          onClick={onHide}
          className="text-white p-0"
          style={{ fontSize: '24px' }}
        >
          <XCircle />
        </Button>
      </Modal.Header>

      <Modal.Body 
        className="p-0"
        style={{ 
          height: '500px',
          background: 'rgba(255, 255, 255, 0.95)'
        }}
      >
        {/* Messages Container */}
        <div 
          className="p-3 overflow-auto h-100"
          style={{ 
            background: 'linear-gradient(to bottom, rgba(102, 126, 234, 0.05), rgba(118, 75, 162, 0.05))'
          }}
        >
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-3 text-muted">Starting chat...</p>
            </div>
          ) : (
            <>
              {messages.map((msg, index) => (
                <div
                  key={msg.id || index}
                  className={`mb-3 d-flex ${msg.senderId === null ? 'justify-content-start' : 'justify-content-end'}`}
                >
                  <div
                    className="message-bubble"
                    style={{
                      maxWidth: '75%',
                      padding: '12px 16px',
                      borderRadius: '16px',
                      background: msg.senderId === null
                        ? 'white'
                        : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: msg.senderId === null ? '#333' : 'white',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                      animation: 'fadeInUp 0.3s ease',
                      border: msg.senderId === null ? '1px solid rgba(102, 126, 234, 0.2)' : 'none'
                    }}
                  >
                    {msg.senderId === null && (
                      <div className="d-flex align-items-center mb-2">
                        <Robot size={16} className="me-2" style={{ color: '#667eea' }} />
                        <small className="fw-bold" style={{ color: '#667eea' }}>AI Assistant</small>
                      </div>
                    )}
                    <div style={{ 
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                      lineHeight: '1.5'
                    }}>
                      {msg.content}
                    </div>
                    <small 
                      className="d-block mt-1 text-end"
                      style={{ 
                        opacity: 0.7,
                        fontSize: '11px'
                      }}
                    >
                      {formatTime(msg.createdAt)}
                    </small>
                  </div>
                </div>
              ))}
              {sending && (
                <div className="mb-3 d-flex justify-content-start">
                  <div
                    className="message-bubble"
                    style={{
                      padding: '12px 16px',
                      borderRadius: '16px',
                      background: 'white',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                      border: '1px solid rgba(102, 126, 234, 0.2)'
                    }}
                  >
                    <div className="typing-indicator">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>
      </Modal.Body>

      <Modal.Footer 
        className="border-0 p-3"
        style={{ background: 'white' }}
      >
        <Form onSubmit={handleSendMessage} className="w-100">
          <div className="d-flex gap-2 align-items-end">
            <Form.Control
              as="textarea"
              rows={3}
              placeholder="Type your message here... (Press Enter to send, Shift+Enter for new line)"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              disabled={sending || loading}
              style={{ 
                flex: 1,
                borderRadius: '20px',
                resize: 'none',
                padding: '15px 20px',
                fontSize: '16px',
                lineHeight: '1.5',
                border: '2px solid #e0e0e0',
                transition: 'all 0.3s ease',
                minHeight: '90px',
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
              disabled={!newMessage.trim() || sending || loading}
              className="rounded-circle mb-1"
              style={{
                width: '55px',
                height: '55px',
                minWidth: '55px',
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
                <Send size={24} />
              )}
            </Button>
          </div>
          <small className="text-muted d-block mt-2 ms-1">
            💡 Tip: Press <strong>Enter</strong> to send, <strong>Shift + Enter</strong> for new line
          </small>
        </Form>
      </Modal.Footer>
    </Modal>
  );
};

export default AIChatModal;
