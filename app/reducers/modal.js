import {
  SET_MODAL,
} from '../actions/modalActions';

const initialState = {
  modal: null,
};

const modal = (state = initialState, action) => {
  switch (action.type) {
    case SET_MODAL:
      return { ...state, modal: action.data };
    default:
      return state;
  }
};

export default modal;