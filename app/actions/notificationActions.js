/*
notificationActions.js
===================
Actions for the generic modal
*/
export const ADD_NOTIFICATION = 'ADD_NOTIFICATION';

export const addNotification = (color = 'default', text) => ({
  type: ADD_NOTIFICATION,
  data: { timestamp: Date.now(), text, color }
});

export const addDefaultNotification = (text) => (dispatch) => {
  dispatch(addNotification('default', text));
};

export const addSuccessNotification = (text) => (dispatch) => {
  dispatch(addNotification('success', text));
};

export const addErrorNotification = (text) => (dispatch) => {
  dispatch(addNotification('error', text));
};

export const addWarningNotification = (text) => (dispatch) => {
  dispatch(addNotification('warning', text));
};
