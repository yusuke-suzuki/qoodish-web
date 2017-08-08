import firebase from 'firebase';

class ApiClient {
  async signIn(params) {
    const url = `${process.env.ENDPOINT}/api/auth`;
    let options = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    };
    const response = await fetch(url, options);
    return response;
  }

  async fetchCurrentMaps() {
    const url = `${process.env.ENDPOINT}/api/maps`;
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
    const url = `${process.env.ENDPOINT}/api/maps?popular=true`;
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
    const url = `${process.env.ENDPOINT}/api/maps`;
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
    const url = `${process.env.ENDPOINT}/api/maps/${params.map_id}`;
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
    const url = `${process.env.ENDPOINT}/api/maps/${mapId}`;
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
    const url = `${process.env.ENDPOINT}/api/maps/${mapId}/spots`;
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

  async fetchSpot(params) {
    const url = `${process.env.ENDPOINT}/api/maps/${params.mapId}/spots/${params.placeId}`;
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
    const url = `${process.env.ENDPOINT}/api/maps/${mapId}`;
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
    const url = `${process.env.ENDPOINT}/api/maps/${mapId}/reviews`;
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
    const url = `${process.env.ENDPOINT}/api/reviews/${params.review_id}`;
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
    const url = `${process.env.ENDPOINT}/api/reviews/${reviewId}`;
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

  async fetchSpotReviews(mapId, placeId) {
    const url = `${process.env.ENDPOINT}/api/maps/${mapId}/reviews?place_id=${placeId}`;
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
    const url = `${process.env.ENDPOINT}/api/maps/${mapId}/reviews/${reviewId}`;
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
    const url = `${process.env.ENDPOINT}/api/maps/${mapId}/collaborators`;
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
    const url = `${process.env.ENDPOINT}/api/maps/${mapId}/follow`;
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
    const url = `${process.env.ENDPOINT}/api/maps/${mapId}/follow`;
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
    const url = `${process.env.ENDPOINT}/api/users/${userId}`;
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
}

export default ApiClient;
