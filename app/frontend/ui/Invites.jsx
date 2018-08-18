import React from 'react';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardContent from '@material-ui/core/CardContent';
import CardActions from '@material-ui/core/CardActions';
import Button from '@material-ui/core/Button';
import Avatar from '@material-ui/core/Avatar';
import Typography from '@material-ui/core/Typography';
import CircularProgress from '@material-ui/core/CircularProgress';
import moment from 'moment';
import NoContentsContainer from '../containers/NoContentsContainer';
import I18n from '../containers/I18n';

const styles = {
  rootLarge: {
    margin: '94px auto 200px',
    maxWidth: 700
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

export default class Invites extends React.PureComponent {
  componentWillMount() {
    this.props.updatePageTitle();

    if (!this.props.currentUser.isAnonymous) {
      this.props.fetchInvites();
    }

    gtag('config', process.env.GA_TRACKING_ID, {
      'page_path': '/invites',
      'page_title': `${I18n.t('invites')} | Qoodish'`
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
          message={I18n.t('no invites here')}
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
            {I18n.t('follow')}
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
