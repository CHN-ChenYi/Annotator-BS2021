import * as React from 'react';
import { Typography, Box, Dialog } from '@mui/material';
import { fDate } from '../../../utils/formatTime';

export default function TaskDescriptionModal({ open, onClose, task, taskType }) {
  return (
    <Dialog open={open} onClose={onClose}>
      <Box sx={{ m: 2 }}>
        <Box sx={{ m: 1 }} display="flex" justifyContent="center" alignItems="center">
          <Typography variant="overline">
            {taskType.taskType === 0 && task.worker ? task.worker.username : task.owner.username}
          </Typography>
        </Box>
        <Box sx={{ m: 1 }} display="flex" justifyContent="center" alignItems="center">
          <Typography
            variant="h4"
            sx={{
              '::after': {
                width: '24px',
                height: '2px',
                margin: '8px auto',
                content: '""',
                display: 'block',
                borderRadius: '2px',
                backgroundColor: '#ddd'
              }
            }}
          >
            {task.title}
          </Typography>
        </Box>
        <Box sx={{ m: 1 }} display="flex" justifyContent="center" alignItems="center">
          <Typography variant="caption">{fDate(Date.parse(task.created_at))}</Typography>
        </Box>
        <Box sx={{ m: 1 }} display="flex" justifyContent="center" alignItems="center">
          <Typography variant="body">{task.description}</Typography>
        </Box>
      </Box>
    </Dialog>
  );
}
