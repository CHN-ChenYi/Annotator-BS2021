// https://github.com/iamchathu/react-material-file-upload/blob/master/src/index.tsx
import { Icon } from '@iconify/react';
import CloudUploadIcon from '@iconify/icons-eva/cloud-upload-fill';
import { Box, Button, FormControl, FormHelperText, Typography } from '@mui/material';
import { useDropzone } from 'react-dropzone';
import FileListItem from './FileListItem';

const FileUpload = ({
  value,
  onChange,
  sx,
  title,
  buttonText,
  typographyProps,
  buttonProps,
  disabled,
  maxSize,
  ...options
}) => {
  const { fileRejections, getRootProps, getInputProps, open } = useDropzone({
    ...options,
    disabled,
    maxSize,
    onDropAccepted: onChange,
    noClick: true,
    noKeyboard: true,
    accept: 'image/jpeg'
  });

  const isFileTooLarge =
    maxSize !== undefined && fileRejections.length > 0 && fileRejections[0].file.size > maxSize;

  const remove = (index) => {
    const files = [...value];
    files.splice(index, 1);
    onChange(files);
  };

  const files = value?.map((file, i) => (
    <FileListItem key={file.name} name={file.name} onDelete={() => remove(i)} />
  ));

  return (
    <Box
      {...getRootProps()}
      sx={{
        margin: 3,
        marginTop: 1,
        border: 1,
        borderRadius: 1,
        borderColor: 'rgba(0, 0, 0, 0.23)',
        paddingY: 3,
        paddingX: 1,
        '&:hover': {
          borderColor: disabled ? undefined : 'text.primary'
        },
        '&:focus-within': {
          borderColor: 'primary.main',
          borderWidth: 2
        },
        ...sx
      }}
    >
      <FormControl
        error={isFileTooLarge}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center'
        }}
      >
        <input {...getInputProps()} />
        <Icon
          icon={CloudUploadIcon}
          sx={{ fontSize: 40 }}
          color={disabled ? 'disabled' : 'primary'}
        />
        <Typography variant="caption" textAlign="center" sx={{ paddingY: 1 }} {...typographyProps}>
          {title}
        </Typography>
        <Button onClick={open} disabled={disabled} sx={{ marginBottom: 1 }} {...buttonProps}>
          {buttonText}
        </Button>
        <FormHelperText> {fileRejections[0]?.errors[0]?.message} </FormHelperText>
      </FormControl>
      <Box
        component="ul"
        sx={{
          display: 'flex',
          justifyContent: 'center',
          flexWrap: 'wrap',
          listStyle: 'none',
          p: 0.5,
          m: 0
        }}
      >
        {files}
      </Box>
    </Box>
  );
};

FileUpload.defaultProps = {
  title: "Drag 'n' drop some files here, or click the button to select files",
  buttonText: 'Select'
};

export default FileUpload;
