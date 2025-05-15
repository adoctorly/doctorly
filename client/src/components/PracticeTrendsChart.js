import React, { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine, ReferenceDot } from 'recharts';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import InfoIcon from '@mui/icons-material/Info';
import Box from '@mui/material/Box';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import OutlinedInput from '@mui/material/OutlinedInput';
import Checkbox from '@mui/material/Checkbox';
import ListItemText from '@mui/material/ListItemText';
import TextField from '@mui/material/TextField';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import dayjs from 'dayjs';
import { v4 as uuidv4 } from 'uuid';

const sectionLabels = {
  chemPhys: 'Chem/Phys',
  cars: 'CARS',
  bioBiochem: 'Bio/Biochem',
  psychSoc: 'Psych/Soc'
};
// High-contrast, color-blind-friendly colors
const sectionColors = {
  chemPhys: '#E64A19',      // Deep Orange
  cars: '#1976D2',         // Strong Blue
  bioBiochem: '#388E3C',   // Strong Green
  psychSoc: '#D32F2F'      // Strong Red
};
const platformColors = {
  UWorld: '#000000',            // Black
  AAMC: '#FFD600',             // Bright Yellow
  Kaplan: '#7B1FA2',           // Strong Purple
  'Princeton Review': '#0097A7', // Strong Teal
  Other: '#FBC02D'             // Gold
};
const platformList = ['UWorld', 'AAMC', 'Kaplan', 'Princeton Review', 'Other'];

// Prepare data for each section+platform
function prepareSectionPlatformData(practiceLogs, selectedSections, selectedPlatforms, startDate, endDate) {
  // Returns: { [section]: { [platform]: [ { date, score } ] } }
  const result = {};
  selectedSections.forEach(section => {
    result[section] = {};
    selectedPlatforms.forEach(platform => {
      result[section][platform] = (practiceLogs || [])
        .filter(log =>
          log.section === section &&
          log.platform === platform &&
          log.scaledScore &&
          (!startDate || new Date(log.date) >= startDate) &&
          (!endDate || new Date(log.date) <= endDate)
        )
        .map(log => ({
          date: new Date(log.date).toLocaleDateString(),
          score: Number(log.scaledScore),
          id: log._id || uuidv4()
        }))
        .sort((a, b) => new Date(a.date) - new Date(b.date));
    });
  });
  return result;
}

function getLatestOfficial(mcatAttempts, section) {
  if (!Array.isArray(mcatAttempts) || mcatAttempts.length === 0) return undefined;
  const sorted = [...mcatAttempts].sort((a, b) => new Date(b.date) - new Date(a.date));
  for (const attempt of sorted) {
    if (attempt.scores && attempt.scores[section]) {
      return { score: Number(attempt.scores[section]), date: attempt.date };
    }
  }
  return undefined;
}

// Custom horizontal line marker for chart dots
const HorizontalLineDot = (props) => {
  const { cx, cy, stroke, key } = props;
  return (
    <svg key={key} x={cx - 8} y={cy - 2} width={16} height={4}>
      <rect x={0} y={0} width={16} height={4} fill={stroke} rx={2} />
    </svg>
  );
};

