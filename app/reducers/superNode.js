import {
  REGISTER_SUPERNODE,
  SET_SUCCESSFUL_PKG,
  SHOW_PACKAGE_DETAILS,
  SET_SELECTED_WALLET,
  SET_SN_STATS,
  SET_SN_KEY,
} from '../actions/superNode';

const initialState = {
  jwt: null,
  packages: [],
  selectedPkg: null,
  selectedWalletName: null,
  snStats: {},
  snPKeys: {},
};

const superNode = (state = initialState, action) => {
  switch (action.type) {
    case REGISTER_SUPERNODE:
      return { ...state, jwt: action.data };
    case SET_SUCCESSFUL_PKG: {
      const snPackages = JSON.parse(localStorage.getItem("snPackages")) || {};
      const data = snPackages[action.data.snAddress] || [];
      const newData = [action.data, ...data].slice(0, 10);

      localStorage.setItem("snPackages", JSON.stringify({
        ...snPackages,
        [action.data.snAddress]: newData,
      }));

      return {
        ...state,
        packages: newData,
      };
    }
    case SHOW_PACKAGE_DETAILS:
      return { ...state, selectedPkg: action.data };
    case SET_SELECTED_WALLET: {
      const { name, snAddress } = action.data;
      const snPackages = JSON.parse(localStorage.getItem("snPackages")) || {};
      const pkgData = snPackages[snAddress] || [];

      const snData = JSON.parse(localStorage.getItem("snData")) || {};
      const statData = snData[snAddress] || {
        txProcessed: 0,
        pkgAvgTime: 0,
        pkgCount: 0,
      };

      return {
        ...state,
        selectedWalletName: name,
        packages: pkgData,
        selectedPkg: null,
        snStats: statData,
      };
    }
    case SET_SN_STATS: {
      const { snAddress, duration, pkgLength } = action.data;
      const snData = JSON.parse(localStorage.getItem("snData")) || {};
      const data = snData[snAddress] || {};
      const txProcessed = data.txProcessed || 0;
      const pkgCount = data.pkgCount || 0;
      const pkgAvgTime = data.pkgAvgTime || 0;

      const newData = {
        txProcessed: txProcessed + pkgLength,
        pkgAvgTime: ((pkgAvgTime * pkgCount) + duration) / (pkgCount + 1),
        pkgCount: pkgCount + 1,
      };

      localStorage.setItem("snData", JSON.stringify({
        ...snData,
        [snAddress]: newData,
      }));

      return { ...state, snStats: newData };
    }
    case SET_SN_KEY: {
      const snPKeys = {
        ...state.snPKeys,
        [action.data.snAddress]: action.data.snPkey,
      };
      snPKeys[action.data.snAddress] = action.data.snPkey;
      return { ...state, snPKeys };
    }
    default:
      return state;
  }
};

export default superNode;
