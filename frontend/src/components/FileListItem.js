import { Chip } from '@mui/material';
import { styled } from '@mui/material/styles';

const ListItem = styled('li')(({ theme }) => ({
  margin: theme.spacing(0.5)
}));

const FileListItem = ({ name, onDelete }) => (
  <ListItem>
    <Chip label={name} variant="outlined" sx={{ maxWidth: 200 }} onDelete={onDelete} />
  </ListItem>
);

export default FileListItem;
