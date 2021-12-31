import PropTypes from 'prop-types';
// material
import { Grid } from '@mui/material';
import ImageCard from './ImageCard';

// ----------------------------------------------------------------------

ImageList.propTypes = {
  images: PropTypes.array.isRequired,
  onSwitch: PropTypes.func.isRequired
};

export default function ImageList({ images, onSwitch, ...other }) {
  return (
    <Grid container spacing={3} {...other}>
      {images.map((image, i) => (
        <Grid key={image} item xs={12} sm={6} md={3}>
          <ImageCard image={{ cover: image }} onSwitch={(name) => onSwitch(i, name)} />
        </Grid>
      ))}
    </Grid>
  );
}
