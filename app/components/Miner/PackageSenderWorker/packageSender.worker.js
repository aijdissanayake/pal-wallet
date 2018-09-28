/*
packageSender.worker.js
===================
Sign packages and send them to gateway
*/
const _ = require('lodash');
const EthereumTx = require('ethereumjs-tx');
const ethUtil = require('ethereumjs-util');
const Axios = require('../../../lib/axiosFunctions');

// Retry count to send
const retryCount = 3;

// Mutex to toggle work
let isDoingWork = false;
// Queue of packages
let queue = [];

// Thread
let senderInterval = null;

// JWT to send
let jwt = null;
// Await lock
let lock = false;

// Invalid responses from GW
const invalidCodes = [
  'encoding/hex',
  'EOF',
  'cannot unmarshal',
]

// Start sending packages to gateway
// snPKey - SN pKey to sign
// gatewayIP - Gateway IP
function startPackageSender(snPKey, gatewayIP) {
  senderInterval = setInterval(async () => {
    if (!isDoingWork) {
      clearInterval(senderInterval);
      return;
    }

    // If there is data and data is valid
    if (!lock && jwt && queue.length > 0 && queue[0] && queue[0].dag && queue[0].dagRaw) {
      // Extract the data and pop from queue
      const pkg = [...queue[0].dag];
      const pkgRaw = [...queue[0].dagRaw];

      
      // If pakcage is not empty
      if (pkg.length > 0) {
        // hash the data
        const hashedData = `0x${Buffer.from(JSON.stringify(pkg), 'utf8').toString('hex')}`;

        // Form the raw block transaction
        const rawTx = {
          value: '0x00',
          data: hashedData,
        }

        // Sign it with supernode private Key
        const tx = new EthereumTx(rawTx);
        const privateKey = Buffer.from(snPKey.slice(2), 'hex');
        tx.sign(privateKey);
        const byteTx = tx.serialize();
        const sTx = `0x${byteTx.toString('hex')}`;
        const txHash = ethUtil.bufferToHex(tx.hash(true));
        // console.log(txHash, sTx);

        // Attempt to send signed package to gateway
        let isSent = false;
        for (let i = 0; i < retryCount; i++) {
          if (isDoingWork) {
            lock = true;
            // eslint-disable-next-line no-await-in-loop
            const result = await Axios.POST(`${gatewayIP}/transactions`, {
              tx_hash: sTx,
            },{
              Authorization: jwt,
            });
            // console.log(result);
            try {
              if (result && result.status === 202) {
                isSent = true;

                break;
              } else if (result.status === 400) {
                // If is not invalid data, considered as pass as result is produced by blockchain
                const data = result.data || {};
                if (!_.find(invalidCodes, code => _.lowerCase(data.error_description).includes(_.lowerCase(code)))) {
                  isSent = true;
                }

                // Break regardless since nothing else can be done to a failed tx.
                // No need to retry
                break;
              } else if (result.status === 401 || result.status === 412) {
                // JWT expired, set to null and wait till refresh
                jwt = null;

                break;
              }
            } catch (error) {
              // Connection error
              console.log('Connection error!');
            }
          }
        }

        // Post only when valid jwt
        // console.log(pkg, pkgRaw);

        const timeStamp = new Date();
        // Update sent pacakge to UI
        postMessage({
          txHash,
          status: isSent,
          timeStamp: timeStamp.toISOString(),
          size: sTx.length,
          txs: pkgRaw,
        });
        
      }

      // Post only when valid jwt, if not store till next round
      if (jwt) {
        queue.shift();
      }

      lock = false;
    }
  }, 0);
}

// Message handler of this worker
onmessage = (e) => {
  // Start work
  if (e.data.cmd === 'Start') {
    // Clear any lingering threads
    clearInterval(senderInterval);
    senderInterval = null;

    // Init queue and mutex
    queue = [];
    isDoingWork = true;

    // Start sending packages
    startPackageSender(e.data.snPKey, e.data.gatewayIP);
    console.log('PackageSender Worker: Start');
  }

  // Add package to queue
  if (e.data.cmd === 'Send_Package') {
    queue.push(e.data.pkg);
    console.log('PackageSender Worker: Send Package');
  }

  if (e.data.cmd === 'Update_Jwt') {
    console.log('PackageSender Worker: Update Jwt');
    ({ jwt } = e.data);
  }

  // Stop work
  if (e.data.cmd === 'Stop') {
    isDoingWork = false;
    console.log('PackageSender Worker: Stop');
  }
}
