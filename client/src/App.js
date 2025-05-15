import React, { useState, useEffect } from 'react';
import SignIn from './components/SignIn';
import ProfileSetup from './components/ProfileSetup';
import MCATAttemptForm from './components/MCATAttemptForm';
import ApplicationCycleForm from './components/ApplicationCycleForm';
import MCATAttemptsHistory from './components/MCATAttemptsHistory';
import ApplicationCyclesHistory from './components/ApplicationCyclesHistory';
import PracticeLogForm from './components/PracticeLogForm';
import PracticeLogsHistory, { PracticeLogsModalTable } from './components/PracticeLogsHistory';
import ProgressDashboard from './components/ProgressDashboard';
import PracticeTrendsChart from './components/PracticeTrendsChart';
import { auth } from './firebase';
import api from './api';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ScienceIcon from '@mui/icons-material/Science';
import HistoryIcon from '@mui/icons-material/History';
import SchoolIcon from '@mui/icons-material/School';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import PlaylistAddCheckIcon from '@mui/icons-material/PlaylistAddCheck';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CloseIcon from '@mui/icons-material/Close';
import TextField from '@mui/material/TextField';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { Routes, Route } from 'react-router-dom';
import SharedDashboard from './components/SharedDashboard';
import PracticeSummary from './components/PracticeSummary';
import dayjs from 'dayjs';
import StreaksHeatmap from './components/StreaksHeatmap';
import PersonalBests from './components/PersonalBests';
import MilestoneBadges from './components/MilestoneBadges';
import SectionInsights from './components/SectionInsights';
import InsightsIcon from '@mui/icons-material/Insights';
import EmojiObjectsIcon from '@mui/icons-material/EmojiObjects';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import PieChartIcon from '@mui/icons-material/PieChart';

