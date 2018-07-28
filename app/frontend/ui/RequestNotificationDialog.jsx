import React from 'react';
import Button from '@material-ui/core/Button';
import Avatar from '@material-ui/core/Avatar';
import Typography from '@material-ui/core/Typography';
import Drawer from '@material-ui/core/Drawer';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardContent from '@material-ui/core/CardContent';
import CardActions from '@material-ui/core/CardActions';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import DoneIcon from '@material-ui/icons/Done';

const styles = {
  drawerPaperLarge: {
    width: 700,
    margin: '64px auto',
    zIndex: 1000
  },
  drawerPaperSmall: {
  },
  cardContent: {
    paddingTop: 0,
    paddingBottom: 0,
    maxHeight: 200,
    overflowY: 'scroll'
  },
  listItemText: {
    paddingLeft: 0,
    paddingRight: 0
  },
  cardActions: {
    paddingLeft: 24,
    paddingRight: 24,
    paddingBottom: 16,
    justifyContent: 'flex-end'
  },
  buttonContainer: {
    width: '100%',
    textAlign: 'right'
  }
};

class RequestNotificationDialog extends React.Component {
  constructor(props) {
    super(props);
    this.notificationMessages = [
      'フォロー中のマップに新しい投稿があった際に通知を受け取ることができます。',
      '作成したマップが誰かにフォローされた際に通知を受け取ることができます。',
      '自分の投稿に「いいね！」がされた際に通知を受け取ることができます。',
      //'コメントなど最新の投稿をリロードせずに画面上に反映できるようになります。'
    ];
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.registrationToken) {
      this.props.handleNotificationAllowed();
    }
  }

  render() {
    return (
      <Drawer
        variant="persistent"
        anchor={this.props.large ? "top" : "bottom"}
        open={this.props.dialogOpen}
        PaperProps={{
          style: this.props.large ? styles.drawerPaperLarge : styles.drawerPaperSmall,
          elevation: 3
        }}
      >
        <Card>
          <CardHeader
            avatar={
              <Avatar src={process.env.SUBSTITUTE_URL} />
            }
            title="Qoodish からのプッシュ通知を受け取りますか？"
            subheader="qoodish.com"
          />
          <CardContent style={styles.cardContent}>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              プッシュ通知を許可すると次のことが実現できます。
            </Typography>
            <List disablePadding>
              {this.renderListItems()}
            </List>
          </CardContent>
          <CardActions style={styles.cardActions}>
            <Button
              onClick={this.props.handleCancelButtonClick}
            >
              受け取らない
            </Button>
            <Button
              variant="raised"
              onClick={this.props.handleAllowNotificationButtonClick}
              color="primary"
            >
              受け取る
            </Button>
          </CardActions>
        </Card>
      </Drawer>
    );
  }

  renderListItems() {
    return this.notificationMessages.map((message, i) => (
      <ListItem disableGutters key={i}>
        <ListItemIcon>
          <DoneIcon />
        </ListItemIcon>
        <ListItemText
          primary={
            <Typography variant="body1">
              {message}
            </Typography>
          }
          style={styles.listItemText}
        />
      </ListItem>
    ));
  }
}

export default RequestNotificationDialog;
