import React, { useState } from 'react';
import axios from 'axios';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';

const MCATAttemptForm = ({ user, onAdded, attempts = [] }) => {
  const [form, setForm] = useState({
    date: '',
    scores: { chemPhys: '', cars: '', bioBiochem: '', psychSoc: '', total: '' },
  });
  const [dateError, setDateError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name in form.scores) {
      const newScores = { ...form.scores, [name]: value };
      // Auto-calculate total if all fields are numbers
      const total = ['chemPhys', 'cars', 'bioBiochem', 'psychSoc']
        .map(k => Number(newScores[k]) || 0)
        .reduce((a, b) => a + b, 0);
      setForm({ ...form, scores: { ...newScores, total: total ? total : '' } });
    } else {
      setForm({ ...form, [name]: value });
      if (name === 'date') setDateError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let parsedDate = require('dayjs')(form.date);
    if (!parsedDate.isValid()) {
      setDateError('Invalid date. Please use mm/dd/yyyy or yyyy-mm-dd.');
      return;
    }
    const token = await user.getIdToken();
    const { prepDetails, ...formToSend } = form;
    await axios.post('/api/profile/mcat-attempt', { ...formToSend, date: parsedDate.toISOString() }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    setForm({ date: '', scores: { chemPhys: '', cars: '', bioBiochem: '', psychSoc: '', total: '' } });
    if (onAdded) onAdded();
  };

  const isDisabled = attempts.length >= 6;

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} sm={6} md={2}>
          <TextField
            name="date"
            type="text"
            value={form.date}
            onChange={handleChange}
            required
            label="Date"
            InputLabelProps={{ shrink: true }}
            placeholder="mm/dd/yyyy or yyyy-mm-dd"
            fullWidth
            disabled={isDisabled}
            error={!!dateError}
            helperText={dateError}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={1.5}>
          <TextField
            name="chemPhys"
            value={form.scores.chemPhys}
            onChange={handleChange}
            label="Chem/Phys Score"
            fullWidth
            disabled={isDisabled}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={1.5}>
          <TextField
            name="cars"
            value={form.scores.cars}
            onChange={handleChange}
            label="CARS Score"
            fullWidth
            disabled={isDisabled}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={1.5}>
          <TextField
            name="bioBiochem"
            value={form.scores.bioBiochem}
            onChange={handleChange}
            label="Bio/Biochem Score"
            fullWidth
            disabled={isDisabled}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={1.5}>
          <TextField
            name="psychSoc"
            value={form.scores.psychSoc}
            onChange={handleChange}
            label="Psych/Soc Score"
            fullWidth
            disabled={isDisabled}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={1.5}>
          <TextField
            name="total"
            value={form.scores.total}
            label="Total Score"
            fullWidth
            InputProps={{ readOnly: true }}
          />
        </Grid>
        <Grid item xs={12} md={12} display="flex" justifyContent={{ xs: 'flex-start', md: 'flex-end' }}>
          <Button type="submit" variant="contained" color="primary" sx={{ minWidth: 180, fontWeight: 600, mt: { xs: 1, md: 0 } }} disabled={isDisabled}>
            Add MCAT Attempt
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};

export default MCATAttemptForm; 