/*
AccountList.js
===================
Show a list of accounts on the sidebar
*/
import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { getWalletList, updateWallet } from 'actions/walletActions';
import { getBalance } from 'actions/accountActions';
import { Scrollbars } from 'react-custom-scrollbars';
import styles from './AccountList.scss';
import Account from './Account/Account';
import NoAccount from './NoAccount/NoAccount';

class AccountList extends Component {
  constructor(props) {
    super(props);

    this.renderAccountList = this.renderAccountList.bind(this);
    this.isWalletChanged = this.isWalletChanged.bind(this);
  }

  componentDidMount() {
    this.props.doGetWalletList(); //eslint-disable-line
  }

  componentWillReceiveProps(nextProps) {
    if (this.isWalletChanged(nextProps)) {
      const { doGetBalance } = this.props;
      doGetBalance(nextProps.selectedWallet.address);
    }

    if (this.isGotNewBalance(nextProps)) {
      const { selectedWallet, doUpdateWallet } = this.props;
      doUpdateWallet({
        ...selectedWallet,
        palBalance: nextProps.newPalBalance,
        weiBalance: nextProps.newWeiBalance,
      })
    }
  }

  isWalletChanged(nextProps) {
    const { selectedWallet } = this.props;
    if (!selectedWallet && nextProps.selectedWallet) {
      return true;
    }

    if (selectedWallet && nextProps.selectedWallet && nextProps.selectedWallet.address !== selectedWallet.address) {
      return true;
    }

    return false;
  }

  isGotNewBalance(nextProps) {
    const { isGetBalance } = this.props;
    if (isGetBalance && isGetBalance !== nextProps.isGetBalance) {
      return true;
    }
    return false;
  }

  renderAccountList() {
    const { wallets, selectedWallet } = this.props;

    return (
      <div className={styles.accountList}>
        <Scrollbars>
        {
          wallets.map( wallet => (
            <Account
              key={wallet.address}
              wallet={wallet}
              active={(selectedWallet && selectedWallet.address === wallet.address)}
            />
          ))
        }
        </Scrollbars>
      </div>
    )
  }

  render() {
    const { wallets } = this.props;

    if (wallets && wallets.length > 0) {
      return this.renderAccountList();
    }

    return (<NoAccount />);
  }
}

AccountList.defaultProps = {
  doGetBalance: null,
  doUpdateWallet: null,
  selectedWallet: null,
  wallets: [],
  isGetBalance: false,
  newWeiBalance: '0',
  newPalBalance: '0',
};

AccountList.propTypes = {
  doGetBalance: PropTypes.func,
  doUpdateWallet: PropTypes.func,
  selectedWallet: PropTypes.object,
  wallets: PropTypes.array,
  isGetBalance: PropTypes.bool,
  newWeiBalance: PropTypes.string,
  newPalBalance: PropTypes.string,
};

const mapStateToProps = state => ({
  selectedWallet: state.wallet.selectedWallet,
  wallets: state.wallet.wallets,
  isGetBalance: state.account.isGetBalance,
  newWeiBalance: state.account.newWeiBalance,
  newPalBalance: state.account.newPalBalance,
});

const mapDispatchToProps = dispatch => ({
  doGetWalletList: () => dispatch(getWalletList()),
  doGetBalance: address => dispatch(getBalance(address)),
  doUpdateWallet: walletData => dispatch(updateWallet(walletData)),
});

export default connect(mapStateToProps, mapDispatchToProps)(AccountList);
