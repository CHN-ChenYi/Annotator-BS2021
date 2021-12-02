import { useState } from 'react';
import * as React from 'react';
import PropTypes from 'prop-types';
import { Button, Box, Dialog, DialogTitle, Stack } from '@mui/material';
import FileUpload from './FileUpload';
import { useUtils } from '../../../utils/utils';

function ImageUploadModal({ open, onClose }) {
  const utils = useUtils();
  const [files, setFiles] = useState([]);

  const handleUpload = () => {
    const formData = new FormData();
    for (let i = 0; i < files.length; i += 1) {
      formData.append('files', files[i]);
    }
    utils.fetch
      .post('/image/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      .catch((error) => {
        console.log(error);
      });
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        mb={5}
        sx={{ marginBottom: 0 }}
      >
        <DialogTitle>Upload Images</DialogTitle>
        <Button
          variant="contained"
          sx={{
            marginRight: 3
          }}
          onClick={handleUpload}
        >
          Upload
        </Button>
      </Stack>
      <Box>
        <FileUpload value={files} onChange={setFiles} accept="image/jpeg" />
      </Box>
    </Dialog>
  );
}

ImageUploadModal.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func
};

export default ImageUploadModal;
