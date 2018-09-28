import {
  START_MINER,
  STOP_MINER,
  SET_WORKER_STATS,
} from '../actions/miner';

const initialState = {
  isMining: false,
  workerStats: {},
};

const miner = (state = initialState, action) => {
  switch (action.type) {
    case START_MINER:
      return { ...state, isMining: true };
    case STOP_MINER:
      return { ...state, isMining: false };
    case SET_WORKER_STATS: {
      const workerStats = { ...state.workerStats };
      workerStats[action.data.id] = action.data.stat;
      return { ...state, workerStats };
    }
    default:
      return state;
  }
};

export default miner;