const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_SECRET,
});

const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: "DummyInstagram_Posts",
        allowed_formats: ["jpg", "png", "jpeg"],
        transformation: [{ quality: "auto", fetch_format: "auto" }],
    },
});

const upload = multer({ storage });

module.exports = upload;