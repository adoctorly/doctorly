import React, { useState } from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableSortLabel from '@mui/material/TableSortLabel';
import TablePagination from '@mui/material/TablePagination';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';

const sectionLabels = {
  chemPhys: 'Chem/Phys',
  cars: 'CARS',
  bioBiochem: 'Bio/Biochem',
  psychSoc: 'Psych/Soc'
};

export function PracticeLogsModalTable({ logs }) {
  const [order, setOrder] = useState('desc');
  const [orderBy, setOrderBy] = useState('date');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  function descendingComparator(a, b, orderBy) {
    if (orderBy === 'date') {
      return new Date(b.date) - new Date(a.date);
    }
    if (orderBy === 'section') {
      return (b.section || '').localeCompare(a.section || '');
    }
    if (orderBy === 'subtopic') {
      return (b.subtopic || '').localeCompare(a.subtopic || '');
    }
    if (orderBy === 'platform') {
      return (b.platform || '').localeCompare(a.platform || '');
    }
    if (orderBy === 'scaledScore') {
      return (b.scaledScore || 0) - (a.scaledScore || 0);
    }
    if (b[orderBy] < a[orderBy]) {
      return -1;
    }
    if (b[orderBy] > a[orderBy]) {
      return 1;
    }
    return 0;
  }

  function getComparator(order, orderBy) {
    return order === 'desc'
      ? (a, b) => descendingComparator(a, b, orderBy)
      : (a, b) => -descendingComparator(a, b, orderBy);
  }

  const sortedLogs = logs ? [...logs].sort(getComparator(order, orderBy)) : [];
  const paginatedLogs = sortedLogs.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  function exportLogsToCSV(logs) {
    if (!logs || logs.length === 0) return;
    const headers = ['Date', 'Section', 'Subtopic', 'Platform', 'Raw', 'Total', '%', 'Scaled'];
    const rows = logs.map(log => [
      log.date ? new Date(log.date).toLocaleDateString() : '',
      sectionLabels[log.section],
      log.subtopic,
      log.platform,
      log.rawScore,
      log.totalQuestions,
      log.percent,
      log.scaledScore
    ]);
    const csvContent = [headers, ...rows].map(r => r.map(x => `"${(x ?? '').toString().replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    a.download = `practice_logs_${yyyy}-${mm}-${dd}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  return (
    <Paper sx={{ width: '100%', mb: 2 }}>
      <Box display="flex" justifyContent="flex-end" alignItems="center" px={2} pt={2}>
        <button
          onClick={() => exportLogsToCSV(paginatedLogs)}
          style={{ fontWeight: 600, fontSize: 15, padding: '6px 18px', borderRadius: 6, background: '#388e3c', color: '#fff', border: 'none', cursor: 'pointer' }}
        >
          Export CSV
        </button>
      </Box>
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sortDirection={orderBy === 'date' ? order : false}>
                <TableSortLabel
                  active={orderBy === 'date'}
                  direction={orderBy === 'date' ? order : 'asc'}
                  onClick={() => handleRequestSort('date')}
                >
                  Date
                </TableSortLabel>
              </TableCell>
              <TableCell sortDirection={orderBy === 'section' ? order : false}>
                <TableSortLabel
                  active={orderBy === 'section'}
                  direction={orderBy === 'section' ? order : 'asc'}
                  onClick={() => handleRequestSort('section')}
                >
                  Section
                </TableSortLabel>
              </TableCell>
              <TableCell sortDirection={orderBy === 'subtopic' ? order : false}>
                <TableSortLabel
                  active={orderBy === 'subtopic'}
                  direction={orderBy === 'subtopic' ? order : 'asc'}
                  onClick={() => handleRequestSort('subtopic')}
                >
                  Subtopic
                </TableSortLabel>
              </TableCell>
              <TableCell sortDirection={orderBy === 'platform' ? order : false}>
                <TableSortLabel
                  active={orderBy === 'platform'}
                  direction={orderBy === 'platform' ? order : 'asc'}
                  onClick={() => handleRequestSort('platform')}
                >
                  Platform
                </TableSortLabel>
              </TableCell>
              <TableCell>Raw</TableCell>
              <TableCell>Total</TableCell>
              <TableCell>%</TableCell>
              <TableCell sortDirection={orderBy === 'scaledScore' ? order : false}>
                <TableSortLabel
                  active={orderBy === 'scaledScore'}
                  direction={orderBy === 'scaledScore' ? order : 'asc'}
                  onClick={() => handleRequestSort('scaledScore')}
                >
                  Scaled
                </TableSortLabel>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedLogs.map((log, idx) => (
              <TableRow key={idx}>
                <TableCell>{log.date ? new Date(log.date).toLocaleDateString() : ''}</TableCell>
                <TableCell>{sectionLabels[log.section]}</TableCell>
                <TableCell>{log.subtopic}</TableCell>
                <TableCell>{log.platform}</TableCell>
                <TableCell>{log.rawScore}</TableCell>
                <TableCell>{log.totalQuestions}</TableCell>
                <TableCell>{log.percent}</TableCell>
                <TableCell>{log.scaledScore}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[10, 25, 50]}
        component="div"
        count={logs ? logs.length : 0}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Paper>
  );
}

const PracticeLogsHistory = ({ logs, onSeeAll }) => {
  if (!logs || logs.length === 0) {
    return <p>No practice logs recorded yet.</p>;
  }
  return (
    <div>
      <button onClick={onSeeAll} style={{ fontWeight: 600, fontSize: 16, padding: '8px 20px', borderRadius: 6, background: '#1976d2', color: '#fff', border: 'none', cursor: 'pointer' }}>
        See All Practice/Test History
      </button>
    </div>
  );
};

export default PracticeLogsHistory; 