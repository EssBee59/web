import React, { forwardRef, useContext, useState } from 'react';
import { Box, Divider, ListItemIcon, ListItemText, MenuItem, Paper, Typography } from '@mui/material';
import styles from '../trackmenu.module.css';
import { ReactComponent as TimeIcon } from '../../../assets/icons/ic_action_gsave_dark.svg';
import { ReactComponent as RenameIcon } from '../../../assets/icons/ic_action_edit_outlined.svg';
import { ReactComponent as DeleteIcon } from '../../../assets/icons/ic_action_delete_outlined.svg';
import GpxCollection from '../GpxCollection';
import RenameDialog from '../../../dialogs/tracks/RenameDialog';
import DeleteFolderDialog from '../../../dialogs/tracks/DeleteFolderDialog';
import { apiPost } from '../../../util/HttpApi';
import AppContext from '../../../context/AppContext';

const GroupActions = forwardRef(({ group, setOpenActions, setProcessDownload }, ref) => {
    const ctx = useContext(AppContext);

    const [newCollection, setNewCollection] = useState([]);
    const [openRenameDialog, setOpenRenameDialog] = useState(false);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

    async function downloadFolderBackup() {
        setProcessDownload(true);
        const res = await apiPost(`${process.env.REACT_APP_USER_API_SITE}/mapapi/download-backup-folder`, [], {
            params: {
                format: '.osf',
                folderName: group.fullName,
                type: 'GPX',
            },
            headers: {
                'Content-Type': 'application/json',
            },
            responseType: 'arraybuffer',
            throwErrors: true,
        }).catch(() => {
            setProcessDownload(false);
            ctx.setTrackErrorMsg({
                title: 'Get osf error',
                msg: `We couldn't download osf fo folder ${group.name}. Please contact us at support@osmand.net`,
            });
        });
        if (res.status === 200) {
            setProcessDownload(false);
            let name = res.headers['content-disposition'].split('filename=')[1];
            const url = document.createElement('a');
            url.href = URL.createObjectURL(new Blob([res.data], { type: 'octet/stream' }));
            url.download = `${name}`;
            url.click();
        }
    }

    return (
        <>
            <Box ref={ref}>
                <Paper className={styles.actions}>
                    <MenuItem
                        disabled={group.realSize === 0}
                        className={styles.action}
                        onClick={() => {
                            downloadFolderBackup().then();
                            setOpenActions(false);
                        }}
                    >
                        <ListItemIcon className={styles.iconAction}>
                            <TimeIcon />
                        </ListItemIcon>
                        <ListItemText>
                            <Typography variant="inherit" className={styles.actionName} noWrap>
                                Download as OSF
                            </Typography>
                        </ListItemText>
                    </MenuItem>
                    <MenuItem
                        disabled={group.realSize === 0}
                        className={styles.action}
                        onClick={() => {
                            setNewCollection(group.files);
                            setOpenActions(false);
                        }}
                    >
                        <ListItemIcon className={styles.iconAction}>
                            <TimeIcon />
                        </ListItemIcon>
                        <ListItemText>
                            <Typography variant="inherit" className={styles.actionName} noWrap>
                                Download as OBF Collection
                            </Typography>
                        </ListItemText>
                    </MenuItem>
                    <Divider className={styles.dividerActions} />
                    <MenuItem className={styles.action} onClick={() => setOpenRenameDialog(true)}>
                        <ListItemIcon className={styles.iconAction}>
                            <RenameIcon />
                        </ListItemIcon>
                        <ListItemText>
                            <Typography variant="inherit" className={styles.actionName} noWrap>
                                Rename
                            </Typography>
                        </ListItemText>
                    </MenuItem>
                    <Divider className={styles.dividerActions} />
                    <MenuItem className={styles.action} onClick={() => setOpenDeleteDialog(true)}>
                        <ListItemIcon className={styles.iconAction}>
                            <DeleteIcon />
                        </ListItemIcon>
                        <ListItemText>
                            <Typography variant="inherit" className={styles.actionName} noWrap>
                                Delete
                            </Typography>
                        </ListItemText>
                    </MenuItem>
                </Paper>
            </Box>
            {newCollection.length > 0 && (
                <GpxCollection tracks={newCollection} setProcessDownload={setProcessDownloadObf} />
            )}
            {openRenameDialog && (
                <RenameDialog setOpenDialog={setOpenRenameDialog} group={group} setOpenActions={setOpenActions} />
            )}
            {openDeleteDialog && (
                <DeleteFolderDialog
                    setOpenDialog={setOpenDeleteDialog}
                    folder={group}
                    setOpenActions={setOpenActions}
                />
            )}
        </>
    );
});

GroupActions.displayName = 'GroupActions';
export default GroupActions;
