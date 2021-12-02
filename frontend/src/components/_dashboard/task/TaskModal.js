import * as React from 'react';
import ReactImageAnnotate from 'react-image-annotate';
import { Button, Box, Dialog, Slide, DialogTitle, Stack } from '@mui/material';

export default function TaskModal({ open, onClose }) {
  const Transition = React.forwardRef((props, ref) => {
    <Slide direction="up" ref={ref} {...props} />;
  });

  return (
    // <Dialog fullScreen open={open} onClose={onClose} TransitionComponent={Transition}>
    <Dialog fullScreen open={open} onClose={onClose}>
      <ReactImageAnnotate
        labelImages
        regionClsList={['Alpha', 'Beta', 'Charlie', 'Delta']}
        regionTagList={['tag1', 'tag2', 'tag3']}
        onExit={(e) => {
          console.log(e);
          onClose();
        }}
        images={[
          {
            src: 'https://placekitten.com/408/287',
            name: 'Image 1',
            regions: []
          }
        ]}
      />
    </Dialog>
  );
}
