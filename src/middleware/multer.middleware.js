import multer from "multer";
import path from "path";
import fs from "fs";
import ApiError from "#src/utils/ApiError.js";
import { FILE_TYPES } from "#src/utils/constants.js";

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(process.cwd(), "public/uploads");

// Storage configuration
const storage = (fieldsConfig) => {
  return multer.diskStorage({
    destination: function (req, file, cb) {
      let uploadPath = uploadsDir;

      // Determine upload path based on file type
      const fileType =
        fieldsConfig
          .find((fc) => fc.name === file.fieldname)
          .fileType.toUpperCase() || "OTHER";

      if (fileType === "IMAGE") {
        uploadPath = path.join(
          uploadsDir,
          file.fieldname === "profileImage" || file.fieldname === "avatar"
            ? "profiles"
            : "images"
        );
      } else if (fileType === "VIDEO") {
        uploadPath = path.join(uploadsDir, "videos");
      } else if (fileType === "DOCUMENT") {
        uploadPath = path.join(uploadsDir, "documents");
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
};

// Create file filter based on type
const fileFilter = (fieldsConfig) => {
  return (req, file, cb) => {
    const fieldConfig = fieldsConfig.find((fc) => fc.name === file.fieldname);

    if (!fieldConfig) {
      return cb(
        new ApiError(400, `Unexpected field: ${file.fieldname}`),
        false
      );
    }

    const typeConfig = FILE_TYPES[fieldConfig.fileType.toUpperCase()];
    if (!typeConfig) {
      return cb(
        new ApiError(
          500,
          `Invalid file type configuration for field: ${file.fieldname}`
        ),
        false
      );
    }

    const extname = path.extname(file.originalname).toLowerCase().slice(1);
    const mimetype = file.mimetype;

    const validExtension = typeConfig.extensions.test(extname);
    const validMimetype =
      typeConfig.mimetypes.length === 0 ||
      typeConfig.mimetypes.includes(mimetype);

    if (!validExtension || !validMimetype) {
      return cb(
        new ApiError(400, `${fieldConfig.name}: ${typeConfig.errorMessage}`),
        false
      );
    }

    cb(null, true);
  };
};

// Middleware for mixed fields with different file types
export const uploadMixedFields = (fieldsConfig) => {
  return (req, res, next) => {
    const maxFileSize = Math.max(
      ...fieldsConfig.map((fc) => FILE_TYPES[fc.fileType.toUpperCase()].maxSize)
    );

    const upload = multer({
      storage: storage(fieldsConfig),
      fileFilter: fileFilter(fieldsConfig),
      limits: {
        fileSize: maxFileSize, // Global limit (largest of all fields)
      },
    });

    const fields = fieldsConfig.map(({ name, maxCount }) => ({
      name,
      maxCount,
    }));
    const fieldsUpload = upload.fields(fields);

    fieldsUpload(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
          return next(new ApiError(400, "File size exceeded the limit"));
        }
        if (err.code === "LIMIT_UNEXPECTED_FILE") {
          return next(
            new ApiError(400, `Unexpected file or too many files: ${err.field}`)
          );
        }
        return next(new ApiError(400, `Upload error: ${err.message}`));
      } else if (err) {
        return next(err);
      }

      // Add URL to files
      if (req.files) {
        Object.keys(req.files).forEach((fieldName) => {
          req.files[fieldName].forEach((file) => {
            file.path = file.path.replace(/\\/g, "/");
            file.url = `/uploads/${path
              .relative(uploadsDir, file.path)
              .replace(/\\/g, "/")}`;
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
      console.log("File deleted successfully:", filePath);
      return true;
    }
    console.warn("File not found:", filePath);
    return false;
  } catch (error) {
    console.error("Error deleting file:", error);
    return false;
  }
};
