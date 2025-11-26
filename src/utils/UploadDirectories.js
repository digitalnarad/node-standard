import path from "path";
import fs from "fs";

const uploadsDir = path.join(process.cwd(), "public/uploads");

// Create uploads directory if it doesn't exist
(() => {
  const dirs = [
    uploadsDir,
    path.join(uploadsDir, "profiles"),
    path.join(uploadsDir, "documents"),
    path.join(uploadsDir, "images"),
    path.join(uploadsDir, "videos"),
    path.join(uploadsDir, "others"),
  ];

  dirs.forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
})();
