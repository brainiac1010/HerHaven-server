const cloudinary = require('cloudinary').v2;

const cloud_name = process.env.CLOUDINARY_CLOUD_NAME;
const api_key = process.env.CLOUDINARY_API_KEY;
const api_secret = process.env.CLOUDINARY_API_SECRET;

// Check if all required environment variables are set
if (!cloud_name || !api_key || !api_secret) {
    console.error('Cloudinary configuration is missing required environment variables!');
    process.exit(1);
}

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dwz3a6w1k',
    api_key: process.env.CLOUDINARY_API_KEY || '957974451817988',
    api_secret: process.env.CLOUDINARY_API_SECRET || 'L_pwuh9sGZBOcHCbFYTJRSup8LQ'
  });

const opts = {
    overwrite: true,
    invalidate: true,
    resource_type: "auto", 
};

// Log Cloudinary config for debugging (remove in production)
//console.log("Cloudinary config:", cloud_name, api_key, api_secret);

module.exports = (image) => {
    return new Promise((resolve, reject) => {
        cloudinary.uploader.upload(image, opts, (error, result) => {
            if (error) {
                console.error("Cloudinary upload error:", error); 
                return reject({ message: error.message });
            }
            if (result && result.secure_url) {
                return resolve(result.secure_url); 
            }
            return reject({ message: 'Unknown error during upload' }); 
        });
    });
};
