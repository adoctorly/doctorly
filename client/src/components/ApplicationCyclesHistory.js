import React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';

const ApplicationCyclesHistory = ({ cycles }) => {
  if (!cycles || cycles.length === 0) {
    return <Typography variant="body1" color="textSecondary">No application cycles recorded yet.</Typography>;
  }
  // Sort by year descending if year is a number
  const sorted = [...cycles].sort((a, b) => (b.year || '').localeCompare(a.year || ''));
  return (
    <Paper elevation={1} sx={{ mt: 2, p: 2, borderRadius: 2 }}>
      <Typography variant="h6" fontWeight={700} color="primary" gutterBottom>
        Application Cycles History
      </Typography>
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Year</TableCell>
              <TableCell>School</TableCell>
              <TableCell>Outcome</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sorted.map((cycle, idx) => (
              cycle.outcomes && cycle.outcomes.length > 0 ? (
                cycle.outcomes.map((o, i) => (
                  <TableRow key={idx + '-' + i}>
                    <TableCell>{i === 0 ? cycle.year : ''}</TableCell>
                    <TableCell>{o.school}</TableCell>
                    <TableCell>{o.status}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow key={idx}>
                  <TableCell>{cycle.year}</TableCell>
                  <TableCell colSpan={2}>No schools/outcomes</TableCell>
                </TableRow>
              )
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default ApplicationCyclesHistory; 