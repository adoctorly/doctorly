import React, { useEffect, useState } from 'react';
import api from '../api';
import { Box, Typography, Button, Table, TableHead, TableRow, TableCell, TableBody, Dialog, DialogTitle, DialogContent, TextField, DialogActions, MenuItem, Paper, Accordion, AccordionSummary, AccordionDetails, Stack } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useNavigate } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { auth } from '../firebase';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import ErrorIcon from '@mui/icons-material/Error';
import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';
import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

const types = [
  { value: 'clinical', label: 'Clinical' },
  { value: 'research', label: 'Research' },
  { value: 'leadership', label: 'Leadership' },
  { value: 'community', label: 'Community' }
];

const ECSDashboard = ({ profile }) => {
  const [entries, setEntries] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ type: '', organization: '', role: '', startDate: '', endDate: '', hours: '', description: '' });
  const [recommendations, setRecommendations] = useState([]);
  const [targets, setTargets] = useState({ clinical: 100, research: 100, leadership: 100, community: 100 });
  const [targetsLoading, setTargetsLoading] = useState(true);
  const [targetsChanged, setTargetsChanged] = useState(false);
  const [summaryStats, setSummaryStats] = useState({ clinical: 0, research: 0, leadership: 0, community: 0 });
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  const fetchTargets = async () => {
    setTargetsLoading(true);
    const user = auth.currentUser;
    if (!user) return;
    const token = await user.getIdToken();
    const res = await api.get('/api/profile/ecs-targets', {
      headers: { Authorization: `Bearer ${token}` }
    });
    setTargets(res.data || { clinical: 100, research: 100, leadership: 100, community: 100 });
    setTargetsLoading(false);
  };

  const saveTargets = async () => {
    const user = auth.currentUser;
    if (!user) return;
    const token = await user.getIdToken();
    await api.put('/api/profile/ecs-targets', targets, {
      headers: { Authorization: `Bearer ${token}` }
    });
    setTargetsChanged(false);
    fetchEntries(); // recalculate recommendations
  };

  const handleTargetChange = (e) => {
    setTargets({ ...targets, [e.target.name]: Number(e.target.value) });
    setTargetsChanged(true);
  };

  const fetchEntries = async () => {
    const user = auth.currentUser;
    if (!user) return;
    const token = await user.getIdToken();
    const res = await api.get('/api/profile/extracurricularsV2', {
      headers: { Authorization: `Bearer ${token}` }
    });
    setEntries(res.data);
    calculateRecommendations(res.data, targets);
  };

  // Always recalculate recommendations and summary stats when entries, targets, or profile change
  useEffect(() => {
    if (!targetsLoading) calculateRecommendations(entries, targets);
    // eslint-disable-next-line
  }, [entries, targets, profile, targetsLoading]);

  const calculateRecommendations = (data, customTargets = targets) => {
    const totals = { clinical: 0, research: 0, leadership: 0, community: 0 };
    // Add ECS tracked entries
    data.forEach(e => {
      if (e.type && e.hours) {
        totals[e.type] += Number(e.hours);
      }
    });
    // Add profile extracurriculars
    if (profile && profile.extracurriculars) {
      Object.keys(totals).forEach(type => {
        (profile.extracurriculars[type] || []).forEach(exp => {
          if (exp.hours) totals[type] += Number(exp.hours);
        });
      });
    }
    setSummaryStats(totals);
    const recs = [];
    Object.keys(customTargets).forEach(type => {
      let status = 'lacking';
      let icon = <ErrorIcon color="error" sx={{ mr: 1 }} />;
      let color = 'error';
      if (totals[type] >= customTargets[type]) {
        status = 'exceeding';
        icon = <CheckCircleIcon color="success" sx={{ mr: 1 }} />;
        color = 'success';
      } else if (totals[type] >= customTargets[type] * 0.8) {
        status = 'ontrack';
        icon = <WarningAmberIcon color="warning" sx={{ mr: 1 }} />;
        color = 'warning';
      }
      recs.push({
        type,
        total: totals[type],
        target: customTargets[type],
        status,
        icon,
        color,
        msg:
          status === 'exceeding'
            ? `Great job! You have ${totals[type]} hours in ${type} (target: ${customTargets[type]}).`
            : status === 'ontrack'
            ? `You're on track in ${type}: ${totals[type]} hours (target: ${customTargets[type]}).`
            : `You have logged ${totals[type]} hours in ${type}. Aim for at least ${customTargets[type]} hours to strengthen your application.`
      });
    });
    setRecommendations(recs);
  };

  useEffect(() => { fetchTargets(); }, []);
  useEffect(() => { if (!targetsLoading) fetchEntries(); }, [targetsLoading]);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user) return;
    const token = await user.getIdToken();
    await api.post('/api/profile/extracurricularsV2', form, {
      headers: { Authorization: `Bearer ${token}` }
    });
    setOpen(false);
    setForm({ type: '', organization: '', role: '', startDate: '', endDate: '', hours: '', description: '' });
    fetchEntries();
  };

  // Render profile experiences if available
  const renderProfileExperiences = () => {
    if (!profile || !profile.extracurriculars) return null;
    return (
      <Accordion sx={{ mb: 3, bgcolor: '#f3e5f5' }} defaultExpanded={false}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>Profile Experiences</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            These are activities you entered during profile setup. They are for your reference and are not included in tracked entries below, but ARE included in your recommendations.
          </Typography>
          <Stack direction="column" spacing={2}>
            {Object.keys(profile.extracurriculars).map(type => (
              <Accordion key={type} defaultExpanded sx={{ bgcolor: '#ede7f6' }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="subtitle1" fontWeight={700}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Organization</TableCell>
                        <TableCell>Start</TableCell>
                        <TableCell>End</TableCell>
                        <TableCell>Hours</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {(profile.extracurriculars[type] || []).map((exp, idx) => (
                        <TableRow key={idx}>
                          <TableCell>{exp.organization}</TableCell>
                          <TableCell>{exp.startDate ? new Date(exp.startDate).toLocaleDateString() : ''}</TableCell>
                          <TableCell>{exp.endDate ? new Date(exp.endDate).toLocaleDateString() : ''}</TableCell>
                          <TableCell>{exp.hours}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </AccordionDetails>
              </Accordion>
            ))}
          </Stack>
        </AccordionDetails>
      </Accordion>
    );
  };

  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  return (
    <Box sx={{ p: 4, maxWidth: '1200px', mx: 'auto' }}>
      {/* Centered Title, Greeting, and Profile Icon */}
      <Box display="flex" flexDirection="column" alignItems="center" mb={4} position="relative">
        <Typography variant="h2" fontWeight={800} color="primary" gutterBottom sx={{ letterSpacing: 1, textAlign: 'center' }}>
          Doctorly Dashboard
        </Typography>
        <Typography variant="h5" color="textSecondary" gutterBottom sx={{ textAlign: 'center' }}>
          Hello, {profile?.name || profile?.email || 'User'}
        </Typography>
        <Box position="absolute" right={0} top={0}>
          <IconButton onClick={handleMenuOpen} size="large">
            {profile?.photoURL ? <Avatar src={profile.photoURL} /> : <AccountCircleIcon fontSize="large" />}
          </IconButton>
          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
            <MenuItem onClick={() => { navigate('/'); handleMenuClose(); }}>Home</MenuItem>
            <MenuItem onClick={handleMenuClose}>Profile (coming soon)</MenuItem>
            <MenuItem onClick={handleMenuClose}>Sign Out (coming soon)</MenuItem>
          </Menu>
        </Box>
      </Box>
      <Stack direction="row" alignItems="center" spacing={2} mb={2}>
        <Button startIcon={<ArrowBackIcon />} variant="outlined" onClick={() => navigate('/')}>Back to Dashboard</Button>
        <Typography variant="h4" fontWeight={700} flexGrow={1}>Extracurricular & Service Hours</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpen(true)}>
          Add Entry
        </Button>
      </Stack>
      {renderProfileExperiences()}
      {/* Targets Section */}
      <Paper sx={{ p: 2, mb: 3, bgcolor: '#fffde7' }}>
        <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>Set Your Hour Targets</Typography>
        <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
          These targets are used for recommendations below. You can update them at any time.
        </Typography>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          {Object.keys(targets).map(type => (
            <TextField
              key={type}
              label={type.charAt(0).toUpperCase() + type.slice(1)}
              name={type}
              type="number"
              value={targets[type]}
              onChange={handleTargetChange}
              InputProps={{ inputProps: { min: 0 } }}
              sx={{ width: 120 }}
            />
          ))}
          <Button variant="contained" onClick={saveTargets} disabled={!targetsChanged} sx={{ height: 40 }}>
            Save Targets
          </Button>
        </Stack>
      </Paper>
      {/* Summary Stats Section */}
      <Paper sx={{ p: 2, mb: 3, bgcolor: '#e8f5e9' }}>
        <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>Summary Stats</Typography>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          {Object.keys(summaryStats).map(type => (
            <Chip
              key={type}
              icon={<CheckCircleIcon color="primary" />}
              label={`${type.charAt(0).toUpperCase() + type.slice(1)}: ${summaryStats[type]} hrs`}
              sx={{ fontWeight: 600, fontSize: 16, bgcolor: '#fff' }}
            />
          ))}
        </Stack>
      </Paper>
      {/* Recommendations Section */}
      <Paper sx={{ p: 2, mb: 3, bgcolor: '#e3f2fd' }}>
        <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>Recommendations</Typography>
        <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
          Based on your total hours (profile + tracked entries) compared to your targets. Color-coded: <Chip icon={<CheckCircleIcon color="success" />} label="Exceeding" size="small" sx={{ bgcolor: '#e8f5e9', mr: 1 }} /> <Chip icon={<WarningAmberIcon color="warning" />} label="On Track" size="small" sx={{ bgcolor: '#fffde7', mr: 1 }} /> <Chip icon={<ErrorIcon color="error" />} label="Lacking" size="small" sx={{ bgcolor: '#ffebee' }} />
        </Typography>
        <Stack spacing={1}>
          {recommendations.map((rec, idx) => (
            <Alert key={idx} severity={rec.color} icon={rec.icon} sx={{ fontWeight: 500, alignItems: 'center' }}>
              {rec.msg}
            </Alert>
          ))}
        </Stack>
      </Paper>
      <Accordion defaultExpanded sx={{ mb: 3 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6" fontWeight={700} color="primary">
            All Entries
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            These are your tracked extracurricular, clinical, research, leadership, and community service activities. Only these entries count toward your recommendations above.
          </Typography>
          <Paper>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Type</TableCell>
                  <TableCell>Organization</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Start</TableCell>
                  <TableCell>End</TableCell>
                  <TableCell>Hours</TableCell>
                  <TableCell>Description</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {entries.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
                      No entries yet. Add new activities using the button above.
                    </TableCell>
                  </TableRow>
                ) : (
                  entries.map(e => (
                    <TableRow key={e._id}>
                      <TableCell>{e.type}</TableCell>
                      <TableCell>{e.organization}</TableCell>
                      <TableCell>{e.role}</TableCell>
                      <TableCell>{e.startDate ? new Date(e.startDate).toLocaleDateString() : ''}</TableCell>
                      <TableCell>{e.endDate ? new Date(e.endDate).toLocaleDateString() : ''}</TableCell>
                      <TableCell>{e.hours}</TableCell>
                      <TableCell>{e.description}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Paper>
        </AccordionDetails>
      </Accordion>
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Extracurricular/Service Entry</DialogTitle>
        <DialogContent>
          <form onSubmit={handleSubmit}>
            <Stack spacing={2} mt={1}>
              <TextField select label="Type" name="type" value={form.type} onChange={handleChange} fullWidth required>
                {types.map(t => <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>)}
              </TextField>
              <TextField label="Organization" name="organization" value={form.organization} onChange={handleChange} fullWidth required />
              <TextField label="Role" name="role" value={form.role} onChange={handleChange} fullWidth />
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField label="Start Date" name="startDate" type="date" value={form.startDate} onChange={handleChange} fullWidth InputLabelProps={{ shrink: true }} />
                <TextField label="End Date" name="endDate" type="date" value={form.endDate} onChange={handleChange} fullWidth InputLabelProps={{ shrink: true }} />
              </Stack>
              <TextField label="Hours" name="hours" type="number" value={form.hours} onChange={handleChange} fullWidth required />
              <TextField label="Description" name="description" value={form.description} onChange={handleChange} fullWidth multiline rows={2} />
            </Stack>
            <DialogActions sx={{ mt: 2 }}>
              <Button onClick={() => setOpen(false)} color="secondary">Cancel</Button>
              <Button type="submit" variant="contained">Save</Button>
            </DialogActions>
          </form>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default ECSDashboard; 