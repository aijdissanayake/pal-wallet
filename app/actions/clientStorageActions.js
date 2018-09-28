/*
clienStorageActions.js
===================
Manages tx lists and pending tx lists to
store it in local storage
*/
export const SAVE_PENDING_TX_STARTED = 'SAVE_PENDING_TX_STARTED';
export const SAVE_PENDING_TX_SUCCESS = 'SAVE_PENDING_TX_SUCCESS';
export const SAVE_PENDING_TX_FAILURE = 'SAVE_PENDING_TX_FAILURE';

export const GET_PENDING_TX_LIST_STARTED = 'GET_PENDING_TX_LIST_STARTED';
export const GET_PENDING_TX_LIST_SUCCESS = 'GET_PENDING_TX_LIST_SUCCESS';
export const GET_PENDING_TX_LIST_FAILURE = 'GET_PENDING_TX_LIST_FAILURE';

export const UPDATE_PENDING_TX_LIST_STARTED = 'UPDATE_PENDING_TX_LIST_STARTED';
export const UPDATE_PENDING_TX_LIST_SUCCESS = 'UPDATE_PENDING_TX_LIST_SUCCESS';
export const UPDATE_PENDING_TX_LIST_FAILURE = 'UPDATE_PENDING_TX_LIST_FAILURE';

export const UPDATE_PENDING_TX_STARTED = 'UPDATE_PENDING_TX_STARTED';
export const UPDATE_PENDING_TX_SUCCESS = 'UPDATE_PENDING_TX_SUCCESS';
export const UPDATE_PENDING_TX_FAILURE = 'UPDATE_PENDING_TX_FAILURE';

export const TRIM_PENDING_TX_LIST_STARTED = 'TRIM_PENDING_TX_LIST_STARTED';
export const TRIM_PENDING_TX_LIST_SUCCESS = 'TRIM_PENDING_TX_LIST_SUCCESS';
export const TRIM_PENDING_TX_LIST_FAILURE = 'TRIM_PENDING_TX_LIST_FAILURE';

const PENDING_TX_KEY = 'pending_tx';

// Save pending tx to storage
const savePendingTx = function (address, tx) {
  return async (dispatch) => {
    dispatch({ type: SAVE_PENDING_TX_STARTED });

    try {
      const pendingTxList = JSON.parse(localStorage.getItem(`${address}_${PENDING_TX_KEY}`)) || [];
      pendingTxList.push(tx);
      localStorage.setItem(`${address}_${PENDING_TX_KEY}`, JSON.stringify(pendingTxList));

      dispatch({
        type: SAVE_PENDING_TX_SUCCESS,
        data: pendingTxList,
      });
    } catch (error) {
      dispatch({ type: SAVE_PENDING_TX_FAILURE, data: error.message || error});
    }
  };
}

// Get pending tx from storage
const getPendingTxList = function (address) {
  return async (dispatch) => {
    dispatch({ type: GET_PENDING_TX_LIST_STARTED });

    try {
      const data = JSON.parse(localStorage.getItem(`${address}_${PENDING_TX_KEY}`)) || [];

      dispatch({
        type: GET_PENDING_TX_LIST_SUCCESS,
        data,
      });
    } catch (error) {
      dispatch({ type: GET_PENDING_TX_LIST_FAILURE, data: error.message || error});
    }
  };
}

// Update pending tx list to storage
const updatePendingTxList = function (address, newPendingTxList) {
  return async (dispatch) => {
    dispatch({ type: UPDATE_PENDING_TX_LIST_STARTED });
    try {
      localStorage.setItem(`${address}_${PENDING_TX_KEY}`, JSON.stringify(newPendingTxList));

      dispatch({
        type: UPDATE_PENDING_TX_LIST_SUCCESS,
        data: newPendingTxList,
      });
    } catch (error) {
      dispatch({ type: UPDATE_PENDING_TX_LIST_FAILURE, data: error.message || error});
    }
  };
}

// Update pending tx to storage
const updatePendingTx = function(address, idx, newPendingTx) {
  return async (dispatch) => {
    dispatch({ type: UPDATE_PENDING_TX_STARTED });
    try {
      const data = JSON.parse(localStorage.getItem(`${address}_${PENDING_TX_KEY}`)) || [];
      data[idx] = newPendingTx;
      localStorage.setItem(`${address}_${PENDING_TX_KEY}`, JSON.stringify(data));

      dispatch({
        type: UPDATE_PENDING_TX_SUCCESS,
        data,
      });
    } catch (error) {
      dispatch({ type: UPDATE_PENDING_TX_FAILURE, data: error.message || error});
    }
  };
}

// Used to delete tx from pending list
const trimPendingTxList = function (address, idx) {
  return async (dispatch) => {
    dispatch({ type: TRIM_PENDING_TX_LIST_STARTED });
    try {
      const data = JSON.parse(localStorage.getItem(`${address}_${PENDING_TX_KEY}`)) || [];
  
      if (idx < 0 || idx >= data.length) {
        throw new Error('Invalid index to remove tx list');
      }

      data.splice(idx, 1);
      localStorage.setItem(`${address}_${PENDING_TX_KEY}`, JSON.stringify(data));

      dispatch({
        type: TRIM_PENDING_TX_LIST_SUCCESS,
        data,
      });
    } catch (error) {
      dispatch({ type: TRIM_PENDING_TX_LIST_FAILURE, data: error.message || error});
    }
  };
}

export {
  savePendingTx,
  getPendingTxList,
  updatePendingTxList,
  updatePendingTx,
  trimPendingTxList,
};
