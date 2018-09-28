/*
HashCash.js
===================
Send tx to do hashcash,
manages worker's load and send hashcashed txs to
form DAG
*/
import ethUtils from 'ethereumjs-util';
import HashCashWorker from './hashcash.worker';

const  { BN } = ethUtils;
const bigNumOne = new BN('1');

// Constructor
function HashCash(dagWorker, setStats, stopMining) {
    if (process.env.NODE_ENV === 'production') {
        this.worker = new HashCashWorker();
    } else {
        this.worker = new Worker('./components/Miner/HashCashWorker/hashcash.worker.js');
    }

    // DAG worker to send work to
    this.dagWorker =  dagWorker;
    // Update worker stats
    this.setStats = setStats;
    // Emergency stop mining
    this.stopMining = stopMining;
};

// Handle the transaction worker
HashCash.prototype.startWorker = function(index, snAddress, transactionsPool, loadBalancer, currentTxCounter) {
  // Reference to the transaction pool
  this.transactionsPool = transactionsPool;
  // Manages the workers' load
  this.loadBalancer = loadBalancer;
  // The current tx counter in queue
  this.currentTxCounter = currentTxCounter;

  // If worker is initiated
  if (this.worker) {
    try {
      // Start the worker and give it an ID
      this.worker.postMessage({
        cmd: 'Start',
        id: index,
      });

      // Message handler
      this.worker.onmessage = (e) => {
        // Update worker stats
        if (e.data.cmd === 'Post_Stats') {
          // Update worker stats for UI
          this.setStats(e.data.info);
        }

        // If hashing is done
        // Race condition now invalid due to priority queue
        if (e.data.cmd === 'Work_Done') {
          // Push the data to pool first
          this.transactionsPool.queue({...e.data.tx});
          // Update worker load
          this.loadBalancer[e.dataworkerID] -= 1;

          // Collect tx while length > 0
          while (this.transactionsPool.length > 0) {
            const tx = this.transactionsPool.peek();
            const txCounter = new BN(tx.txCounter);
            // If the txCounter is not the next in queue, return
            if (!txCounter.eq(this.currentTxCounter.txCounter)) {
              break;
            }

            // If this tx is in the next queue,
            // Send to form DAG
            this.dagWorker.sendTx({
              ...tx,
              txCounter: tx.txCounter.toString(),
              snAddress,
            });

            // Remove this tx from pool
            this.transactionsPool.dequeue();
            // Increase the currentTxCounter to get the next tx
            this.currentTxCounter.txCounter = this.currentTxCounter.txCounter.add(bigNumOne);
          }
        }
      }
    } catch (error) {
      // Worker thread should not have error.
      // Stop all work immediately
      this.stopMining();
      console.log(`Worker error!! Error: ${error.message}`);
    }
  }
};
  
// Stop the HashCash worker
HashCash.prototype.stopWorker = function() {
  if (this.worker) {
    this.worker.postMessage({cmd: 'Stop'});
  }
}

// Handle the HashCash worker
HashCash.prototype.sendTx = function(tx) {
  if (this.worker) {
    this.worker.postMessage({
      cmd: 'New_Transaction',
      tx,
    });
  }
};

export default HashCash;
