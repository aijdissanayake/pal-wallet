// @flow
import { combineReducers } from 'redux';
import { routerReducer as router } from 'react-router-redux';
import miner from './miner';
import statistics from './statistics';
import superNode from './superNode';
import wallet from './walletReducer';
import account from './accountReducer';
import modal from './modal';
import clientStorage from './clientStorageReducer';
import notification from './notificationReducer';

const rootReducer = combineReducers({
  router,
  miner,
  wallet,
  statistics,
  superNode,
  account,
  clientStorage,
  modal,
  notification,
});

export default rootReducer;
