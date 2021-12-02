import React, { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import plusFill from '@iconify/icons-eva/plus-fill';
import { Link as RouterLink } from 'react-router-dom';
import ReactImageAnnotate from 'react-image-annotate';
// material
import { Grid, Button, Container, Stack, Typography, Box } from '@mui/material';
// components
import Page from '../components/Page';
import { TaskCard, TaskPostsSort, TaskPostsSearch } from '../components/_dashboard/task';
//
import POSTS from '../_mocks_/blog';
import { useUtils } from '../utils/utils';

// ----------------------------------------------------------------------

const SORT_OPTIONS = [
  { value: 'latest', label: 'Latest' },
  { value: 'popular', label: 'Popular' },
  { value: 'oldest', label: 'Oldest' }
];

// ----------------------------------------------------------------------

export default function Task(taskType) {
  const utils = useUtils();

  const [taskList, setTaskList] = useState([]);
  const updateTaskList = () => {
    console.log(taskType);
    utils.fetch
      .get('/task-list/all', { params: { task_type: taskType.taskType } })
      .then((res) => setTaskList(res.data));
  };

  useEffect(() => {
    updateTaskList();
    // eslint-disable-next-line
  }, [taskType]);

  return (
    <Page title="Task | Annotator">
      <Container>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
          <Typography variant="h4" gutterBottom>
            Task
          </Typography>
        </Stack>

        <Grid container spacing={3}>
          {taskList.map((task, index) => (
            <TaskCard
              key={task.id}
              task={task}
              index={index}
              taskType={taskType}
              updateTaskList={updateTaskList}
            />
          ))}
        </Grid>
      </Container>
    </Page>
  );
}
