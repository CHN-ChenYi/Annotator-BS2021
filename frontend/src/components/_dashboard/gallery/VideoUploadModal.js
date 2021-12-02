import * as Yup from 'yup';
import { useFormik, FormikProvider } from 'formik';
import { useState } from 'react';
import * as React from 'react';
import PropTypes from 'prop-types';
import { Button, Box, Dialog, DialogTitle, Stack, TextField } from '@mui/material';
import FileUpload from './FileUpload';
import { useUtils } from '../../../utils/utils';

function VideoUploadModal({ open, onClose }) {
  const utils = useUtils();
  const [files, setFiles] = useState([]);

  const RegisterSchema = Yup.object().shape({
    step: Yup.number().required('Step required').positive(),
    cnt: Yup.number().required('Count required').positive().integer()
  });

  const formik = useFormik({
    initialValues: {
      step: 1,
      cnt: 1
    },
    validationSchema: RegisterSchema,
    onSubmit: () => {
      const formData = new FormData();
      for (let i = 0; i < files.length; i += 1) {
        formData.append('files', files[i]);
      }
      utils.fetch
        .post('video/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          },
          params: {
            step: values.step,
            cnt: values.cnt
          }
        })
        .catch((error) => {
          console.log(error);
        });
      onClose();
    }
  });

  const { errors, touched, values, handleSubmit, getFieldProps } = formik;

  return (
    <Dialog open={open} onClose={onClose}>
      <FormikProvider value={formik}>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          mb={5}
          sx={{ marginBottom: 0 }}
        >
          <DialogTitle>Upload Videos</DialogTitle>
          <Button
            variant="contained"
            sx={{
              marginRight: 3
            }}
            onClick={handleSubmit}
          >
            Upload
          </Button>
        </Stack>
        <Box>
          <FileUpload value={files} onChange={setFiles} accept="video/*" />
        </Box>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={1}
          sx={{
            margin: 3,
            marginTop: 0
          }}
        >
          <TextField
            fullWidth
            label="Time interval (in seconds)"
            {...getFieldProps('step')}
            error={Boolean(touched.step && errors.step)}
            helperText={touched.step && errors.step}
          />

          <TextField
            fullWidth
            label="Number of extracted frames"
            {...getFieldProps('cnt')}
            error={Boolean(touched.cnt && errors.cnt)}
            helperText={touched.cnt && errors.cnt}
          />
        </Stack>
      </FormikProvider>
    </Dialog>
  );
}

VideoUploadModal.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func
};

export default VideoUploadModal;
