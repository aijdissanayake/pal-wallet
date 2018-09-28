/*
statistics.js
===================
Actions to query genral protocl health
*/
import { remote } from 'electron';
import Axios from '../lib/axiosFunctions';

export const STATISTICS_GET_VERSION = 'STATISTICS_GET_VERSION';
export const STATISTICS_GET_METRICS = 'STATISTICS_GET_METRICS';
export const STATISTICS_GET_SN_COUNT = 'STATISTICS_GET_SN_COUNT';

// Used to ping and get version from gateway for validation
export const getPing = (doStopMining) => async (dispatch) => {
  const pingResult = await Axios.GET(`${process.env.PPN_GATEWAY_IP}/ping`);
  if (pingResult && pingResult.status === 200 && pingResult.data && pingResult.data.semver) {
    try {
      const isValidVersion = remote.app.getVersion() === pingResult.data.semver;
      if (!isValidVersion && doStopMining) {
        doStopMining();
      }

      return dispatch({
        type: STATISTICS_GET_VERSION,
        data: isValidVersion,
      });
    } catch(error) {
      console.log('Get ping failed');
    }
  }
};

// Get protocol statistics
export const getStatistics = () => async (dispatch) => {
  const metricResult = await Axios.GET(`${process.env.PPN_GATEWAY_IP}/metrics`);
  if (metricResult && metricResult.status === 200) {
    try {
      return dispatch({
        type: STATISTICS_GET_METRICS,
        data: metricResult.data,
      });
    } catch(error) {
      console.log('Get metrics failed');
    }
  }
};

// Get current supernode count
export const getSnCount = () => async (dispatch) => {
  const snResult = await Axios.GET(`${process.env.PPN_GATEWAY_IP}/sn/count`);

  if (snResult && snResult.status === 200) {
    try {
      return dispatch({
        type: STATISTICS_GET_SN_COUNT,
        data: snResult.data,
      });
    } catch(error) {
      console.log('Get SN count failed');
    }
  }
};