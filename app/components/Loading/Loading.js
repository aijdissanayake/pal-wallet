/*
Loading.js
===================
Generic loading screen
*/
import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import {
  Modal,
  ModalBody,
} from 'reactstrap';
import logoImg from 'assets/images/logo/ppn-logo.svg';
import styles from './Loading.scss';

class Loading extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isLoading: false,
    }
  }

  componentWillReceiveProps(nextProps) {
    const {
      isGetBalance,
      isGetTransactionList,
      isCreateTransaction,
      isCreateWallet,
      isImportWallet,
      isGetWalletList,
      isChangeWallet,
      isUpdateWallet,
      isLoadingKeyStore,
    } = nextProps;

    if (isGetBalance ||
        isGetTransactionList ||
        isCreateTransaction ||
        isCreateWallet ||
        isImportWallet ||
        isGetWalletList ||
        isChangeWallet ||
        isUpdateWallet ||
        isLoadingKeyStore) {
      this.setState({ isLoading: true });
    } else {
      this.setState({ isLoading: false })
    }
  }

  render() {
    const { isLoading } = this.state;

    return (
      <Modal
        centered
        backdrop="static"
        isOpen={isLoading}
        className={styles.loading}
      >
      <ModalBody>
        <div className={styles.loading__content}>
          <div className={styles.loading__logo}>
            <img src={logoImg} alt="Logo" />
          </div>
          <div className={styles.loading__iconGroup}>
            <div className={styles.loading__icon}><div /><div /><div /><div /></div>
          </div>
          <h4 className={styles.loading__text}>PROCESSING...</h4>
        </div>
      </ModalBody>
      </Modal>
    )
  }
}

Loading.defaultProps = {
  isGetBalance: false,
  isGetTransactionList: false,
  isCreateTransaction: false,

  isCreateWallet: false,
  isImportWallet: false,
  isGetWalletList: false,
  isChangeWallet: false,
  isUpdateWallet: false,
  isLoadingKeyStore: false,
};

Loading.propTypes = {
  isGetBalance: PropTypes.bool,
  isGetTransactionList: PropTypes.bool,
  isCreateTransaction: PropTypes.bool,

  isCreateWallet: PropTypes.bool,
  isImportWallet: PropTypes.bool,
  isGetWalletList: PropTypes.bool,
  isChangeWallet: PropTypes.bool,
  isUpdateWallet: PropTypes.bool,

  isLoadingKeyStore: PropTypes.bool,
};

const mapStateToProps = state => ({
  isGetBalance: state.account.isGetBalance,
  isGetTransactionList: state.account.isGetTransactionList,
  isCreateTransaction: state.account.isCreateTransaction,

  isCreateWallet: state.wallet.isCreateWallet,
  isImportWallet: state.wallet.isImportWallet,
  isGetWalletList: state.wallet.isGetWalletList,
  isChangeWallet: state.wallet.isChangeWallet,
  isUpdateWallet: state.wallet.isUpdateWallet,

  isLoadingKeyStore: state.wallet.isLoadingKeyStore,
});

export default connect(mapStateToProps, null)(Loading);
