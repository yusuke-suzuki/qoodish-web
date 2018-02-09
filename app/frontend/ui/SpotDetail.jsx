import React, { Component } from 'react';
import IconButton from 'material-ui/IconButton';
import Drawer from 'material-ui/Drawer';
import Button from 'material-ui/Button';
import List, { ListItem, ListItemText } from 'material-ui/List';
import Avatar from 'material-ui/Avatar';
import Card, { CardMedia } from 'material-ui/Card';
import Typography from 'material-ui/Typography';
import Collapse from 'material-ui/transitions/Collapse';
import ExpandMoreIcon from 'material-ui-icons/ExpandMore';
import RateReviewIcon from 'material-ui-icons/RateReview';
import AddLocationIcon from 'material-ui-icons/AddLocation';
import DirectionsIcon from 'material-ui-icons/Directions';
import Divider from 'material-ui/Divider';
import Toolbar from 'material-ui/Toolbar';
import GridList, { GridListTile, GridListTileBar } from 'material-ui/GridList';
import ChevronRightIcon from 'material-ui-icons/ChevronRight';
import ArrowBackIcon from 'material-ui-icons/ArrowBack';
import BottomNavigation, { BottomNavigationAction } from 'material-ui/BottomNavigation';
import PlaceIcon from 'material-ui-icons/Place';
import Dialog, { DialogContent } from 'material-ui/Dialog';
import Slide from 'material-ui/transitions/Slide';
import AppBar from 'material-ui/AppBar';

const styles = {
  drawer: {
    position: 'fixed',
    zIndex: 1
  },
  cardContainerLarge: {
    marginTop: 64,
    width: 350,
    height: 'calc(100% - 64px)'
  },
  cardContainerSmall: {
  },
  cardLarge: {
    height: '100%',
    overflowY: 'scroll'
  },
  cardSmall: {
    height: '100%',
    width: '100%',
    overflowY: 'scroll',
    position: 'absolute'
  },
  media: {
    width: '100%',
    height: 'inherit'
  },
  spotName: {
    whiteSpace: 'initial'
  },
  spotAddress: {
    whiteSpace: 'initial'
  },
  toolbar: {
    cursor: 'pointer'
  },
  spotToolbar: {
    backgroundImage: 'linear-gradient(to bottom,rgba(0,0,0,.5),rgba(0,0,0,0))',
    position: 'absolute',
    zIndex: 1,
    right: 0,
    left: 0
  },
  spotToobarIcon: {
    color: 'white'
  },
  toolbarActions: {
    marginLeft: 'auto'
  },
  expandOpen: {
    transform: 'rotate(180deg)'
  },
  expandTitle: {
    paddingLeft: 16,
    display: 'inline-flex'
  },
  expandContentIcon: {
    marginRight: 10
  },
  reviewImage: {
    width: 40,
    height: 40
  },
  tileBar: {
    paddingTop: 16,
    paddingBottom: 16,
    height: 'initial'
  },
  dialogContent: {
    padding: 0
  },
  gridList: {
    width: '100%',
    margin: 0
  },
  gridListTile: {
    height: 'auto'
  },
  backIcon: {
    color: 'white'
  },
  appbar: {
    position: 'sticky'
  }
};

function Transition(props) {
  return <Slide direction='up' {...props} />;
}

class SpotDetail extends Component {
  constructor(props) {
    super(props);
    this.state = {
      collaboratorExpanded: true,
      reviewExpanded: true,
    };
    this.handleExpandReviewClick = this.handleExpandReviewClick.bind(this);
  }

  handleExpandReviewClick() {
    this.setState({
      reviewExpanded: !this.state.reviewExpanded
    });
  }

  render() {
    return (
      <div>
        {this.props.large ? this.renderDrawer() : this.renderDialog()}
      </div>
    );
  }

  renderDrawer() {
    return (
      <Drawer
        anchor='right'
        open={this.props.drawerOpen}
        style={styles.drawer}
        type='persistent'
        elevation={0}
      >
        {this.props.currentSpot && this.renderSpotSummary(this.props.currentSpot)}
      </Drawer>
    );
  }

