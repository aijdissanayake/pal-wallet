/*
superNode.js
===================
Actions for super node
*/
import Axios from '../lib/axiosFunctions';

export const REGISTER_SUPERNODE = 'REGISTER_SUPERNODE';
export const SET_SUCCESSFUL_PKG = 'SET_SUCCESSFUL_PKG';
export const SHOW_PACKAGE_DETAILS = 'SHOW_PACKAGE_DETAILS';
export const SET_SELECTED_WALLET = 'SET_SELECTED_WALLET';
export const SET_SN_STATS = 'SET_SN_STATS';
export const SET_SN_KEY = 'SET_SN_KEY';

// Register supernode to get jwt for jobs
export const registerSuperNode = (address, modal, stopMine) => async (dispatch) => {
  let snToken = null;

  const result = await Axios.POST(`${process.env.PPN_GATEWAY_IP}/sn/register`, {
    address,
  });

  if (result && result.status === 200) {
    try {
      snToken = result.data.token;
      localStorage.setItem("snToken", snToken);
    } catch(error) {
      console.log('Register SuperNode failed');
    }
  }

  if (!snToken) {
    if (modal) {
      if (!result) {
        modal.toggle('Connection failed!', `Please try again.`);
      } else {
        modal.toggle('Access denied!', `Account does not have the required 100,000 ${process.env.PPN_SYMBOL}. Get more ${process.env.PPN_SYMBOL} from the faucet at the account detail page.`);
      }
    }

    if (stopMine) {
      stopMine();
    }
  }
  
  return dispatch({
    type: REGISTER_SUPERNODE,
    data: snToken,
  });
};

// A successful package is sent
export const setSuccessfulPkg = (pkg) => (dispatch) => {
  dispatch({
    type: SET_SUCCESSFUL_PKG,
    data: pkg,
  });
};

// Show package details
export const showPackageDetails = pkg => dispatch => dispatch({
  type: SHOW_PACKAGE_DETAILS,
  data: pkg,
});

// Set the selected wallet from drop list
export const setSelectedWallet = (name, snAddress) => dispatch => dispatch({
  type: SET_SELECTED_WALLET,
  data: { 
    name,
    snAddress,
  }
});

// Set the current supernode stats
export const setSnStats = (snAddress, duration, pkgLength) => dispatch => dispatch({
  type: SET_SN_STATS,
  data: {
    snAddress,
    duration,
    pkgLength,
  }
});

// Set the supernode private locally for this session
export const setSnKey = (snAddress, snPkey) => dispatch => dispatch({
  type: SET_SN_KEY,
  data: {
    snAddress,
    snPkey,
  }
});
