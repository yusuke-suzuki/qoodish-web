import React from 'react';
import Card, { CardHeader, CardContent, CardActions } from 'material-ui/Card';
import Button from 'material-ui/Button';
import Avatar from 'material-ui/Avatar';
import Typography from 'material-ui/Typography';
import { CircularProgress } from 'material-ui/Progress';
import moment from 'moment';
import NoContentsContainer from '../containers/NoContentsContainer';

const styles = {
  rootLarge: {
    margin: '94px auto',
    maxWidth: 600,
    minWidth: 320
  },
  rootSmall: {
    margin: '72px auto'
  },
  cardLarge: {
    marginTop: 20
  },
  cardSmall: {
    marginTop: 16
  },
  avatar: {
    width: 40
  },
  cardContent: {
    paddingTop: 0
  },
  contentText: {
    wordBreak: 'break-all'
  },
  progress: {
    textAlign: 'center',
    padding: 10,
    marginTop: 20
  }
};

export default class Invites extends React.Component {
  componentWillMount() {
    this.props.updatePageTitle();
    this.props.fetchInvites();
    gtag('config', process.env.GA_TRACKING_ID, {
      'page_path': '/invites',
      'page_title': 'Invites | Qoodish'
    });
  }

  render() {
    return (
      <div style={this.props.large ? styles.rootLarge : styles.rootSmall}>
        <div>
          {this.props.loadingInvites
            ? this.renderProgress()
            : this.renderInvitesContainer(this.props.invites)}
        </div>
      </div>
    );
  }

  renderProgress() {
    return (
      <div style={styles.progress}>
        <CircularProgress />
      </div>
    );
  }

  renderInvitesContainer(invites) {
    if (invites.length > 0) {
      return this.renderInviteCards(invites)
    } else {
      return (
        <NoContentsContainer
          contentType="invite"
          message="When you received invites, you will see here."
        />
      );
    }
  }

  renderInviteCards(invites) {
    return invites.map((invite) => (
      <Card
        key={invite.id}
        style={
          this.props.large
            ? styles.cardLarge
            : styles.cardSmall
        }
      >
        <CardHeader
          avatar={
            <Avatar>
              <img
                src={invite.invitable.image_url}
                style={styles.avatar}
              />
            </Avatar>
          }
          title={invite.invitable.name}
          subheader={this.renderCreatedAt(invite)}
        />
        <CardContent style={styles.cardContent}>
          <Typography component="p" style={styles.contentText}>
            {invite.invitable.description}
          </Typography>
        </CardContent>
        <CardActions>
          <Button
            variant="raised"
            color="primary"
            onClick={() => this.props.handleFollowButtonClick(invite)}
            disabled={invite.expired}
          >
            Follow
          </Button>
        </CardActions>
      </Card>
    ));
  }

  renderCreatedAt(invite) {
    return moment(invite.created_at, 'YYYY-MM-DDThh:mm:ss.SSSZ')
      .locale(window.currentLocale)
      .format('LL');
  }
}
