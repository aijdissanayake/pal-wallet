/*
TransactionHandler.js
===================
Retrieve Txs from gateway and send validated Txs
to HashCash workers
*/
import _ from 'lodash';
import ethUtils from 'ethereumjs-util';
import TxWorker from './transactionHandler.worker';

const  { BN } = ethUtils;
const bigNumOne = new BN('1');

// Constructor
function TransactionHandler(hashCashWorkers, stopMining) {
    if (process.env.NODE_ENV === 'production') {
        this.worker = new TxWorker();
    } else {
        this.worker = new Worker('./components/Miner/TransactionHandlerWorker/transactionHandler.worker.js');
    }

    // Emergency stop due to error
    this.stopMining = stopMining;
    // The array of avaliable HashCash workers
    this.hashCashWorkers = hashCashWorkers;
    // Function to reregister SN to get JWT
    this.registerSN = () => {};
};

// Start the worker
TransactionHandler.prototype.startWorker = function(pollInterval, loadBalancer, modal, debugPkey) {
  // A reference to HashCash workers loadbalancer 
  this.loadBalancer = loadBalancer;
  // This counter keeps track the order of each validated Tx
  this.assignedTxCounter = new BN('0');

  if (this.worker) {
    try {
      // Start the transactionWorker with pollinterval
      // and debugPkey for debugging
      this.worker.postMessage({
        cmd: 'Start',
        pollInterval,
        gatewayIP: process.env.PPN_GATEWAY_IP,
        debugPkey,
      });

      // Message handler
      this.worker.onmessage = (e) => {
        if (e.data.cmd === 'New_Transaction') {
          // Assign a counter to this tx. This is used to maintain
          // order during DAG building
          e.data.tx.txCounter = this.assignedTxCounter.toString();
          // Increase the counter
          this.assignedTxCounter = this.assignedTxCounter.add(bigNumOne);
          // if hashWorker is initiated
          if (this.hashCashWorkers) {
            // Find a hashWorker with the least work load
            const freeWorkerIndex = _.indexOf(this.loadBalancer, _.min(this.loadBalancer));
            // Assign this transaction to the hashWorker and increase its load
            this.hashCashWorkers[freeWorkerIndex].sendTx(e.data.tx);
            this.loadBalancer[freeWorkerIndex] += 1;
          }
        }

        if (e.data.cmd === 'Request_JWT' && this.registerSN) {
          this.registerSN()
        }

        if (e.data.cmd === 'Low_Balance') {
          // Account have low balance. Stop work
          this.stopMining();
          if (modal) {
            modal.toggle('Mining Stopped!', `Account balance has fallen below the required 100,000 ${process.env.PPN_SYMBOL}.`);
          }
        }
      }
    } catch (error) {
      // Worker thread should not be undefined.
      // Stop all work immediately
      this.stopMining();
      console.log(`Worker is Undefined!! Error: ${error.message}`);
    }
  }
};
  
// Stop the transaction worker
TransactionHandler.prototype.stopWorker = function() {
  if (this.worker) {
      this.worker.postMessage({cmd: 'Stop'});
  }
}

TransactionHandler.prototype.setRegisterFunc = function(registerFunc) {
  this.registerSN = registerFunc;
}

// Stop the transaction worker
TransactionHandler.prototype.updateJwt = function(jwt) {
  if (this.worker) {
    this.worker.postMessage({
      cmd: 'Update_Jwt',
      jwt,
    });
  }
}

export default TransactionHandler;