  renderDialog() {
    return (
      <Dialog
        fullScreen
        open={!this.props.large && this.props.drawerOpen}
        transition={Transition}
      >
        {this.renderAppBar()}
        <DialogContent style={styles.dialogContent}>
          {this.renderSpotSummary(this.props.currentSpot)}
        </DialogContent>
      </Dialog>
    );
  }

  renderAppBar() {
    return (
      <AppBar style={styles.appbar}>
        <Toolbar disableGutters>
          <IconButton onClick={this.props.handleCloseSpotButtonClick}>
            <ArrowBackIcon style={styles.backIcon} />
          </IconButton>
          <Typography
            type='headline'
            color='inherit'
          >
            Spot
          </Typography>
        </Toolbar>
      </AppBar>
    )
  }

  renderSpotSummary(spot) {
    return (
      <div style={this.props.large ? styles.cardContainerLarge : styles.cardContainerSmall}>
        {this.props.large && this.renderToolbar()}
        <Card style={this.props.large ? styles.cardLarge : styles.cardSmall}>
          {this.renderThumbnail(spot)}
          <BottomNavigation showLabels>
            <BottomNavigationAction
              label='ADD'
              icon={<AddLocationIcon />}
              onClick={() => this.props.handleAddReviewButtonClick(spot)}
              disabled={!this.ableToPost(this.props.currentMap)}
            />
            <BottomNavigationAction
              label='DIRECTIONS'
              icon={<DirectionsIcon />}
              onClick={() => this.props.handleRouteButtonClick(spot, this.props.currentPosition)}
            />
          </BottomNavigation>
          <Divider />
          <Toolbar style={styles.toolbar} disableGutters onClick={this.handleExpandReviewClick}>
            <Typography style={styles.expandTitle} type='title' color='textSecondary'>
              <RateReviewIcon style={styles.expandContentIcon}/> Reports
            </Typography>
            <div style={styles.toolbarActions}>
              <IconButton
                aria-expanded={this.state.reviewExpanded}
                aria-label='Show more'
               >
                 <ExpandMoreIcon style={this.state.reviewExpanded ? styles.expandOpen : {}} />
              </IconButton>
            </div>
          </Toolbar>
          <Collapse in={this.state.reviewExpanded}>
            <List disablePadding>
              {this.props.spotReviews.length > 0 && this.renderSpotReviews(this.props.spotReviews)}
            </List>
          </Collapse>
        </Card>
      </div>
    );
  }

  renderToolbar() {
    return (
      <Toolbar style={styles.spotToolbar} disableGutters>
        <div>
          <IconButton
            onClick={this.props.handleCloseSpotButtonClick}
          >
            <ChevronRightIcon style={styles.spotToobarIcon} />
          </IconButton>
        </div>
      </Toolbar>
    );
  }

  renderThumbnail(spot) {
    return (
      <GridList
        cols={1}
        spacing={0}
        style={styles.gridList}
      >
        <GridListTile
          key={spot.place_id}
          style={styles.gridListTile}
        >
          <img src={spot.image_url} style={styles.media} />
          <GridListTileBar
            title={
              <Typography type='headline' component='h2' color='inherit' style={styles.spotName} >
                <PlaceIcon /> {spot.name}
              </Typography>
            }
            subtitle={
              <Typography component='p' color='inherit' style={styles.spotAddress}>
                {spot.formatted_address}
              </Typography>
            }
            style={styles.tileBar}
          />
        </GridListTile>
      </GridList>
    );
  }

  renderSpotReviews(reviews) {
    return reviews.map((review) => (
      <ListItem button key={review.id} onClick={() => this.props.handleReviewClick(review)}>
        <Avatar>
          <img src={review.author.profile_image_url} style={styles.reviewImage} />
        </Avatar>
        <ListItemText
          disableTypography={true}
          primary={
            <Typography type='subheading' noWrap>
              {review.author.name}
            </Typography>
          }
          secondary={
            <Typography component='p' noWrap color='textSecondary'>
              {review.comment}
            </Typography>
          }
        />
      </ListItem>
    ));
  }

  ableToPost(map) {
    if (!map) {
      return false;
    } else {
      return (map.following && (map.shared || map.editable));
    }
  }
}

export default SpotDetail;