function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [practiceLogs, setPracticeLogs] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [editingProfile, setEditingProfile] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [practiceModalOpen, setPracticeModalOpen] = useState(false);
  const [expanded, setExpanded] = useState('progress');
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [shareEmails, setShareEmails] = useState('');
  const [shareLoading, setShareLoading] = useState(false);
  const [shareLink, setShareLink] = useState('');
  const [shareSnackbar, setShareSnackbar] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((firebaseUser) => {
      if (firebaseUser) {
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          name: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
        });
      } else {
        setUser(null);
        setProfile(null);
        setPracticeLogs([]);
      }
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);
  const handleEditProfile = () => {
    setEditingProfile(true);
    handleMenuClose();
  };
  const handleSignOut = async () => {
    await auth.signOut();
    setUser(null);
    setProfile(null);
    setPracticeLogs([]);
    handleMenuClose();
  };
  const handleDeleteAccount = () => {
    setDeleteDialogOpen(true);
    handleMenuClose();
  };
  const confirmDeleteAccount = async () => {
    try {
      const token = await auth.currentUser.getIdToken();
      await api.delete('/api/profile', { headers: { Authorization: `Bearer ${token}` } });
      await auth.signOut();
      setUser(null);
      setProfile(null);
      setPracticeLogs([]);
      setDeleteDialogOpen(false);
    } catch (err) {
      alert('Failed to delete account.');
      setDeleteDialogOpen(false);
    }
  };
  const handleShareDashboard = () => {
    setShareDialogOpen(true);
    handleMenuClose();
  };

  const fetchProfile = async () => {
    if (user && auth.currentUser) {
      setLoadingProfile(true);
      try {
        const token = await auth.currentUser.getIdToken();
        const res = await api.get('/api/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProfile(res.data);
        // Fetch practice logs
        const logsRes = await api.get('/api/profile/practice-logs', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setPracticeLogs(Array.isArray(logsRes.data) ? logsRes.data : []);
      } catch (err) {
        setProfile(null);
        setPracticeLogs([]);
      }
      setLoadingProfile(false);
    }
  };

  // Fetch only practice logs (for silent update after log entry)
  const fetchPracticeLogs = async () => {
    if (user && auth.currentUser) {
      try {
        const token = await auth.currentUser.getIdToken();
        const logsRes = await api.get('/api/profile/practice-logs', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setPracticeLogs(Array.isArray(logsRes.data) ? logsRes.data : []);
      } catch (err) {
        setPracticeLogs([]);
      }
    }
  };

  useEffect(() => {
    if (user && auth.currentUser) {
      fetchProfile();
    }
    // eslint-disable-next-line
  }, [user]);

  const handleAccordionChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  // Filter practiceLogs by date range
  const filteredPracticeLogs = React.useMemo(() => {
    const logs = Array.isArray(practiceLogs) ? practiceLogs : [];
    const start = dateRange.start ? new Date(dateRange.start) : null;
    const end = dateRange.end ? new Date(dateRange.end) : null;
    return logs.filter(log => {
      const logDate = log.date ? new Date(log.date) : null;
      if (!logDate) return false;
      if (start && logDate < start) return false;
      if (end && logDate > end) return false;
      return true;
    });
  }, [practiceLogs, dateRange]);

  // Move all logic inside the main route element
  const mainAppElement = (
    authLoading ? (
      <Box minHeight="100vh" display="flex" flexDirection="column" alignItems="center" justifyContent="center" bgcolor="#f5faff">
        <Box mb={3}>
          <svg width="80" height="80" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ animation: 'spin 1.2s linear infinite' }}>
            <circle cx="50" cy="50" r="48" fill="#1976d2" stroke="#1565c0" strokeWidth="4" />
            <path d="M35 40c0 10 0 25 15 25s15-15 15-25" stroke="#fff" strokeWidth="3" fill="none" strokeLinecap="round"/>
            <circle cx="35" cy="40" r="5" fill="#fff" stroke="#1976d2" strokeWidth="2" />
            <circle cx="65" cy="40" r="5" fill="#fff" stroke="#1976d2" strokeWidth="2" />
            <path d="M50 65v7a8 8 0 1 0 8-8" stroke="#fff" strokeWidth="3" fill="none" strokeLinecap="round"/>
            <circle cx="58" cy="72" r="3" fill="#fff" stroke="#1976d2" strokeWidth="2" />
            <style>{'@keyframes spin { 100% { transform: rotate(360deg); } }'}</style>
          </svg>
        </Box>
        <Typography variant="h5" color="primary" fontWeight={600} align="center">
          Loading...
        </Typography>
      </Box>
    ) :
    !user ? <SignIn onSignIn={setUser} /> :
    loadingProfile ? (
      <Box minHeight="100vh" display="flex" flexDirection="column" alignItems="center" justifyContent="center" bgcolor="#f5faff">
        <Box mb={3}>
          <svg width="80" height="80" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ animation: 'spin 1.2s linear infinite' }}>
            <circle cx="50" cy="50" r="48" fill="#1976d2" stroke="#1565c0" strokeWidth="4" />
            <path d="M35 40c0 10 0 25 15 25s15-15 15-25" stroke="#fff" strokeWidth="3" fill="none" strokeLinecap="round"/>
            <circle cx="35" cy="40" r="5" fill="#fff" stroke="#1976d2" strokeWidth="2" />
            <circle cx="65" cy="40" r="5" fill="#fff" stroke="#1976d2" strokeWidth="2" />
            <path d="M50 65v7a8 8 0 1 0 8-8" stroke="#fff" strokeWidth="3" fill="none" strokeLinecap="round"/>
            <circle cx="58" cy="72" r="3" fill="#fff" stroke="#1976d2" strokeWidth="2" />
            <style>{'@keyframes spin { 100% { transform: rotate(360deg); } }'}</style>
          </svg>
        </Box>
        <Typography variant="h5" color="primary" fontWeight={600} align="center">
          Loading Profile...
        </Typography>
      </Box>
    ) :
    editingProfile && profile ? <ProfileSetup user={user} onProfileComplete={fetchProfile} initialData={profile} /> :
    !profile || !profile.profileComplete ? <ProfileSetup user={user} onProfileComplete={fetchProfile} /> : (
      <Container maxWidth="lg" sx={{ py: 6, bgcolor: '#f5faff', minHeight: '100vh' }}>
        {/* Dashboard Title and Greeting */}
        <Typography variant="h2" fontWeight={800} color="primary" gutterBottom align="center" sx={{ letterSpacing: 1 }}>
          Doctorly Dashboard
        </Typography>
        <Typography variant="h5" align="center" color="textSecondary" gutterBottom sx={{ mb: 5 }}>
          Hello, {profile.name || profile.email}
        </Typography>
        {/* Global Date Range Filter (now below greeting) */}
        <Box display="flex" flexWrap="wrap" alignItems="center" gap={2} mb={4} justifyContent="center">
          <TextField
            label="Start Date"
            type="date"
            size="small"
            value={dateRange.start}
            onChange={e => setDateRange(r => ({ ...r, start: e.target.value }))}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="End Date"
            type="date"
            size="small"
            value={dateRange.end}
            onChange={e => setDateRange(r => ({ ...r, end: e.target.value }))}
            InputLabelProps={{ shrink: true }}
          />
          <Button variant="outlined" size="small" onClick={() => {
            const today = dayjs();
            setDateRange({
              start: today.subtract(6, 'day').format('YYYY-MM-DD'),
              end: today.format('YYYY-MM-DD')
            });
          }}>Last 7 days</Button>
          <Button variant="outlined" size="small" onClick={() => {
            const today = dayjs();
            setDateRange({
              start: today.subtract(29, 'day').format('YYYY-MM-DD'),
              end: today.format('YYYY-MM-DD')
            });
          }}>Last 30 days</Button>
          <Button variant="outlined" size="small" onClick={() => {
            const today = dayjs();
            setDateRange({
              start: today.startOf('year').format('YYYY-MM-DD'),
              end: today.format('YYYY-MM-DD')
            });
          }}>This year</Button>
          <Button variant="outlined" size="small" onClick={() => setDateRange({ start: '', end: '' })}>All time</Button>
        </Box>
        <Box display="flex" justifyContent="flex-end" alignItems="center" mb={3}>
          <IconButton onClick={handleMenuOpen} size="large">
            {profile.photoURL ? <Avatar src={profile.photoURL} /> : <AccountCircleIcon fontSize="large" />}
          </IconButton>
          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
            <MenuItem onClick={handleEditProfile}>Edit Profile</MenuItem>
            <MenuItem onClick={handleSignOut}>Sign Out</MenuItem>
            <MenuItem onClick={handleDeleteAccount} sx={{ color: 'error.main' }}>Delete My Account</MenuItem>
            <MenuItem onClick={handleShareDashboard}>Share Dashboard</MenuItem>
          </Menu>
        </Box>
        <Box>
          <Accordion defaultExpanded sx={{ mb: 3 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Stack direction="row" alignItems="center" spacing={2}>
                <TrendingUpIcon color="primary" sx={{ fontSize: 32 }} />
                <Typography variant="h5" fontWeight={700} color="primary">
                  Progress vs. Target
                </Typography>
              </Stack>
            </AccordionSummary>
            <AccordionDetails>
              <ProgressDashboard profile={profile} practiceLogs={filteredPracticeLogs} mcatAttempts={profile?.mcatAttempts || []} />
            </AccordionDetails>
          </Accordion>
          <SectionInsights practiceLogs={filteredPracticeLogs} />
          <StreaksHeatmap practiceLogs={filteredPracticeLogs} defaultExpanded={false} />
          <PersonalBests practiceLogs={filteredPracticeLogs} mcatAttempts={profile?.mcatAttempts || []} defaultExpanded={false} />
          <MilestoneBadges practiceLogs={filteredPracticeLogs} mcatAttempts={profile?.mcatAttempts || []} defaultExpanded={false} />
          <Accordion defaultExpanded={false} sx={{ mb: 3 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Stack direction="row" alignItems="center" spacing={2}>
                <TrendingUpIcon color="primary" sx={{ fontSize: 32 }} />
                <Typography variant="h5" fontWeight={700} color="primary">
                  Practice Test Trends
                </Typography>
              </Stack>
            </AccordionSummary>
            <AccordionDetails>
              <PracticeTrendsChart practiceLogs={filteredPracticeLogs} profile={profile} mcatAttempts={profile?.mcatAttempts || []} readOnly={false} />
            </AccordionDetails>
          </Accordion>
          <Accordion defaultExpanded={false} sx={{ mb: 3 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Stack direction="row" alignItems="center" spacing={2}>
                <PlaylistAddCheckIcon color="primary" sx={{ fontSize: 32 }} />
                <Typography variant="h5" fontWeight={700} color="primary">
                  Log MCAT Practice/Test
                </Typography>
              </Stack>
            </AccordionSummary>
            <AccordionDetails>
              <PracticeLogForm user={auth.currentUser} />
              <Box mt={3}>
                <PracticeLogsHistory logs={filteredPracticeLogs} onSeeAll={() => setPracticeModalOpen(true)} />
              </Box>
            </AccordionDetails>
          </Accordion>
          <Accordion defaultExpanded={false} sx={{ mb: 3 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Stack direction="row" alignItems="center" spacing={2}>
                <PieChartIcon color="primary" sx={{ fontSize: 32 }} />
                <Typography variant="h5" fontWeight={700} color="primary">
                  Grand Total Practice Summary
                </Typography>
              </Stack>
            </AccordionSummary>
            <AccordionDetails>
              <PracticeSummary practiceLogs={filteredPracticeLogs} defaultExpanded={false} />
            </AccordionDetails>
          </Accordion>
          <Accordion defaultExpanded={false} sx={{ mb: 3 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Stack direction="row" alignItems="center" spacing={2}>
                <HistoryIcon color="primary" sx={{ fontSize: 32 }} />
                <Typography variant="h5" fontWeight={700} color="primary">
                  Add MCAT Attempt
                </Typography>
              </Stack>
            </AccordionSummary>
            <AccordionDetails>
              <MCATAttemptForm user={auth.currentUser} attempts={profile?.mcatAttempts || []} />
              <Box mt={3}>
                <MCATAttemptsHistory attempts={profile?.mcatAttempts || []} />
              </Box>
            </AccordionDetails>
          </Accordion>
          <Accordion defaultExpanded={false} sx={{ mb: 3 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Stack direction="row" alignItems="center" spacing={2}>
                <SchoolIcon color="primary" sx={{ fontSize: 32 }} />
                <Typography variant="h5" fontWeight={700} color="primary">
                  Add Application Cycle
                </Typography>
              </Stack>
            </AccordionSummary>
            <AccordionDetails>
              <ApplicationCycleForm user={auth.currentUser} cycles={profile?.applicationCycles || []} />
              <Box mt={3}>
                <ApplicationCyclesHistory cycles={profile?.applicationCycles || []} />
              </Box>
            </AccordionDetails>
          </Accordion>
        </Box>
        <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
          <DialogTitle>Delete Account</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently removed.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialogOpen(false)} color="primary">Cancel</Button>
            <Button onClick={confirmDeleteAccount} color="error" variant="contained">Delete</Button>
          </DialogActions>
        </Dialog>
        {/* Modal for all practice logs */}
        <Dialog open={practiceModalOpen} onClose={() => setPracticeModalOpen(false)} maxWidth="xl" fullWidth>
          <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pr: 2 }}>
            All Practice/Test Logs
            <IconButton aria-label="close" onClick={() => setPracticeModalOpen(false)} size="large">
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent>
            <PracticeLogsModalTable logs={practiceLogs} />
          </DialogContent>
        </Dialog>
        {/* Share Dashboard Dialog */}
        <Dialog open={shareDialogOpen} onClose={() => setShareDialogOpen(false)} fullWidth maxWidth="sm">
          <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pr: 2 }}>
            Share Dashboard
            <IconButton aria-label="close" onClick={() => setShareDialogOpen(false)} size="large">
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent>
            <TextField
              label="Gmail addresses (comma separated)"
              value={shareEmails}
              onChange={e => setShareEmails(e.target.value)}
              fullWidth
              autoFocus
              margin="dense"
              placeholder="example1@gmail.com, example2@gmail.com"
            />
            {shareLink && (
              <Box mt={2} display="flex" alignItems="center" gap={1}>
                <TextField value={shareLink} fullWidth InputProps={{ readOnly: true }} size="small" />
                <IconButton onClick={() => {navigator.clipboard.writeText(shareLink); setShareSnackbar('Link copied!')}}>
                  <ContentCopyIcon />
                </IconButton>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button
              onClick={async () => {
                setShareLoading(true);
                try {
                  const token = await auth.currentUser.getIdToken();
                  const emails = shareEmails.split(',').map(e => e.trim()).filter(e => e);
                  await api.post('/api/profile/share', { emails }, { headers: { Authorization: `Bearer ${token}` } });
                  setShareLink(window.location.origin + '/shared/' + user.uid);
                  setShareSnackbar('Share link ready!');
                } catch (err) {
                  setShareSnackbar('Failed to update sharing.');
                }
                setShareLoading(false);
              }}
              color="primary"
              variant="contained"
              disabled={shareLoading || !shareEmails.trim()}
            >
              {shareLoading ? 'Saving...' : 'Generate Link'}
            </Button>
          </DialogActions>
        </Dialog>
        <Snackbar open={!!shareSnackbar} autoHideDuration={2500} onClose={() => setShareSnackbar('')} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
          <Alert onClose={() => setShareSnackbar('')} severity="success" sx={{ width: '100%' }}>
            {shareSnackbar}
          </Alert>
        </Snackbar>
      </Container>
    )
  );

  return (
    <Routes>
      <Route path="/shared/:uid" element={<SharedDashboard />} />
      <Route path="/*" element={mainAppElement} />
    </Routes>
  );
}

export default App; 