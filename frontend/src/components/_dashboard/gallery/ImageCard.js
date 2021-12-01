import { useState } from 'react';
import PropTypes from 'prop-types';
// material
import {
  Box,
  Card,
  CardActionArea,
  Switch,
  Dialog,
  DialogTitle,
  Stack,
  TextField
} from '@mui/material';
import { styled } from '@mui/material/styles';
//
import Label from '../../Label';

// ----------------------------------------------------------------------

const ImageImgStyle = styled('img')({
  top: 0,
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  position: 'absolute'
});

// ----------------------------------------------------------------------

ImageCard.propTypes = {
  image: PropTypes.object,
  onSwitch: PropTypes.func
};

export default function ImageCard({ image, onSwitch }) {
  const { cover } = image;

  const [nameModal, setNameModal] = useState(false);
  const handleNameModal = () => setNameModal(true);
  const handleNameModalClose = () => setNameModal(false);

  const handleClick = () => {
    handleNameModal();
  };

  const [name, setName] = useState();
  const setNewName = (newName) => {
    onSwitch(newName);
    setName(newName);
  };

  return (
    <CardActionArea
      sx={{
        borderRadius: 2,
        transition: '0.2s',
        '&:hover': {
          transform: 'scale(1.1)'
        }
      }}
    >
      <Card onClick={handleClick}>
        <Box sx={{ pt: '100%', position: 'relative' }}>
          {name && (
            <Label
              variant="filled"
              color="info"
              sx={{
                zIndex: 9,
                top: 16,
                right: 16,
                position: 'absolute'
              }}
            >
              {name}
            </Label>
          )}
          <ImageImgStyle src={cover} />
        </Box>
      </Card>
      <NameModal open={nameModal} onClose={handleNameModalClose} setName={setNewName} />
    </CardActionArea>
  );
}

function NameModal({ open, onClose, setName }) {
  const [newName, setNewName] = useState('');
  const handleTextChange = (value) => {
    setNewName(value);
    if (selected) {
      setName(value);
    } else {
      setName(undefined);
    }
  };

  const [selected, setSelected] = useState(false);
  const handleSwitchChange = (event) => {
    setSelected(event.target.checked);
    if (event.target.checked) {
      setName(newName);
    } else {
      setName(undefined);
    }
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
        <DialogTitle>Select Image</DialogTitle>
        <Switch checked={selected} onChange={handleSwitchChange} />
      </Stack>
      <TextField
        label="Name"
        defaultValue={newName}
        disabled={!selected}
        sx={{ margin: 3, mt: 0 }}
        onChange={(e) => {
          handleTextChange(e.target.value);
        }}
        error={selected && newName.length === 0}
      />
    </Dialog>
  );
}
