const multer = require('multer');

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads');
    },
    filename: function (req, file, cd) {
        cd(null, new Date().toISOString() + file.originalname)
    }
});

module.exports = multer({ storage: storage });