const express = require('express');
const multer = require('multer');
const jwt = require('jsonwebtoken');
const Image = require('../models/Image');
const path = require('path');
const fs = require('fs');

const router = express.Router();

// Auth middleware
const auth = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: 'Unauthorized' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Set up multer for local uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// POST: upload image
router.post('/upload', auth, upload.single('image'), async (req, res) => {
  try {
    const image = new Image({
      user: req.userId,
      filename: req.file.filename
    });
    await image.save();
    res.status(201).json({ message: 'Image uploaded successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET: fetch user's gallery
router.get('/', auth, async (req, res) => {
  try {
    const images = await Image.find({ user: req.userId });
    res.json(images);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
