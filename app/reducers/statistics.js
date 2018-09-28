import {
  STATISTICS_GET_METRICS,
  STATISTICS_GET_SN_COUNT,
  STATISTICS_GET_VERSION,
} from '../actions/statistics';

const initialState = {
  stats: {},
  isValidVersion: null,
};

const statistics = (state = initialState, action) => {
  switch (action.type) {
    case STATISTICS_GET_METRICS:
    case STATISTICS_GET_SN_COUNT:
      return { ...state, stats: {...state.stats, ...action.data} };
    case STATISTICS_GET_VERSION:
      return { ...state, isValidVersion: action.data };
    default:
      return state;
  }
};

export default statistics;
