const multer = require("multer");

const storage = multer.memoryStorage();

const upload = multer({
    storage,

    limits: {
        fileSize: 25 * 1024 * 1024 // 25mb
    },

    fileFilter: (req, file, result) => {
      if (!file.mimetype.startsWith("audio/")) return result(new Error("Only audio files allowed"));
  
      result(null, true);
    }

});

module.exports = upload;