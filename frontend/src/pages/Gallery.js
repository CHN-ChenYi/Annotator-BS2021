import React, { useState, useEffect } from 'react';
// material
import { Container, Button, Stack, Typography } from '@mui/material';
// components
import { Icon } from '@iconify/react';
import plusFill from '@iconify/icons-eva/plus-fill';
import { Link as RouterLink } from 'react-router-dom';
import Page from '../components/Page';
import {
  ImageList,
  ImageCartWidget,
  ImageUploadModal,
  VideoUploadModal,
  TaskCreateModal
} from '../components/_dashboard/gallery';
import { useUtils } from '../utils/utils';

// ----------------------------------------------------------------------

export default function Gallery() {
  const utils = useUtils();

  const [videoUpload, setVideoUpload] = useState(false);
  const handleVideoUpload = () => setVideoUpload(true);
  const handleVideoUploadClose = () => {
    setVideoUpload(false);
    refresh();
  };

  const [imageUpload, setImageUpload] = useState(false);
  const handleImageUpload = () => setImageUpload(true);
  const handleImageUploadClose = () => {
    setImageUpload(false);
    refresh();
  };

  const [selectedImageNum, setSelectedImageNum] = useState(0);
  const [selectedImage, setSelectedImage] = useState([]);
  const handleSelectStateSwitch = (index, imageName) => {
    if (!imageName) {
      if (selectedImage[index]) setSelectedImageNum(selectedImageNum - 1);
      selectedImage[index] = undefined;
      setSelectedImage(selectedImage);
    } else {
      if (!selectedImage[index]) setSelectedImageNum(selectedImageNum + 1);
      selectedImage[index] = imageName;
      setSelectedImage(selectedImage);
    }
  };

  const [taskCreate, setTaskCreate] = useState(false);
  const handleTaskCreate = () => setTaskCreate(true);
  const handleTaskCreateClose = () => {
    setTaskCreate(false);
    refresh();
  };

  const [imageList, setImageList] = useState([]);
  const updateImageList = () => {
    utils.fetch.get('/image/all').then((res) => setImageList(res.data));
  };

  const refresh = () => {
    setSelectedImageNum(0);
    setSelectedImage([]);
    updateImageList();
  };

  useEffect(() => {
    updateImageList();
    // eslint-disable-next-line
  }, []);

  return (
    <Page title="Gallery | Annotator">
      <Container>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
          <Typography variant="h4" gutterBottom>
            Gallery
          </Typography>
          <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
            <Button
              variant="contained"
              component={RouterLink}
              to="#"
              startIcon={<Icon icon={plusFill} />}
              onClick={handleVideoUpload}
            >
              New Videos
            </Button>
            <VideoUploadModal open={videoUpload} onClose={handleVideoUploadClose} />
            <Button
              variant="contained"
              component={RouterLink}
              to="#"
              startIcon={<Icon icon={plusFill} />}
              onClick={handleImageUpload}
            >
              New Images
            </Button>
            <ImageUploadModal open={imageUpload} onClose={handleImageUploadClose} />
          </Stack>
        </Stack>

        <ImageList images={imageList} onSwitch={handleSelectStateSwitch} />
        <ImageCartWidget content={selectedImageNum} handleClick={handleTaskCreate} />
        <TaskCreateModal
          open={taskCreate}
          onClose={handleTaskCreateClose}
          selectedImage={selectedImage}
          imageList={imageList}
        />
      </Container>
    </Page>
  );
}
