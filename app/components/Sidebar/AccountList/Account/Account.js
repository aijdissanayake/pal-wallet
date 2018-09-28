/*
Account.js
===================
The account in the account list
*/
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import { getTransactionList, getBalance } from 'actions/accountActions';
import { getPendingTxList } from 'actions/clientStorageActions';
import { addErrorNotification } from 'actions/notificationActions';
import NumberFormat from 'react-number-format';
import { historyPush } from 'lib/helperFunctions';

import styles from './Account.scss';

class Account extends Component {
  constructor(props) {
    super(props);

    this.getAccountClasses = this.getAccountClasses.bind(this);
    this.onClickAccount = this.onClickAccount.bind(this);
    this.renderAccount = this.renderAccount.bind(this);
    this.displayNotification = this.displayNotification.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    this.displayNotification(nextProps);
  }

  displayNotification(nextProps) {
    const { doAddErrorNotification } = this.props;
    /* eslint-disable */
    const [currentGetBalanceError, newGetBalanceError] = [this.props.getBalanceError, nextProps.getBalanceError];
    const [currentGetTransactionListError, newGetTransactionListError] = [this.props.getTransactionListError, nextProps.getTransactionListError];
    const [currentCreateTransactionError, newCreateTransactionError] = [this.props.createTransactionError, nextProps.createTransactionError];
    /* eslint-enable */

    if (newGetBalanceError && newGetBalanceError.localeCompare(currentGetBalanceError) !== 0) {
      doAddErrorNotification('Can\'t connect to server.');
    }

    if (newGetTransactionListError && newGetTransactionListError.localeCompare(currentGetTransactionListError) !== 0) {
      doAddErrorNotification('Can\'t load transaction list.');
    }

    if (newCreateTransactionError && newCreateTransactionError.localeCompare(currentCreateTransactionError) !== 0) {
      doAddErrorNotification('Can\'t create new transaction.');
    }
  }

  getAccountClasses() {
    const { active } = this.props;
    const classes = [styles.account];

    if (active) {
      classes.push(styles.active);
    }

    return classes.join(' ');
  }

  onClickAccount() {
    const { doGetTransactionList, doGetPendingTxList, wallet, history, isGetPendingTxList, isGetTransactionList, doGetBalance } = this.props;
    const { address, page } = this.props.match.params;// eslint-disable-line

    // On click update balance, pending and tx list
    if (wallet.address === address) {
      if (!isGetPendingTxList && !isGetTransactionList) {
        const currentPage = (page) ? Math.trunc(page) : 1;

        doGetTransactionList(address, currentPage);
        doGetPendingTxList(address);
        doGetBalance(address);
      }
    } else {
      historyPush(history, `/account/${wallet.address}`);
    }
  }

  renderAccount() {
    const { wallet } = this.props;

    return (
      <div
        role="presentation"
        className={this.getAccountClasses()}
        onClick={this.onClickAccount}
      >
        <i className="far fa-address-book" />
        <div className={styles.account__info}>
          <div className={styles.account__name}>{wallet.name}</div>
          <div className={styles.account__balance}>
            <NumberFormat
              thousandSeparator
              suffix={` ${process.env.PPN_SYMBOL}`}
              displayType="text"
              value={wallet.palBalance || 0}
            />
          </div>
        </div>
      </div>
    )
  }

  render() {
    const { wallet } = this.props;

    if (wallet) {
      return this.renderAccount();
    }

    return null;
  }
}

Account.defaultProps = {
  doGetTransactionList: null,
  doGetPendingTxList: null,
  doAddErrorNotification: null,
  wallet: null,
  active: false,
  isGetTransactionList: false,
  isGetPendingTxList: false,
};

Account.propTypes = {
  doGetTransactionList: PropTypes.func,
  doGetPendingTxList: PropTypes.func,
  doAddErrorNotification: PropTypes.func,
  wallet: PropTypes.object,
  active: PropTypes.bool,
  history: PropTypes.any.isRequired,
  isGetTransactionList: PropTypes.bool,
  isGetPendingTxList: PropTypes.bool,
  doGetBalance: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  isGetTransactionList: state.account.isGetTransactionList,
  isGetPendingTxList: state.clientStorage.isGetPendingTxList,

  getBalanceError: state.account.getBalanceError,
  getTransactionListError: state.account.getTransactionListError,
  createTransactionError: state.account.createTransactionError,
});

const mapDispatchToProps = dispatch => ({
  doGetTransactionList: (address, page) => dispatch(getTransactionList(address, page)),
  doGetPendingTxList: address => dispatch(getPendingTxList(address)),
  doGetBalance: address => dispatch(getBalance(address)),
  doAddErrorNotification: (text) => dispatch(addErrorNotification(text)),
});

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Account));
