/*
NodeStats.js
===================
Statistics for the current supernode.
*/
// @flow
import React, { Component } from 'react';
import { Row, Col } from 'reactstrap';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import styles from './SuperNode.scss';

class NodeStats extends Component {
  render() {
    const { snStats } = this.props;
    return (
      <div className="border">
        <Row className={styles.statistics}>
          <Col className={styles.stat}>
            <span>Transaction Processed</span>
            <span>{snStats.txProcessed || 0}</span>
          </Col>
          <Col className={styles.stat}>
            <span>Average Pkg Time</span>
            <span>{(snStats.pkgAvgTime || 0).toFixed(2)} s</span>
          </Col>
        </Row>
      </div>
    );
  }
}

NodeStats.defaultProps = {
  snStats: {},
};

NodeStats.propTypes = {
  snStats: PropTypes.object,
};

const mapStateToProps = state => ({
  snStats: state.superNode.snStats,
});

export default connect(mapStateToProps)(NodeStats);
