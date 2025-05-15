import React, { useState } from 'react';
import { signInWithPopup } from 'firebase/auth';
import { auth, provider } from '../firebase';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import GoogleIcon from '@mui/icons-material/Google';

const funQuotes = [
  "Future doctors: caffeine is your spirit animal.",
  "MCAT: Making Coffee A Tradition.",
  "Remember: Even the best doctors once Googled 'What is MCAT?'.",
  "Your progress is private. Your dreams are not!",
  "No one can see your data but you. Not even your mom."
];

const randomQuote = funQuotes[Math.floor(Math.random() * funQuotes.length)];

const stethoscopeSVG = (
  <svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="48" fill="#1976d2" stroke="#1565c0" strokeWidth="4" />
    <path d="M35 40c0 10 0 25 15 25s15-15 15-25" stroke="#fff" strokeWidth="3" fill="none" strokeLinecap="round"/>
    <circle cx="35" cy="40" r="5" fill="#fff" stroke="#1976d2" strokeWidth="2" />
    <circle cx="65" cy="40" r="5" fill="#fff" stroke="#1976d2" strokeWidth="2" />
    <path d="M50 65v7a8 8 0 1 0 8-8" stroke="#fff" strokeWidth="3" fill="none" strokeLinecap="round"/>
    <circle cx="58" cy="72" r="3" fill="#fff" stroke="#1976d2" strokeWidth="2" />
  </svg>
);

const SignIn = ({ onSignIn }) => {
  const [user, setUser] = useState(null);

  const handleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const { displayName, email, uid, photoURL } = result.user;
      const token = await result.user.getIdToken();
      const userData = { displayName, email, uid, photoURL, token };
      setUser(userData);
      if (onSignIn) onSignIn(userData);
      localStorage.setItem('doctorlyUser', JSON.stringify(userData));
    } catch (error) {
      alert('Sign in failed: ' + error.message);
    }
  };

  if (user || auth.currentUser) {
    return <Box p={4}><Typography variant="h5">Welcome back!</Typography></Box>;
  }

  return (
    <Box minHeight="100vh" display="flex" flexDirection="column" alignItems="center" justifyContent="center" bgcolor="#f5faff">
      <Paper elevation={4} sx={{ p: 5, maxWidth: 440, textAlign: 'center', borderRadius: 4 }}>
        <Box mb={3} display="flex" justifyContent="center">{stethoscopeSVG}</Box>
        <Typography variant="h3" fontWeight={800} color="primary" gutterBottom>
          Welcome to Doctorly
        </Typography>
        <Typography variant="subtitle1" color="#222" gutterBottom sx={{ fontSize: 18 }}>
          Track your med school journey, one step at a time.
        </Typography>
        <Typography variant="body1" sx={{ color: '#7b1fa2', fontWeight: 700, fontSize: 18, mb: 3 }}>
          "{randomQuote}"
        </Typography>
        <Button
          variant="contained"
          color="primary"
          size="large"
          startIcon={<GoogleIcon />}
          onClick={handleSignIn}
          sx={{ mt: 2, mb: 2, width: '100%', fontSize: 18, py: 1.5 }}
        >
          Sign in with Google
        </Button>
        <Typography variant="caption" color="#333" display="block" mt={3} sx={{ fontSize: 15 }}>
          Your data is 100% private and only visible to you.
        </Typography>
      </Paper>
    </Box>
  );
};

export default SignIn; 