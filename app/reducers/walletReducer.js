import {
  CREATE_WALLET_STARTED,
  CREATE_WALLET_SUCCESS,
  CREATE_WALLET_FAILURE,
  IMPORT_WALLET_STARTED,
  IMPORT_WALLET_SUCCESS,
  IMPORT_WALLET_FAILURE,
  GET_WALLET_LIST_STARTED,
  GET_WALLET_LIST_SUCCESS,
  GET_WALLET_LIST_FAILURE,
  CHANGE_WALLET_STARTED,
  CHANGE_WALLET_SUCCESS,
  CHANGE_WALLET_FAILURE,
  UPDATE_WALLET_STARTED,
  UPDATE_WALLET_SUCCESS,
  UPDATE_WALLET_FAILURE,
  EXPORT_KEYSTORE_STARTED,
  EXPORT_KEYSTORE_SUCCESS,
  EXPORT_KEYSTORE_FAILURE,
} from 'actions/walletActions';

const INITIAL_STATE = {
  isCreateWallet: false,
  createWalletError: '',
  newWalletInfo: null,

  isImportWallet: false,
  importWalletError: '',
  selectedWallet: null,
  wallets: [],

  isGetWalletList: false,
  getWalletListError: '',

  isChangeWallet: false,
  changeWalletError: '',

  isUpdateWallet: false,
  updateWalletError: '',

  isLoadingKeyStore: false,
};

export default function (state = INITIAL_STATE, action) {
  switch (action.type) {
    // FOR CREATE WALLET
    case CREATE_WALLET_STARTED:
      return {
        ...state,
        isCreateWallet: true,
      };
    case CREATE_WALLET_SUCCESS:
      return {
        ...state,
        newWalletInfo: action.data,
        isCreateWallet: false,
      };
    case CREATE_WALLET_FAILURE: {
      const createWalletError = action.data || { message: action.data.message };
      return {
        ...state,
        createWalletError,
        isCreateWallet: false,
      };
    }
    // FOR IMPORT WALLET
    case IMPORT_WALLET_STARTED:
      return {
        ...state,
        isImportWallet: true,
      };
    case IMPORT_WALLET_SUCCESS:
      return {
        ...state,
        newWalletInfo: action.data.selectedWallet,
        selectedWallet: action.data.selectedWallet,
        wallets: action.data.wallets,
        isImportWallet: false,
      };
    case IMPORT_WALLET_FAILURE: {
      const importWalletError = action.data || { message: action.data.message };
      return {
        ...state,
        importWalletError,
        isImportWallet: false,
      };
    }
    // FOR GET WALLET LIST
    case GET_WALLET_LIST_STARTED:
      return {
        ...state,
        isGetWalletList: true,
      };
    case GET_WALLET_LIST_SUCCESS:
      return {
        ...state,
        wallets: action.data.wallets,
        isGetWalletList: false,
      };
    case GET_WALLET_LIST_FAILURE: {
      const getWalletListError = action.data || { message: action.data.message };
      return {
        ...state,
        getWalletListError,
        isGetWalletList: false,
      };
    }
    // FOR CHANGE WALLET
    case CHANGE_WALLET_STARTED:
      return {
        ...state,
        isChangeWallet: true,
      };
    case CHANGE_WALLET_SUCCESS:
      return {
        ...state,
        selectedWallet: action.data.selectedWallet,
        isChangeWallet: false,
      };
    case CHANGE_WALLET_FAILURE: {
      const changeWalletError = action.data || { message: action.data.message };
      return {
        ...state,
        changeWalletError,
        isChangeWallet: false,
      };
    }
    // FOR UPDATE WALLET
    case UPDATE_WALLET_STARTED:
      return {
        ...state,
        isUpdateWallet: true,
      };
    case UPDATE_WALLET_SUCCESS:
      return {
        ...state,
        selectedWallet: action.data.selectedWallet,
        wallets: action.data.wallets,
        isUpdateWallet: false,
      };
    case UPDATE_WALLET_FAILURE: {
      const updateWalletError = action.data || { message: action.data.message };
      return {
        ...state,
        updateWalletError,
        isUpdateWallet: false,
      };
    }
    // FOR Exporting keystore
    case EXPORT_KEYSTORE_STARTED:
      return {
        ...state,
        isLoadingKeyStore: true,
      };
    case EXPORT_KEYSTORE_SUCCESS:
    case EXPORT_KEYSTORE_FAILURE:
      return {
        ...state,
        isLoadingKeyStore: false,
      };
    default:
      return state;
  }
}
