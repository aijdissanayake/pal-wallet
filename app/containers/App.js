// @flow
import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import Miner from '../components/Miner/Miner';
import MessageModal from '../components/MessageModal/MessageModal';
import VersionCheck from '../components/Modal/VersionCheck/VersionCheck';

import { stopMining } from '../actions/miner';
import { setModal } from '../actions/modalActions';
import { getPing } from '../actions/statistics';

class App extends Component {
  constructor(props) {
    super(props);

    this.versionChecker = this.versionChecker.bind(this);
  }

  componentDidMount() {
    const { setModalComponent } = this.props;
    setModalComponent(this.modal);

    // if (process.env.NODE_ENV !== 'development') {
    //   this.versionChecker();
    //   this.pingChecker = setInterval(this.versionChecker, 10000);
    // }
  }

  componentWillUnmount() {
    clearInterval(this.versionChecker);
  }

  versionChecker() {
    const { doGetPing, doStopMining } = this.props;
    doGetPing(doStopMining);
  }

  render() {
    const { children } = this.props;
    return (
      <Fragment>
        <MessageModal
          ref={node => { this.modal = node }}
        />
        {children}
        <Miner />
        <VersionCheck />
      </Fragment>
    );
  }
}

App.defaultProps = {
};

App.propTypes = {
  children: PropTypes.node.isRequired,
  setModalComponent: PropTypes.func.isRequired,
  doGetPing: PropTypes.func.isRequired,
  doStopMining: PropTypes.func.isRequired,
};

const mapDispatchToProps = dispatch => ({
  setModalComponent: (modal) => {
    dispatch(setModal(modal));
  },
  doGetPing: (doStopMining) => {
    dispatch(getPing(doStopMining));
  },
  doStopMining: () => {
    dispatch(stopMining());
  }
 });

export default connect(null, mapDispatchToProps)(App);
