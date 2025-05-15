import React from 'react';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Box from '@mui/material/Box';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import dayjs from 'dayjs';

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

function getBest(logs, attempts, section) {
  let best = null;
  // Practice logs
  (logs || []).forEach(log => {
    if (log.section === section && log.scaledScore) {
      if (!best || log.scaledScore > best.score) {
        best = {
          score: log.scaledScore,
          date: log.date,
          source: 'Practice',
        };
      }
    }
  });
  // Official attempts
  (attempts || []).forEach(attempt => {
    if (attempt.scores && attempt.scores[section]) {
      if (!best || attempt.scores[section] > best.score) {
        best = {
          score: attempt.scores[section],
          date: attempt.date,
          source: 'Official',
        };
      }
    }
  });
  return best;
}

function getBestTotal(attempts) {
  let best = null;
  (attempts || []).forEach(attempt => {
    if (attempt.scores && attempt.scores.total) {
      if (!best || attempt.scores.total > best.score) {
        best = {
          score: attempt.scores.total,
          date: attempt.date,
          source: 'Official',
        };
      }
    }
  });
  return best;
}

const PersonalBests = ({ practiceLogs, mcatAttempts, defaultExpanded = false }) => {
  return (
    <Accordion defaultExpanded={defaultExpanded} sx={{ mb: 3 }}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Box display="flex" alignItems="center" gap={2}>
          <EmojiEventsIcon color="warning" />
          <Typography variant="h6" fontWeight={700} color="primary">
            Personal Bests
          </Typography>
        </Box>
      </AccordionSummary>
      <AccordionDetails>
        <Box display="flex" flexWrap="wrap" gap={3}>
          {Object.keys(sectionLabels).map(section => {
            const best = getBest(practiceLogs, mcatAttempts, section);
            return (
              <Box key={section} minWidth={160} p={2} borderRadius={2} bgcolor="#f5faff" border={`2px solid ${sectionColors[section]}`}> 
                <Typography variant="subtitle1" fontWeight={700} color={sectionColors[section]}>
                  {sectionLabels[section]}
                </Typography>
                {best ? (
                  <>
                    <Typography variant="h4" fontWeight={800} color={sectionColors[section]}>{best.score}</Typography>
                    <Typography variant="body2" color="text.secondary">{dayjs(best.date).format('MMM D, YYYY')}</Typography>
                    <Typography variant="caption" color="text.secondary">{best.source}</Typography>
                  </>
                ) : (
                  <Typography variant="body2" color="text.secondary">No data</Typography>
                )}
              </Box>
            );
          })}
          {/* Best total (official only) */}
          <Box minWidth={160} p={2} borderRadius={2} bgcolor="#fffbe7" border="2px solid #FFD600">
            <Typography variant="subtitle1" fontWeight={700} color="#FFD600">
              Best Total (Official)
            </Typography>
            {getBestTotal(mcatAttempts) ? (
              <>
                <Typography variant="h4" fontWeight={800} color="#FFD600">{getBestTotal(mcatAttempts).score}</Typography>
                <Typography variant="body2" color="text.secondary">{dayjs(getBestTotal(mcatAttempts).date).format('MMM D, YYYY')}</Typography>
                <Typography variant="caption" color="text.secondary">Official</Typography>
              </>
            ) : (
              <Typography variant="body2" color="text.secondary">No data</Typography>
            )}
          </Box>
        </Box>
      </AccordionDetails>
    </Accordion>
  );
};

export default PersonalBests; 