import * as Yup from 'yup';
import { useFormik, FormikProvider } from 'formik';
import { useState } from 'react';
import * as React from 'react';
import PropTypes from 'prop-types';
import { Button, Dialog, DialogTitle, Stack, TextField, Autocomplete } from '@mui/material';
import { useUtils } from '../../../utils/utils';

function TaskCreateModal({ open, onClose, selectedImage, imageList }) {
  const utils = useUtils();
  const [zeroTags, setZeroTags] = useState(false);
  const [tags, setTags] = useState([]);

  const RegisterSchema = Yup.object().shape({
    title: Yup.string().required('Title required'),
    description: Yup.string().required('Description required')
  });

  const formik = useFormik({
    initialValues: {
      title: '',
      description: ''
    },
    validationSchema: RegisterSchema,
    onSubmit: () => {
      if (!tags.length) {
        setZeroTags(true);
        return;
      }
      const images = [];
      selectedImage.forEach((selected, i) => {
        if (selected) images.push({ iid: imageList[i], name: selected });
      });
      utils.fetch.post('/task', {
        title: values.title,
        description: values.description,
        tags: JSON.stringify(tags),
        images
      });
      onClose();
    }
  });

  const { errors, touched, values, handleSubmit, getFieldProps } = formik;

  return (
    <Dialog open={open} onClose={onClose} fullWidth>
      <FormikProvider value={formik}>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          mb={5}
          sx={{ marginBottom: 0 }}
        >
          <DialogTitle>Create a task</DialogTitle>
          <Button
            variant="contained"
            sx={{
              marginRight: 3
            }}
            onClick={handleSubmit}
          >
            Create
          </Button>
        </Stack>
        <Stack
          direction={{ xs: 'row', sm: 'column' }}
          spacing={1}
          sx={{
            margin: 3,
            marginTop: 0
          }}
        >
          <TextField
            fullWidth
            label="Title"
            {...getFieldProps('title')}
            error={Boolean(touched.title && errors.title)}
            helperText={touched.title && errors.title}
          />

          <TextField
            fullWidth
            label="Description"
            multiline
            minRows={4}
            {...getFieldProps('description')}
            error={Boolean(touched.description && errors.description)}
            helperText={touched.description && errors.description}
          />

          <Autocomplete
            multiple
            id="tags-outlined"
            options={[]}
            freeSolo
            filterSelectedOptions
            onChange={(_, values) => {
              setTags(values);
              setZeroTags(!values.length);
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Tags"
                error={zeroTags}
                helperText={zeroTags && 'Tags required'}
              />
            )}
          />
        </Stack>
      </FormikProvider>
    </Dialog>
  );
}

TaskCreateModal.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  selectedImage: PropTypes.array,
  imageList: PropTypes.array
};

export default TaskCreateModal;
