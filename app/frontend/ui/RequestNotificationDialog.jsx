import React from 'react';
import Button from '@material-ui/core/Button';
import Avatar from '@material-ui/core/Avatar';
import CloseIcon from '@material-ui/icons/Close';
import Typography from '@material-ui/core/Typography';
import Drawer from '@material-ui/core/Drawer';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardContent from '@material-ui/core/CardContent';
import IconButton from '@material-ui/core/IconButton';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
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
  substitute: {
    width: 60,
    height: 60
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
              <Avatar src={process.env.SUBSTITUTE_URL} style={styles.substitute} />
            }
            action={
              <IconButton onClick={this.props.handleCancelButtonClick}>
                <CloseIcon />
              </IconButton>
            }
            title={
              <Typography gutterBottom variant="title">
                Qoodish からのプッシュ通知を受け取りますか？
              </Typography>
            }
            subheader="qoodish.com"
          />
          <CardContent>
            <Typography component="p" gutterBottom>
              プッシュ通知を許可すると次のことが実現できます。
            </Typography>
            <List disablePadding>
              {this.renderListItems()}
            </List>
            <div style={styles.buttonContainer}>
              <Button
                variant="raised"
                onClick={this.props.handleAllowNotificationButtonClick}
                color="primary"
              >
                プッシュ通知を許可する
              </Button>
            </div>
          </CardContent>
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
        <ListItemText primary={message} />
      </ListItem>
    ));
  }
}

export default RequestNotificationDialog;