const PracticeTrendsChart = ({ practiceLogs, profile, mcatAttempts }) => {
  const allSections = Object.keys(sectionLabels);
  const allPlatforms = platformList;
  const [selectedSections, setSelectedSections] = useState(allSections);
  const [selectedPlatforms, setSelectedPlatforms] = useState(allPlatforms);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [startDateError, setStartDateError] = useState('');
  const [endDateError, setEndDateError] = useState('');

  const sectionPlatformData = useMemo(() => {
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;
    return prepareSectionPlatformData(practiceLogs || [], selectedSections, selectedPlatforms, start, end);
  }, [practiceLogs, selectedSections, selectedPlatforms, startDate, endDate]);

  const hasAny = selectedSections.some(section =>
    selectedPlatforms.some(platform =>
      (sectionPlatformData[section]?.[platform]?.length || 0) > 0
    )
  );

  // Remove a section from filter
  const handleRemoveSection = (section) => {
    setSelectedSections(selectedSections.filter(s => s !== section));
  };
  // Remove a platform from filter
  const handleRemovePlatform = (platform) => {
    setSelectedPlatforms(selectedPlatforms.filter(p => p !== platform));
  };

  return (
    <Box width="100%">
      <Box mb={2} display="flex" flexWrap="wrap" gap={2} alignItems="center">
        <FormControl sx={{ minWidth: 220 }} size="small">
          <InputLabel id="section-filter-label">Section</InputLabel>
          <Select
            labelId="section-filter-label"
            multiple
            value={selectedSections}
            onChange={e => setSelectedSections(typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value)}
            input={<OutlinedInput label="Section" />}
            renderValue={() => ''} // Don't show selected in dropdown
          >
            {allSections.map(section => (
              <MenuItem key={section} value={section}>
                <Checkbox checked={selectedSections.indexOf(section) > -1} />
                <ListItemText primary={sectionLabels[section]} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl sx={{ minWidth: 180 }} size="small">
          <InputLabel id="platform-filter-label">Platform</InputLabel>
          <Select
            labelId="platform-filter-label"
            multiple
            value={selectedPlatforms}
            onChange={e => setSelectedPlatforms(typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value)}
            input={<OutlinedInput label="Platform" />}
            renderValue={() => ''}
          >
            {allPlatforms.map(platform => (
              <MenuItem key={platform} value={platform}>
                <Checkbox checked={selectedPlatforms.indexOf(platform) > -1} />
                <ListItemText primary={platform} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField
          label="Start Date"
          type="text"
          size="small"
          value={startDate}
          onChange={e => {
            setStartDate(e.target.value);
            setStartDateError('');
          }}
          placeholder="mm/dd/yyyy or yyyy-mm-dd"
          InputLabelProps={{ shrink: true }}
          error={!!startDateError}
          helperText={startDateError}
        />
        <TextField
          label="End Date"
          type="text"
          size="small"
          value={endDate}
          onChange={e => {
            setEndDate(e.target.value);
            setEndDateError('');
          }}
          placeholder="mm/dd/yyyy or yyyy-mm-dd"
          InputLabelProps={{ shrink: true }}
          error={!!endDateError}
          helperText={endDateError}
        />
      </Box>
      <Stack direction="row" spacing={1} mb={2} flexWrap="wrap">
        {selectedSections.map(section => (
          <Chip
            key={section}
            label={sectionLabels[section]}
            onDelete={() => handleRemoveSection(section)}
            color="primary"
            sx={{ bgcolor: sectionColors[section], color: '#fff', fontWeight: 600 }}
          />
        ))}
        {selectedPlatforms.map(platform => (
          <Chip
            key={platform}
            label={platform}
            onDelete={() => handleRemovePlatform(platform)}
            color="default"
            sx={{ bgcolor: platformColors[platform] || '#757575', color: '#fff', fontWeight: 600 }}
          />
        ))}
      </Stack>
      {!hasAny ? (
        <Paper elevation={0} sx={{ p: 4, textAlign: 'center', bgcolor: '#f8fafc' }}>
          <InfoIcon color="primary" sx={{ fontSize: 48, mb: 1 }} />
          <Typography variant="h6" fontWeight={700} color="primary" gutterBottom>
            No practice/test data for selected filters
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Log some MCAT practice or test results to see your trends!
          </Typography>
        </Paper>
      ) : (
        <Box width="100%" height={400}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart margin={{ top: 20, right: 30, left: 10, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                type="category"
                dataKey="date"
                angle={-30}
                textAnchor="end"
                height={60}
                allowDuplicatedCategory={false}
              />
              <YAxis domain={[118, 132]} label={{ value: 'Scaled Score', angle: -90, position: 'insideLeft' }} />
              <Tooltip />
              <Legend />
              {selectedSections.map(section =>
                selectedPlatforms.map(platform => {
                  const color = sectionColors[section];
                  const dash = platform === 'AAMC' ? '6 3' : platform === 'UWorld' ? '0' : '2 2';
                  return (
                    <Line
                      key={section + '-' + platform}
                      data={sectionPlatformData[section][platform]}
                      type="monotone"
                      dataKey="score"
                      name={`${sectionLabels[section]} (${platform})`}
                      stroke={color}
                      strokeDasharray={dash}
                      strokeWidth={3}
                      dot={<HorizontalLineDot />}
                      activeDot={{ r: 6 }}
                      connectNulls
                      isAnimationActive={false}
                    />
                  );
                })
              )}
              {/* Target and Official markers per section (not per platform) */}
              {selectedSections.map(section => {
                const target = profile?.mcatTarget?.[section];
                const official = getLatestOfficial(mcatAttempts, section);
                return (
                  <React.Fragment key={section + '-refs'}>
                    {target && (
                      <ReferenceLine
                        y={Number(target)}
                        stroke={sectionColors[section]}
                        strokeDasharray="6 3"
                        label={{ value: `${sectionLabels[section]} Target`, position: 'right', fill: sectionColors[section], fontWeight: 600 }}
                      />
                    )}
                    {official && (
                      <ReferenceDot
                        x={new Date(official.date).toLocaleDateString()}
                        y={official.score}
                        r={7}
                        fill={sectionColors[section]}
                        stroke="#222"
                        label={{ value: 'Official', position: 'top', fill: sectionColors[section], fontWeight: 700 }}
                      />
                    )}
                  </React.Fragment>
                );
              })}
            </LineChart>
          </ResponsiveContainer>
        </Box>
      )}
    </Box>
  );
};

export default PracticeTrendsChart; 