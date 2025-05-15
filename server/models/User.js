const mongoose = require('mongoose');

const MCATAttemptSchema = new mongoose.Schema({
  date: Date,
  scores: {
    chemPhys: Number,
    cars: Number,
    bioBiochem: Number,
    psychSoc: Number,
    total: Number
  },
  prepDetails: String
});

const ApplicationCycleSchema = new mongoose.Schema({
  year: Number,
  schoolsApplied: [String],
  outcomes: [{
    school: String,
    status: { type: String, enum: ['Accepted', 'Rejected', 'Waitlisted', 'Interview', 'Pending'] }
  }],
  notes: String
});

const UserSchema = new mongoose.Schema({
  uid: { type: String, required: true, unique: true },
  email: { type: String, required: true, immutable: true },
  name: { type: String, required: true, immutable: true },
  zipcode: String,
  gpa: {
    undergrad: {
      overall: Number,
      science: Number
    },
    grad: {
      overall: Number,
      science: Number
    }
  },
  degrees: {
    undergrad: [{ degree: String, school: String }],
    grad: [{ degree: String, school: String }]
  },
  mcatTarget: {
    chemPhys: Number,
    cars: Number,
    bioBiochem: Number,
    psychSoc: Number,
    total: Number
  },
  extracurriculars: {
    clinical: [{ organization: String, startDate: Date, endDate: Date, hours: Number }],
    research: [{ organization: String, startDate: Date, endDate: Date, hours: Number }],
    leadership: [{ organization: String, startDate: Date, endDate: Date, hours: Number }],
    community: [{ organization: String, startDate: Date, endDate: Date, hours: Number }]
  },
  mcatAttempts: [MCATAttemptSchema],
  applicationCycles: [ApplicationCycleSchema],
  profileComplete: { type: Boolean, default: false },
  practiceLogs: [{
    date: Date,
    section: { type: String, enum: ['chemPhys', 'cars', 'bioBiochem', 'psychSoc'] },
    subtopic: String,
    platform: String,
    rawScore: Number,
    totalQuestions: Number,
    scaledScore: Number,
    percent: Number
  }],
  sharedWith: [String]
});

module.exports = mongoose.model('User', UserSchema); 