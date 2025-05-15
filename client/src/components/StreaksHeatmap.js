import React from 'react';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Box from '@mui/material/Box';
import CalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';
import dayjs from 'dayjs';

function getStreaks(dates) {
  if (!dates.length) return { current: 0, longest: 0 };
  const sorted = [...dates].sort((a, b) => a - b);
  let longest = 1, current = 1, max = 1;
  for (let i = 1; i < sorted.length; i++) {
    if (dayjs(sorted[i]).diff(dayjs(sorted[i - 1]), 'day') === 1) {
      current++;
      max = Math.max(max, current);
    } else if (dayjs(sorted[i]).isSame(sorted[i - 1], 'day')) {
      // same day, skip
    } else {
      current = 1;
    }
  }
  // Check if the streak is ongoing
  const today = dayjs().startOf('day');
  const last = dayjs(sorted[sorted.length - 1]).startOf('day');
  const currentStreak = today.diff(last, 'day') === 0 ? current : 0;
  return { current: currentStreak, longest: max };
}

const colorScale = [
  '#eeeeee', // 0
  '#b3cde0', // 1
  '#6497b1', // 2
  '#005b96', // 3
  '#03396c', // 4+
];

function getClassForValue(value) {
  if (!value || value.count === 0) return 'color-empty';
  if (value.count >= 4) return 'color-scale-4';
  if (value.count === 3) return 'color-scale-3';
  if (value.count === 2) return 'color-scale-2';
  return 'color-scale-1';
}

const StreaksHeatmap = ({ practiceLogs, defaultExpanded = false }) => {
  // Map logs to date counts
  const dateMap = {};
  (practiceLogs || []).forEach(log => {
    const d = dayjs(log.date).format('YYYY-MM-DD');
    dateMap[d] = (dateMap[d] || 0) + 1;
  });
  const allDates = Object.keys(dateMap);
  const streaks = getStreaks(allDates);

  // Heatmap range: last 6 months
  const endDate = dayjs().format('YYYY-MM-DD');
  const startDate = dayjs().subtract(5, 'month').startOf('month').format('YYYY-MM-DD');
  const values = [];
  let d = dayjs(startDate);
  while (d.isBefore(dayjs(endDate).add(1, 'day'))) {
    const key = d.format('YYYY-MM-DD');
    values.push({ date: key, count: dateMap[key] || 0 });
    d = d.add(1, 'day');
  }

  const hasActivity = values.some(v => v.count > 0);

  return (
    <Accordion sx={{ mb: 3 }} defaultExpanded={defaultExpanded}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Box>
          <Typography variant="h5" fontWeight={700} color="primary">
            Streaks & Consistency
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" mt={0.5}>
            Track your daily MCAT practice/test activity. Build streaks and stay consistent!
          </Typography>
        </Box>
      </AccordionSummary>
      <AccordionDetails>
        <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} alignItems="center" gap={4}>
          <Box minWidth={280}>
            {hasActivity ? (
              <CalendarHeatmap
                startDate={startDate}
                endDate={endDate}
                values={values}
                classForValue={getClassForValue}
                showWeekdayLabels
                gutterSize={4}
                horizontal={false}
                tooltipDataAttrs={value => {
                  if (!value || !value.date) return null;
                  return {
                    'data-tip': `${dayjs(value.date).format('MMM D, YYYY')}: ${value.count} activit${value.count === 1 ? 'y' : 'ies'}`
                  };
                }}
                rectSize={18}
              />
            ) : (
              <Typography variant="body1" color="text.secondary" mt={2}>
                No activity yet.
              </Typography>
            )}
            <Box mt={2} display="flex" alignItems="center" gap={1}>
              <Box width={20} height={20} bgcolor={colorScale[1]} borderRadius={1} border={1} borderColor="#ccc" />
              <Typography variant="caption">1</Typography>
              <Box width={20} height={20} bgcolor={colorScale[2]} borderRadius={1} border={1} borderColor="#ccc" />
              <Typography variant="caption">2</Typography>
              <Box width={20} height={20} bgcolor={colorScale[3]} borderRadius={1} border={1} borderColor="#ccc" />
              <Typography variant="caption">3</Typography>
              <Box width={20} height={20} bgcolor={colorScale[4]} borderRadius={1} border={1} borderColor="#ccc" />
              <Typography variant="caption">4+</Typography>
            </Box>
          </Box>
          <Box textAlign="center" minWidth={180}>
            <Typography variant="h6" color="primary" mb={1}>Current Streak</Typography>
            <Typography variant="h2" fontWeight={900} color="success.main" lineHeight={1.1}>{streaks.current} <span style={{fontSize: '1.2rem'}}>days</span></Typography>
            <Typography variant="h6" color="primary" mt={3} mb={1}>Longest Streak</Typography>
            <Typography variant="h4" fontWeight={800} color="text.secondary" lineHeight={1.1}>{streaks.longest} <span style={{fontSize: '1rem'}}>days</span></Typography>
          </Box>
        </Box>
        <style>{`
          .color-empty { fill: ${colorScale[0]}; stroke: #ccc; }
          .color-scale-1 { fill: ${colorScale[1]}; stroke: #ccc; }
          .color-scale-2 { fill: ${colorScale[2]}; stroke: #ccc; }
          .color-scale-3 { fill: ${colorScale[3]}; stroke: #ccc; }
          .color-scale-4 { fill: ${colorScale[4]}; stroke: #ccc; }
          .react-calendar-heatmap text { font-size: 0.85rem; }
        `}</style>
      </AccordionDetails>
    </Accordion>
  );
};

export default StreaksHeatmap; 