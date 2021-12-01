import { Icon } from '@iconify/react';
import PropTypes from 'prop-types';
import folderAddFill from '@iconify/icons-eva/folder-add-fill';
// material
import { styled } from '@mui/material/styles';
import { Badge } from '@mui/material';

// ----------------------------------------------------------------------

const RootStyle = styled('div')(({ theme }) => ({
  zIndex: 999,
  right: 0,
  display: 'flex',
  cursor: 'pointer',
  position: 'fixed',
  alignItems: 'center',
  top: theme.spacing(16),
  height: theme.spacing(5),
  paddingLeft: theme.spacing(2),
  paddingRight: theme.spacing(2),
  paddingTop: theme.spacing(1.25),
  boxShadow: theme.customShadows.z20,
  color: theme.palette.text.primary,
  backgroundColor: theme.palette.background.paper,
  borderTopLeftRadius: theme.shape.borderRadiusMd,
  borderBottomLeftRadius: theme.shape.borderRadiusMd,
  transition: theme.transitions.create('opacity'),
  opacity: 0.8,
  '&:hover': { opacity: 1 }
}));

// ----------------------------------------------------------------------

CartWidget.propTypes = {
  content: PropTypes.number,
  handleClick: PropTypes.func
};

export default function CartWidget({ content, handleClick }) {
  return (
    <RootStyle>
      <Badge showZero badgeContent={content} color="error" max={99} onClick={handleClick}>
        <Icon icon={folderAddFill} width={28} height={28} />
      </Badge>
    </RootStyle>
  );
}
