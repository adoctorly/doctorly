import React, { useState, useEffect } from 'react';
import api from '../api';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { auth } from '../firebase';
import { useNavigate } from 'react-router-dom';

const emptyDegree = { degree: '', school: '' };
const emptyExtracurricular = { organization: '', startDate: '', endDate: '', hours: '' };

const ProfileSetup = ({ user, onProfileComplete, initialData }) => {
  const defaultForm = {
    name: user?.displayName || '',
    email: user?.email || '',
    zipcode: '',
    gpa: {
      undergrad: { overall: '', science: '' },
      grad: { overall: '', science: '' }
    },
    degrees: {
      undergrad: [ { degree: '', school: '' } ],
      grad: [ { degree: '', school: '' } ]
    },
    mcatTarget: { chemPhys: '', cars: '', bioBiochem: '', psychSoc: '', total: '' },
    extracurriculars: {
      clinical: [ { organization: '', startDate: '', endDate: '', hours: '' } ],
      research: [ { organization: '', startDate: '', endDate: '', hours: '' } ],
      leadership: [ { organization: '', startDate: '', endDate: '', hours: '' } ],
      community: [ { organization: '', startDate: '', endDate: '', hours: '' } ]
    }
  };

  const [form, setForm] = useState(defaultForm);
  const [expanded, setExpanded] = useState('personal');
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (initialData) {
      // Merge initialData with defaults for missing fields
      setForm({
        ...defaultForm,
        ...initialData,
        gpa: {
          ...defaultForm.gpa,
          ...initialData.gpa
        },
        degrees: {
          undergrad: initialData.degrees?.undergrad?.length ? initialData.degrees.undergrad : defaultForm.degrees.undergrad,
          grad: initialData.degrees?.grad?.length ? initialData.degrees.grad : defaultForm.degrees.grad
        },
        mcatTarget: {
          ...defaultForm.mcatTarget,
          ...initialData.mcatTarget
        },
        extracurriculars: {
          clinical: initialData.extracurriculars?.clinical?.length ? initialData.extracurriculars.clinical : defaultForm.extracurriculars.clinical,
          research: initialData.extracurriculars?.research?.length ? initialData.extracurriculars.research : defaultForm.extracurriculars.research,
          leadership: initialData.extracurriculars?.leadership?.length ? initialData.extracurriculars.leadership : defaultForm.extracurriculars.leadership,
          community: initialData.extracurriculars?.community?.length ? initialData.extracurriculars.community : defaultForm.extracurriculars.community
        }
      });
    }
  }, [initialData]);

  // Auto-calculate total MCAT target
  const calcTotal = (fields) => {
    const vals = ['chemPhys', 'cars', 'bioBiochem', 'psychSoc'].map(k => Number(fields[k]) || 0);
    return vals.reduce((a, b) => a + b, 0);
  };

  const handleChange = (e) => {
    const { name, value, dataset } = e.target;
    if (name.startsWith('gpa-')) {
      const [_, level, type] = name.split('-');
      setForm({
        ...form,
        gpa: {
          ...form.gpa,
          [level]: { ...form.gpa[level], [type]: value }
        }
      });
    } else if (name.startsWith('degree-')) {
      const [_, level, field, idx] = name.split('-');
      const degreesArr = [...form.degrees[level]];
      degreesArr[parseInt(idx)][field] = value;
      setForm({
        ...form,
        degrees: {
          ...form.degrees,
          [level]: degreesArr
        }
      });
    } else if (name in form.mcatTarget) {
      const newTarget = { ...form.mcatTarget, [name]: value };
      // Auto-calc total
      newTarget.total = calcTotal(newTarget);
      setForm({ ...form, mcatTarget: newTarget });
    } else if (name.startsWith('extracurricular-')) {
      const [_, type, field, idx] = name.split('-');
      const arr = [...form.extracurriculars[type]];
      arr[parseInt(idx)][field] = value;
      setForm({
        ...form,
        extracurriculars: {
          ...form.extracurriculars,
          [type]: arr
        }
      });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const addDegree = (level) => {
    setForm({
      ...form,
      degrees: {
        ...form.degrees,
        [level]: [...form.degrees[level], { ...emptyDegree }]
      }
    });
  };
  const removeDegree = (level, idx) => {
    setForm({
      ...form,
      degrees: {
        ...form.degrees,
        [level]: form.degrees[level].filter((_, i) => i !== idx)
      }
    });
  };

  const addExtracurricular = (type) => {
    setForm({
      ...form,
      extracurriculars: {
        ...form.extracurriculars,
        [type]: [...form.extracurriculars[type], { ...emptyExtracurricular }]
      }
    });
  };
  const removeExtracurricular = (type, idx) => {
    setForm({
      ...form,
      extracurriculars: {
        ...form.extracurriculars,
        [type]: form.extracurriculars[type].filter((_, i) => i !== idx)
      }
    });
  };

  const getTotalHours = (type) => {
    return form.extracurriculars[type].reduce((sum, entry) => sum + (Number(entry.hours) || 0), 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    let token;
    // Wait for auth.currentUser to be available
    if (auth.currentUser) {
      token = await auth.currentUser.getIdToken();
    } else {
      // Wait for Firebase Auth to initialize (should be rare)
      await new Promise(resolve => {
        const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
          if (firebaseUser) {
            token = await firebaseUser.getIdToken();
            unsubscribe();
            resolve();
          }
        });
      });
    }
    await api.post('/api/profile', form, {
      headers: { Authorization: `Bearer ${token}` }
    });
    setSaving(false);
    if (onProfileComplete) onProfileComplete();
    window.location.reload();
  };

  const handleCancel = (e) => {
    e.preventDefault();
    if (onProfileComplete) onProfileComplete();
    window.location.reload();
  };

  const handleAccordionChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  return (
    <Box minHeight="100vh" display="flex" alignItems="center" justifyContent="center" bgcolor="#f5faff">
      <Paper elevation={4} sx={{ p: 5, maxWidth: 700, width: '100%', borderRadius: 4 }}>
        <Typography variant="h4" fontWeight={700} color="primary" gutterBottom align="center">
          Set Up Your Profile
        </Typography>
        <Typography variant="subtitle1" color="textSecondary" align="center" mb={3}>
          This info helps us personalize your med school journey. Only you can see it!
        </Typography>
        <form onSubmit={handleSubmit} autoComplete="off">
          <Accordion expanded={expanded === 'personal'} onChange={handleAccordionChange('personal')}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6" fontWeight={600} color="primary">Personal Info</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Box display="flex" gap={2} mb={2}>
                <TextField name="name" label="Name" value={form.name} InputProps={{ readOnly: true }} fullWidth required />
                <TextField name="email" label="Email" value={form.email} InputProps={{ readOnly: true }} fullWidth required />
              </Box>
              <Box display="flex" gap={2} mb={2}>
                <TextField name="zipcode" label="Zip Code" value={form.zipcode} onChange={handleChange} fullWidth required />
              </Box>
            </AccordionDetails>
          </Accordion>
          <Accordion expanded={expanded === 'gpa'} onChange={handleAccordionChange('gpa')}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6" fontWeight={600} color="primary">GPA</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Box display="flex" gap={2} mb={2}>
                <TextField name="gpa-undergrad-overall" label="UG Overall" value={form.gpa.undergrad.overall} onChange={handleChange} fullWidth />
                <TextField name="gpa-undergrad-science" label="UG Science" value={form.gpa.undergrad.science} onChange={handleChange} fullWidth />
                <TextField name="gpa-grad-overall" label="Grad Overall" value={form.gpa.grad.overall} onChange={handleChange} fullWidth />
                <TextField name="gpa-grad-science" label="Grad Science" value={form.gpa.grad.science} onChange={handleChange} fullWidth />
              </Box>
            </AccordionDetails>
          </Accordion>
          <Accordion expanded={expanded === 'degrees'} onChange={handleAccordionChange('degrees')}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6" fontWeight={600} color="primary">Degrees</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="subtitle2" color="textSecondary" mb={1}>Undergraduate</Typography>
              {form.degrees.undergrad.map((deg, idx) => (
                <Box display="flex" gap={2} mb={1} key={`ug-${idx}`}> 
                  <TextField name={`degree-undergrad-degree-${idx}`} label="Degree" value={deg.degree} onChange={handleChange} fullWidth />
                  <TextField name={`degree-undergrad-school-${idx}`} label="School" value={deg.school} onChange={handleChange} fullWidth />
                  <IconButton onClick={() => removeDegree('undergrad', idx)} disabled={form.degrees.undergrad.length === 1}><RemoveIcon /></IconButton>
                  {idx === form.degrees.undergrad.length - 1 && (
                    <IconButton onClick={() => addDegree('undergrad')}><AddIcon /></IconButton>
                  )}
                </Box>
              ))}
              <Typography variant="subtitle2" color="textSecondary" mb={1} mt={2}>Graduate</Typography>
              {form.degrees.grad.map((deg, idx) => (
                <Box display="flex" gap={2} mb={1} key={`grad-${idx}`}> 
                  <TextField name={`degree-grad-degree-${idx}`} label="Degree" value={deg.degree} onChange={handleChange} fullWidth />
                  <TextField name={`degree-grad-school-${idx}`} label="School" value={deg.school} onChange={handleChange} fullWidth />
                  <IconButton onClick={() => removeDegree('grad', idx)} disabled={form.degrees.grad.length === 1}><RemoveIcon /></IconButton>
                  {idx === form.degrees.grad.length - 1 && (
                    <IconButton onClick={() => addDegree('grad')}><AddIcon /></IconButton>
                  )}
                </Box>
              ))}
            </AccordionDetails>
          </Accordion>
          <Accordion expanded={expanded === 'mcat'} onChange={handleAccordionChange('mcat')}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6" fontWeight={600} color="primary">MCAT Target Scores</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Box display="flex" gap={2} mb={2}>
                <TextField name="chemPhys" label="Chem/Phys" value={form.mcatTarget.chemPhys} onChange={handleChange} fullWidth />
                <TextField name="cars" label="CARS" value={form.mcatTarget.cars} onChange={handleChange} fullWidth />
                <TextField name="bioBiochem" label="Bio/Biochem" value={form.mcatTarget.bioBiochem} onChange={handleChange} fullWidth />
                <TextField name="psychSoc" label="Psych/Soc" value={form.mcatTarget.psychSoc} onChange={handleChange} fullWidth />
                <TextField name="total" label="Total" value={form.mcatTarget.total} InputProps={{ readOnly: true }} fullWidth />
              </Box>
            </AccordionDetails>
          </Accordion>
          <Accordion expanded={expanded === 'extracurriculars'} onChange={handleAccordionChange('extracurriculars')}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6" fontWeight={600} color="primary">Extracurricular Hours</Typography>
            </AccordionSummary>
            <AccordionDetails>
              {['clinical', 'research', 'leadership', 'community'].map(type => (
                <Box key={type} mb={3}>
                  <Typography variant="subtitle2" color="textSecondary" mb={1}>
                    {type.charAt(0).toUpperCase() + type.slice(1)} (Total: {getTotalHours(type)} hrs)
                  </Typography>
                  {form.extracurriculars[type].map((entry, idx) => (
                    <Box display="flex" gap={2} mb={2} key={`${type}-${idx}`}> 
                      <TextField name={`extracurricular-${type}-organization-${idx}`} label="Organization" value={entry.organization} onChange={handleChange} fullWidth />
                      <TextField name={`extracurricular-${type}-startDate-${idx}`} label="Start Date" type="date" value={entry.startDate} onChange={handleChange} InputLabelProps={{ shrink: true }} fullWidth />
                      <TextField name={`extracurricular-${type}-endDate-${idx}`} label="End Date" type="date" value={entry.endDate} onChange={handleChange} InputLabelProps={{ shrink: true }} fullWidth />
                      <TextField name={`extracurricular-${type}-hours-${idx}`} label="Hours" type="number" value={entry.hours} onChange={handleChange} fullWidth />
                      <IconButton onClick={() => removeExtracurricular(type, idx)} disabled={form.extracurriculars[type].length === 1}><RemoveIcon /></IconButton>
                      {idx === form.extracurriculars[type].length - 1 && (
                        <IconButton onClick={() => addExtracurricular(type)}><AddIcon /></IconButton>
                      )}
                    </Box>
                  ))}
                </Box>
              ))}
            </AccordionDetails>
          </Accordion>
          <Box mt={4} display="flex" justifyContent="center" gap={2}>
            <Button type="submit" variant="contained" color="primary" size="large" sx={{ px: 5, py: 1.5, fontSize: 18 }} disabled={saving}>
              {saving ? 'Saving...' : 'Save Profile'}
            </Button>
            {initialData && (
              <Button variant="outlined" color="secondary" size="large" sx={{ px: 5, py: 1.5, fontSize: 18 }} onClick={handleCancel}>
                Cancel
              </Button>
            )}
          </Box>
        </form>
      </Paper>
    </Box>
  );
};

export default ProfileSetup; 