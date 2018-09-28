/*
walletNode.js
===================
Actions for wallet
*/
import { generateKeyStore, pKeyToKeyStore, keyStoreToPKey } from '../lib/keyFunctions';

export const CREATE_WALLET_STARTED = 'CREATE_WALLET_STARTED';
export const CREATE_WALLET_SUCCESS = 'CREATE_WALLET_SUCCESS';
export const CREATE_WALLET_FAILURE = 'CREATE_WALLET_FAILURE';

export const IMPORT_WALLET_STARTED = 'IMPORT_WALLET_STARTED';
export const IMPORT_WALLET_SUCCESS = 'IMPORT_WALLET_SUCCESS';
export const IMPORT_WALLET_FAILURE = 'IMPORT_WALLET_FAILURE';

export const GET_WALLET_LIST_STARTED = 'GET_WALLET_LIST_STARTED';
export const GET_WALLET_LIST_SUCCESS = 'GET_WALLET_LIST_SUCCESS';
export const GET_WALLET_LIST_FAILURE = 'GET_WALLET_LIST_FAILURE';

export const CHANGE_WALLET_STARTED = 'CHANGE_WALLET_STARTED';
export const CHANGE_WALLET_SUCCESS = 'CHANGE_WALLET_SUCCESS';
export const CHANGE_WALLET_FAILURE = 'CHANGE_WALLET_FAILURE';

export const UPDATE_WALLET_STARTED = 'UPDATE_WALLET_STARTED';
export const UPDATE_WALLET_SUCCESS = 'UPDATE_WALLET_SUCCESS';
export const UPDATE_WALLET_FAILURE = 'UPDATE_WALLET_FAILURE';

export const EXPORT_KEYSTORE_STARTED = 'EXPORT_KEYSTORE_STARTED';
export const EXPORT_KEYSTORE_SUCCESS = 'EXPORT_KEYSTORE_SUCCESS';
export const EXPORT_KEYSTORE_FAILURE = 'EXPORT_KEYSTORE_FAILURE';

export const DEFAULT_WALLET_DATA = {
  name: '',
  address: '',
  privateKey: '',
  palBalance: '0',
  weiBalance: '0',
  transactions: [],
}

// Creation of new wallet by generating keystpre
const createNewWallet = function (walletName, password) {
  return async (dispatch) => {
    dispatch({ type: CREATE_WALLET_STARTED });

    try {
      // Generate a keystore with user password
      const keyStore = generateKeyStore(password);
      // Get the private key
      const privateKeyResult = keyStoreToPKey(keyStore, password);

      // Success and set new wallet to selected wallet
      if (keyStore) {
        dispatch({
          type: CREATE_WALLET_SUCCESS,
          data: {
            ...DEFAULT_WALLET_DATA,
            name: walletName,
            address: `0x${keyStore.address}`.toLowerCase(),
            keyStore,
            privateKey: privateKeyResult.privateKey,
          }
        });
      } else {
        dispatch({ type: CREATE_WALLET_FAILURE, data: 'Can\'t create wallet.'});
      }
    } catch (error) {
      dispatch({ type: CREATE_WALLET_FAILURE, data: error});
    }
  };
}

// Import new wallet by private key and password
// to form a new keystore
const importNewWallet = function (walletData) {
  return async (dispatch) => {
    dispatch({ type: IMPORT_WALLET_STARTED });

    try {
      let selectedWallet = null;

      if (walletData) {
        selectedWallet = walletData;

        if (walletData.password && walletData.privateKey) {
          // Form a new keystore with password and private key
          const keyStoreResult = await pKeyToKeyStore(walletData.password, walletData.privateKey);

          // Set keystore data to selected wallet
          if (keyStoreResult.keyStore) {
            selectedWallet = {
              ...selectedWallet,
              address: `0x${keyStoreResult.keyStore.address}`,
              keyStore: keyStoreResult.keyStore,
            }
          }
        }
      }

      if (selectedWallet && selectedWallet.address && selectedWallet.name) {
        const wallets = JSON.parse(localStorage.getItem('wallets')) || [];

        // Check and add if wallet is new
        if (!wallets.some(item => item.address === selectedWallet.address)) {
          wallets.push(selectedWallet);
        }

        // Set it to local storage
        localStorage.setItem('wallets', JSON.stringify(wallets));

        // Success and set new wallet to selected wallet
        dispatch({
          type: IMPORT_WALLET_SUCCESS,
          data: {
            selectedWallet,
            wallets,
          }
        });
      } else {
        dispatch({ type: IMPORT_WALLET_FAILURE, data: 'Can\'t import wallet.'});
      }
    } catch (error) {
      dispatch({ type: IMPORT_WALLET_FAILURE, data: error});
    }
  };
}

// Get wallet list from local storage
const getWalletList = function () {
  return async (dispatch) => {
    dispatch({ type: GET_WALLET_LIST_STARTED });

    try {
      const wallets = JSON.parse(localStorage.getItem('wallets')) || [];

      dispatch({
        type: GET_WALLET_LIST_SUCCESS,
        data: {
          wallets
        }
      });
    } catch (error) {
      dispatch({ type: GET_WALLET_LIST_FAILURE, data: error});
    }
  };
}

// Change selected wallet
const changeWallet = function (wallet) {
  return async (dispatch) => {
    dispatch({ type: CHANGE_WALLET_STARTED });

    try {
      const wallets = JSON.parse(localStorage.getItem('wallets')) || [];
      const idx = wallets.findIndex(item => item.address === wallet.address);

      const selectedWallet = {
        ...DEFAULT_WALLET_DATA,
        ...wallets[idx],
      }

      dispatch({
        type: CHANGE_WALLET_SUCCESS,
        data: { selectedWallet }
      });
    } catch (error) {
      dispatch({ type: CHANGE_WALLET_FAILURE, data: error});
    }
  };
}

// Update wallet status to local storage
const updateWallet = function (walletData) {
  return async (dispatch) => {
    dispatch({ type: UPDATE_WALLET_STARTED });

    try {
      const wallets = JSON.parse(localStorage.getItem('wallets')) || [];
      const idx = wallets.findIndex(item => item.address === walletData.address);
      let selectedWallet = null;

      if (idx >= 0) {
        wallets[idx] = { ...DEFAULT_WALLET_DATA, ...walletData };
        selectedWallet = wallets[idx];
      }

      localStorage.setItem('wallets', JSON.stringify(wallets));
      dispatch({
        type: UPDATE_WALLET_SUCCESS,
        data: {
          selectedWallet,
          wallets,
        }
      });
    } catch (error) {
      dispatch({ type: UPDATE_WALLET_FAILURE, data: error});
    }
  };
}

// Exporting keystore state to manage the loading modal
const exportKeyStoreState = state => (dispatch) => {
  if (state === 'start') {
    dispatch({ type: EXPORT_KEYSTORE_STARTED });
  } else if (state === 'success') {
    dispatch({ type: EXPORT_KEYSTORE_SUCCESS });
  } else {
    dispatch({ type: EXPORT_KEYSTORE_FAILURE });
  };
}

export {
  createNewWallet,
  importNewWallet,
  getWalletList,
  changeWallet,
  updateWallet,
  exportKeyStoreState,
};
