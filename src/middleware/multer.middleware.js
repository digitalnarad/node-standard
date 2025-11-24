import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import ApiError from "#src/utils/ApiError.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, "../../public/uploads");
const createUploadDirectories = () => {
  const dirs = [
    uploadsDir,
    path.join(uploadsDir, "profiles"),
    path.join(uploadsDir, "documents"),
    path.join(uploadsDir, "images"),
    path.join(uploadsDir, "others"),
  ];

  dirs.forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
};

createUploadDirectories();

// Storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let uploadPath = uploadsDir;

    // Determine upload path based on fieldname
    if (file.fieldname === "profileImage" || file.fieldname === "avatar") {
      uploadPath = path.join(uploadsDir, "profiles");
    } else if (
      file.fieldname === "document" ||
      file.fieldname === "documents"
    ) {
      uploadPath = path.join(uploadsDir, "documents");
    } else if (file.fieldname === "image" || file.fieldname === "images") {
      uploadPath = path.join(uploadsDir, "images");
    } else {
      uploadPath = path.join(uploadsDir, "others");
    }

    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    // Generate unique filename
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    const nameWithoutExt = path.basename(file.originalname, ext);
    const sanitizedName = nameWithoutExt.replace(/[^a-zA-Z0-9]/g, "_");

    cb(null, `${sanitizedName}-${uniqueSuffix}${ext}`);
  },
});

// File filter
const fileFilter = (req, file, cb) => {
  // Allowed file types
  const allowedImageTypes = /jpeg|jpg|png|gif|webp/;
  const allowedDocTypes = /pdf|doc|docx|xls|xlsx|txt/;
  const allowedVideoTypes = /mp4|avi|mov|wmv/;

  const extname = path.extname(file.originalname).toLowerCase().slice(1);
  const mimetype = file.mimetype;

  // Check file type based on mimetype and extension
  const isImage =
    allowedImageTypes.test(extname) && mimetype.startsWith("image/");
  const isDoc = allowedDocTypes.test(extname);
  const isVideo =
    allowedVideoTypes.test(extname) && mimetype.startsWith("video/");

  if (isImage || isDoc || isVideo) {
    cb(null, true);
  } else {
    cb(
      new ApiError(
        400,
        `Invalid file type. Allowed types: images (${allowedImageTypes.source}), documents (${allowedDocTypes.source}), videos (${allowedVideoTypes.source})`
      ),
      false
    );
  }
};

// Multer configuration
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max file size
  },
});

// Middleware for single file upload
export const uploadSingle = (fieldName = "file") => {
  return (req, res, next) => {
    const singleUpload = upload.single(fieldName);

    singleUpload(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
          return next(new ApiError(400, "File size should not exceed 10MB"));
        }
        return next(new ApiError(400, `Upload error: ${err.message}`));
      } else if (err) {
        return next(err);
      }

      // Add file path to request
      if (req.file) {
        req.file.path = req.file.path.replace(/\\/g, "/");
        req.file.url = `/uploads/${path
          .relative(uploadsDir, req.file.path)
          .replace(/\\/g, "/")}`;
      }

      next();
    });
  };
};

// Middleware for multiple files upload (same field)
export const uploadMultiple = (fieldName = "files", maxCount = 5) => {
  return (req, res, next) => {
    const multipleUpload = upload.array(fieldName, maxCount);

    multipleUpload(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
          return next(new ApiError(400, "File size should not exceed 10MB"));
        }
        if (err.code === "LIMIT_UNEXPECTED_FILE") {
          return next(
            new ApiError(400, `Too many files. Maximum allowed: ${maxCount}`)
          );
        }
        return next(new ApiError(400, `Upload error: ${err.message}`));
      } else if (err) {
        return next(err);
      }

      // Add file paths to request
      if (req.files && req.files.length > 0) {
        req.files = req.files.map((file) => {
          file.path = file.path.replace(/\\/g, "/");
          file.url = `/uploads/${path
            .relative(uploadsDir, file.path)
            .replace(/\\/g, "/")}`;
          return file;
        });
      }

      next();
    });
  };
};

// Middleware for multiple fields upload
export const uploadFields = (fields) => {
  return (req, res, next) => {
    const fieldsUpload = upload.fields(fields);

    fieldsUpload(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
          return next(new ApiError(400, "File size should not exceed 10MB"));
        }
        return next(new ApiError(400, `Upload error: ${err.message}`));
      } else if (err) {
        return next(err);
      }

      // Add file paths to request
      if (req.files) {
        Object.keys(req.files).forEach((fieldName) => {
          req.files[fieldName] = req.files[fieldName].map((file) => {
            file.path = file.path.replace(/\\/g, "/");
            file.url = `/uploads/${path
              .relative(uploadsDir, file.path)
              .replace(/\\/g, "/")}`;
            return file;
          });
        });
      }

      next();
    });
  };
};

// Utility function to delete file
export const deleteFile = (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return true;
    }
    return false;
  } catch (error) {
    console.error("Error deleting file:", error);
    return false;
  }
};

// Utility function to delete multiple files
export const deleteFiles = (filePaths) => {
  const results = filePaths.map((filePath) => deleteFile(filePath));
  return results.every((result) => result === true);
};
