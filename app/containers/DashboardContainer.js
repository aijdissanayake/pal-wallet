// @flow
import React, { Component } from 'react';
import Layout from 'components/Layout/Layout';
import Dashboard from '../components/Dashboard/Dashboard';

class DashboardContainer extends Component {
  render() {
    return (
      <Layout>
        <Dashboard />
      </Layout>
    );
  }
}

export default DashboardContainer;
