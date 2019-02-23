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

  async sendRegistrationToken(registrationToken) {
    let params = {
      registration_token: registrationToken
    };
    const url = `${process.env.API_ENDPOINT}/devices`;
    const token = await this.getCurrentToken();
    let options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token
      },
      body: JSON.stringify(params)
    };
    const response = await fetch(url, options);
    return response;
  }

  async deleteRegistrationToken(registrationToken) {
    const url = `${process.env.API_ENDPOINT}/devices/${registrationToken}`;
    const token = await this.getCurrentToken();
    let options = {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token
      }
    };
    const response = await fetch(url, options);
    return response;
  }

  async fetchTrendingSpots() {
    const url = `${process.env.API_ENDPOINT}/spots?popular=true`;
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

  async fetchSpots(mapId) {
    const url = `${process.env.API_ENDPOINT}/maps/${mapId}/spots`;
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

  async fetchSpot(placeId) {
    const url = `${process.env.API_ENDPOINT}/spots/${placeId}`;
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

  async createReview(mapId, params) {
    const url = `${process.env.API_ENDPOINT}/maps/${mapId}/reviews`;
    const token = await this.getCurrentToken();
    let options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token
      },
      body: JSON.stringify(params)
    };
    const response = await fetch(url, options);
    return response;
  }

  async editReview(params) {
    const url = `${process.env.API_ENDPOINT}/reviews/${params.review_id}`;
    const token = await this.getCurrentToken();
    let options = {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token
      },
      body: JSON.stringify(params)
    };
    const response = await fetch(url, options);
    return response;
  }

  async deleteReview(reviewId) {
    const url = `${process.env.API_ENDPOINT}/reviews/${reviewId}`;
    const token = await this.getCurrentToken();
    let options = {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token
      }
    };
    const response = await fetch(url, options);
    return response;
  }

  async likeReview(id) {
    const url = `${process.env.API_ENDPOINT}/reviews/${id}/like`;
    const token = await this.getCurrentToken();
    let options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token
      }
    };
    const response = await fetch(url, options);
    return response;
  }

  async unlikeReview(id) {
    const url = `${process.env.API_ENDPOINT}/reviews/${id}/like`;
    const token = await this.getCurrentToken();
    let options = {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token
      }
    };
    const response = await fetch(url, options);
    return response;
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

  async likeComment(reviewId, commentId) {
    const url = `${
      process.env.API_ENDPOINT
    }/reviews/${reviewId}/comments/${commentId}/like`;
    const token = await this.getCurrentToken();
    let options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token
      }
    };
    const response = await fetch(url, options);
    return response;
  }

  async unlikeComment(reviewId, commentId) {
    const url = `${
      process.env.API_ENDPOINT
    }/reviews/${reviewId}/comments/${commentId}/like`;
    const token = await this.getCurrentToken();
    let options = {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token
      }
    };
    const response = await fetch(url, options);
    return response;
  }

  async likeMap(mapId) {
    const url = `${process.env.API_ENDPOINT}/maps/${mapId}/like`;
    const token = await this.getCurrentToken();
    let options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token
      }
    };
    const response = await fetch(url, options);
    return response;
  }

  async unlikeMap(mapId) {
    const url = `${process.env.API_ENDPOINT}/maps/${mapId}/like`;
    const token = await this.getCurrentToken();
    let options = {
      method: 'DELETE',
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

  async fetchReviews(timestamp = null) {
    let url = `${process.env.API_ENDPOINT}/reviews`;
    if (timestamp) {
      url += `?next_timestamp=${timestamp}`;
    }
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

  async fetchUserReviews(userId = undefined, timestamp = undefined) {
    if (!userId) {
      userId = await this.getCurrentUid();
    }
    let url = `${process.env.API_ENDPOINT}/users/${userId}/reviews`;
    if (timestamp) {
      url += `?next_timestamp=${timestamp}`;
    }
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

  async fetchSpotReviews(placeId) {
    const url = `${process.env.API_ENDPOINT}/spots/${placeId}/reviews`;
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

  async fetchMapReviews(mapId) {
    const url = `${process.env.API_ENDPOINT}/maps/${mapId}/reviews`;
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

  async fetchReview(mapId, reviewId) {
    const url = `${process.env.API_ENDPOINT}/maps/${mapId}/reviews/${reviewId}`;
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

  async fetchRecentReviews() {
    const url = `${process.env.API_ENDPOINT}/reviews?recent=true`;
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

  async fetchCollaborators(mapId) {
    const url = `${process.env.API_ENDPOINT}/maps/${mapId}/collaborators`;
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

  async followMap(mapId, inviteId = undefined) {
    let url = `${process.env.API_ENDPOINT}/maps/${mapId}/follow`;
    if (inviteId) {
      url += `?invite_id=${inviteId}`;
    }
    const token = await this.getCurrentToken();
    let options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token
      }
    };
    const response = await fetch(url, options);
    return response;
  }

  async unfollowMap(mapId) {
    const url = `${process.env.API_ENDPOINT}/maps/${mapId}/follow`;
    const token = await this.getCurrentToken();
    let options = {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token
      }
    };
    const response = await fetch(url, options);
    return response;
  }

  async issueContent(params) {
    const url = `${process.env.API_ENDPOINT}/inappropriate_contents`;
    const token = await this.getCurrentToken();
    let options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token
      },
      body: JSON.stringify(params)
    };
    const response = await fetch(url, options);
    return response;
  }

  async searchPlaces(input) {
    const url = `${process.env.API_ENDPOINT}/places?input=${input}`;
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

  async searchNearPlaces(lat, lng) {
    const url = `${process.env.API_ENDPOINT}/places?lat=${lat}&lng=${lng}`;
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

  async sendComment(reviewId, comment) {
    const url = `${process.env.API_ENDPOINT}/reviews/${reviewId}/comments`;
    const token = await this.getCurrentToken();
    let options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token
      },
      body: JSON.stringify({ comment: comment })
    };
    const response = await fetch(url, options);
    return response;
  }

  async deleteComment(reviewId, commentId) {
    const url = `${
      process.env.API_ENDPOINT
    }/reviews/${reviewId}/comments/${commentId}`;
    const token = await this.getCurrentToken();
    let options = {
      method: 'DELETE',
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
