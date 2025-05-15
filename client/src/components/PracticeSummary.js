import React from 'react';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from 'recharts';

const sectionLabels = {
  chemPhys: 'Chem/Phys',
  cars: 'CARS',
  bioBiochem: 'Bio/Biochem',
  psychSoc: 'Psych/Soc'
};
const sectionColors = {
  chemPhys: '#E64A19',      // Deep Orange
  cars: '#1976D2',         // Strong Blue
  bioBiochem: '#388E3C',   // Strong Green
  psychSoc: '#D32F2F'      // Strong Red
};

const PracticeSummary = ({ practiceLogs, defaultExpanded = false }) => {
  const totals = { chemPhys: 0, cars: 0, bioBiochem: 0, psychSoc: 0 };
  const sessions = { chemPhys: 0, cars: 0, bioBiochem: 0, psychSoc: 0 };
  (practiceLogs || []).forEach(log => {
    if (log.section && typeof log.totalQuestions === 'number') {
      totals[log.section] += log.totalQuestions;
      sessions[log.section] += 1;
    }
  });
  const pieData = Object.keys(sectionLabels).map(key => ({
    name: sectionLabels[key],
    value: totals[key],
    color: sectionColors[key]
  }));
  const maxSection = Object.keys(totals).reduce((a, b) => totals[a] > totals[b] ? a : b);
  const maxQuestions = Math.max(...Object.values(totals));

  return (
    <Accordion sx={{ mb: 3 }} defaultExpanded={defaultExpanded}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography variant="h5" fontWeight={700} color="primary">
          Grand Total Practice Summary
        </Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Paper elevation={2} sx={{ p: 4, borderRadius: 4, mb: 4, display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'center', justifyContent: 'center' }}>
          <Box width="100%">
            <Box mb={2}>
              <Typography variant="h6" fontWeight={700} color="primary">Section</Typography>
              <Box component="table" width="100%" sx={{ borderCollapse: 'collapse', mt: 1 }}>
                <Box component="thead">
                  <Box component="tr">
                    <Box component="th" align="left" sx={{ fontWeight: 700, p: 1 }}>Section</Box>
                    <Box component="th" align="left" sx={{ fontWeight: 700, p: 1 }}>Total Questions</Box>
                    <Box component="th" align="left" sx={{ fontWeight: 700, p: 1 }}>Total Sessions</Box>
                  </Box>
                </Box>
                <Box component="tbody">
                  {Object.keys(sectionLabels).map(section => (
                    <Box component="tr" key={section} sx={{ bgcolor: section === maxSection ? '#f5faff' : undefined }}>
                      <Box component="td" sx={{ fontWeight: 700, color: sectionColors[section], p: 1 }}>{sectionLabels[section]}</Box>
                      <Box component="td" sx={{ fontWeight: 700, color: sectionColors[section], p: 1 }}>
                        {totals[section]}
                        <Box component="span" sx={{ display: 'inline-block', width: 60, height: 8, bgcolor: sectionColors[section], borderRadius: 2, ml: 1, verticalAlign: 'middle' }} />
                      </Box>
                      <Box component="td" sx={{ p: 1 }}>{sessions[section]}</Box>
                    </Box>
                  ))}
                </Box>
              </Box>
            </Box>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {pieData.map((entry, idx) => (
                    <Cell key={`cell-${idx}`} fill={entry.color} />
                  ))}
                </Pie>
                <Legend verticalAlign="bottom" height={36} />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Box>
        </Paper>
      </AccordionDetails>
    </Accordion>
  );
};

export default PracticeSummary; 