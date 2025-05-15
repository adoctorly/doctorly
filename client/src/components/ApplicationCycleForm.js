import React, { useState } from 'react';
import axios from 'axios';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';

const outcomeOptions = [
  'Accepted',
  'Rejected',
  'Waitlisted',
  'Interview',
  'Pending'
];

const ApplicationCycleForm = ({ user, onAdded, cycles = [] }) => {
  const [form, setForm] = useState({
    year: '',
    schools: [ { school: '', outcome: '' } ]
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSchoolChange = (idx, field, value) => {
    const schools = [...form.schools];
    schools[idx][field] = value;
    setForm({ ...form, schools });
  };

  const addSchool = () => {
    if (form.schools.length < 50) {
      setForm({ ...form, schools: [...form.schools, { school: '', outcome: '' }] });
    }
  };

  const removeSchool = (idx) => {
    if (form.schools.length > 1) {
      setForm({ ...form, schools: form.schools.filter((_, i) => i !== idx) });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = await user.getIdToken();
    // Only include non-empty schools
    const outcomes = form.schools.filter(s => s.school.trim()).map(s => ({ school: s.school.trim(), status: s.outcome }));
    await axios.post('/api/profile/application-cycle', {
      year: form.year,
      schoolsApplied: outcomes.map(o => o.school),
      outcomes
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    setForm({ year: '', schools: [ { school: '', outcome: '' } ] });
    if (onAdded) onAdded();
  };

  const isDisabled = cycles.length >= 6;

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} sm={3} md={2}>
          <TextField
            name="year"
            value={form.year}
            onChange={handleChange}
            label="Year"
            fullWidth
            disabled={isDisabled}
          />
        </Grid>
        <Grid item xs={12} sm={9} md={10}>
          <Grid container spacing={1} alignItems="center">
            {form.schools.map((entry, idx) => (
              <React.Fragment key={idx}>
                <Grid item xs={12} sm={6} md={5}>
                  <TextField
                    value={entry.school}
                    onChange={e => handleSchoolChange(idx, 'school', e.target.value)}
                    label={`School ${idx + 1}`}
                    fullWidth
                    disabled={isDisabled}
                  />
                </Grid>
                <Grid item xs={10} sm={5} md={5}>
                  <FormControl fullWidth>
                    <InputLabel>Outcome</InputLabel>
                    <Select
                      value={entry.outcome}
                      label="Outcome"
                      onChange={e => handleSchoolChange(idx, 'outcome', e.target.value)}
                      disabled={isDisabled}
                    >
                      {outcomeOptions.map(opt => (
                        <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={2} sm={2} md={2} display="flex" alignItems="center">
                  <IconButton onClick={() => removeSchool(idx)} disabled={form.schools.length === 1 || isDisabled} size="small">
                    <RemoveIcon />
                  </IconButton>
                  {idx === form.schools.length - 1 && form.schools.length < 50 && !isDisabled && (
                    <IconButton onClick={addSchool} size="small">
                      <AddIcon />
                    </IconButton>
                  )}
                </Grid>
              </React.Fragment>
            ))}
          </Grid>
        </Grid>
        <Grid item xs={12} md={12} display="flex" justifyContent={{ xs: 'flex-start', md: 'flex-end' }}>
          <Button type="submit" variant="contained" color="primary" sx={{ minWidth: 180, fontWeight: 600, mt: { xs: 1, md: 0 } }} disabled={isDisabled}>
            Add Application Cycle
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ApplicationCycleForm; 