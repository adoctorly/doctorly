import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Paper from '@mui/material/Paper';
import ProgressDashboard from './ProgressDashboard';
import PracticeTrendsChart from './PracticeTrendsChart';
import { auth } from '../firebase';
import { PracticeLogsModalTable } from './PracticeLogsHistory';
import PracticeSummary from './PracticeSummary';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import dayjs from 'dayjs';
import StreaksHeatmap from './StreaksHeatmap';
import PersonalBests from './PersonalBests';
import MilestoneBadges from './MilestoneBadges';
import SectionInsights from './SectionInsights';
import { Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Stack from '@mui/material/Stack';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import PlaylistAddCheckIcon from '@mui/icons-material/PlaylistAddCheck';
import HistoryIcon from '@mui/icons-material/History';
import SchoolIcon from '@mui/icons-material/School';
import PracticeLogForm from './PracticeLogForm';
import PracticeLogsHistory from './PracticeLogsHistory';
import MCATAttemptForm from './MCATAttemptForm';
import MCATAttemptsHistory from './MCATAttemptsHistory';
import ApplicationCycleForm from './ApplicationCycleForm';
import ApplicationCyclesHistory from './ApplicationCyclesHistory';
import SignIn from './SignIn';

const SharedDashboard = () => {
  const { uid } = useParams();
  const [allowed, setAllowed] = useState(null);
  const [profile, setProfile] = useState(null);
  const [practiceLogs, setPracticeLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [practiceModalOpen, setPracticeModalOpen] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  const sectionLabels = {
    chemPhys: 'Chem/Phys',
    cars: 'CARS',
    bioBiochem: 'Bio/Biochem',
    psychSoc: 'Psych/Soc'
  };
  const sectionColors = {
    chemPhys: '#E64A19',
    cars: '#1976D2',
    bioBiochem: '#388E3C',
    psychSoc: '#D32F2F'
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(() => {
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (authLoading || !auth.currentUser) return;
    const checkAccessAndFetch = async () => {
      setLoading(true);
      try {
        const user = auth.currentUser;
        if (!user) throw new Error('You must be signed in with Google.');
        const token = await user.getIdToken();
        const res = await axios.get(`/api/profile/${uid}/shared`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.data.allowed) {
          setAllowed(false);
          setLoading(false);
          return;
        }
        setAllowed(true);
        // Fetch profile and logs for this uid
        const profileRes = await axios.get(`/api/profile/${uid}/public-profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProfile(profileRes.data);
        const logsRes = await axios.get(`/api/profile/${uid}/public-practice-logs`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setPracticeLogs(logsRes.data);
      } catch (err) {
        setAllowed(false);
      }
      setLoading(false);
    };
    checkAccessAndFetch();
  }, [uid, authLoading, auth.currentUser]);

  // Filter practiceLogs by date range
  const filteredPracticeLogs = React.useMemo(() => {
    if (!practiceLogs) return [];
    const start = dateRange.start ? new Date(dateRange.start) : null;
    const end = dateRange.end ? new Date(dateRange.end) : null;
    return practiceLogs.filter(log => {
      const logDate = log.date ? new Date(log.date) : null;
      if (!logDate) return false;
      if (start && logDate < start) return false;
      if (end && logDate > end) return false;
      return true;
    });
  }, [practiceLogs, dateRange]);

  if (authLoading) {
    return (
      <Box minHeight="60vh" display="flex" flexDirection="column" alignItems="center" justifyContent="center">
        <CircularProgress />
        <Typography mt={2}>Loading authentication...</Typography>
      </Box>
    );
  }
  if (!auth.currentUser) {
    return <SignIn />;
  }

  if (loading) {
    return (
      <Box minHeight="60vh" display="flex" flexDirection="column" alignItems="center" justifyContent="center">
        <CircularProgress />
        <Typography mt={2}>Loading shared dashboard...</Typography>
      </Box>
    );
  }
  if (!allowed) {
    return (
      <Box minHeight="60vh" display="flex" flexDirection="column" alignItems="center" justifyContent="center">
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" color="error" gutterBottom>Access Denied</Typography>
          <Typography>You do not have permission to view this dashboard.</Typography>
        </Paper>
      </Box>
    );
  }
  return (
    <Box maxWidth="lg" mx="auto" py={6}>
      <Typography variant="h3" fontWeight={800} color="primary" gutterBottom align="center">
        Shared Dashboard (Read-Only)
      </Typography>
      {/* Global Date Range Filter (below title) */}
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
      <Paper elevation={3} sx={{ p: 5, borderRadius: 4, mb: 4 }}>
        <ProgressDashboard profile={profile} practiceLogs={filteredPracticeLogs} mcatAttempts={profile?.mcatAttempts || []} readOnly />
      </Paper>
      <SectionInsights practiceLogs={filteredPracticeLogs} defaultExpanded={false} />
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
          <PracticeTrendsChart practiceLogs={filteredPracticeLogs} profile={profile} mcatAttempts={profile?.mcatAttempts || []} readOnly />
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
      <PracticeSummary practiceLogs={filteredPracticeLogs} defaultExpanded={false} />
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
  );
};

export default SharedDashboard; 