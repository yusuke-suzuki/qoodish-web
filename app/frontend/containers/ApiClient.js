class ApiClient {
  async signIn(params) {
    const url = `${process.env.ENDPOINT}/api/auth`;
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
      throw(this.generateError(json));
    }
  }

  generateError(json) {
    let error = new Error(json.detail);
    error.name = json.title;
    error.status = json.status;
    return error;
  }
}

export default ApiClient;
