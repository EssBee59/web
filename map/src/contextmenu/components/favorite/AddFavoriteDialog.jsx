import {Dialog} from "@material-ui/core";
import {
    Button,
    Grid,
    IconButton,
    ListItemText
} from "@mui/material";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import React, {useContext, useEffect, useState} from "react";
import contextMenuStyles from "../../styles/ContextMenuStyles";
import AppContext from "../../../context/AppContext";
import {Add, Close} from "@mui/icons-material";
import MarkerOptions from "../../../map/markers/MarkerOptions";
import FavoriteName from "./structure/FavoriteName";
import FavoriteAddress from "./structure/FavoriteAddress";
import FavoriteDescription from "./structure/FavoriteDescription";
import FavoriteGroup from "./structure/FavoriteGroup";
import FavoriteIcon from "./structure/FavoriteIcon";
import FavoriteColor from "./structure/FavoriteColor";
import FavoriteShape from "./structure/FavoriteShape";
import FavoritesManager from "../../../context/FavoritesManager";
import FavoriteEditHelper from "./FavoriteEditHelper";

export default function AddFavoriteDialog({dialogOpen, setDialogOpen}) {

    const menuStyles = contextMenuStyles();
    const ctx = useContext(AppContext);

    const [favoriteName, setFavoriteName] = useState('');
    const [favoriteAddress, setFavoriteAddress] = useState('');
    const [favoriteDescription, setFavoriteDescription] = useState('');
    const [addAddress, setAddAddress] = useState(false);
    const [addDescription, setAddDescription] = useState(false);
    const [favoriteGroup, setFavoriteGroup] = useState(null);
    const [favoriteIcon, setFavoriteIcon] = useState(MarkerOptions.DEFAULT_WPT_ICON);
    const [favoriteIconCategories, setFavoriteIconCategories] = useState(null);
    const [favoriteColor, setFavoriteColor] = useState(MarkerOptions.DEFAULT_WPT_COLOR);
    const [favoriteShape, setFavoriteShape] = useState(MarkerOptions.BACKGROUND_WPT_SHAPE_CIRCLE);
    const [currentIconCategories, setCurrentIconCategories] = useState(null);
    const [errorName, setErrorName] = useState(false);

    useEffect(() => {
        getIconCategories().then();
    }, [dialogOpen]);

    async function getIconCategories() {
        let resp = await fetch(FavoritesManager.FAVORITE_GROUP_FOLDER)
        const res = await resp.json();
        if (res) {
            setCurrentIconCategories('special');
            setFavoriteIconCategories(res);
        }
    }

    async function save() {
        let selectedGroup = favoriteGroup === null ? ctx.favorites.groups.find(g => g.name === FavoritesManager.DEFAULT_GROUP_NAME) : favoriteGroup;
        let favorite;
        if (selectedGroup) {
            favorite = {
                name: favoriteName,
                address: favoriteAddress === "" ? null : favoriteAddress,
                desc: favoriteDescription === "" ? null : favoriteDescription,
                color: favoriteColor,
                background: favoriteShape,
                icon: favoriteIcon,
                category: getCategoryName(selectedGroup),
                lat: ctx.addFavorite.location.lat,
                lon: ctx.addFavorite.location.lng
            };
        }
        let result = await FavoritesManager.addFavorite(
            favorite,
            selectedGroup.file.name,
            selectedGroup.updatetimems)
        if (result) {
            updateGroupMarkers(result, selectedGroup);
            closeDialog();
        }
    }

    function getCategoryName(selectedGroup) {
        return selectedGroup.name !== FavoritesManager.DEFAULT_GROUP_NAME ? selectedGroup.name : null;
    }

    function closeDialog() {
        ctx.addFavorite.location = null;
        ctx.setAddFavorite({...ctx.addFavorite});
        setDialogOpen(false);
    }

    function updateGroupMarkers(result, selectedGroup) {
        if (!ctx.favorites[selectedGroup.name]) {
            ctx.favorites[selectedGroup.name] = result.data;
            ctx.favorites[selectedGroup.name].url = `${process.env.REACT_APP_USER_API_SITE}/mapapi/download-file?type=${encodeURIComponent(selectedGroup.file.type)}&name=${encodeURIComponent(selectedGroup.file.name)}`;
        } else {
            delete ctx.favorites[selectedGroup.name].markers;
            Object.keys(result.data).forEach(t => {
                ctx.favorites[selectedGroup.name][`${t}`] = result.data[t];
            });
        }

        ctx.favorites[selectedGroup.name].clienttimems = result.clienttimems;
        ctx.favorites[selectedGroup.name].updatetimems = result.updatetimems;

        FavoriteEditHelper.updateSelectedGroup(ctx.favorites.groups, selectedGroup.name, result);
        FavoriteEditHelper.updateSelectedFile(ctx, null, favoriteName, selectedGroup.name, false);

        ctx.setFavorites({...ctx.favorites});
        setFavoriteGroup(ctx.favorites[selectedGroup.name]);
    }

    const CloseDialog = (dialogOpen) => {
        return <IconButton
            variant="contained"
            type="button"
            onClick={() => dialogOpen(false)}
        >
            <Close fontSize="small"/>
        </IconButton>
    }

    return (
        <Dialog open={dialogOpen}>
            <Grid container spacing={2}>
                <Grid className={menuStyles.name} item xs={11} sx={{mb: -3}}>
                    <DialogTitle>Add favorite</DialogTitle>
                </Grid>
                <Grid item xs={1} sx={{ml: -2, mt: 1}}>
                    {CloseDialog(setDialogOpen)}
                </Grid>
            </Grid>
            <DialogContent>
                <FavoriteName favoriteName={favoriteName}
                              setFavoriteName={setFavoriteName}
                              favoriteGroup={favoriteGroup}
                              setErrorName={setErrorName}/>
                {!addAddress && <ListItemText>
                    <IconButton sx={{mt: -1}}
                                onClick={() => setAddAddress(true)}>
                        <Add/>
                    </IconButton>
                    Add address
                </ListItemText>}
                {addAddress && <FavoriteAddress favoriteAddress={favoriteAddress}
                                                setFavoriteAddress={setFavoriteAddress}
                                                setClose={setAddAddress}/>}
                {!addDescription && <ListItemText>
                    <IconButton sx={{mt: -1}}
                                onClick={() => setAddDescription(true)}>
                        <Add/>
                    </IconButton>
                    Add description
                </ListItemText>}
                {addDescription && <FavoriteDescription favoriteDescription={favoriteDescription}
                                                        setFavoriteDescription={setFavoriteDescription}
                                                        setClose={addDescription}/>}
                <FavoriteGroup favoriteGroup={favoriteGroup}
                               setFavoriteGroup={setFavoriteGroup}
                               groups={ctx.favorites.groups}
                               defaultGroup={FavoritesManager.DEFAULT_GROUP_NAME}/>
                <FavoriteIcon favoriteIcon={favoriteIcon}
                              setFavoriteIcon={setFavoriteIcon}
                              currentIconCategories={currentIconCategories}
                              favoriteIconCategories={favoriteIconCategories}
                              selectedGpxFile={ctx.selectedGpxFile}
                              add={true}
                              defaultIcon={MarkerOptions.DEFAULT_WPT_ICON}/>
                <FavoriteColor favoriteColor={favoriteColor}
                               setFavoriteColor={setFavoriteColor}
                               defaultColor={MarkerOptions.DEFAULT_WPT_COLOR}/>
                <FavoriteShape color={favoriteColor}
                               favoriteShape={favoriteShape}
                               setFavoriteShape={setFavoriteShape}
                               defaultBackground={MarkerOptions.BACKGROUND_WPT_SHAPE_CIRCLE}/>
            </DialogContent>
            <DialogActions>
                <Button disabled={errorName} onClick={() => save()}>
                    Save</Button>
            </DialogActions>
        </Dialog>
    );
}