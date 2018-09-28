/*
Statistic.js
===================
A list of accounts to choose from
*/
// @flow
import React, { Component, Fragment } from 'react';
import { Row, Col } from 'reactstrap';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { getStatistics, getSnCount } from '../../actions/statistics';

import styles from './SuperNode.scss';

class Statistics extends Component {
  componentDidMount() {
    const { getStats, getSnCnt } = this.props;

    getStats();
    getSnCnt();

    this.interval = setInterval(() => {
      getStats();
      getSnCnt();
    }, 5000);
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  render() {
    const { stats } = this.props;
    return (
      <Fragment>
        <h3>Statistics</h3>
        <Row noGutters>
          <Col xs={12} className="d-flex">
            <div className="border">
              <Row noGutters className={styles.statistics}>
                <Col className={styles.stat}>
                  <span>Number of SuperNodes</span>
                  <span> {stats.count}</span>
                </Col>
                <Col className={styles.stat}>
                  <span>Average Tx Time</span>
                  <span>{stats.transactions}</span>
                </Col>
                <Col className={styles.stat}>
                  <span>Average Ping</span>
                  <span>{stats.ping}</span>
                </Col>
                <Col className={styles.stat}>
                  <span>Difficulty</span>
                  <span>{stats.difficulty}</span>
                </Col>
              </Row>
            </div>
          </Col>
        </Row>
      </Fragment>
    );
  }
}

Statistics.defaultProps = {
};

Statistics.propTypes = {
  stats: PropTypes.object.isRequired,
  getStats: PropTypes.func.isRequired,
  getSnCnt: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  stats: state.statistics.stats,
});

const mapDispatchToProps = dispatch => ({
  getStats: () => {
    dispatch(getStatistics());
  },
  getSnCnt: () => {
    dispatch(getSnCount());
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(Statistics);