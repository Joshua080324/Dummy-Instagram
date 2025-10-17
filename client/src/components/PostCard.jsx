import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toggleLikeAsync, setLikeCount, setLikeState } from '../store/likesSlice';
import { Card, Carousel, Button, Dropdown, Spinner } from 'react-bootstrap';
import { Heart, HeartFill, ChatDots, Send, Bookmark, ThreeDotsVertical, PencilSquare, Trash } from 'react-bootstrap-icons';
import Swal from 'sweetalert2';

const PostCard = ({ post, onLikeToggle, onEdit, onDelete, showActions = false }) => {
  const dispatch = useDispatch();
  const isLiked = useSelector(state => state.likes.likedById[post.id]) || false;
  const likesCount = useSelector(state => state.likes.counts[post.id]) ?? (post.Likes?.length || 0);
  const isLikeLoading = useSelector(state => state.likes.loading[post.id]) || false;
  const [showFullCaption, setShowFullCaption] = useState(false);

  // Get current user ID from Redux
  const currentUser = useSelector(state => state.auth.user);
  const currentUserId = currentUser?.id;
  const isOwnPost = post.UserId === currentUserId;

  // Initialize redux like state on mount
  useEffect(() => {
    if (post && post.id) {
      dispatch(setLikeCount({ postId: post.id, count: post.Likes?.length || 0 }));
      
      if (currentUserId && post.Likes) {
        const liked = post.Likes.some(like => like.UserId === currentUserId);
        dispatch(setLikeState({ postId: post.id, liked }));
      }
    }
  }, [post, currentUserId, dispatch]);

  const handleLike = async () => {
    try {
      await dispatch(toggleLikeAsync(post.id)).unwrap();
      if (onLikeToggle) onLikeToggle(post.id);
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Failed to like post',
        text: error || 'Something went wrong',
        background: 'rgba(255, 255, 255, 0.95)',
        backdrop: 'rgba(102, 126, 234, 0.4)',
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
          <span className="badge bg-gradient-primary px-3 py-2 me-2" style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '20px'
          }}>
            {post.Category.name}
          </span>
        )}
        {showActions && isOwnPost && (
          <Dropdown align="end">
            <Dropdown.Toggle 
              variant="link" 
              className="p-0 text-dark"
              style={{ 
                fontSize: '20px',
                textDecoration: 'none',
                border: 'none',
                boxShadow: 'none'
              }}
            >
              <ThreeDotsVertical />
            </Dropdown.Toggle>

            <Dropdown.Menu>
              <Dropdown.Item onClick={() => onEdit(post)}>
                <PencilSquare className="me-2" />
                Edit Post
              </Dropdown.Item>
              <Dropdown.Item onClick={() => onDelete(post.id)} className="text-danger">
                <Trash className="me-2" />
                Delete Post
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
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
          {!isOwnPost && (
            <Button
              variant="link"
              className="p-0 me-3 text-decoration-none like-button"
              onClick={handleLike}
              disabled={isLikeLoading}
              style={{ fontSize: '24px', position: 'relative' }}
            >
              {isLikeLoading ? (
                <Spinner animation="border" size="sm" />
              ) : isLiked ? (
                <HeartFill className="text-danger heart-icon" />
              ) : (
                <Heart className="text-dark heart-icon" />
              )}
            </Button>
          )}
          {isOwnPost && (
            <div className="me-3" style={{ fontSize: '24px', opacity: 0.3 }}>
              <Heart className="text-muted" />
            </div>
          )}
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
