

import fs from "fs";
import { v2 as cloudinary } from "cloudinary";


if (!process.env.CLOUDINARY_CLOUD_NAME ||
    !process.env.CLOUDINARY_API_KEY ||
    !process.env.CLOUDINARY_API_SECRET) {
  console.error('Missing Cloudinary configuration in environment variables');
  throw new Error('Cloudinary credentials not configured');
}


cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});


const uploadOnCloudinary = async (localFilePath) => {
  console.log(`Attempting upload from: ${localFilePath}`);

  try {
    if (!localFilePath) {
      console.error('No file path provided');
      return null;
    }

    if (!fs.existsSync(localFilePath)) {
      console.error(`File not found: ${localFilePath}`);
      return null;
    }

    console.log('Cloudinary config:', {
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY?.substring(0, 6) + '...',
      api_secret: process.env.CLOUDINARY_API_SECRET?.substring(0, 6) + '...'
    });

    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
      timeout: 30000 
    });

    console.log(`Cloudinary upload success: ${response.public_id}`);
    fs.unlinkSync(localFilePath);
    return response;

  } catch (error) {
    console.error('Cloudinary upload error:', {
      message: error.message,
      stack: error.stack,
      file: localFilePath
    });

    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }
    return null;
  }
};


const extractPublicIdFrom = (url) => {
  try {
    const match = url.match(/\/upload\/([^?#]+)/);
    if (!match || !match[1]) return null;
    let path = match[1];
    if (path.startsWith('v') && /^v\d+\//.test(path)) {
      path = path.replace(/^v\d+\//, '');
    }
    path = path.replace(/\.[^./?]+$/, '');
    return path;
  } catch (_) {
    return null;
  }
};


const cloudinaryDelete = async (fileUrl) => {
  if (!fileUrl) {
    console.log("No file URL provided for delete");
    return null;
  }
  try {
    const publicId = extractPublicIdFrom(fileUrl);
    if (!publicId) {
      console.log(`Could not extract public ID from URL: ${fileUrl}`);
      return null;
    }

    const resourceType = fileUrl.includes("/video/upload") ? "video" : "image";
    const deletionResult = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
      invalidate: true, 
    });

    return deletionResult;
  } catch (error) {
    console.log("Cloudinary deletion error: ", error);
    throw new Error(`Failed to delete file from Cloudinary: ${error.message}`);
  }
};

export { uploadOnCloudinary, cloudinaryDelete };
