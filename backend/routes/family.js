// backend/routes/family.js
const express = require('express');
const FamilyMember = require('../models/FamilyMember');
const jwt = require('jsonwebtoken');
const router = express.Router();

// Middleware to verify user token
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (err) {
    res.status(403).json({ message: 'Invalid token' });
  }
};

// Add family member
router.post('/add', authMiddleware, async (req, res) => {
  const { name, relation, parent, birthDate } = req.body;
  try {
    const newMember = new FamilyMember({
      user: req.userId,
      name,
      relation,
      parent: parent || null,
      birthDate,
    });
    await newMember.save();
    res.status(201).json({ message: 'Family member added', member: newMember });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get family members of the logged-in user
router.get('/', authMiddleware, async (req, res) => {
  try {
    const members = await FamilyMember.find({ user: req.userId }).populate('parent');
    res.json(members);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

// Get upcoming birthdays (next 30 days)
router.get('/birthdays/upcoming', authMiddleware, async (req, res) => {
  try {
    const today = new Date();
    const future = new Date();
    future.setDate(today.getDate() + 30);

    const allMembers = await FamilyMember.find({ user: req.userId });

    // Filter members whose birthday is within the next 30 days
    const upcoming = allMembers.filter(member => {
      if (!member.birthDate) return false;

      const birthDate = new Date(member.birthDate);
      const thisYearBirthday = new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate());

      return thisYearBirthday >= today && thisYearBirthday <= future;
    });

    res.json(upcoming);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
