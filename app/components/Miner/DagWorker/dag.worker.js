/*
dag.worker.js
===================
Send txs to forms a DAG to package
*/
// Mutex to toggle work
let isDoingWork = false;
// Load
let queue = [];
// dag - Simplified package to send to gateway
// dagRaw - Package that contains all work data
let dag = [];
let dagRaw = [];
// Time before securing current package
let epoch = 0;

// Start time of this packaging
let startDate = null;

// Thread
let dagInterval = null;

// Perform DAG
function doDag() {
  dagInterval = setInterval(() => {
    // Emergency stop
    if (!isDoingWork) {
      clearInterval(dagInterval);
      return;
    }

    // Check if currently still within epoch
    const endDate = new Date();
    const isWithinEpoch = (endDate - startDate) / 1000 < epoch;
    
    const tx = {...queue[0]};

    // If still within epoch, insert into DAG
    // and remove tx from queue
    if (isWithinEpoch) {
      if (queue.length > 0) {
        dag.push({
          snAddress: tx.snAddress,
          transaction: tx.transaction,
          nonce: tx.nonce,
          validated: tx.validated,
        });
        dagRaw.push({...tx})
        queue.shift();
      }
    }

    // If epoch is over, close this package and send it back
    if (!isWithinEpoch) {
      postMessage({
        dag,
        dagRaw,
      });

      // Reset Start Time for new epoch and init new
      // package
      startDate = new Date();
      dag = [];
      dagRaw = [];
    }
  }, 0);
}

// Message handler of this worker
onmessage = (e) => {
  // Start work
  if (e.data.cmd === 'Start') {
    // Clear any lingering threads
    clearInterval(dagInterval);

    // Get epoch
    ({ epoch } = e.data);

    // Init start time, packages and queue
    isDoingWork = true;
    startDate = new Date();
    dag = [];
    dagRaw = [];
    queue = [];

    // Do work
    doDag();
    console.log('DAG Worker: Start');
  }

  // Add Tx into queue
  if (e.data.cmd === 'Add_Transaction') {
    queue.push(e.data.tx);
    console.log('DAG Worker: Add Tx');
  }

  // Update epoch
  if (e.data.cmd === 'Update_Epoch') {
    ({epoch} = e.data);
    console.log('DAG Worker: Update Epoch');
  }


  // Stop work
  if (e.data.cmd === 'Stop') {
    isDoingWork = false;
    console.log('DAG Worker: Stop');
  }
}
