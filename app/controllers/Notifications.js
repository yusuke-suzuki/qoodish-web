import Application from './Application';
import QoodishClient from '../models/QoodishClient';

class Notifications extends Application {
  async index(ctx) {
    const client = new QoodishClient;
    let notifications = await client.fetchNotifications(ctx.request.headers.authorization, ctx.currentLocale);
    return notifications;
  }

  async update(ctx) {
    const client = new QoodishClient;
    let notification = await client.readNotification(ctx.request.headers.authorization, ctx.params.notificationId, ctx.currentLocale);
    return notification;
  }
}

export default Notifications;
