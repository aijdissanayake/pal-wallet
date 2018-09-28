// @flow
import React, { Component } from 'react';
import Layout from 'components/Layout/Layout';
import SuperNode from '../components/SuperNode/SuperNode';

class SuperNodeContainer extends Component {
  render() {
    return (
      <Layout>
        <SuperNode />
      </Layout>
    );
  }
}

export default SuperNodeContainer;
