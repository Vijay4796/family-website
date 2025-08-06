// backend/models/FamilyMember.js
const mongoose = require('mongoose');

const familyMemberSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // link to the account
  name: { type: String, required: true },
  relation: { type: String },
  parent: { type: mongoose.Schema.Types.ObjectId, ref: 'FamilyMember', default: null }, // for tree structure
  birthDate: { type: Date },
});

module.exports = mongoose.model('FamilyMember', familyMemberSchema);
