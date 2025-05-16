
import multer from "multer";
import path from "path";

// Storage setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./uploads");
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + path.extname(file.originalname);
    cb(null, uniqueName);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only jpg, jpeg, and png files are allowed."), false);
  }
};

const limits = {
  fileSize: 5 * 1024 * 1024, 
};

const upload = multer({ storage, fileFilter, limits });

// Export different versions 
export const uploadSingle = (field) => upload.single(field);
export const uploadMultiple = (field, maxCount = 5) => upload.array(field, maxCount);
export const uploadFields = (fields) => upload.fields(fields); 
