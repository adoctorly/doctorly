import React, { useState } from 'react';
import axios from 'axios';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import Grid from '@mui/material/Grid';
import dayjs from 'dayjs';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';

const sections = [
  { value: 'chemPhys', label: 'Chem/Phys' },
  { value: 'cars', label: 'CARS' },
  { value: 'bioBiochem', label: 'Bio/Biochem' },
  { value: 'psychSoc', label: 'Psych/Soc' }
];

const platforms = ['AAMC', 'UWorld', 'Kaplan', 'Princeton Review', 'Other'];

// Mapping of MCAT sections to subtopics
const sectionSubtopics = {
  chemPhys: [
    "Atomic Theory and Chemical Composition",
    "Interactions of Chemical Substances",
    "Thermodynamics, Kinetics & Gas Laws",
    "Solutions and Electrochemistry",
    "Introduction to Organic Chemistry",
    "Functional Groups and Their Reactions",
    "Separation Techniques, Spectroscopy, and Analytical Methods",
    "Mechanics and Energy",
    "Fluids",
    "Electrostatics and Circuits",
    "Light and Sound",
    "Thermodynamics"
  ],
  cars: [
    "Humanities",
    "Social Sciences"
  ],
  bioBiochem: [
    "Molecular Biology",
    "Cellular Biology",
    "Genetics and Evolution",
    "Reproduction",
    "Endocrine and Nervous Systems",
    "Circulation and Respiration",
    "Digestion and Excretion",
    "Musculoskeletal System",
    "Skin and Immune Systems",
    "Amino Acids and Proteins",
    "Enzymes",
    "Carbohydrates, Nucleotides, and Lipids",
    "Metabolic Reactions",
    "Biochemistry Lab Techniques"
  ],
  psychSoc: [
    "Sensation, Perception, and Consciousness",
    "Learning, Memory, and Cognition",
    "Motivation, Emotion, Attitudes, Personality, and Stress",
    "Identity and Social Interaction",
    "Demographics and Social Structure"
  ]
};

const PracticeLogForm = ({ user, onAdded }) => {
  const [form, setForm] = useState({
    date: '',
    section: 'chemPhys',
    subtopic: '',
    platform: 'UWorld',
    rawScore: '',
    totalQuestions: ''
  });
  const [dateError, setDateError] = useState('');
  const [loading, setLoading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    if (name === 'date') setDateError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Parse date
    let parsedDate = dayjs(form.date);
    if (!parsedDate.isValid()) {
      setDateError('Invalid date. Please use mm/dd/yyyy or yyyy-mm-dd.');
      return;
    }
    setLoading(true);
    try {
      const token = await user.getIdToken();
      await axios.post('/api/profile/practice-log', { ...form, date: parsedDate.toISOString() }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setForm({ date: '', section: 'chemPhys', subtopic: '', platform: 'UWorld', rawScore: '', totalQuestions: '' });
      if (onAdded) onAdded();
      setSnackbarOpen(true);
      setErrorMsg('');
    } catch (err) {
      setErrorMsg(err?.response?.data?.message || 'Failed to log practice/test. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} sm={6} md={2.5}>
          <TextField
            name="date"
            type="text"
            value={form.date}
            onChange={handleChange}
            required
            label="Date"
            InputLabelProps={{ shrink: true }}
            placeholder="mm/dd/yyyy or yyyy-mm-dd"
            autoFocus
            fullWidth
            error={!!dateError}
            helperText={dateError}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <FormControl fullWidth>
            <InputLabel id="section-label">Section</InputLabel>
            <Select
              labelId="section-label"
              name="section"
              value={form.section}
              label="Section"
              onChange={handleChange}
            >
              {sections.map(s => (
                <MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <TextField
            select
            name="subtopic"
            value={form.subtopic}
            onChange={handleChange}
            label="Subtopic"
            fullWidth
          >
            {(sectionSubtopics[form.section] || []).map((sub, idx) => (
              <MenuItem key={idx} value={sub}>{sub}</MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <FormControl fullWidth>
            <InputLabel id="platform-label">Platform</InputLabel>
            <Select
              labelId="platform-label"
              name="platform"
              value={form.platform}
              label="Platform"
              onChange={handleChange}
            >
              {platforms.map(p => (
                <MenuItem key={p} value={p}>{p}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6} md={1.5}>
          <TextField
            name="rawScore"
            type="number"
            value={form.rawScore}
            onChange={handleChange}
            label="Raw Score"
            required
            fullWidth
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <TextField
            name="totalQuestions"
            type="number"
            value={form.totalQuestions}
            onChange={handleChange}
            label="Total Questions"
            required
            fullWidth
          />
        </Grid>
        <Grid item xs={12} md={12} display="flex" justifyContent={{ xs: 'flex-start', md: 'flex-end' }}>
          <Button type="submit" variant="contained" color="primary" sx={{ minWidth: 180, fontWeight: 600, mt: { xs: 1, md: 0 } }}>
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Log Practice/Test'}
          </Button>
        </Grid>
      </Grid>
      <Snackbar open={snackbarOpen} autoHideDuration={3000} onClose={() => setSnackbarOpen(false)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={() => setSnackbarOpen(false)} severity="success" sx={{ width: '100%' }}>
          Practice/Test log added!
        </Alert>
      </Snackbar>
      <Snackbar open={!!errorMsg} autoHideDuration={4000} onClose={() => setErrorMsg('')} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={() => setErrorMsg('')} severity="error" sx={{ width: '100%' }}>
          {errorMsg}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default PracticeLogForm; 