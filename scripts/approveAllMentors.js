const mongoose = require('mongoose');
const Mentor = require('../models/Mentor');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://teja:gtejaiit18@cluster0.xjo4byx.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

async function approveAllMentors() {
  await mongoose.connect(MONGODB_URI);
  const res = await Mentor.updateMany({ 'verification.status': { $ne: 'approved' } }, { 'verification.status': 'approved' });
  console.log('Mentors updated:', res.modifiedCount);
  await mongoose.disconnect();
}

approveAllMentors().catch(err => { console.error(err); process.exit(1); }); 