import React, { Component } from 'react';

const styles = {
  loginContainer: {
    textAlign: 'center',
    marginTop: 104,
    marginBottom: 200
  }
};

export default class Login extends Component {
  constructor(props) {
    super(props);

    this.state = {
      name: '',
      password: '',
      errorName: null,
      errorPassword: null,
      disabled: true
    };
  }

  render() {
    return (
      <div>
        <div style={styles.loginContainer}>
          <h1>みんなで作る、冒険の地図。</h1>
          <p>次はどこ行く？</p>
        </div>
      </div>
    );
  }
}
