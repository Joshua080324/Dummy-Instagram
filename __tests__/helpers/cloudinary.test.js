const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

jest.mock('cloudinary', () => {
  const mockConfig = jest.fn();
  return {
    v2: {
      config: mockConfig,
    },
  };
});

jest.mock('multer-storage-cloudinary', () => {
  return {
    CloudinaryStorage: jest.fn().mockImplementation((config) => {
      return {
        _handleFile: jest.fn(),
        _removeFile: jest.fn(),
        ...config
      };
    })
  };
});

jest.mock('multer', () => {
  return jest.fn().mockReturnValue('mockMulter');
});

describe('Cloudinary Config', () => {
  let cloudinary;
  let CloudinaryStorage;
  let multer;

  beforeEach(() => {
    // Set up environment variables
    process.env.CLOUDINARY_CLOUD_NAME = 'test-cloud';
    process.env.CLOUDINARY_API_KEY = 'test-key';
    process.env.CLOUDINARY_SECRET = 'test-secret';
    jest.resetModules();

    cloudinary = require('cloudinary');
    CloudinaryStorage = require('multer-storage-cloudinary').CloudinaryStorage;
    multer = require('multer');
  });

  afterEach(() => {
    jest.clearAllMocks();
    delete process.env.CLOUDINARY_CLOUD_NAME;
    delete process.env.CLOUDINARY_API_KEY;
    delete process.env.CLOUDINARY_SECRET;
  });

  test('should configure cloudinary with correct credentials', () => {
    require('../../helpers/cloudinary');

    expect(cloudinary.v2.config).toHaveBeenCalledWith({
      cloud_name: 'test-cloud',
      api_key: 'test-key',
      api_secret: 'test-secret'
    });
  });

  test('should configure CloudinaryStorage with correct parameters', () => {
    require('../../helpers/cloudinary');

    expect(CloudinaryStorage).toHaveBeenCalledWith({
      cloudinary: cloudinary.v2,
      params: {
        folder: 'DummyInstagram_Posts',
        allowed_formats: ['jpg', 'png', 'jpeg'],
        transformation: [{ quality: 'auto', fetch_format: 'auto' }]
      }
    });
  });

  test('should configure multer with CloudinaryStorage instance', () => {
    require('../../helpers/cloudinary');

    expect(multer).toHaveBeenCalled();
    const multerCallArgs = multer.mock.calls[0][0];
    expect(multerCallArgs).toHaveProperty('storage');
    expect(multerCallArgs.storage).toBeTruthy();
  });

  test('should export multer instance', () => {
    const upload = require('../../helpers/cloudinary');
    expect(upload).toBe('mockMulter');
  });
});