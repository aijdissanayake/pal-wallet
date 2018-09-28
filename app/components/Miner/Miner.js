/*
Miner.js
===================
Entry point to SuperNode Mining.
*/
// @flow
import _ from 'lodash';
import PriorityQueue from 'js-priority-queue';
import { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import ethUtils from 'ethereumjs-util';

import TxWorker from './TransactionHandlerWorker/TransactionHandler';
import HashCash from './HashCashWorker/HashCash';
import Dag from './DagWorker/Dag';
import PackageSender from './PackageSenderWorker/PackageSender';

import { setWorkerStats, stopMining } from '../../actions/miner';
import { setSuccessfulPkg, registerSuperNode, setSnStats } from '../../actions/superNode';

const  { BN } = ethUtils;

// Default Epoch to send package (s)
const defaultEpoch = 5;
// Poll interval for packages (ms)
const pollInterval = 2500;

class Miner extends Component {
  constructor(props) {
    super(props);

    const { setPkg, setStats } = this.props;

    this.stopMining = this.stopMining.bind(this);

    this.isAlreadyMining = false;
    
    // DAG Setup
    // This pool stores all the work done txs, ready to push into DAG
    // Maintain order by PQueue
    this.transactionsPool = new PriorityQueue({ comparator: (tx1, tx2) => {
      const tx1BN = new BN(tx1.txCounter);
      const tx2BN = new BN(tx2.txCounter);
      return tx1BN.cmp(tx2BN);
    }});
    // The next job tx counter that is needed for DAG
    this.currentTxCounter = { txCounter: new BN('0') };

    // HashWorkers Setup
    // Maintain the load of the hashworkers
    this.loadBalancer = Array(this.cores).fill(0);
    // Open hashworkers to the amount of cores
    this.cores = navigator.hardwareConcurrency || 4;
    
    // Workers Initialize
    // PackageSenderWorker sends package to gateway
    this.packageSenderWorker = new PackageSender(setPkg);
    // DagWorker forms hashcashed Txs to DAG and send package to PackageSenderWorker
    this.dagWorker = new Dag(this.packageSenderWorker);
    // HashCashWorkers perform hashcash on Txs and send hashcashed to DagWorker
    this.hashCashWorkers = [];
    for (let i = 0; i < this.cores; i++) {
      this.hashCashWorkers.push(new HashCash(this.dagWorker, setStats, this.stopMining));
    }
    // TransactionWorker retrieve transactions from gateway, verify them
    // and send to hashcash
    this.transactionWorker = new TxWorker(this.hashCashWorkers, this.stopMining);
  }

  componentDidUpdate(prevProps) {
    const { isMining, jwt, epoch } = this.props;

    if (!this.isAlreadyMining && isMining) {
      this.isAlreadyMining = true;
      this.startMining();
    }

    if (this.isAlreadyMining && !isMining) {
      this.isAlreadyMining = false;
      this.stopMining();
    }

    if (isMining) {
      // Update new Jwt token for TransactionWorker to retrieve
      // new Txs from gateway
      if (prevProps.jwt !== jwt) {
        this.packageSenderWorker.updateJwt(jwt);
        this.transactionWorker.updateJwt(jwt);
      }
      
      if (prevProps.epoch !== epoch) {
        
        this.dagWorker.updateEpoch(epoch);
      }
    } 
  }

  // Start all workers
  startMining() {
    const { epoch, wallets, selectedWalletName, registerSN, modal, setSuperNodeStats, snPKeys } = this.props;

    const wallet = _.find(wallets, w => w.name === selectedWalletName);
    const privateKey = snPKeys[wallet.address];

    if (wallet && privateKey) {
      // Clear all previous txs
      this.transactionsPool.clear();
      // Restart txCounter
      this.currentTxCounter = { txCounter: new BN('0') };
      // Reset all load of Hashworkers to 0
      this.loadBalancer = Array(this.cores).fill(0);
      // Start all workers
      this.packageSenderWorker.startWorker(wallet.address, privateKey, setSuperNodeStats);
      this.dagWorker.startWorker(epoch || defaultEpoch);
      _.each(this.hashCashWorkers, (worker, index) => worker.startWorker(index, wallet.address, this.transactionsPool, this.loadBalancer, this.currentTxCounter));
      this.transactionWorker.setRegisterFunc(() => registerSN(wallet.address));
      this.transactionWorker.startWorker(pollInterval, this.loadBalancer, modal, privateKey);
    } else {
      this.stopMining();
    }
  }

  // Stop all workers
  stopMining() {
    const { stopMine } = this.props;

    this.transactionWorker.stopWorker();
    _.each(this.hashCashWorkers, worker => worker.stopWorker());
    this.dagWorker.stopWorker();
    this.packageSenderWorker.stopWorker();
    stopMine();
  }

  // No need to render anything
  render() {
    return null;
  }
}

Miner.defaultProps = {
  jwt: '',
  epoch: 0,
  selectedWalletName: null,
  wallets: [],
  modal: null,
  snPKeys: {},
};

Miner.propTypes = {
  isMining: PropTypes.bool.isRequired,
  setStats: PropTypes.func.isRequired,
  setPkg: PropTypes.func.isRequired,
  registerSN: PropTypes.func.isRequired,
  jwt: PropTypes.string,
  epoch: PropTypes.number,
  selectedWalletName: PropTypes.string,
  wallets: PropTypes.array,
  stopMine: PropTypes.func.isRequired,
  setSuperNodeStats: PropTypes.func.isRequired,
  modal: PropTypes.object,
  snPKeys: PropTypes.object,
};

const mapStateToProps = state => ({
  isMining: state.miner.isMining,
  jwt: state.superNode.jwt,
  epoch: state.statistics.stats.epoch,
  wallets: state.wallet.wallets,
  selectedWalletName: state.superNode.selectedWalletName,
  modal: state.modal.modal,
  snPKeys: state.superNode.snPKeys,
});

const mapDispatchToProps = dispatch => ({
  setPkg: (pkg) => {
    dispatch(setSuccessfulPkg(pkg));
  },
  setStats: (stats) => {
    dispatch(setWorkerStats(stats));
  },
  registerSN: (address) => {
    dispatch(registerSuperNode(address));
  },
  stopMine: () => {
    dispatch(stopMining());
  },
  setSuperNodeStats: (snAddress, duration, pkgLength) => {
    dispatch(setSnStats(snAddress, duration, pkgLength));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(Miner);