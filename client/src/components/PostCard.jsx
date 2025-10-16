import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toggleLike, setLikeCount, setLikeState } from '../store/likesSlice';
import { Card, Carousel, Button } from 'react-bootstrap';
import { Heart, HeartFill, ChatDots, Send, Bookmark } from 'react-bootstrap-icons';
import http from '../helpers/http';
import Swal from 'sweetalert2';

const PostCard = ({ post, onLikeToggle }) => {
  const dispatch = useDispatch();
  const isLiked = useSelector(state => state.likes.likedById[post.id]) || false;
  const likesCount = useSelector(state => state.likes.counts[post.id]) ?? (post.Likes?.length || 0);
  const [showFullCaption, setShowFullCaption] = useState(false);

  // Initialize redux like state on mount
  useState(() => {
    if (post && post.id) {
      dispatch(setLikeCount({ postId: post.id, count: post.Likes?.length || 0 }));
      // naive liked detection: current user liked if Likes contains current user id
      const token = localStorage.getItem('access_token');
      if (token && post.Likes) {
        // decode token minimal (not verifying) to get id
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          const userId = payload.id;
          const liked = post.Likes.some(like => like.UserId === userId);
          dispatch(setLikeState({ postId: post.id, liked }));
        } catch (e) {
          // ignore
        }
      }
    }
  }, [post]);

  const handleLike = async () => {
    try {
      const { data } = await http.post(`/posts/${post.id}/like`);

      // Optimistically toggle redux state
      dispatch(toggleLike(post.id));
      if (onLikeToggle) onLikeToggle(post.id);
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Failed to like post',
        text: error.response?.data?.message || 'Something went wrong',
      });
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const truncateText = (text, maxLength = 100) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return showFullCaption ? text : `${text.substring(0, maxLength)}...`;
  };

  return (
    <Card className="mb-4 post-card border-0 shadow-sm">
      {/* Post Header */}
      <Card.Header className="bg-white border-0 d-flex align-items-center p-3">
        <div 
          className="rounded-circle d-flex align-items-center justify-content-center me-3"
          style={{
            width: '40px',
            height: '40px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            fontWeight: 'bold',
            fontSize: '16px'
          }}
        >
          {post.User?.username?.charAt(0).toUpperCase() || 'U'}
        </div>
        <div className="flex-grow-1">
          <div className="fw-bold">{post.User?.username || 'Unknown User'}</div>
          <small className="text-muted">{formatDate(post.createdAt)}</small>
        </div>
        {post.Category && (
          <span className="badge bg-gradient-primary px-3 py-2" style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '20px'
          }}>
            {post.Category.name}
          </span>
        )}
      </Card.Header>

      {/* Post Images Carousel */}
      {post.Images && post.Images.length > 0 && (
        <div className="post-images-container">
          {post.Images.length === 1 ? (
            <img 
              src={post.Images[0].imageUrl} 
              alt="Post" 
              className="w-100"
              style={{ 
                maxHeight: '600px', 
                objectFit: 'cover',
                cursor: 'pointer'
              }}
            />
          ) : (
            <Carousel indicators={post.Images.length > 1} controls={post.Images.length > 1}>
              {post.Images.map((image, index) => (
                <Carousel.Item key={image.id || index}>
                  <img
                    src={image.imageUrl}
                    alt={`Post image ${index + 1}`}
                    className="d-block w-100"
                    style={{ 
                      maxHeight: '600px', 
                      objectFit: 'cover'
                    }}
                  />
                </Carousel.Item>
              ))}
            </Carousel>
          )}
        </div>
      )}

      {/* Post Actions */}
      <Card.Body className="px-3 pt-3 pb-2">
        <div className="d-flex align-items-center mb-2">
          <Button
            variant="link"
            className="p-0 me-3 text-decoration-none like-button"
            onClick={handleLike}
            style={{ fontSize: '24px' }}
          >
            {isLiked ? (
              <HeartFill className="text-danger heart-icon" />
            ) : (
              <Heart className="text-dark heart-icon" />
            )}
          </Button>
          <Button
            variant="link"
            className="p-0 me-3 text-decoration-none text-dark"
            style={{ fontSize: '24px' }}
          >
            <ChatDots />
          </Button>
          <Button
            variant="link"
            className="p-0 me-auto text-decoration-none text-dark"
            style={{ fontSize: '24px' }}
          >
            <Send />
          </Button>
          <Button
            variant="link"
            className="p-0 text-decoration-none text-dark"
            style={{ fontSize: '24px' }}
          >
            <Bookmark />
          </Button>
        </div>

        {/* Likes Count */}
        {likesCount > 0 && (
          <div className="fw-bold mb-2">
            {likesCount} {likesCount === 1 ? 'like' : 'likes'}
          </div>
        )}

        {/* Post Caption */}
        {post.content && (
          <div className="mb-2">
            <span className="fw-bold me-2">{post.User?.username}</span>
            <span>{truncateText(post.content, 100)}</span>
            {post.content.length > 100 && (
              <button 
                className="btn btn-link p-0 text-muted text-decoration-none ms-1"
                onClick={() => setShowFullCaption(!showFullCaption)}
                style={{ fontSize: '14px' }}
              >
                {showFullCaption ? 'less' : 'more'}
              </button>
            )}
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default PostCard;
