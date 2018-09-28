/*
Dag.js
===================
Send txs to forms a DAG to package
*/
import DagWorker from './dag.worker';

// Constructor
function Dag(packageSenderWorker) {
    if (process.env.NODE_ENV === 'production') {
        this.worker = new DagWorker();
    } else {
        this.worker = new Worker('./components/Miner/DagWorker/dag.worker.js');
    }

    // Worker to send package back to gateway
    this.packageSenderWorker =  packageSenderWorker;
};

// Handle the transaction worker
Dag.prototype.startWorker = function(epoch) {
  if (this.worker) {
    // Start DAG worker with epoch to form blocks
    this.worker.postMessage({
      cmd: 'Start',
      epoch,
    });

    // Message handler
    this.worker.onmessage = (e) => {
      // Send package back to gateway
      this.packageSenderWorker.sendPackage(e.data);
    }
  }
};
  
// Stop the transaction worker
Dag.prototype.stopWorker = function() {
  if (this.worker) {
    this.worker.postMessage({cmd: 'Stop'});
  }
}

// Send Tx to form dag
Dag.prototype.sendTx = function(tx) {
  if (this.worker) {
    this.worker.postMessage({
      cmd: 'Add_Transaction',
      tx,
    });
  }
};

// Stop the transaction worker
Dag.prototype.updateEpoch = function(epoch) {
  if (this.worker) {
    this.worker.postMessage({
      cmd: 'Update_Epoch',
      epoch,
    });
  }
}

export default Dag;
