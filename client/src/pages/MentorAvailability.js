import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Grid, Paper, IconButton, TextField, MenuItem, Select, InputLabel, FormControl, Alert } from '@mui/material';
import { Add, Delete } from '@mui/icons-material';
import axios from 'axios';

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const MentorAvailability = ({ mentor, onClose }) => {
  const [schedule, setSchedule] = useState([]);
  const [timezone, setTimezone] = useState('Asia/Kolkata');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (mentor && mentor.availability) {
      setSchedule(mentor.availability.schedule || []);
      setTimezone(mentor.availability.timezone || 'Asia/Kolkata');
    }
  }, [mentor]);

  const handleAddSlot = (day) => {
    setSchedule(prev =>
      prev.map(slot =>
        slot.day === day
          ? { ...slot, slots: [...slot.slots, { startTime: '', endTime: '', isAvailable: true }] }
          : slot
      )
    );
  };

  const handleRemoveSlot = (day, idx) => {
    setSchedule(prev =>
      prev.map(slot =>
        slot.day === day
          ? { ...slot, slots: slot.slots.filter((_, i) => i !== idx) }
          : slot
      )
    );
  };

  const handleSlotChange = (day, idx, field, value) => {
    setSchedule(prev =>
      prev.map(slot =>
        slot.day === day
          ? {
              ...slot,
              slots: slot.slots.map((s, i) =>
                i === idx ? { ...s, [field]: value } : s
              ),
            }
          : slot
      )
    );
  };

  const handleAddDay = (day) => {
    if (!schedule.some(slot => slot.day === day)) {
      setSchedule(prev => [...prev, { day, slots: [{ startTime: '', endTime: '', isAvailable: true }] }]);
    }
  };

  const handleRemoveDay = (day) => {
    setSchedule(prev => prev.filter(slot => slot.day !== day));
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccess('');
    
    try {
      // Validate schedule data
      const scheduleData = Array.isArray(schedule) ? schedule : [];
      
      // Filter out empty slots
      const validSchedule = scheduleData.map(daySlot => ({
        ...daySlot,
        slots: daySlot.slots.filter(slot => slot.startTime && slot.endTime)
      })).filter(daySlot => daySlot.slots.length > 0);
      
      console.log('Sending availability data:', { schedule: validSchedule, timezone });
      
      await axios.put('/api/mentors/availability', { 
        schedule: validSchedule, 
        timezone 
      });
      
      setSuccess('Availability updated successfully!');
      setTimeout(() => {
        if (onClose) onClose();
      }, 1500);
    } catch (err) {
      console.error('Availability update error:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Failed to update availability. Please try again.');
    }
    setSaving(false);
  };

  return (
    <Paper sx={{ p: 3, mb: 4 }}>
      <Typography variant="h6" gutterBottom>
        Your Availability
      </Typography>
      <FormControl sx={{ mb: 2, minWidth: 200 }}>
        <InputLabel>Timezone</InputLabel>
        <Select value={timezone} onChange={e => setTimezone(e.target.value)} label="Timezone">
          <MenuItem value="Asia/Kolkata">Asia/Kolkata</MenuItem>
          <MenuItem value="UTC">UTC</MenuItem>
        </Select>
      </FormControl>
      <Box>
        {daysOfWeek.map(day => (
          <Box key={day} sx={{ mb: 2 }}>
            {schedule.some(slot => slot.day === day) ? (
              <Box>
                <Typography variant="subtitle1">{day}</Typography>
                {schedule
                  .find(slot => slot.day === day)
                  .slots.map((slot, idx) => (
                    <Grid container spacing={1} alignItems="center" key={idx} sx={{ mb: 1 }}>
                      <Grid item>
                        <TextField
                          label="Start Time"
                          type="time"
                          value={slot.startTime}
                          onChange={e => handleSlotChange(day, idx, 'startTime', e.target.value)}
                          InputLabelProps={{ shrink: true }}
                          size="small"
                        />
                      </Grid>
                      <Grid item>
                        <TextField
                          label="End Time"
                          type="time"
                          value={slot.endTime}
                          onChange={e => handleSlotChange(day, idx, 'endTime', e.target.value)}
                          InputLabelProps={{ shrink: true }}
                          size="small"
                        />
                      </Grid>
                      <Grid item>
                        <IconButton onClick={() => handleRemoveSlot(day, idx)} color="error">
                          <Delete />
                        </IconButton>
                      </Grid>
                    </Grid>
                  ))}
                <Button
                  startIcon={<Add />}
                  onClick={() => handleAddSlot(day)}
                  size="small"
                  sx={{ mt: 1 }}
                >
                  Add Slot
                </Button>
                <Button
                  startIcon={<Delete />}
                  onClick={() => handleRemoveDay(day)}
                  size="small"
                  color="error"
                  sx={{ mt: 1, ml: 2 }}
                >
                  Remove Day
                </Button>
              </Box>
            ) : (
              <Button
                variant="outlined"
                onClick={() => handleAddDay(day)}
                size="small"
                sx={{ mb: 1 }}
              >
                Add {day}
              </Button>
            )}
          </Box>
        ))}
      </Box>
      {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mt: 2 }}>{success}</Alert>}
      <Button
        variant="contained"
        onClick={handleSave}
        disabled={saving}
        sx={{ mt: 3 }}
      >
        {saving ? 'Saving...' : 'Save Availability'}
      </Button>
    </Paper>
  );
};

export default MentorAvailability; 