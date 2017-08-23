import fetch from 'node-fetch';
import AuthenticationFailed from './errors/AuthenticationFailed';
import DeleteUserFailed from './errors/DeleteUserFailed';
import FetchMapsFailed from './errors/FetchMapsFailed';
import FetchMapFailed from './errors/FetchMapFailed';
import CreateMapFailed from './errors/CreateMapFailed';
import UpdateMapFailed from './errors/UpdateMapFailed';
import DeleteMapFailed from './errors/DeleteMapFailed';
import FetchSpotsFailed from './errors/FetchSpotsFailed';
import FetchSpotFailed from './errors/FetchSpotFailed';
import CreateReviewFailed from './errors/CreateReviewFailed';
import UpdateReviewFailed from './errors/UpdateReviewFailed';
import DeleteReviewFailed from './errors/DeleteReviewFailed';
import FetchReviewsFailed from './errors/FetchReviewsFailed';
import FetchReviewFailed from './errors/FetchReviewFailed';
import FetchCollaboratorsFailed from './errors/FetchCollaboratorsFailed';
import JoinMapFailed from './errors/JoinMapFailed';
import LeaveMapFailed from './errors/LeaveMapFailed';

class QoodishClient {
  async signIn(params) {
    const url = `${process.env.API_ENDPOINT}/users`;
    let options = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    };
    const response = await fetch(url, options);
    const json = await response.json();
    if (response.ok) {
      return json;
    } else {
      throw new AuthenticationFailed;
    }
  }

  async deleteAccount(token, userId) {
    const url = `${process.env.API_ENDPOINT}/users/${userId}`;
    let options = {
      method: 'DELETE',
      headers: {
        'Authorization': `bearer ${token}`
      }
    };
    const response = await fetch(url, options);
    if (response.ok) {
      return;
    } else if (response.status === 401) {
      throw new AuthenticationFailed;
    } else {
      const json = await response.json();
      throw new DeleteUserFailed(response.status, json.detail);
    }
  }

  async listCurrentMaps(token) {
    const url = `${process.env.API_ENDPOINT}/maps`;
    let options = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `bearer ${token}`
      }
    };
    const response = await fetch(url, options);
    const json = await response.json();
    if (response.ok) {
      return json;
    } else if (response.status === 401) {
      throw new AuthenticationFailed;
    } else {
      throw new FetchMapsFailed;
    }
  }

  async listPopularMaps(token) {
    const url = `${process.env.API_ENDPOINT}/maps?popular=true`;
    let options = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `bearer ${token}`
      }
    };
    const response = await fetch(url, options);
    const json = await response.json();
    if (response.ok) {
      return json;
    } else if (response.status === 401) {
      throw new AuthenticationFailed;
    } else {
      throw new FetchMapsFailed;
    }
  }

  async createMap(token, params) {
    const url = `${process.env.API_ENDPOINT}/maps`;
    let options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `bearer ${token}`
      },
      body: JSON.stringify(params)
    };
    const response = await fetch(url, options);
    const json = await response.json();
    if (response.ok) {
      return json;
    } else if (response.status === 401) {
      throw new AuthenticationFailed;
    } else {
      throw new CreateMapFailed(response.status, json.detail);
    }
  }

  async updateMap(token, params, mapId) {
    const url = `${process.env.API_ENDPOINT}/maps/${mapId}`;
    let options = {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `bearer ${token}`
      },
      body: JSON.stringify(params)
    };
    const response = await fetch(url, options);
    const json = await response.json();
    if (response.ok) {
      return json;
    } else if (response.status === 401) {
      throw new AuthenticationFailed;
    } else {
      throw new UpdateMapFailed(response.status, json.detail);
    }
  }

  async deleteMap(token, mapId) {
    const url = `${process.env.API_ENDPOINT}/maps/${mapId}`;
    let options = {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `bearer ${token}`
      }
    };
    const response = await fetch(url, options);
    if (response.ok) {
      return;
    } else if (response.status === 401) {
      throw new AuthenticationFailed;
    } else {
      throw new DeleteMapFailed(response.status, json.detail);
    }
  }

  async fetchMap(token, mapId) {
    const url = `${process.env.API_ENDPOINT}/maps/${mapId}`;
    let options = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `bearer ${token}`
      }
    };
    const response = await fetch(url, options);
    const json = await response.json();
    if (response.ok) {
      return json;
    } else if (response.status === 401) {
      throw new AuthenticationFailed;
    } else {
      throw new FetchMapFailed;
    }
  }

  async fetchSpot(token, mapId, spotId, locale) {
    const url = `${process.env.API_ENDPOINT}/maps/${mapId}/spots/${spotId}`;
    let options = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `bearer ${token}`,
        'Accept-Language': locale
      }
    };
    const response = await fetch(url, options);
    const json = await response.json();
    if (response.ok) {
      return json;
    } else if (response.status === 401) {
      throw new AuthenticationFailed;
    } else {
      throw new FetchSpotFailed;
    }
  }

  async fetchSpots(token, mapId, locale) {
    const url = `${process.env.API_ENDPOINT}/maps/${mapId}/spots`;
    let options = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `bearer ${token}`,
        'Accept-Language': locale
      }
    };
    const response = await fetch(url, options);
    const json = await response.json();
    if (response.ok) {
      return json;
    } else if (response.status === 401) {
      throw new AuthenticationFailed;
    } else {
      throw new FetchSpotsFailed;
    }
  }

  async createReview(token, mapId, params) {
    console.log(params);
    const url = `${process.env.API_ENDPOINT}/maps/${mapId}/reviews`;
    let options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `bearer ${token}`
      },
      body: JSON.stringify(params)
    };
    const response = await fetch(url, options);
    const json = await response.json();
    if (response.ok) {
      return json;
    } else if (response.status === 401) {
      throw new AuthenticationFailed;
    } else {
      throw new CreateReviewFailed(response.status, json.detail);
    }
  }

  async updateReview(token, reviewId, params) {
    const url = `${process.env.API_ENDPOINT}/reviews/${reviewId}`;
    let options = {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `bearer ${token}`
      },
      body: JSON.stringify(params)
    };
    const response = await fetch(url, options);
    const json = await response.json();
    if (response.ok) {
      return json;
    } else if (response.status === 401) {
      throw new AuthenticationFailed;
    } else {
      throw new UpdateReviewFailed(response.status, json.detail);
    }
  }

  async deleteReview(token, reviewId) {
    const url = `${process.env.API_ENDPOINT}/reviews/${reviewId}`;
    let options = {
      method: 'DELETE',
      headers: {
        'Authorization': `bearer ${token}`
      }
    };
    const response = await fetch(url, options);
    if (response.ok) {
      return;
    } else if (response.status === 401) {
      throw new AuthenticationFailed;
    } else {
      throw new DeleteReviewFailed(response.status, json.detail);
    }
  }

  async fetchSpotReviews(token, mapId, placeId) {
    const url = `${process.env.API_ENDPOINT}/maps/${mapId}/reviews?place_id=${placeId}`;
    let options = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `bearer ${token}`
      }
    };
    const response = await fetch(url, options);
    const json = await response.json();
    if (response.ok) {
      return json;
    } else if (response.status === 401) {
      throw new AuthenticationFailed;
    } else {
      throw new FetchReviewsFailed;
    }
  }

  async fetchReview(token, mapId, reviewId) {
    const url = `${process.env.API_ENDPOINT}/maps/${mapId}/reviews/${reviewId}`;
    let options = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `bearer ${token}`
      }
    };
    const response = await fetch(url, options);
    const json = await response.json();
    if (response.ok) {
      return json;
    } else if (response.status === 401) {
      throw new AuthenticationFailed;
    } else {
      throw new FetchReviewFailed;
    }
  }

  async fetchCollaborators(token, mapId) {
    const url = `${process.env.API_ENDPOINT}/maps/${mapId}/collaborators`;
    let options = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `bearer ${token}`
      }
    };
    const response = await fetch(url, options);
    const json = await response.json();
    if (response.ok) {
      return json;
    } else if (response.status === 401) {
      throw new AuthenticationFailed;
    } else {
      throw new FetchCollaboratorsFailed;
    }
  }

  async joinMap(token, mapId) {
    const url = `${process.env.API_ENDPOINT}/maps/${mapId}/follow`;
    let options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `bearer ${token}`
      }
    };
    const response = await fetch(url, options);
    const json = await response.json();
    if (response.ok) {
      return json;
    } else if (response.status === 401) {
      throw new AuthenticationFailed;
    } else {
      throw new JoinMapFailed(response.status, json.detail);
    }
  }

  async leaveMap(token, mapId) {
    const url = `${process.env.API_ENDPOINT}/maps/${mapId}/follow`;
    let options = {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `bearer ${token}`
      }
    };
    const response = await fetch(url, options);
    const json = await response.json();
    if (response.ok) {
      return json;
    } else if (response.status === 401) {
      throw new AuthenticationFailed;
    } else {
      throw new LeaveMapFailed(response.status, json.detail);
    }
  }
}

export default QoodishClient;
