/*
accountActions.js
===================
Actions for accounts
*/
import Web3 from 'web3';
import Axios from 'lib/axiosFunctions';
import EthereumTx from 'ethereumjs-tx';
import { truncateHash } from '../lib/helperFunctions';

export const GET_BALANCE_STARTED = 'GET_BALANCE_STARTED';
export const GET_BALANCE_SUCCESS = 'GET_BALANCE_SUCCESS';
export const GET_BALANCE_FAILURE = 'GET_BALANCE_FAILURE';

export const GET_TRANSACTION_LIST_STARTED = 'GET_TRANSACTION_LIST_STARTED';
export const GET_TRANSACTION_LIST_SUCCESS = 'GET_TRANSACTION_LIST_SUCCESS';
export const GET_TRANSACTION_LIST_FAILURE = 'GET_TRANSACTION_LIST_FAILURE';

export const CREATE_TX_STARTED = 'CREATE_TX_STARTED';
export const CREATE_TX_SUCCESS = 'CREATE_TX_SUCCESS';
export const CREATE_TX_FAILURE = 'CREATE_TX_FAILURE';

const GATEWAY_IP = process.env.PPN_GATEWAY_IP;
const PER_PAGE = 10;

// Get balance of address from GW
const getBalance = function (address) {
  return async (dispatch) => {
    dispatch({ type: GET_BALANCE_STARTED });

    try {
      const result = await Axios.GET(`${GATEWAY_IP}/account/balance/${address}`);

      if (result.status === 200) {
        let data = { palBalance: '0', weiBalance: '0' };

        if (result.data[address] && result.data[address].balance !== '0') {
          const web3 = new Web3();
          const weiBalance = result.data[address].balance;
          const palBalance = web3.utils.fromWei(weiBalance, 'ether');
          data = {
            palBalance,
            weiBalance,
          };
        }

        dispatch({ type: GET_BALANCE_SUCCESS, data });
      } else {
        dispatch({ type: GET_BALANCE_FAILURE, data: 'Can\'t get balance.'});
      }
    } catch (error) {
      dispatch({ type: GET_BALANCE_FAILURE, data: error.message || error});
    }
  };
}

// Get transaction list of address from GW
const getTransactionList = function (address, page = 1) {
  return async (dispatch) => {
    dispatch({ type: GET_TRANSACTION_LIST_STARTED });

    try {
      const result = await Axios.GET(`${GATEWAY_IP}/account/tx/${address}?page=${page}&per_page=${PER_PAGE}`);

      if (result.status === 200) {
        const  data = { ...result.data };

        dispatch({ type: GET_TRANSACTION_LIST_SUCCESS, data });
      } else {
        dispatch({ type: GET_TRANSACTION_LIST_FAILURE, data: 'Can\'t get transaction list.'});
      }
    } catch (error) {
      dispatch({ type: GET_TRANSACTION_LIST_FAILURE, data: error.message || error});
    }
  };
}

// Creates a transaction and send to GW
const createTransaction = function (transactionData) {
  return async (dispatch) => {
    dispatch({ type: CREATE_TX_STARTED });

    try {
      const nonceResult = await Axios.GET(`${GATEWAY_IP}/account/nonce/${transactionData.from}`);

      // Attempt to get from local storage
      const accNonces = JSON.parse(localStorage.getItem("accNonces")) || {};
      const nonceFromNode = nonceResult.data[transactionData.from] || 0;
      const currTime = new Date();

      // Increment nonce and store it
      localStorage.setItem("accNonces", JSON.stringify({
        ...accNonces,
        [transactionData.from]: {
          nonce: parseInt(nonceFromNode.nonce, 10) + 1,
          timeStamp: currTime.toISOString(),
        },
      }));

      // Create the tx
      const tx = {
        nonce: nonceFromNode.nonce,
        chainId: 2018,
        gas: 1500000,
        gasPrice: 0,
        ...transactionData,
      };
      delete tx.privateKey;

      const palTx = new EthereumTx(tx);

      // Sign tx
      palTx.sign(Buffer.from(transactionData.privateKey.slice(2), 'hex'));
      const jsonData = `0x${palTx.serialize().toString('hex')}`;

      // Send transaction
      const result = await Axios.POST(`${GATEWAY_IP}/tx/send`, { data: `${jsonData}` });

      if (result.status === 200) {
        const data = {
          ...result.data,
          ...transactionData,
          'created_at': + new Date(),
        };
        delete data.privateKey;

        dispatch({ type: CREATE_TX_SUCCESS, data });
      } else {
        dispatch({ type: CREATE_TX_FAILURE, data: 'Can\'t create transaction.'});
      }
    } catch (error) {
      dispatch({ type: CREATE_TX_FAILURE, data: error.message || error});
    }
  };
};

// Get TPAL from faucet
const getFaucetPal = async (address, modal) => {
  const result = await Axios.POST(`${GATEWAY_IP}/account/faucet`, {
    address,
  });

  const symbol = process.env.PPN_SYMBOL;
  try {
    if (modal) {
      if (result.status === 200) {
        const txHash = truncateHash(result.data[address].tx_hash);
        modal.toggle(`Your ${symbol} is on the way!`, `TxHash: ${txHash}`);
      } else {
        modal.toggle(`Too much ${symbol}`, `You already have enough ${symbol}`);
      }
    }
  } catch (error) {
    modal.toggle(`${symbol} faucet is busy!`, 'Please try again');
    console.log(`Error parsing faucet result: ${error.message}`);
  }
}

export {
  getTransactionList,
  getBalance,
  createTransaction,
  getFaucetPal,
};
