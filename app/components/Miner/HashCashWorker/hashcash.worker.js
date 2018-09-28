/*
hashcash.worker.js
===================
Do hashcash calculation for nonce difficulty for
each transaction.
*/
const SHA256 = require("crypto-js/sha256");
const ethUtil = require('ethereumjs-util');

const { BN } = ethUtil;

// States
const STATE_IDLE = 0;
const STATE_HASHING = 1;

// Do short burst of calculations
const burstLimit = 1000;
const increment = new BN('1');

// ID of this worker
let id = 0;
// Worker state
let state = STATE_IDLE;
// Mutex used to stop work
let isDoingWork = false;
// Worker load
let queue = [];

// Stats
let ratePerSec = 0;

// Threads
let miningInterval = null;
let statInterval = null;

// For hash validation
function diff (hash, difficulty, verifyString) {
  if (hash.length < difficulty) {
    return false;
  }
  const toCheck = hash.substring(0, difficulty);
  const nextChar = hash[difficulty];
  return toCheck === verifyString && nextChar !== '0'
}

// Start do hashcash mining
function startMining() {
  // String to verify work done
  let verifyString = '';
  // Start nonce from 0
  let nonce = new BN('0');
  // Start of work
  let startDate = new Date();
  // Calculated hash with nonce, should match the 0s with the difficulty 
  let hash = null;
  // The original transaction
  let tx = null;

  miningInterval = setInterval(() => {
    // Emergency stop mining
    if (!isDoingWork) {
      clearInterval(miningInterval);
      return;
    }

    switch (state) {
      // When not doing work
      case STATE_IDLE: {
        // If there are txs for work
        if (queue.length > 0) {
          // Retrieve and delete from load
          tx = {...queue[0]};
          queue.shift();
          
          // Do not do work if tx already failed validation.
          // Return with empty nonce
          // if (!tx.validated) {
          //   postMessage({
          //     cmd: 'Work_Done',
          //     workerID: id,
          //     tx: {
          //       ...tx,
          //       nonce: '',
          //     },
          //   });

          //   break;
          // }

          // Get the amount of 0s to check and init the nonce
          // and starting time stamp
          verifyString = new Array(tx.difficulty + 1).join('0');
          nonce = new BN('0');;
          startDate = new Date();
          
          // Do work once first
          if (tx.validated) {
            hash = SHA256(tx.transaction + nonce.toString()).toString();
          }
          // Switch state to do hashing
          state = STATE_HASHING;
        }
        break;
      }
      case STATE_HASHING: {
        // Attempt work in short burts
        for (let i = 0; i < burstLimit; i++) {
          // Stop work if exit
          if (!isDoingWork) {
            break;
          }

          // Verify work done with difficulty to amount of 0s
          if (!diff(hash, tx.difficulty, verifyString)) {
            // If fail, increase nonce, hash and try again
            nonce = nonce.add(increment);
            hash = SHA256(tx.transaction + nonce.toString()).toString();
          } else {
            // Calculate the rate to calculate this hash
            const endDate = new Date();
            ratePerSec = (endDate - startDate) / 1000;

            // Post result nonce with tx
            postMessage({
              cmd: 'Work_Done',
              workerID: id,
              tx: {
                ...tx,
                nonce: nonce.toString(),
              },
            });

            // Switch back to IDLE to get more work
            state = STATE_IDLE;
            break;
          }
        }
        
        break;
      }
      default: {
        console.log('HashCash Worker error!');
      }
    }
  }, 0);
}

// Update worker stats per sec
function logStats() {
  statInterval = setInterval(() => {
    if (!isDoingWork) {
      clearInterval(statInterval);
      return;
    }

    postMessage({
      cmd: 'Post_Stats',
      info: {
        id,
        stat: {
          load: queue.length,
          ratePerSec,
        }
      },
    });
  }, 1000);
}

// Message handler of this worker
onmessage = (e) => {
  // Start worker
  if (e.data.cmd === 'Start') {
    // Clear any lingering threads
    clearInterval(miningInterval);
    clearInterval(statInterval);

    // Init state, ID, mutex and queue
    state = STATE_IDLE;
    ({ id } = e.data);
    isDoingWork = true;
    queue = [];

    // Start work
    startMining();
    logStats();
    console.log('HashCash Worker: Start');
  }

  // When new transaction arrive, push to queue
  if (e.data.cmd === 'New_Transaction') {
    queue.push(e.data.tx);
    console.log(`HashWorker ${id}: New transaction for hashing`);
  }

  // Stop work
  if (e.data.cmd === 'Stop') {
    isDoingWork = false;
    queue = [];
    console.log(`HashWorker ${id}: Stop hashing`);
  }
}
