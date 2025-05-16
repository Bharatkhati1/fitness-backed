import fs from "fs";
import path from "path";

//multer upload files without validation, so if validation failed delete the uploaded files.
export const deleteUploadedFiles = (files) => {
    for (const file of files) {
      const filePath = path.join("./uploads", file.filename);
      fs.unlink(filePath, (err) => {
        if (err) console.error("Failed to delete file:", filePath, err);
      });
    }
};