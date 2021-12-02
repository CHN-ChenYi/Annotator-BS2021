import React, { useState, useEffect } from 'react';
// material
import { Grid, Container, Stack, Typography } from '@mui/material';
// components
import Page from '../components/Page';
import { TaskCard } from '../components/_dashboard/task';
//
import { useUtils } from '../utils/utils';

// ----------------------------------------------------------------------

export default function Task(taskType) {
  const utils = useUtils();

  const [taskList, setTaskList] = useState([]);
  const updateTaskList = () => {
    utils.fetch
      .get('/task-list/all', { params: { task_type: taskType.taskType } })
      .then((res) => setTaskList(res.data));
  };

  useEffect(() => {
    updateTaskList();
    // eslint-disable-next-line
  }, [taskType]);

  let pageTitle = 'Tasks';
  if (taskType.taskType === 0) pageTitle = 'Owned Tasks';
  else if (taskType.taskType === 1) pageTitle = 'Claimed Tasks';
  else pageTitle = 'Tasks to be Claimed';

  return (
    <Page title={`${pageTitle} | Annotator`}>
      <Container>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
          <Typography variant="h4" gutterBottom>
            {pageTitle}
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
