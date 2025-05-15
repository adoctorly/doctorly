import React from 'react';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Box from '@mui/material/Box';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import StarIcon from '@mui/icons-material/Star';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import dayjs from 'dayjs';

const sectionLabels = {
  chemPhys: 'Chem/Phys',
  cars: 'CARS',
  bioBiochem: 'Bio/Biochem',
  psychSoc: 'Psych/Soc',
};

function getMilestones(practiceLogs, mcatAttempts) {
  const milestones = [];
  // 10 practice sessions
  if ((practiceLogs || []).length >= 10) {
    const tenth = practiceLogs[9];
    milestones.push({
      icon: <StarIcon color="primary" />, color: '#1976D2',
      label: '10 Practice Sessions',
      date: tenth.date,
      desc: 'Logged 10 MCAT practice sessions!'
    });
  }
  // First 520+ total (official)
  const first520 = (mcatAttempts || []).find(a => a.scores && a.scores.total >= 520);
  if (first520) {
    milestones.push({
      icon: <WorkspacePremiumIcon color="warning" />, color: '#FFD600',
      label: '520+ Total Score',
      date: first520.date,
      desc: 'Scored 520 or higher on an official MCAT!'
    });
  }
  // First 130+ in any section (official)
  const foundSections = new Set();
  (mcatAttempts || []).forEach(a => {
    if (a.scores) {
      Object.keys(sectionLabels).forEach(section => {
        if (a.scores[section] >= 130 && !foundSections.has(section)) {
          milestones.push({
            icon: <WorkspacePremiumIcon color="success" />, color: '#388E3C',
            label: `130+ in ${sectionLabels[section]}`,
            date: a.date,
            desc: `Scored 130+ in ${sectionLabels[section]} on an official MCAT!`
          });
          foundSections.add(section);
        }
      });
    }
  });
  // First official MCAT logged
  if ((mcatAttempts || []).length > 0) {
    const first = mcatAttempts[0];
    milestones.push({
      icon: <EmojiEventsIcon color="secondary" />, color: '#9C27B0',
      label: 'First Official MCAT',
      date: first.date,
      desc: 'Logged your first official MCAT attempt!'
    });
  }
  return milestones;
}

const MilestoneBadges = ({ practiceLogs, mcatAttempts, defaultExpanded = false }) => {
  const milestones = getMilestones(practiceLogs, mcatAttempts);
  return (
    <Accordion defaultExpanded={defaultExpanded} sx={{ mb: 3 }}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Box display="flex" alignItems="center" gap={2}>
          <WorkspacePremiumIcon color="success" />
          <Typography variant="h6" fontWeight={700} color="primary">
            Milestone Badges
          </Typography>
        </Box>
      </AccordionSummary>
      <AccordionDetails>
        {milestones.length === 0 ? (
          <Typography color="text.secondary">No milestones achieved yet.</Typography>
        ) : (
          <Box display="flex" flexWrap="wrap" gap={3}>
            {milestones.map((m, i) => (
              <Box key={i} minWidth={200} p={2} borderRadius={2} bgcolor="#f5faff" border={`2px solid ${m.color}`}> 
                <Box display="flex" alignItems="center" gap={1} mb={1}>{m.icon}<Typography fontWeight={700}>{m.label}</Typography></Box>
                <Typography variant="body2" color="text.secondary">{m.desc}</Typography>
                <Typography variant="caption" color="text.secondary">{dayjs(m.date).format('MMM D, YYYY')}</Typography>
              </Box>
            ))}
          </Box>
        )}
      </AccordionDetails>
    </Accordion>
  );
};

export default MilestoneBadges; 