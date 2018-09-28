/*
miner.js
===================
Actions for DAG miner
*/
export const START_MINER = 'START_MINER';
export const STOP_MINER = 'STOP_MINER';
export const SET_WORKER_STATS = 'SET_WORKER_STATS';

export const startMining = () => (dispatch) => {
  dispatch({
    type: START_MINER,
  });
};

export const stopMining = () => (dispatch) => {
  dispatch({
    type: STOP_MINER,
  });
};

export const setWorkerStats = (stats) => (dispatch) => {
  dispatch({
    type: SET_WORKER_STATS,
    data: stats,
  });
};
