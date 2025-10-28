const express = require('express');
const ffmpegController = require('../controllers/ffmpegController');
const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

// Nova rota modificada
router.post('/processar-video', upload.single('video'), ffmpegController.processarVideo);

module.exports = router;