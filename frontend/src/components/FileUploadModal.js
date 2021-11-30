import { useState } from 'react';
import * as React from 'react';
import PropTypes from 'prop-types';
import Backdrop from '@mui/material/Backdrop';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import Fade from '@mui/material/Fade';
import Typography from '@mui/material/Typography';
// import FileUpload from './FileUpload';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4
};

function FileUploadModal({ open, onClose }) {
  const [files, setFiles] = useState([]);

  return (
    <Modal
      aria-labelledby="transition-modal-title"
      aria-describedby="transition-modal-description"
      closeAfterTransition
      open={open}
      onClose={onClose}
      BackdropComponent={Backdrop}
      BackdropProps={{
        timeout: 500
      }}
    >
      <Fade in={open}>
        <Box sx={style}>
          {/* <FileUpload value={files} onChange={setFiles} />; */}
          <Typography id="transition-modal-title" variant="h6" component="h2">
            Text in a modal
          </Typography>
          <Typography id="transition-modal-description" sx={{ mt: 2 }}>
            Duis mollis, est non commodo luctus, nisi erat porttitor ligula.
          </Typography>
        </Box>
      </Fade>
    </Modal>
  );
}

FileUploadModal.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func
};

export default FileUploadModal;
