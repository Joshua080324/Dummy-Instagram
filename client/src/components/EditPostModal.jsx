import { useState, useEffect } from 'react';
import { Modal, Form, Button, Spinner, Image, Row, Col, Carousel } from 'react-bootstrap';
import { ImageFill } from 'react-bootstrap-icons';
import Swal from 'sweetalert2';
import http from '../helpers/http';

const EditPostModal = ({ show, onHide, post, onPostUpdated }) => {
  const [content, setContent] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (post) {
      setContent(post.content || '');
      setCategoryId(post.CategoryId || '');
    }
  }, [post]);

  useEffect(() => {
    if (show) {
      fetchCategories();
    }
  }, [show]);

  const fetchCategories = async () => {
    try {
      const { data } = await http.get('/categories');
      setCategories(data);
    } catch (error) {
      // Fallback categories if API fails
      setCategories([
        { id: 1, name: 'Travel' },
        { id: 2, name: 'Food' },
        { id: 3, name: 'Fashion' },
        { id: 4, name: 'Technology' },
        { id: 5, name: 'Lifestyle' },
      ]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!content.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Content required',
        text: 'Please enter some content for your post',
        background: 'rgba(255, 255, 255, 0.95)',
        backdrop: 'rgba(102, 126, 234, 0.4)',
      });
      return;
    }

    try {
      setLoading(true);
      
      await http.put(`/posts/${post.id}`, {
        content,
        categoryId: categoryId || null,
        isPrivate: post.isPrivate
      });

      Swal.fire({
        icon: 'success',
        title: 'Post updated!',
        text: 'Your post has been updated successfully',
        timer: 1500,
        showConfirmButton: false,
        background: 'rgba(255, 255, 255, 0.95)',
        backdrop: 'rgba(102, 126, 234, 0.4)',
      });

      onPostUpdated();
      onHide();
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Update failed',
        text: error.response?.data?.message || 'Failed to update post',
        background: 'rgba(255, 255, 255, 0.95)',
        backdrop: 'rgba(102, 126, 234, 0.4)',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onHide();
    }
  };

  return (
    <Modal 
      show={show} 
      onHide={handleClose} 
      size="lg"
      centered
      className="edit-post-modal"
    >
      <Modal.Header 
        closeButton 
        className="border-0"
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white'
        }}
      >
        <Modal.Title className="fw-bold">Edit Post</Modal.Title>
      </Modal.Header>
      
      <Modal.Body className="p-4">
        <Form onSubmit={handleSubmit}>
          {/* Display Current Images (Read-only) */}
          {post?.Images && post.Images.length > 0 && (
            <Form.Group className="mb-4">
              <Form.Label className="fw-semibold">
                <ImageFill className="me-2" />
                Current Images
              </Form.Label>
              
              {post.Images.length === 1 ? (
                <div className="rounded overflow-hidden" style={{ maxHeight: '300px' }}>
                  <Image 
                    src={post.Images[0].imageUrl} 
                    alt="Post" 
                    className="w-100"
                    style={{ 
                      maxHeight: '300px', 
                      objectFit: 'cover',
                      border: '2px solid #667eea'
                    }}
                  />
                </div>
              ) : (
                <Carousel indicators controls className="rounded overflow-hidden">
                  {post.Images.map((image, index) => (
                    <Carousel.Item key={image.id || index}>
                      <img
                        src={image.imageUrl}
                        alt={`Post image ${index + 1}`}
                        className="d-block w-100"
                        style={{ 
                          maxHeight: '300px', 
                          objectFit: 'cover',
                          border: '2px solid #667eea'
                        }}
                      />
                    </Carousel.Item>
                  ))}
                </Carousel>
              )}
              <small className="text-muted d-block mt-2">
                Note: Images cannot be changed when editing. Only caption and category can be updated.
              </small>
            </Form.Group>
          )}

          {/* Caption */}
          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold">Caption</Form.Label>
            <Form.Control
              as="textarea"
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What's on your mind?"
              disabled={loading}
              className="instagram-input"
              style={{
                borderRadius: '12px',
                border: '2px solid #e0e0e0',
                resize: 'none'
              }}
            />
          </Form.Group>

          {/* Category */}
          <Form.Group className="mb-4">
            <Form.Label className="fw-semibold">Category</Form.Label>
            <Form.Select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              disabled={loading}
              className="instagram-input"
              style={{
                borderRadius: '12px',
                border: '2px solid #e0e0e0'
              }}
            >
              <option value="">Select a category (optional)</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          {/* Submit Buttons */}
          <div className="d-grid gap-2">
            <Button
              type="submit"
              disabled={loading}
              className="instagram-button py-3"
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none',
                borderRadius: '12px',
                fontWeight: 'bold'
              }}
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
                  Updating Post...
                </>
              ) : (
                'Update Post'
              )}
            </Button>
            <Button
              variant="secondary"
              onClick={handleClose}
              disabled={loading}
              className="py-3"
              style={{
                borderRadius: '12px',
                fontWeight: 'bold'
              }}
            >
              Cancel
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default EditPostModal;
