import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import LinearProgress from '@mui/material/LinearProgress';
import Chip from '@mui/material/Chip';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import InfoIcon from '@mui/icons-material/Info';
import Paper from '@mui/material/Paper';

const sectionLabels = {
  chemPhys: 'Chem/Phys',
  cars: 'CARS',
  bioBiochem: 'Bio/Biochem',
  psychSoc: 'Psych/Soc'
};

const getProgress = (latest, target) => {
  if (!latest || !target) return 0;
  return Math.max(0, Math.min(100, Math.round((latest / target) * 100)));
};

function getLatestOfficial(mcatAttempts, section) {
  if (!Array.isArray(mcatAttempts) || mcatAttempts.length === 0) return undefined;
  // Sort by date descending, pick the latest attempt with a score for this section
  const sorted = [...mcatAttempts].sort((a, b) => new Date(b.date) - new Date(a.date));
  for (const attempt of sorted) {
    if (attempt.scores && attempt.scores[section]) {
      return Number(attempt.scores[section]);
    }
  }
  return undefined;
}

const ProgressDashboard = ({ profile, practiceLogs, mcatAttempts }) => {
  if (!profile || !profile.mcatTarget) return null;

  const latestScores = {};
  let hasAnyScore = false;
  Object.keys(sectionLabels).forEach(section => {
    const logs = practiceLogs.filter(l => l.section === section);
    if (logs.length > 0) {
      latestScores[section] = logs[logs.length - 1].scaledScore;
      hasAnyScore = true;
    }
  });

  // Check if any official score exists
  let hasAnyOfficial = false;
  const latestOfficial = {};
  Object.keys(sectionLabels).forEach(section => {
    const score = getLatestOfficial(mcatAttempts, section);
    if (score !== undefined) {
      latestOfficial[section] = score;
      hasAnyOfficial = true;
    }
  });

  if (!hasAnyScore && !hasAnyOfficial) {
    return (
      <Paper elevation={0} sx={{ p: 4, textAlign: 'center', bgcolor: '#f8fafc' }}>
        <InfoIcon color="primary" sx={{ fontSize: 48, mb: 1 }} />
        <Typography variant="h5" fontWeight={700} color="primary" gutterBottom>
          No practice/test or official MCAT data yet
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Log your first MCAT practice, test, or official attempt to see your progress vs. your targets!
        </Typography>
      </Paper>
    );
  }

  return (
    <Box>
      <Box mb={3}>
        <Typography variant="h5" fontWeight={700} color="primary" gutterBottom>
          Progress vs. Target
        </Typography>
      </Box>
      <Box>
        <Paper elevation={0} sx={{ p: 2, mb: 2, bgcolor: '#fafdff' }}>
          <Box display="flex" fontWeight={700} color="primary.main" mb={1}>
            <Box width={120}>Section</Box>
            <Box width={80}>Target</Box>
            <Box width={100}>Practice</Box>
            <Box width={100}>Official</Box>
            <Box flex={1}>Progress</Box>
            <Box width={90}>Status</Box>
          </Box>
          {Object.entries(sectionLabels).map(([section, label]) => {
            const target = Number(profile.mcatTarget[section]);
            const latest = Number(latestScores[section]);
            const official = Number(latestOfficial[section]);
            const progress = getProgress(latest, target);
            let chip = null;
            if (!latest) {
              chip = <Chip label="No data" color="default" size="small" icon={<InfoIcon />} />;
            } else if (latest >= target) {
              chip = <Chip label="On Track" color="success" size="small" icon={<CheckCircleIcon />} />;
            } else if (latest >= target - 2) {
              chip = <Chip label="Almost" color="warning" size="small" icon={<WarningAmberIcon />} />;
            } else {
              chip = <Chip label="Needs Work" color="error" size="small" icon={<WarningAmberIcon />} />;
            }
            return (
              <Box key={section} display="flex" alignItems="center" mb={2}>
                <Box width={120} fontWeight={600} color="primary.main">{label}</Box>
                <Box width={80}>{target || '-'}</Box>
                <Box width={100}>{latest || '-'}</Box>
                <Box width={100}>{official || '-'}</Box>
                <Box flex={1} pr={2}>
                  <LinearProgress variant={latest ? 'determinate' : 'buffer'} value={progress} sx={{ height: 10, borderRadius: 5, bgcolor: '#e3eafc' }} />
                </Box>
                <Box width={90}>{chip}</Box>
              </Box>
            );
          })}
        </Paper>
      </Box>
    </Box>
  );
};

export default ProgressDashboard; 