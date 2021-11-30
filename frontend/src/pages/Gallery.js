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
import FileUploadModal from '../components/FileUploadModal';
//
import PRODUCTS from '../_mocks_/products';

// ----------------------------------------------------------------------

export default function Gallery() {
  const [upload, setUpload] = useState(false);
  const handleUpload = () => setUpload(true);
  const handleUploadClose = () => setUpload(false);

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
          <Button
            variant="contained"
            component={RouterLink}
            to="#"
            startIcon={<Icon icon={plusFill} />}
            onClick={handleUpload}
          >
            New Images
          </Button>
          <FileUploadModal open={upload} onClose={handleUploadClose} />
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
