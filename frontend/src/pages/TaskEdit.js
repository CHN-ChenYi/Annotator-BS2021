import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ReactImageAnnotate from 'react-image-annotate';
// material
import { Dialog, Container, Button, DialogActions } from '@mui/material';
// components
import Page from '../components/Page';
//
import { useUtils } from '../utils/utils';

export default function Task(taskType) {
  const utils = useUtils();
  const location = useLocation();
  const navigate = useNavigate();
  const tid = location.pathname.substr(location.pathname.lastIndexOf('/') + 1);

  const [save, setSave] = useState(false);
  const handleSave = () => setSave(true);
  const handleSaveClose = () => setSave(false);

  const [task, setTask] = useState();
  const updateTaskList = () => {
    utils.fetch.get(`/task/${tid}`).then((res) => setTask(res.data));
  };

  useEffect(() => {
    updateTaskList();
    // eslint-disable-next-line
  }, [taskType]);

  const [selectedImage, setSelectedImage] = useState(0);

  const handleNext = () => {
    if (selectedImage === JSON.parse(task.content).length - 1) return;
    setSelectedImage(selectedImage + 1);
  };
  const handlePrev = () => {
    if (selectedImage === 0) return;
    setSelectedImage(selectedImage - 1);
  };

  const [e, setE] = useState();
  const submit = (status_) => {
    utils.fetch.put(`/task/${tid}`, {
      content: JSON.stringify(e.images),
      status: status_
    });
    navigate(-1);
  };

  return (
    <Page title="Task | Annotator">
      <Container>
        <Dialog fullScreen open>
          {task && (
            <ReactImageAnnotate
              hideFullScreen
              hideSettings
              taskDescription={task.description}
              labelImages
              regionClsList={['All']}
              regionTagList={JSON.parse(task.tags)}
              onExit={(e) => {
                setE(e);
                handleSave();
              }}
              selectedImage={selectedImage}
              onNextImage={handleNext}
              onPrevImage={handlePrev}
              images={JSON.parse(task.content)}
            />
          )}
        </Dialog>
        <Dialog open={save} onClose={handleSaveClose}>
          <DialogActions>
            <Button
              variant="contained"
              sx={{
                margin: 2
              }}
              onClick={() => submit(1)}
            >
              Save
            </Button>
            <Button
              variant="contained"
              sx={{
                margin: 2
              }}
              onClick={() => submit(2)}
            >
              Complete
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Page>
  );
}
