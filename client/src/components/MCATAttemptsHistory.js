import React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';

const MCATAttemptsHistory = ({ attempts }) => {
  if (!attempts || attempts.length === 0) {
    return <Typography variant="body1" color="textSecondary">No MCAT attempts recorded yet.</Typography>;
  }
  // Sort by date descending
  const sorted = [...attempts].sort((a, b) => new Date(b.date) - new Date(a.date));
  return (
    <Paper elevation={1} sx={{ mt: 2, p: 2, borderRadius: 2 }}>
      <Typography variant="h6" fontWeight={700} color="primary" gutterBottom>
        MCAT Attempts History
      </Typography>
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>C/P</TableCell>
              <TableCell>CARS</TableCell>
              <TableCell>B/B</TableCell>
              <TableCell>P/S</TableCell>
              <TableCell>Total</TableCell>
              <TableCell>Prep Details</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sorted.map((attempt, idx) => (
              <TableRow key={idx}>
                <TableCell>{attempt.date ? new Date(attempt.date).toLocaleDateString() : ''}</TableCell>
                <TableCell>{attempt.scores?.chemPhys}</TableCell>
                <TableCell>{attempt.scores?.cars}</TableCell>
                <TableCell>{attempt.scores?.bioBiochem}</TableCell>
                <TableCell>{attempt.scores?.psychSoc}</TableCell>
                <TableCell>{attempt.scores?.total}</TableCell>
                <TableCell>{attempt.prepDetails}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default MCATAttemptsHistory; 