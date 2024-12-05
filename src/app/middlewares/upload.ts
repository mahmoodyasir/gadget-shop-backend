import multer from "multer";

const storage = multer.memoryStorage();

const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        cb(null, true); 
    },
});

export default upload;
