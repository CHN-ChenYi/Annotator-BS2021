import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Icon } from '@iconify/react';
import codeDownloadFill from '@iconify/icons-eva/code-download-fill';
import personDeleteFill from '@iconify/icons-eva/person-delete-fill';
import editFill from '@iconify/icons-eva/edit-fill';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import checkMarkCircleFill from '@iconify/icons-eva/checkmark-circle-fill';
// material
import { alpha, styled } from '@mui/material/styles';
import {
  Dialog,
  Button,
  DialogActions,
  Link,
  Card,
  Grid,
  Avatar,
  Typography,
  CardContent,
  IconButton
} from '@mui/material';
// utils
import { fDate } from '../../../utils/formatTime';
//
import SvgIconStyle from '../../SvgIconStyle';
import { TaskDescriptionModal } from '.';
import { useUtils } from '../../../utils/utils';
import { exportCOCO, exportVOC } from './TaskExport';

// ----------------------------------------------------------------------

const CardMediaStyle = styled('div')({
  position: 'relative',
  paddingTop: 'calc(100% * 3 / 4)'
});

const TitleStyle = styled(Link)({
  height: 44,
  overflow: 'hidden',
  WebkitLineClamp: 2,
  display: '-webkit-box',
  WebkitBoxOrient: 'vertical'
});

const AvatarStyle = styled(Avatar)(({ theme }) => ({
  zIndex: 9,
  width: 32,
  height: 32,
  position: 'absolute',
  left: theme.spacing(3),
  bottom: theme.spacing(-2)
}));

const InfoStyle = styled('div')(({ theme }) => ({
  display: 'flex',
  flexWrap: 'wrap',
  justifyContent: 'flex-end',
  // marginTop: theme.spacing(3),
  color: theme.palette.text.disabled
}));

const CoverImgStyle = styled('img')({
  top: 0,
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  position: 'absolute'
});

// ----------------------------------------------------------------------

TaskCard.propTypes = {
  task: PropTypes.object.isRequired,
  index: PropTypes.number
};

export default function TaskCard({ task, index, taskType, updateTaskList }) {
  const utils = useUtils();
  const navigate = useNavigate();

  const [descriptionOpen, setDescriptionOpen] = useState(false);
  const handleDescriptionOpen = () => setDescriptionOpen(true);
  const handleDescriptionClose = () => setDescriptionOpen(false);

  // const { id, owner, title, description, worker, status, createdAt, updatedAt, coverImage } = task;
  const latestTaskLarge = index === 0;
  const latestTask = index === 1 || index === 2;

  const [download, setDownload] = useState(false);
  const handleDownload = () => setDownload(true);
  const handleDownloadClose = () => setDownload(false);

  return (
    <Grid item xs={12} sm={latestTaskLarge ? 12 : 6} md={latestTaskLarge ? 6 : 3}>
      <Card sx={{ position: 'relative' }}>
        <CardMediaStyle
          sx={{
            ...((latestTaskLarge || latestTask) && {
              pt: 'calc(100% * 4 / 3)',
              '&:after': {
                top: 0,
                content: "''",
                width: '100%',
                height: '100%',
                position: 'absolute',
                bgcolor: (theme) => alpha(theme.palette.grey[900], 0.72)
              }
            }),
            ...(latestTaskLarge && {
              pt: {
                xs: 'calc(100% * 4 / 3)',
                sm: 'calc(100% * 3 / 4.66)'
              }
            })
          }}
        >
          <SvgIconStyle
            color="paper"
            src="/static/icons/shape-avatar.svg"
            sx={{
              width: 80,
              height: 36,
              zIndex: 9,
              bottom: -15,
              position: 'absolute',
              ...((latestTaskLarge || latestTask) && { display: 'none' })
            }}
          />
          <AvatarStyle
            src={
              taskType.taskType === 0 && task.worker
                ? utils.getAvatar(task.worker.email)
                : utils.getAvatar(task.owner.email)
            }
            sx={{
              ...((latestTaskLarge || latestTask) && {
                zIndex: 9,
                top: 24,
                left: 24,
                width: 40,
                height: 40
              })
            }}
          />

          <CoverImgStyle src={utils.getImage(task.cover_image)} />
        </CardMediaStyle>

        <CardContent
          sx={{
            pt: 4,
            ...((latestTaskLarge || latestTask) && {
              bottom: 0,
              width: '100%',
              position: 'absolute'
            })
          }}
        >
          <Typography
            gutterBottom
            variant="caption"
            sx={{ color: 'text.disabled', display: 'block' }}
          >
            {fDate(Date.parse(task.updated_at))}
          </Typography>

          <TitleStyle
            to="#"
            color="inherit"
            variant="subtitle2"
            underline="hover"
            component={RouterLink}
            onClick={handleDescriptionOpen}
            sx={{
              ...(latestTaskLarge && { typography: 'h5', height: 60 }),
              ...((latestTaskLarge || latestTask) && {
                color: 'common.white'
              })
            }}
          >
            {task.title}
          </TitleStyle>
          <TaskDescriptionModal
            open={descriptionOpen}
            onClose={handleDescriptionClose}
            task={task}
            taskType={taskType}
          />

          {taskType.taskType === 0 && task.status === 2 && (
            <Dialog open={download} onClose={handleDownloadClose}>
              <DialogActions>
                <Button
                  variant="contained"
                  sx={{
                    margin: 2
                  }}
                  onClick={() => {
                    utils.fetch.get(`/task/${task.id}`).then((res) => {
                      exportCOCO(task, res.data);
                    });
                  }}
                >
                  Coco Format
                </Button>
                <Button
                  variant="contained"
                  sx={{
                    margin: 2
                  }}
                  onClick={() => {
                    utils.fetch.get(`/task/${task.id}`).then((res) => {
                      exportVOC(task, res.data);
                    });
                  }}
                >
                  Pascal Voc Format
                </Button>
              </DialogActions>
            </Dialog>
          )}
          <InfoStyle>
            {taskType.taskType === 0 && task.status === 2 && (
              <IconButton onClick={handleDownload}>
                <Icon icon={codeDownloadFill} />
              </IconButton>
            )}
            {taskType.taskType === 0 && task.worker && (
              <IconButton
                onClick={() => {
                  utils.fetch.delete(`/task/${task.id}/worker`);
                  updateTaskList();
                }}
              >
                <Icon icon={personDeleteFill} />
              </IconButton>
            )}
            {(taskType.taskType === 0 || taskType.taskType === 1) && (
              <IconButton
                onClick={() => {
                  navigate(`/dashboard/task/${task.id}`);
                }}
              >
                <Icon icon={editFill} />
              </IconButton>
            )}
            {taskType.taskType === 2 && (
              <IconButton
                onClick={() => {
                  utils.fetch.post(`/task/${task.id}/worker`);
                  new Promise((resolve) => setTimeout(resolve, 300)).then(() => {
                    updateTaskList();
                  });
                }}
              >
                <Icon icon={checkMarkCircleFill} />
              </IconButton>
            )}
          </InfoStyle>
        </CardContent>
      </Card>
    </Grid>
  );
}
