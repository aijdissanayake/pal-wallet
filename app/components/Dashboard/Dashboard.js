/*
Dashboard.js
===================
Dashboard View
*/
// @flow
import React, { Component } from 'react';
import { Row, Col } from 'reactstrap';
import AccountList from './AccountList';
import CreateAccount from './CreateAccount';

import styles from './Dashboard.scss';

class Dashboard extends Component {
  render() {
    return (
      <Row className={styles.dashboard} noGutters>
        <Col xs={12}>
          <h2>Good day, Pal</h2>
        </Col>
        <Col xs={12}>
          <CreateAccount />
        </Col>
        <Col xs={12}>
          <AccountList />
        </Col>
      </Row>
    );
  }
}

export default Dashboard;