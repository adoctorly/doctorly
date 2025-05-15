import React from 'react';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import LinearProgress from '@mui/material/LinearProgress';
import EmojiObjectsIcon from '@mui/icons-material/EmojiObjects';

const sectionLabels = {
  chemPhys: 'Chem/Phys',
  cars: 'CARS',
  bioBiochem: 'Bio/Biochem',
  psychSoc: 'Psych/Soc',
};
const sectionColors = {
  chemPhys: '#E64A19',
  cars: '#1976D2',
  bioBiochem: '#388E3C',
  psychSoc: '#D32F2F',
};

function getAverages(practiceLogs) {
  const sums = {}, counts = {};
  (practiceLogs || []).forEach(log => {
    if (log.section && log.scaledScore) {
      sums[log.section] = (sums[log.section] || 0) + log.scaledScore;
      counts[log.section] = (counts[log.section] || 0) + 1;
    }
  });
  const avgs = {};
  Object.keys(sectionLabels).forEach(section => {
    avgs[section] = counts[section] ? sums[section] / counts[section] : null;
  });
  return avgs;
}

const SectionInsights = ({ practiceLogs }) => {
  const avgs = getAverages(practiceLogs);
  const validSections = Object.keys(avgs).filter(s => avgs[s] !== null);
  if (validSections.length === 0) return (
    <Box p={3}>
      <Typography variant="body1" color="text.secondary" align="center">
        No section insights yet—log some practice to see your strengths and weaknesses!
      </Typography>
    </Box>
  );
  let weakest = validSections[0], strongest = validSections[0];
  validSections.forEach(s => {
    if (avgs[s] < avgs[weakest]) weakest = s;
    if (avgs[s] > avgs[strongest]) strongest = s;
  });
  return (
    <Box p={3}>
      <Box display="flex" alignItems="center" gap={2} mb={2}>
        <EmojiObjectsIcon color="info" />
        <Typography variant="h6" fontWeight={700} color="primary">
          Section Insights
        </Typography>
      </Box>
      <Box display="flex" flexDirection="column" gap={2}>
        {Object.keys(sectionLabels).map(section => (
          <Box key={section} display="flex" alignItems="center" gap={2}>
            <Typography minWidth={90} fontWeight={700} color={sectionColors[section]}>{sectionLabels[section]}</Typography>
            <Box flex={1}>
              <LinearProgress
                variant="determinate"
                value={avgs[section] ? ((avgs[section] - 118) / 14) * 100 : 0}
                sx={{ height: 16, borderRadius: 2, bgcolor: '#f0f0f0',
                  '& .MuiLinearProgress-bar': {
                    backgroundColor:
                      section === strongest ? '#43a047' :
                      section === weakest ? '#e53935' : sectionColors[section],
                  }
                }}
              />
            </Box>
            <Typography minWidth={40} fontWeight={700} color={section === strongest ? '#43a047' : section === weakest ? '#e53935' : 'text.primary'}>
              {avgs[section] ? avgs[section].toFixed(1) : '--'}
            </Typography>
          </Box>
        ))}
        <Box mt={2}>
          <Typography variant="subtitle1" color="error.main" fontWeight={700}>
            Weakest: {sectionLabels[weakest]}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Focus more on {sectionLabels[weakest]} for bigger gains!
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default SectionInsights; 