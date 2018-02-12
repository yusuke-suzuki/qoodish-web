import firebase from 'firebase';

class ApiClient {
  async signIn(params) {
    const url = `${process.env.API_ENDPOINT}/users`;
    let options = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    };
    const response = await fetch(url, options);
    return response;
  }

  async sendRegistrationToken(registrationToken) {
    let params = {
      registration_token: registrationToken
    };
    const userId = firebase.auth().currentUser.uid;
    const url = `${process.env.API_ENDPOINT}/devices`;
    const token = await firebase.auth().currentUser.getIdToken();
    let options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token
      },
      body: JSON.stringify(params)
    };
    const response = await fetch(url, options);
    return response;
  }

  async deleteRegistrationToken(registrationToken) {
    const userId = firebase.auth().currentUser.uid;
    const url = `${process.env.API_ENDPOINT}/devices/${registrationToken}`;
    const token = await firebase.auth().currentUser.getIdToken();
    let options = {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token
      }
    };
    const response = await fetch(url, options);
    return response;
  }

  async fetchUser(id) {
    const url = `${process.env.API_ENDPOINT}/users/${id}`;
    const token = await firebase.auth().currentUser.getIdToken();
    let options = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token
      }
    };
    const response = await fetch(url, options);
    return response;
  }

  async fetchFollowingMaps() {
    const url = `${process.env.API_ENDPOINT}/maps`;
    const token = await firebase.auth().currentUser.getIdToken();
    let options = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token
      }
    };
    const response = await fetch(url, options);
    return response;
  }

  async fetchMyMaps() {
    const userId = firebase.auth().currentUser.uid;
    const url = `${process.env.API_ENDPOINT}/users/${userId}/maps`;
    const token = await firebase.auth().currentUser.getIdToken();
    let options = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token
      }
    };
    const response = await fetch(url, options);
    return response;
  }

  async fetchPopularMaps() {
    const url = `${process.env.API_ENDPOINT}/maps?popular=true`;
    const token = await firebase.auth().currentUser.getIdToken();
    let options = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token
      }
    };
    const response = await fetch(url, options);
    return response;
  }

  async fetchPostableMaps() {
    const url = `${process.env.API_ENDPOINT}/maps?postable=true`;
    const token = await firebase.auth().currentUser.getIdToken();
    let options = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token
      }
    };
    const response = await fetch(url, options);
    return response;
  }

  async createMap(params) {
    const url = `${process.env.API_ENDPOINT}/maps`;
    const token = await firebase.auth().currentUser.getIdToken();
    let options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token
      },
      body: JSON.stringify(params)
    };
    const response = await fetch(url, options);
    return response;
  }

  async editMap(params) {
    const url = `${process.env.API_ENDPOINT}/maps/${params.map_id}`;
    const token = await firebase.auth().currentUser.getIdToken();
    let options = {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token
      },
      body: JSON.stringify(params)
    };
    const response = await fetch(url, options);
    return response;
  }

  async deleteMap(mapId) {
    const url = `${process.env.API_ENDPOINT}/maps/${mapId}`;
    const token = await firebase.auth().currentUser.getIdToken();
    let options = {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token
      }
    };
    const response = await fetch(url, options);
    return response;
  }

  async fetchSpots(mapId) {
    const url = `${process.env.API_ENDPOINT}/maps/${mapId}/spots`;
    const token = await firebase.auth().currentUser.getIdToken();
    let options = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token
      }
    };
    const response = await fetch(url, options);
    return response;
  }

  async fetchSpot(placeId) {
    const url = `${process.env.API_ENDPOINT}/spots/${placeId}`;
    const token = await firebase.auth().currentUser.getIdToken();
    let options = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token
      }
    };
    const response = await fetch(url, options);
    return response;
  }

  async fetchMap(mapId) {
    const url = `${process.env.API_ENDPOINT}/maps/${mapId}`;
    const token = await firebase.auth().currentUser.getIdToken();
    let options = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token
      }
    };
    const response = await fetch(url, options);
    return response;
  }

  async createReview(mapId, params) {
    const url = `${process.env.API_ENDPOINT}/maps/${mapId}/reviews`;
    const token = await firebase.auth().currentUser.getIdToken();
    let options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token
      },
      body: JSON.stringify(params)
    };
    const response = await fetch(url, options);
    return response;
  }

  async editReview(params) {
    const url = `${process.env.API_ENDPOINT}/reviews/${params.review_id}`;
    const token = await firebase.auth().currentUser.getIdToken();
    let options = {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token
      },
      body: JSON.stringify(params)
    };
    const response = await fetch(url, options);
    return response;
  }

  async deleteReview(reviewId) {
    const url = `${process.env.API_ENDPOINT}/reviews/${reviewId}`;
    const token = await firebase.auth().currentUser.getIdToken();
    let options = {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token
      }
    };
    const response = await fetch(url, options);
    return response;
  }

  async likeReview(id) {
    const url = `${process.env.API_ENDPOINT}/reviews/${id}/like`;
    const token = await firebase.auth().currentUser.getIdToken();
    let options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token
      }
    };
    const response = await fetch(url, options);
    return response;
  }

  async unlikeReview(id) {
    const url = `${process.env.API_ENDPOINT}/reviews/${id}/like`;
    const token = await firebase.auth().currentUser.getIdToken();
    let options = {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token
      }
    };
    const response = await fetch(url, options);
    return response;
  }

  async fetchReviewLikes(reviewId) {
    let url = `${process.env.API_ENDPOINT}/reviews/${reviewId}/likes`;
    const token = await firebase.auth().currentUser.getIdToken();
    let options = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token
      }
    };
    const response = await fetch(url, options);
    return response;
  }

  async fetchReviews(timestamp = null) {
    let url = `${process.env.API_ENDPOINT}/reviews`;
    if (timestamp) {
      url += `?next_timestamp=${timestamp}`
    }
    const token = await firebase.auth().currentUser.getIdToken();
    let options = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token
      }
    };
    const response = await fetch(url, options);
    return response;
  }

  async fetchSpotReviews(placeId) {
    const url = `${process.env.API_ENDPOINT}/spots/${placeId}/reviews`;
    const token = await firebase.auth().currentUser.getIdToken();
    let options = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token
      }
    };
    const response = await fetch(url, options);
    return response;
  }

  async fetchMapReviews(mapId) {
    const url = `${process.env.API_ENDPOINT}/maps/${mapId}/reviews`;
    const token = await firebase.auth().currentUser.getIdToken();
    let options = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token
      }
    };
    const response = await fetch(url, options);
    return response;
  }

  async fetchReview(mapId, reviewId) {
    const url = `${process.env.API_ENDPOINT}/maps/${mapId}/reviews/${reviewId}`;
    const token = await firebase.auth().currentUser.getIdToken();
    let options = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token
      }
    };
    const response = await fetch(url, options);
    return response;
  }

  async fetchRecentReviews() {
    const url = `${process.env.API_ENDPOINT}/reviews?recent=true`;
    const token = await firebase.auth().currentUser.getIdToken();
    let options = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token
      }
    };
    const response = await fetch(url, options);
    return response;
  }

  async fetchCollaborators(mapId) {
    const url = `${process.env.API_ENDPOINT}/maps/${mapId}/collaborators`;
    const token = await firebase.auth().currentUser.getIdToken();
    let options = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token
      }
    };
    const response = await fetch(url, options);
    return response;
  }

  async followMap(mapId) {
    const url = `${process.env.API_ENDPOINT}/maps/${mapId}/follow`;
    const token = await firebase.auth().currentUser.getIdToken();
    let options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token
      }
    };
    const response = await fetch(url, options);
    return response;
  }

  async unfollowMap(mapId) {
    const url = `${process.env.API_ENDPOINT}/maps/${mapId}/follow`;
    const token = await firebase.auth().currentUser.getIdToken();
    let options = {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token
      }
    };
    const response = await fetch(url, options);
    return response;
  }

  async deleteAccount(userId) {
    const url = `${process.env.API_ENDPOINT}/users/${userId}`;
    const token = await firebase.auth().currentUser.getIdToken();
    let options = {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token
      }
    };
    const response = await fetch(url, options);
    return response;
  }

  async issueContent(params) {
    const url = `${process.env.API_ENDPOINT}/inappropriate_contents`;
    const token = await firebase.auth().currentUser.getIdToken();
    let options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token
      },
      body: JSON.stringify(params)
    };
    const response = await fetch(url, options);
    return response;
  }

  async searchPlaces(input) {
    const url = `${process.env.API_ENDPOINT}/places?input=${input}`;
    const token = await firebase.auth().currentUser.getIdToken();
    let options = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token
      }
    };
    const response = await fetch(url, options);
    return response;
  }

  async searchNearPlaces(lat, lng) {
    const url = `${process.env.API_ENDPOINT}/places?lat=${lat}&lng=${lng}`;
    const token = await firebase.auth().currentUser.getIdToken();
    let options = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token
      }
    };
    const response = await fetch(url, options);
    return response;
  }

  async fetchNotifications() {
    let url = `${process.env.API_ENDPOINT}/notifications`;
    const token = await firebase.auth().currentUser.getIdToken();
    let options = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token
      }
    };
    const response = await fetch(url, options);
    return response;
  }

  async readNotification(id) {
    let url = `${process.env.API_ENDPOINT}/notifications/${id}`;
    const token = await firebase.auth().currentUser.getIdToken();
    let options = {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token
      },
      body: JSON.stringify({ read: true })
    };
    const response = await fetch(url, options);
    return response;
  }
}

export default ApiClient;
