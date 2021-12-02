import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ReactImageAnnotate from 'react-image-annotate';
// material
import { Dialog, Container } from '@mui/material';
// components
import Page from '../components/Page';
//
import { useUtils } from '../utils/utils';

export default function Task(taskType) {
  const utils = useUtils();
  const location = useLocation();
  const navigate = useNavigate();
  const tid = location.pathname.substr(location.pathname.lastIndexOf('/') + 1);

  const [task, setTask] = useState();
  const updateTaskList = () => {
    utils.fetch.get(`/task/${tid}`).then((res) => setTask(res.data));
  };

  useEffect(() => {
    updateTaskList();
    // eslint-disable-next-line
  }, [taskType]);

  return (
    <Page title="Task | Annotator">
      <Container>
        <Dialog fullScreen open>
          {task && (
            <ReactImageAnnotate
              hideFullScreen
              taskDescription={task.description}
              labelImages
              regionClsList={['All']}
              regionTagList={JSON.parse(task.tags)}
              onExit={(e) => {
                console.log(e);
                utils.fetch.put(`/task/${tid}`, {
                  content: JSON.stringify(e.images),
                  status: 1
                });
                navigate(-1);
              }}
              images={JSON.parse(task.content)}
            />
          )}
        </Dialog>
      </Container>
    </Page>
  );
}
