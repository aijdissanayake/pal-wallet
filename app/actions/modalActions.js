/*
modalActions.js
===================
Actions for the generic modal
*/
export const SET_MODAL = 'SET_MODAL';

export const setModal = (modal) => (dispatch) => dispatch({
  type: SET_MODAL,
  data: modal,
});
