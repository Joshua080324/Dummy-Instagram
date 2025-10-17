import { useState, useRef } from 'react';
import { Modal, Form, Button, Row, Col, Image, Spinner } from 'react-bootstrap';
import { XCircle, Upload, ImageFill } from 'react-bootstrap-icons';
import http from '../helpers/http';
import Swal from 'sweetalert2';

const CreatePostModal = ({ show, onHide, onPostCreated }) => {
  const [content, setContent] = useState('');
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [isPrivate, setIsPrivate] = useState(false);
  const [categoryId, setCategoryId] = useState('');
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  const categories = [
    { id: 1, name: 'Travel' },
    { id: 2, name: 'Food' },
    { id: 3, name: 'Fashion' },
    { id: 4, name: 'Technology' },
    { id: 5, name: 'Lifestyle' },
  ];

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    
    if (images.length + files.length > 5) {
      Swal.fire({
        icon: 'warning',
        title: 'Too many images',
        text: 'You can only upload up to 5 images per post',
      });
      return;
    }

    setImages([...images, ...files]);

    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews(prev => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
    setImagePreviews(imagePreviews.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (images.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'No images',
        text: 'Please select at least one image',
      });
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('content', content);
      formData.append('isPrivate', isPrivate);
      if (categoryId) formData.append('categoryId', categoryId);
      
      images.forEach(image => {
        formData.append('images', image);
      });

      const { data } = await http.post('/posts', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      Swal.fire({
        icon: 'success',
        title: 'Post Created!',
        text: 'Your post has been shared successfully',
        timer: 1500,
        showConfirmButton: false,
      });

      // Reset form
      setContent('');
      setImages([]);
      setImagePreviews([]);
      setIsPrivate(false);
      setCategoryId('');
      
      onHide();
      if (onPostCreated) onPostCreated();
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Failed to create post',
        text: error.response?.data?.message || 'Something went wrong',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal 
      show={show} 
      onHide={onHide} 
      size="lg" 
      centered
      className="create-post-modal"
    >
      <Modal.Header 
        closeButton 
        className="border-0"
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white'
        }}
      >
        <Modal.Title className="fw-bold">Create New Post</Modal.Title>
      </Modal.Header>
      
      <Modal.Body className="p-4">
        <Form onSubmit={handleSubmit}>
          {/* Image Upload Section */}
          <Form.Group className="mb-4">
            <Form.Label className="fw-semibold">
              <ImageFill className="me-2" />
              Upload Images (Max 5)
            </Form.Label>
            
            {/* Image Previews */}
            {imagePreviews.length > 0 && (
              <Row className="g-2 mb-3">
                {imagePreviews.map((preview, index) => (
                  <Col xs={6} md={4} key={index}>
                    <div className="position-relative">
                      <Image 
                        src={preview} 
                        alt={`Preview ${index + 1}`}
                        className="w-100 rounded"
                        style={{ 
                          height: '150px', 
                          objectFit: 'cover',
                          border: '2px solid #667eea'
                        }}
                      />
                      <Button
                        variant="danger"
                        size="sm"
                        className="position-absolute top-0 end-0 m-1"
                        onClick={() => removeImage(index)}
                        style={{ 
                          borderRadius: '50%', 
                          width: '30px', 
                          height: '30px',
                          padding: 0
                        }}
                      >
                        <XCircle />
                      </Button>
                    </div>
                  </Col>
                ))}
              </Row>
            )}

            {/* Upload Button */}
            {images.length < 5 && (
              <div
                className="border border-2 rounded p-4 text-center"
                style={{
                  borderStyle: 'dashed',
                  borderColor: '#667eea',
                  cursor: 'pointer',
                  background: 'rgba(102, 126, 234, 0.05)'
                }}
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload size={40} className="text-primary mb-2" />
                <p className="mb-0">Click to upload images</p>
                <small className="text-muted">
                  {images.length}/5 images selected
                </small>
              </div>
            )}
            
            <Form.Control
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageChange}
              className="d-none"
            />
          </Form.Group>

          {/* Caption */}
          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold">Caption</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write a caption..."
              className="instagram-input"
            />
          </Form.Group>

          {/* Category */}
          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold">Category</Form.Label>
            <Form.Select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="instagram-input"
            >
              <option value="">Select a category (optional)</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </Form.Select>
          </Form.Group>

          {/* Privacy Toggle */}
          <Form.Group className="mb-4">
            <Form.Check
              type="switch"
              id="privacy-switch"
              label="Make this post private"
              checked={isPrivate}
              onChange={(e) => setIsPrivate(e.target.checked)}
              className="fw-semibold"
            />
            <small className="text-muted ms-4">
              {isPrivate ? 'Only you can see this post' : 'Everyone can see this post'}
            </small>
          </Form.Group>

          {/* Submit Button */}
          <div className="d-grid gap-2">
            <Button
              type="submit"
              disabled={loading || images.length === 0}
              className="instagram-button py-3"
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
                  Creating Post...
                </>
              ) : (
                'Share Post'
              )}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default CreatePostModal;
