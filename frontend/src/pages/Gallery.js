import { useFormik } from 'formik';
import { useState } from 'react';
// material
import { Container, Button, Stack, Typography } from '@mui/material';
// components
import { Icon } from '@iconify/react';
import plusFill from '@iconify/icons-eva/plus-fill';
import { Link as RouterLink } from 'react-router-dom';
import Page from '../components/Page';
import { ProductSort, ProductList, ProductFilterSidebar } from '../components/_dashboard/products';
import ImageUploadModal from '../components/ImageUploadModal';
import VideoUploadModal from '../components/VideoUploadModal';
//
import PRODUCTS from '../_mocks_/products';

// ----------------------------------------------------------------------

export default function Gallery() {
  const [videoUpload, setVideoUpload] = useState(false);
  const handleVideoUpload = () => setVideoUpload(true);
  const handleVideoUploadClose = () => setVideoUpload(false);

  const [imageUpload, setImageUpload] = useState(false);
  const handleImageUpload = () => setImageUpload(true);
  const handleImageUploadClose = () => setImageUpload(false);

  const [openFilter, setOpenFilter] = useState(false);

  const formik = useFormik({
    initialValues: {
      gender: '',
      category: '',
      colors: '',
      priceRange: '',
      rating: ''
    },
    onSubmit: () => {
      setOpenFilter(false);
    }
  });

  const { resetForm, handleSubmit } = formik;

  const handleOpenFilter = () => {
    setOpenFilter(true);
  };

  const handleCloseFilter = () => {
    setOpenFilter(false);
  };

  const handleResetFilter = () => {
    handleSubmit();
    resetForm();
  };

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

        <Stack
          direction="row"
          flexWrap="wrap-reverse"
          alignItems="center"
          justifyContent="flex-end"
          sx={{ mb: 5 }}
        >
          <Stack direction="row" spacing={1} flexShrink={0} sx={{ my: 1 }}>
            <ProductFilterSidebar
              formik={formik}
              isOpenFilter={openFilter}
              onResetFilter={handleResetFilter}
              onOpenFilter={handleOpenFilter}
              onCloseFilter={handleCloseFilter}
            />
            <ProductSort />
          </Stack>
        </Stack>

        <ProductList products={PRODUCTS} />
      </Container>
    </Page>
  );
}
