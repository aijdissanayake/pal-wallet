/*
Workers.js
===================
View to show the hashworkers status and load.
*/
// @flow
import _ from 'lodash';
import React, { Component, Fragment } from 'react';
import { Row, Col } from 'reactstrap';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import styles from './SuperNode.scss';

class Workers extends Component {
  renderStats() {
    const { workerStats } = this.props;
    
    if (_.isEmpty(workerStats)) {
      return (
        <Col>
          <p>No workers initiated</p>
        </Col>
      )
    }

    return _.map(workerStats, (stat, key) => (
        <Col xs={12} key={`worker-${key}`}>
          <div>
            <span>Worker {parseInt(key, 10) + 1} Load: {stat.load} Txs </span>
            <span style={{ float: 'right' }}>Rate per Tx: {stat.ratePerSec.toFixed(2)}s</span>
          </div>
        </Col>
      )
    );
  }

  render() {
    return (
      <Fragment>
        <h3>Workers</h3>
        <Row className={`border ${styles.workers}`} noGutters>
          {this.renderStats()}
        </Row>
      </Fragment>
    );
  }
}

Workers.defaultProps = {
  workerStats: {},
};

Workers.propTypes = {
  workerStats: PropTypes.object,
};

const mapStateToProps = state => ({
  workerStats: state.miner.workerStats,
});

export default connect(mapStateToProps)(Workers);
