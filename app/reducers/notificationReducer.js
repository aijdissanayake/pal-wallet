import {
  ADD_NOTIFICATION
} from 'actions/notificationActions';


const INITIAL_STATE = {
  timestamp: 0,
  color: 'default',
  text: '',
}

export default function (state = INITIAL_STATE, action) {
  switch (action.type) {
    case ADD_NOTIFICATION:
      return {
        ...state,
        ...action.data,
      }
    default:
      return state;
  }
}
