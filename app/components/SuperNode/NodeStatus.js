/*
NodeStatus.js
===================
Entry point to start supernode work.
*/
// @flow
import _ from 'lodash';
import React, { Component, Fragment } from 'react';
import { Button } from 'reactstrap';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import UnlockSuperNode from '../Modal/UnlockSuperNode/UnlockSuperNode';

import { registerSuperNode, setSnKey } from '../../actions/superNode';
import { startMining, stopMining } from '../../actions/miner';

import { keyStoreToPKey } from '../../lib/keyFunctions';

import styles from './SuperNode.scss';

class NodeStatus extends Component {
  constructor(props) {
    super(props);

    this.state = {
      showModal: false,
    }

    this.closeModal = this.closeModal.bind(this);
    this.startWithModal = this.startWithModal.bind(this);
    this.startSuperNode = this.startSuperNode.bind(this);
  }

  closeModal() {
    this.setState({
      showModal: false,
    });
  }

  // Show Modal to take in user password to unlock super node wallet
  startWithModal(password) {
    const { wallets, selectedWalletName, modal } = this.props;
    // Find the current wallet
    const wallet = _.find(wallets, w => w.name === selectedWalletName);

    // Get the pKey and begin supernode work
    if (wallet) {
      const pKeyResult = keyStoreToPKey(JSON.stringify(wallet.keyStore), password);
      const { privateKey } = pKeyResult;
      
      if (privateKey) {
        this.startSuperNode(wallet.address, privateKey);
        this.closeModal();
      } else {
        this.closeModal();

        if (modal) {
          modal.toggle('Unable to unlock supernode', 'Password authentication failed. Please try again');
        }
      }
    }
  }

  // Starts the super node
  startSuperNode(address, privateKey) {
    const { registerSN, startMine, stopMine, modal, setKey } = this.props;
    
    // Store the pkey temporary so user only need to enter once per session
    setKey(address, privateKey);
    // Register SN to GW
    registerSN(address, modal, stopMine);
    // Start mining
    startMine();
  }

  render() {
    const { showModal } = this.state;
    const { isMining, stopMine, wallets, selectedWalletName, snPKeys } = this.props;

    const miningButtonStyle = isMining ? 'miningBtnActive' : 'miningBtnIdle';
    const miningText = isMining ? 'Stop SuperNode' : 'Begin SuperNode';
    const runningText = isMining ? 'Supernode is running' : 'Supernode is not running';

    return (
      <Fragment>
        <div className={`border ${styles.nodeStatus}`}>
          <span>{runningText}</span>
          <Button
            className={`greenBtn ${miningButtonStyle}`}
            onClick={() => { 
              if (!isMining) {
                const wallet = _.find(wallets, w => w.name === selectedWalletName);
                if (wallet) {
                  const privateKey = snPKeys[wallet.address];
                  if (privateKey) {
                    this.startSuperNode(wallet.address, privateKey);
                    return;
                  }
                }

                this.setState({ showModal: true });
              } else {
                stopMine();
              }
            }}
          >
            <p>{miningText}</p>
          </Button>
        </div>
        <UnlockSuperNode
          showModal={showModal}
          closeModal={this.closeModal}
          startWithModal={this.startWithModal}

        />
      </Fragment>
    );
  }
}

NodeStatus.defaultProps = {
  selectedWalletName: null,
  wallets: [],
  modal: null,
  snPKeys: {},
};

NodeStatus.propTypes = {
  isMining: PropTypes.bool.isRequired,
  registerSN: PropTypes.func.isRequired,
  startMine: PropTypes.func.isRequired,
  stopMine: PropTypes.func.isRequired,
  selectedWalletName: PropTypes.string,
  wallets: PropTypes.array,
  modal: PropTypes.object,
  snPKeys: PropTypes.object,
  setKey: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  isMining: state.miner.isMining,
  wallets: state.wallet.wallets,
  selectedWalletName: state.superNode.selectedWalletName,
  modal: state.modal.modal,
  snPKeys: state.superNode.snPKeys,
});

const mapDispatchToProps = dispatch => ({
  startMine: () => {
    dispatch(startMining());
  },
  stopMine: () => {
    dispatch(stopMining());
  },
  registerSN: (address, modal, stopMine) => {
    dispatch(registerSuperNode(address, modal, stopMine));
  },
  setKey: (address, pkey) => {
    dispatch(setSnKey(address, pkey));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(NodeStatus);