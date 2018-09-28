/*
SuperNode.js
===================
Main SuperNode page
*/
// @flow
import React, { Component, Fragment } from 'react';
import { Row, Col } from 'reactstrap';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import Statistics from './Statistic';
import NodeStatus from './NodeStatus';
import NodeStats from './NodeStats';
import SNAccount from './SNAccount';
import Workers from './Workers';
import PackageHistory from './PackageHistory';
import PackageDetail from './PackageDetail';
import UnRegistered from './UnRegistered';

import styles from './SuperNode.scss';

class SuperNode extends Component {
  renderRegistered() {
    return (
      <Fragment>
        <Col xs={12}>
          <h3>Status</h3>
          <Row noGutters>
            <Col xs={12} lg={5} className="d-flex">
              <NodeStatus />
            </Col>
            <Col xs={12} lg={7} className="d-flex">
              <NodeStats />
            </Col>
          </Row>
        </Col>
        <Col xs={12}>
          <Workers />
        </Col>
        <Col xs={12} lg={5}>
          <PackageHistory />
        </Col>
        <Col xs={12} lg={7}>
          <PackageDetail />
        </Col>
      </Fragment>
    );
  }

  render() {
    const { jwt } = this.props;
    return (
      <Row className={styles.supernode} noGutters>
        <Col xs={12}>
          <h2>SuperNode</h2>
        </Col>
        <Col xs={12}>
          <Statistics />
          <SNAccount />
        </Col>
          { jwt ? this.renderRegistered() : <UnRegistered/> }
      </Row>
    );
  }
}

SuperNode.defaultProps = {
  jwt: null,
};

SuperNode.propTypes = {
  jwt: PropTypes.string,
};

const mapStateToProps = state => ({
  jwt: state.superNode.jwt,
});

export default connect(mapStateToProps)(SuperNode);