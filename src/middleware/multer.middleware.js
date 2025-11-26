import multer from "multer";
import path from "path";
import fs from "fs";
import ApiError from "#src/utils/ApiError.js";
import { FILE_TYPES } from "#src/utils/constants.js";

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(process.cwd(), "public/uploads");

// Storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let uploadPath = uploadsDir;

    // Determine upload path based on file type
    const mimetype = file.mimetype;

    if (mimetype.startsWith("image/")) {
      uploadPath = path.join(
        uploadsDir,
        file.fieldname === "profileImage" || file.fieldname === "avatar"
          ? "profiles"
          : "images"
      );
    } else if (mimetype.startsWith("video/")) {
      uploadPath = path.join(uploadsDir, "videos");
    } else if (
      mimetype.includes("pdf") ||
      mimetype.includes("document") ||
      mimetype.includes("sheet") ||
      mimetype.includes("msword") ||
      mimetype.includes("ms-excel") ||
      mimetype.includes("text")
    ) {
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

// Create file filter based on type
const createFileFilter = (fileType = "ALL") => {
  return (req, file, cb) => {
    const typeConfig = FILE_TYPES[fileType.toUpperCase()];

    if (!typeConfig) {
      return cb(
        new ApiError(400, `Invalid file type configuration: ${fileType}`),
        false
      );
    }

    const extname = path.extname(file.originalname).toLowerCase().slice(1);
    const mimetype = file.mimetype;

    // Check extension
    const validExtension = typeConfig.extensions.test(extname);

    // Check mimetype (if specific mimetypes defined)
    const validMimetype =
      typeConfig.mimetypes.length === 0 ||
      typeConfig.mimetypes.includes(mimetype);

    if (validExtension && validMimetype) {
      cb(null, true);
    } else {
      cb(new ApiError(400, typeConfig.errorMessage), false);
    }
  };
};

// Create multer instance with specific file type
const createUploadInstance = (fileType = "ALL") => {
  const typeConfig = FILE_TYPES[fileType.toUpperCase()];

  return multer({
    storage: storage,
    fileFilter: createFileFilter(fileType),
    limits: {
      fileSize: typeConfig ? typeConfig.maxSize : 50 * 1024 * 1024,
    },
  });
};

// Middleware for mixed fields with different file types
export const uploadMixedFields = (fieldsConfig) => {
  /*
    fieldsConfig format:
    [
      { name: "profileImage", maxCount: 1, fileType: "IMAGE" },
      { name: "documents", maxCount: 5, fileType: "DOCUMENT" },
      { name: "videos", maxCount: 3, fileType: "VIDEO" }
    ]
  */
  return (req, res, next) => {
    // For mixed types, we'll use ALL and validate individually
    const upload = createUploadInstance("ALL");
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
        return next(new ApiError(400, `Upload error: ${err.message}`));
      } else if (err) {
        return next(err);
      }

      // Validate each field's file type
      if (req.files) {
        for (const fieldConfig of fieldsConfig) {
          const files = req.files[fieldConfig.name];
          if (files && files.length > 0) {
            const typeConfig = FILE_TYPES[fieldConfig.fileType.toUpperCase()];

            for (const file of files) {
              const ext = path
                .extname(file.originalname)
                .toLowerCase()
                .slice(1);
              const validExt = typeConfig.extensions.test(ext);
              const validMime =
                typeConfig.mimetypes.length === 0 ||
                typeConfig.mimetypes.includes(file.mimetype);

              if (!validExt || !validMime) {
                // Delete uploaded files
                files.forEach(
                  (f) => fs.existsSync(f.path) && fs.unlinkSync(f.path)
                );
                return next(
                  new ApiError(
                    400,
                    `${fieldConfig.name}: ${typeConfig.errorMessage}`
                  )
                );
              }

              // Add URL
              file.path = file.path.replace(/\\/g, "/");
              file.url = `/uploads/${path
                .relative(uploadsDir, file.path)
                .replace(/\\/g, "/")}`;
            }
          }
        }
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

// Utility function to delete multiple files
export const deleteFiles = (filePaths) => {
  const results = filePaths.map((filePath) => deleteFile(filePath));
  return results.every((result) => result === true);
};

// // Middleware for single file upload
// export const uploadSingle = (fieldName = "file", fileType = "ALL") => {
//   return (req, res, next) => {
//     const upload = createUploadInstance(fileType);
//     const singleUpload = upload.single(fieldName);

//     singleUpload(req, res, (err) => {
//       if (err instanceof multer.MulterError) {
//         if (err.code === "LIMIT_FILE_SIZE") {
//           const typeConfig = FILE_TYPES[fileType.toUpperCase()];
//           const maxSizeMB = typeConfig
//             ? (typeConfig.maxSize / (1024 * 1024)).toFixed(0)
//             : 50;
//           return next(
//             new ApiError(400, `File size should not exceed ${maxSizeMB}MB`)
//           );
//         }
//         return next(new ApiError(400, `Upload error: ${err.message}`));
//       } else if (err) {
//         return next(err);
//       }

//       // Add file path to request
//       if (req.file) {
//         req.file.path = req.file.path.replace(/\\/g, "/");
//         req.file.url = `/uploads/${path
//           .relative(uploadsDir, req.file.path)
//           .replace(/\\/g, "/")}`;
//       }

//       next();
//     });
//   };
// };

// // Middleware for multiple files upload (same field)
// export const uploadMultiple = (
//   fieldName = "files",
//   maxCount = 5,
//   fileType = "ALL"
// ) => {
//   return (req, res, next) => {
//     const upload = createUploadInstance(fileType);
//     const multipleUpload = upload.array(fieldName, maxCount);

//     multipleUpload(req, res, (err) => {
//       if (err instanceof multer.MulterError) {
//         if (err.code === "LIMIT_FILE_SIZE") {
//           const typeConfig = FILE_TYPES[fileType.toUpperCase()];
//           const maxSizeMB = typeConfig
//             ? (typeConfig.maxSize / (1024 * 1024)).toFixed(0)
//             : 50;
//           return next(
//             new ApiError(
//               400,
//               `File size should not exceed ${maxSizeMB}MB per file`
//             )
//           );
//         }
//         if (err.code === "LIMIT_UNEXPECTED_FILE") {
//           return next(
//             new ApiError(400, `Too many files. Maximum allowed: ${maxCount}`)
//           );
//         }
//         return next(new ApiError(400, `Upload error: ${err.message}`));
//       } else if (err) {
//         return next(err);
//       }

//       // Add file paths to request
//       if (req.files && req.files.length > 0) {
//         req.files = req.files.map((file) => {
//           file.path = file.path.replace(/\\/g, "/");
//           file.url = `/uploads/${path
//             .relative(uploadsDir, file.path)
//             .replace(/\\/g, "/")}`;
//           return file;
//         });
//       }

//       next();
//     });
//   };
// };

// // Middleware for multiple fields upload
// export const uploadFields = (fields, fileType = "ALL") => {
//   return (req, res, next) => {
//     const upload = createUploadInstance(fileType);
//     const fieldsUpload = upload.fields(fields);

//     fieldsUpload(req, res, (err) => {
//       if (err instanceof multer.MulterError) {
//         if (err.code === "LIMIT_FILE_SIZE") {
//           const typeConfig = FILE_TYPES[fileType.toUpperCase()];
//           const maxSizeMB = typeConfig
//             ? (typeConfig.maxSize / (1024 * 1024)).toFixed(0)
//             : 50;
//           return next(
//             new ApiError(
//               400,
//               `File size should not exceed ${maxSizeMB}MB per file`
//             )
//           );
//         }
//         return next(new ApiError(400, `Upload error: ${err.message}`));
//       } else if (err) {
//         return next(err);
//       }

//       // Add file paths to request
//       if (req.files) {
//         Object.keys(req.files).forEach((fieldName) => {
//           req.files[fieldName] = req.files[fieldName].map((file) => {
//             file.path = file.path.replace(/\\/g, "/");
//             file.url = `/uploads/${path
//               .relative(uploadsDir, file.path)
//               .replace(/\\/g, "/")}`;
//             return file;
//           });
//         });
//       }

//       next();
//     });
//   };
// };
