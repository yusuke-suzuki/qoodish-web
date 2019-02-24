import getCurrentUser from './getCurrentUser';

class ApiClient {
  async getCurrentToken() {
    const currentUser = await getCurrentUser();
    const token = await currentUser.getIdToken();
    return `Bearer ${token}`;
  }

  async getCurrentUid() {
    const currentUser = await getCurrentUser();
    return currentUser.uid;
  }

  async fetchReviewLikes(reviewId) {
    let url = `${process.env.API_ENDPOINT}/reviews/${reviewId}/likes`;
    const token = await this.getCurrentToken();
    let options = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token
      }
    };
    const response = await fetch(url, options);
    return response;
  }

  async fetchMapLikes(mapId) {
    let url = `${process.env.API_ENDPOINT}/maps/${mapId}/likes`;
    const token = await this.getCurrentToken();
    let options = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token
      }
    };
    const response = await fetch(url, options);
    return response;
  }

  async fetchUserLikes(userId = undefined) {
    if (!userId) {
      userId = await this.getCurrentUid();
    }
    let url = `${process.env.API_ENDPOINT}/users/${userId}/likes`;
    const token = await this.getCurrentToken();
    let options = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token
      }
    };
    const response = await fetch(url, options);
    return response;
  }

  async fetchNotifications() {
    let url = `${process.env.API_ENDPOINT}/notifications`;
    const token = await this.getCurrentToken();
    let options = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token
      }
    };
    const response = await fetch(url, options);
    return response;
  }

  async readNotification(id) {
    let url = `${process.env.API_ENDPOINT}/notifications/${id}`;
    const token = await this.getCurrentToken();
    let options = {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token
      },
      body: JSON.stringify({ read: true })
    };
    const response = await fetch(url, options);
    return response;
  }

  async sendInvite(mapId, userId) {
    let url = `${process.env.API_ENDPOINT}/maps/${mapId}/invites`;
    const token = await this.getCurrentToken();
    let options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token
      },
      body: JSON.stringify({ user_id: userId })
    };
    const response = await fetch(url, options);
    return response;
  }

  async fetchInvites() {
    const url = `${process.env.API_ENDPOINT}/invites`;
    const token = await this.getCurrentToken();
    let options = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token
      }
    };
    const response = await fetch(url, options);
    return response;
  }
}

export default ApiClient;
