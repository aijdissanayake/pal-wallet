/*
transaction.worker.js
===================
Fetch transactions from gateway and do the following validations
before passing down to form DAG.

1. Signature check
2. Account balance check
*/
const _ = require('lodash');
const ethUtil = require('ethereumjs-util');
const EthereumTx = require('ethereumjs-tx');
const Axios = require('../../../lib/axiosFunctions');

const { BN } = ethUtil;

let returnBody = {};

// Mutex to toggle working state of this worker
let isDoingWork = false;
let debugNonce = 0;
let interval = null;
let genInterval = null;
let gatewayIP = '';
let jwt = null;

// Await lock
let lock = null;

// Validate transaction
const validateTransaction = async (transactions) => {
  // Results that contains all the validated transactions
  const validatedResults = [];
  // Request body for gateway to check balance
  const accountsRequestBody = [];

  // This loop will only validate the signature and hash tokens only
  for (let i = 0; i < transactions.length; i++) {
    let transactionHash = null;
    try {
      // Revert raw-transaction to transaction
      const tx = new EthereumTx(transactions[i]);
      // Sender
      const fromAddress = ethUtil.bufferToHex(tx.getSenderAddress());
      // Validates the signature and checks to see if it has enough tokens
      // input for this tx
      const validated = tx.validate();
      // The upfront cost needed for a successful transaction
      const upFrontCost = tx.getUpfrontCost();
      // Transaction hash of this tx
      transactionHash = ethUtil.bufferToHex(tx.hash(true));
      // Previous upfrontCost (If met same user)
      const prevUpFrontCost = accountsRequestBody[fromAddress] || new BN('0');
      // Recipient address
      const toAddress = ethUtil.bufferToHex(tx.to);
      // PAL value to transfer
      const value = (new BN(tx.value).toString());

      // Add partial validated results
      validatedResults.push({
        transaction: transactions[i],
        validated,
        fromAddress,
        toAddress,
        value,
        transactionHash,
        upFrontCost,
      });

      // If this batch consists of same users, just check for the
      // highest upFrontCost in the batch
      if (validated && upFrontCost.gt(prevUpFrontCost)) {
        if (_.findIndex(accountsRequestBody, account => account === fromAddress) === -1) {
          accountsRequestBody.push(fromAddress);
        }
      }
    } catch(error) {
      // If any form of validation failed, push original raw transaction
      // with empty tx hash and validated to false
      validatedResults.push({
        transaction: transactions[i],
        transactionHash: transactionHash || '',
        validated: false,
      });
      console.log('Error parsing tx');
    }
  }

  // If there are accounts to be checked
  if (!_.isEmpty(accountsRequestBody)) {
    // API call to check it
    const result = await Axios.POST(`${gatewayIP}/account/balance`, accountsRequestBody);
    if (result && result.status === 200) {
      try {
        returnBody = result.data.addresses;
      } catch (error) {
        returnBody = [];
        console.log('Error parsing account balance check');
      }
    }
  }

  // This loop will check for account balance vs upfront cost
  for (let i = 0; i < validatedResults.length; i++) {
    const vResult = validatedResults[i];
    // If existing result managed to parse fromAddress
    if (vResult.fromAddress) {
      // Check balance from gateway vs upfront cost and update validated
      const accBalance = new BN(_.has(returnBody, vResult.fromAddress) ? returnBody[vResult.fromAddress].balance : '0');
      vResult.validated = vResult.validated && accBalance.gt(vResult.upFrontCost);
    }
  }
  
  return validatedResults;
}

// Poll transactions from gateway
const pollTransactions = async (pollInterval) => {
  // Do 1st work
  await poll();

  // Start polling every interval
  interval = setInterval(async () => {
    // Force stop polling
    if (!isDoingWork) {
      clearInterval(interval);
      return;
    }

    if (!lock) {
      lock = true;
      await poll();
    }
  }, pollInterval);
}

// the actual polling
const poll = async () => {
  if (jwt) {
    let bodyToUse = null;
    let difficulty = null;
    // GET transactions from gateway
    const result = await Axios.GET(`${gatewayIP}/sn/tx/retrieve`, {
      Authorization: jwt,
    });

    if (result) {
      try {
        if (result.status === 200) {
          bodyToUse = result.data.txs;
          ({ difficulty } = result.data);
        } else if (result.status === 401) {
          // JWT expired, wait till refresh
          jwt = null;
          postMessage({
            cmd: 'Request_JWT',
          });
        } else if (result.status === 412) {
          // Balance below threshold
          jwt = null;
          isDoingWork = false;
          postMessage({
            cmd: 'Low_Balance',
          });
        }
      } catch (error) {
        console.log('Error parsing account balance check');
      }
    }

    // console.log(result);

    if (isDoingWork && bodyToUse && bodyToUse.length > 0 && difficulty) {
      // Validate transaction
      const validatedTransactions = await validateTransaction(bodyToUse);
      // Finish validation of transaction and send to next pipeline
      if (isDoingWork) {
        _.each(validatedTransactions, tx => postMessage({
          cmd: 'New_Transaction',
          tx: {
            difficulty,
            ...tx,
          },
        }));
      }
    }
  }

  lock = false;
}

// Message handler of this worker
onmessage = (e) => {
  // Start doing work
  if (e.data.cmd === 'Start') {
    clearInterval(interval);
    clearInterval(genInterval);

    isDoingWork = true;
    debugNonce = 0;
    ({ gatewayIP } = e.data);

    pollTransactions(e.data.pollInterval);

    console.log('Transaction Worker: Start');
  }

  if (e.data.cmd === 'Stop') {
    console.log('Transaction Worker: Stop');
    isDoingWork = false;
  }

  if (e.data.cmd === 'Update_Jwt') {
    console.log('Transaction Worker: Update Jwt');
    ({ jwt } = e.data);
  }
}