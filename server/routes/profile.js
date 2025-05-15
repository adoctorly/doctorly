const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');

// Get user profile
router.get('/', auth, async (req, res) => {
  let user = await User.findOne({ uid: req.user.uid });
  if (!user) return res.status(404).json({ error: 'Profile not found' });
  if (!user.profileComplete) {
    user.profileComplete = true;
    await user.save();
    console.log('Profile marked complete on fetch:', user);
  }
  res.json(user);
});

// Create or update user profile
router.post('/', auth, async (req, res) => {
  const { name, email, zipcode, gpa, degrees, mcatTarget, extracurriculars } = req.body;
  let user = await User.findOne({ uid: req.user.uid });
  if (!user) {
    user = new User({
      uid: req.user.uid,
      email,
      name,
      zipcode,
      gpa,
      degrees,
      mcatTarget,
      extracurriculars,
      profileComplete: true
    });
  } else {
    // Do not allow editing name/email after creation
    user.zipcode = zipcode;
    user.gpa = gpa;
    user.degrees = degrees;
    user.mcatTarget = mcatTarget;
    user.extracurriculars = extracurriculars;
    user.profileComplete = true;
  }
  await user.save();
  console.log('Saved user:', user);
  res.json(user);
});

// Add MCAT attempt
router.post('/mcat-attempt', auth, async (req, res) => {
  const user = await User.findOne({ uid: req.user.uid });
  if (!user) return res.status(404).json({ error: 'Profile not found' });
  user.mcatAttempts.push(req.body);
  await user.save();
  res.json(user);
});

// Add application cycle
router.post('/application-cycle', auth, async (req, res) => {
  const user = await User.findOne({ uid: req.user.uid });
  if (!user) return res.status(404).json({ error: 'Profile not found' });
  user.applicationCycles.push(req.body);
  await user.save();
  res.json(user);
});

// Add practice log
router.post('/practice-log', auth, async (req, res) => {
  const user = await User.findOne({ uid: req.user.uid });
  if (!user) return res.status(404).json({ error: 'Profile not found' });

  const { date, section, subtopic, platform, rawScore, totalQuestions } = req.body;
  // Example: simple linear conversion, replace with real MCAT lookup if available
  const percent = totalQuestions ? Math.round((rawScore / totalQuestions) * 100) : 0;
  let scaledScore = 118 + Math.round((rawScore / totalQuestions) * 14); // MCAT sections: 118-132

  user.practiceLogs.push({
    date,
    section,
    subtopic,
    platform,
    rawScore,
    totalQuestions,
    scaledScore,
    percent
  });
  await user.save();
  res.json(user.practiceLogs[user.practiceLogs.length - 1]);
});

// Get all practice logs
router.get('/practice-logs', auth, async (req, res) => {
  const user = await User.findOne({ uid: req.user.uid });
  if (!user) return res.status(404).json({ error: 'Profile not found' });
  res.json(user.practiceLogs || []);
});

// Delete user profile and all data
router.delete('/', auth, async (req, res) => {
  try {
    await User.deleteOne({ uid: req.user.uid });
    res.json({ message: 'User data deleted successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete user data.' });
  }
});

// Share dashboard: update sharedWith list
router.post('/share', auth, async (req, res) => {
  const { emails } = req.body; // array of Gmail addresses
  if (!Array.isArray(emails)) return res.status(400).json({ error: 'Emails must be an array.' });
  const user = await User.findOne({ uid: req.user.uid });
  if (!user) return res.status(404).json({ error: 'Profile not found' });
  user.sharedWith = emails;
  await user.save();
  res.json({ sharedWith: user.sharedWith });
});

// Check if logged-in user can view shared dashboard
router.get('/:uid/shared', auth, async (req, res) => {
  const { uid } = req.params;
  const user = await User.findOne({ uid });
  if (!user) return res.status(404).json({ error: 'Profile not found' });
  const viewerEmail = req.user.email;
  const allowed = user.sharedWith && user.sharedWith.includes(viewerEmail);
  res.json({ allowed });
});

// Get public profile for sharing (read-only)
router.get('/:uid/public-profile', auth, async (req, res) => {
  const user = await User.findOne({ uid: req.params.uid });
  if (!user) return res.status(404).json({ error: 'Profile not found' });
  // Only return non-sensitive fields
  res.json({
    name: user.name,
    mcatTarget: user.mcatTarget,
    mcatAttempts: user.mcatAttempts,
    practiceLogs: user.practiceLogs,
    profileComplete: user.profileComplete
  });
});

// Get public practice logs for sharing
router.get('/:uid/public-practice-logs', auth, async (req, res) => {
  const user = await User.findOne({ uid: req.params.uid });
  if (!user) return res.status(404).json({ error: 'Profile not found' });
  res.json(user.practiceLogs || []);
});

// ECS (Extracurriculars/Clinical/Service) V2 Endpoints
router.get('/extracurricularsV2', auth, async (req, res) => {
  const user = await User.findOne({ uid: req.user.uid });
  if (!user) return res.status(404).json({ error: 'Profile not found' });
  res.json(user.extracurricularsV2 || []);
});

router.post('/extracurricularsV2', auth, async (req, res) => {
  const user = await User.findOne({ uid: req.user.uid });
  if (!user) return res.status(404).json({ error: 'Profile not found' });
  user.extracurricularsV2.push(req.body);
  await user.save();
  res.status(201).json(user.extracurricularsV2[user.extracurricularsV2.length - 1]);
});

router.put('/extracurricularsV2/:id', auth, async (req, res) => {
  const user = await User.findOne({ uid: req.user.uid });
  if (!user) return res.status(404).json({ error: 'Profile not found' });
  const ex = user.extracurricularsV2.id(req.params.id);
  if (!ex) return res.status(404).json({ message: 'Not found' });
  Object.assign(ex, req.body);
  await user.save();
  res.json(ex);
});

router.delete('/extracurricularsV2/:id', auth, async (req, res) => {
  const user = await User.findOne({ uid: req.user.uid });
  if (!user) return res.status(404).json({ error: 'Profile not found' });
  user.extracurricularsV2.id(req.params.id).remove();
  await user.save();
  res.status(204).end();
});

// ECS Targets Endpoints
router.get('/ecs-targets', auth, async (req, res) => {
  const user = await User.findOne({ uid: req.user.uid });
  if (!user) return res.status(404).json({ error: 'Profile not found' });
  res.json(user.ecsTargets || {});
});

router.put('/ecs-targets', auth, async (req, res) => {
  const user = await User.findOne({ uid: req.user.uid });
  if (!user) return res.status(404).json({ error: 'Profile not found' });
  user.ecsTargets = { ...user.ecsTargets, ...req.body };
  await user.save();
  res.json(user.ecsTargets);
});

module.exports = router; 