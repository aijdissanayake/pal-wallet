import {
  SAVE_PENDING_TX_STARTED,
  SAVE_PENDING_TX_SUCCESS,
  SAVE_PENDING_TX_FAILURE,
  GET_PENDING_TX_LIST_STARTED,
  GET_PENDING_TX_LIST_SUCCESS,
  GET_PENDING_TX_LIST_FAILURE,
  UPDATE_PENDING_TX_LIST_STARTED,
  UPDATE_PENDING_TX_LIST_SUCCESS,
  UPDATE_PENDING_TX_LIST_FAILURE,
  UPDATE_PENDING_TX_STARTED,
  UPDATE_PENDING_TX_SUCCESS,
  UPDATE_PENDING_TX_FAILURE,
  TRIM_PENDING_TX_LIST_STARTED,
  TRIM_PENDING_TX_LIST_SUCCESS,
  TRIM_PENDING_TX_LIST_FAILURE,
} from 'actions/clientStorageActions';

const INITIAL_STATE = {
  isSavePendingTx: false,
  savePendingTxError: '',
  pendingTxList: [],

  isGetPendingTxList: false,
  getPendingTxListError: '',

  isUpdatePendingTxList: false,
  updatePendingTxListError: '',

  isUpdatePendingTx: false,
  updatePendingTxError: '',
};

export default function (state = INITIAL_STATE, action) {
  switch (action.type) {
    // FOR SAVE PENDING TRANSACTION
    case SAVE_PENDING_TX_STARTED:
      return {
        ...state,
        isSavePendingTx: true,
      };
    case SAVE_PENDING_TX_SUCCESS:
      return {
        ...state,
        pendingTxList: action.data || [],
        isSavePendingTx: false,
      };
    case SAVE_PENDING_TX_FAILURE: {
      const savePendingTxError = action.data || { message: action.data.message };
      return {
        ...state,
        savePendingTxError,
        isSavePendingTx: false,
      };
    }

    // FOR GET TRANSACTION LIST
    case GET_PENDING_TX_LIST_STARTED:
      return {
        ...state,
        isGetPendingTxList: true,
      };
    case GET_PENDING_TX_LIST_SUCCESS:
      return {
        ...state,
        pendingTxList: action.data || [],
        isGetPendingTxList: false,
      };
    case GET_PENDING_TX_LIST_FAILURE: {
      const getPendingTxListError = action.data || { message: action.data.message };
      return {
        ...state,
        getPendingTxListError,
        isGetPendingTxList: false,
      };
    }

    // FOR UPDATE TRANSACTION LIST
    case UPDATE_PENDING_TX_LIST_STARTED:
    case TRIM_PENDING_TX_LIST_STARTED:
      return {
        ...state,
        isUpdatePendingTxList: true,
      };
    case UPDATE_PENDING_TX_LIST_SUCCESS:
      return {
        ...state,
        isUpdatePendingTxList: false,
        pendingTxList: action.data,
      };
    case UPDATE_PENDING_TX_LIST_FAILURE:
    case TRIM_PENDING_TX_LIST_FAILURE: {
      const updatePendingTxListError = action.data || { message: action.data.message };
      return {
        ...state,
        updatePendingTxListError,
        isUpdatePendingTxList: false,
      };
    }

    // FOR UPDATE TRANSACTION
    case UPDATE_PENDING_TX_STARTED:
      return {
        ...state,
        isUpdatePendingTx: true,
      };
    case UPDATE_PENDING_TX_SUCCESS:
    case TRIM_PENDING_TX_LIST_SUCCESS:
      return {
        ...state,
        isUpdatePendingTx: false,
        pendingTxList: action.data,
      };
    case UPDATE_PENDING_TX_FAILURE: {
      const updatePendingTxError = action.data || { message: action.data.message };
      return {
        ...state,
        updatePendingTxError,
        isUpdatePendingTx: false,
      };
    }
    default:
      return state;
  }
}
