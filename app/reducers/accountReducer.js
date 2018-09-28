import {
  GET_BALANCE_STARTED,
  GET_BALANCE_SUCCESS,
  GET_BALANCE_FAILURE,
  GET_TRANSACTION_LIST_STARTED,
  GET_TRANSACTION_LIST_SUCCESS,
  GET_TRANSACTION_LIST_FAILURE,
  CREATE_TX_STARTED,
  CREATE_TX_SUCCESS,
  CREATE_TX_FAILURE,
} from 'actions/accountActions';

const INITIAL_STATE = {
  isGetBalance: false,
  getBalanceError: '',
  newWeiBalance: '0',
  newPalBalance: '0',

  isGetTransactionList: false,
  getTransactionListError: '',
  transactionList: [],
  transactionPage: 1,
  transactionTotalPages: 1,

  isCreateTransaction: false,
  createTransactionError: '',
  newTransaction: {},
};

export default function (state = INITIAL_STATE, action) {
  switch (action.type) {
    // FOR GET BALANCE
    case GET_BALANCE_STARTED:
      return {
        ...state,
        isGetBalance: true,
        getBalanceError: '',
      };
    case GET_BALANCE_SUCCESS:
      return {
        ...state,
        newWeiBalance: action.data.weiBalance,
        newPalBalance: action.data.palBalance,
        isGetBalance: false,
      };
    case GET_BALANCE_FAILURE: {
      const getBalanceError = action.data || { message: action.data.message };
      return {
        ...state,
        getBalanceError,
        isGetBalance: false,
      };
    }

    // FOR GET TRANSACTION LIST
    case GET_TRANSACTION_LIST_STARTED:
      return {
        ...state,
        getTransactionListError: '',
        isGetTransactionList: true,
      };
    case GET_TRANSACTION_LIST_SUCCESS:
      return {
        ...state,
        transactionList: action.data.data || [],
        transactionPage: action.data.page || 1,
        transactionTotalPages: action.data.total_pages || 1,
        isGetTransactionList: false,
      };
    case GET_TRANSACTION_LIST_FAILURE: {
      const getTransactionListError = action.data || { message: action.data.message };
      return {
        ...state,
        getTransactionListError,
        isGetTransactionList: false,
      };
    }

    // FOR CREATE TRANSACTION
    case CREATE_TX_STARTED:
      return {
        ...state,
        createTransactionError: '',
        isCreateTransaction: true,
      };
    case CREATE_TX_SUCCESS:
      return {
        ...state,
        newTransaction: action.data || {},
        isCreateTransaction: false,
      };
    case CREATE_TX_FAILURE: {
      const createTransactionError = action.data || { message: action.data.message };
      return {
        ...state,
        createTransactionError,
        isCreateTransaction: false,
      };
    }
    default:
      return state;
  }
}
