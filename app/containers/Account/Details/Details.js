import React, { Component } from 'react';
import { Link } from "react-router-dom";
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import {
  Row,
  Col,
  Button,
  Tooltip,
  Pagination,
  PaginationItem,
} from 'reactstrap';
import NumberFormat from 'react-number-format';
import { getTransactionList, getFaucetPal, createTransaction, getBalance } from 'actions/accountActions';
import { getPendingTxList, updatePendingTx, updatePendingTxList } from 'actions/clientStorageActions';
import { addDefaultNotification } from 'actions/notificationActions';
import { changeWallet } from 'actions/walletActions';
import Layout from 'components/Layout/Layout';
import Box from 'components/Box/Box';
import { ChangeWalletName } from 'components/Modal';// eslint-disable-line
import ExportKey from 'components/Modal/ExportKey/ExportKey';
import { openExplorerLink } from 'lib/explorerFunctions';
import { copyToClipboard } from 'lib/helperFunctions';
import TransactionList from './TransactionList/TransactionList';
import SendTransaction from './SendTransaction/SendTransaction';

import styles from './Details.scss';

class Details extends Component {
  constructor(props) {
    super(props);

    this.state = {
      showModalExportPrivateKey: false,
      showModalExportKeyStore: false,
      showTooltipCopied: false,
      showModalChangeWalletName: false,
      isGettingPAL: false,
      page: 1,
    };

    this.showModalExportPrivateKey = this.showModalExportPrivateKey.bind(this);
    this.closeModalExportPrivateKey = this.closeModalExportPrivateKey.bind(this);
    this.showModalExportKeyStore = this.showModalExportKeyStore.bind(this);
    this.closeModalExportKeyStore = this.closeModalExportKeyStore.bind(this);

    this.renderDetail = this.renderDetail.bind(this);
    this.isWalletChanged = this.isWalletChanged.bind(this);
    this.isPendingTxListChanged = this.isPendingTxListChanged.bind(this);
    this.isTxListChanged = this.isTxListChanged.bind(this);
    this.isCreateTransactionDone = this.isCreateTransactionDone.bind(this);
    this.checkUpdatePendingTxList = this.checkUpdatePendingTxList.bind(this);
    this.allowReloadTransaction = this.allowReloadTransaction.bind(this);
    this.onClickButtonRefreshTransaction = this.onClickButtonRefreshTransaction.bind(this);
    this.renderTransactionPagination = this.renderTransactionPagination.bind(this);
  }

  componentDidMount() {
    const { makeChangeWallet, isChangeWallet } = this.props;
    const { address, page } = this.props.match.params;// eslint-disable-line
    if (!isChangeWallet) {
      makeChangeWallet({address});
    }

    if (page) {
      this.setState({ page: Math.trunc(page) || 1 });
    }
  }

  componentWillReceiveProps(nextProps) {
    const [currentAddress, newAddress] = [this.props.match.params.address, nextProps.match.params.address];// eslint-disable-line
    const [currentPage, newPage] = [this.props.match.params.page, nextProps.match.params.page]// eslint-disable-line
    const [currentIsGetTransactionList, newIsGetTransactionList] = [this.props.isGetTransactionList, nextProps.isGetTransactionList]// eslint-disable-line

    if (newAddress && currentAddress !== newAddress) {
      const { makeChangeWallet } = this.props;
      makeChangeWallet({address: newAddress});
    }

    if (currentPage !== newPage) {
      const { doGetTransactionList, doGetPendingTxList } = this.props;
      const newPageNum = (newPage || currentPage) ? Math.trunc(newPage || currentPage) : 1;

      this.setState({ page: newPageNum });
      doGetTransactionList(newAddress || currentAddress, newPageNum);
      doGetPendingTxList(newAddress || currentAddress);
    }

    if (this.isWalletChanged(nextProps)) {
      const { doGetTransactionList, doGetPendingTxList } = this.props;

      doGetTransactionList(newAddress || currentAddress, newPage || currentPage);
      doGetPendingTxList(newAddress || currentAddress);
    }

    if (this.isPendingTxListChanged(nextProps)) {
      if (nextProps.pendingTxList.length > 0) {
        const firstTx = nextProps.pendingTxList[0];

        if (!firstTx.tx_hash) {
          const { doCreateTransaction } = this.props;
          doCreateTransaction(firstTx);
        }
      }
    }

    if (this.isCreateTransactionDone(nextProps)) {
      const { doUpdatePendingTx, doAddDefaultNotification } = this.props;
      const tx = nextProps.newTransaction;
      const amountCharToKeep = 5;
      const headStr = tx.tx_hash.substr(0, amountCharToKeep+2);
      const tailStr = tx.tx_hash.substr(tx.tx_hash.length - amountCharToKeep, amountCharToKeep);

      doUpdatePendingTx(tx.from, 0, tx);
      doAddDefaultNotification(`Transaction ${headStr}...${tailStr} sent.`);
    }

    if (this.isTxListChanged(nextProps) || (currentIsGetTransactionList && currentIsGetTransactionList !== newIsGetTransactionList)) {
      this.checkUpdatePendingTxList(currentAddress || newAddress, nextProps.pendingTxList, nextProps.transactionList);
    }
  }

  showModalExportPrivateKey() {
    this.setState({ showModalExportPrivateKey: true });
  }

  closeModalExportPrivateKey() {
    this.setState({ showModalExportPrivateKey: false });
  }

  showModalExportKeyStore() {
    this.setState({ showModalExportKeyStore: true });
  }

  closeModalExportKeyStore() {
    this.setState({ showModalExportKeyStore: false });
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

  isPendingTxListChanged(nextProps) {
    const { pendingTxList } = this.props;

    if (pendingTxList.length !== nextProps.pendingTxList.length) {
      return true;
    }

    return false;
  }

  isTxListChanged(nextProps) {
    const { transactionList } = this.props;

    if (transactionList.length !== nextProps.transactionList.length) {
      return true;
    }

    return false;
  }

  isCreateTransactionDone(nextProps) {
    const { isCreateTransaction, newTransaction } = this.props;
    if (isCreateTransaction !== nextProps.isCreateTransaction && newTransaction !== nextProps.newTransaction) {
      return true;
    }

    return false;
  }

  allowReloadTransaction() {
    const { isGetTransactionList, isGetPendingTxList, isChangeWallet, isCreateTransaction } = this.props;
    return (!isGetTransactionList && !isGetPendingTxList && !isChangeWallet && !isCreateTransaction);
  }

  checkUpdatePendingTxList(address, pendingTxList, transactionList) {
    if (pendingTxList.length > 0 && transactionList.length > 0) {
      const { doUpdatePendingTxList, doCreateTransaction } = this.props;
      const firstTx = pendingTxList[0];
      const filteredPendingTxList = transactionList.filter(tx => tx.tx_hash.toLowerCase().localeCompare(firstTx.tx_hash.toLowerCase()) === 0);

      if (filteredPendingTxList.length > 0) {
        pendingTxList.shift();
        doUpdatePendingTxList(address, pendingTxList);

        if (pendingTxList.length > 0) {
          doCreateTransaction(pendingTxList[0]);
        }
      }
    }
  }

  copyKey(text) {
    copyToClipboard(text);
    const self = this;
    this.setState({showTooltipCopied: true}, () => setTimeout(() => self.setState({showTooltipCopied: false}), 3000));
  }

  onClickButtonRefreshTransaction() {
    const {
      doGetTransactionList,
      doGetPendingTxList,
      selectedWallet,
      doGetBalance,
      transactionPage,
    } = this.props;
    const { address } = selectedWallet;

    if (this.allowReloadTransaction()) {
      doGetTransactionList(address, transactionPage);
      doGetPendingTxList(address);
      doGetBalance(address);
    }
  }

  renderTransactionPagination() {
    const { selectedWallet, transactionTotalPages } = this.props;
    const { page } = this.state;
    const { address } = selectedWallet;
    const prevPage = (page - 1 > 0) ? page - 1 : 1;
    const nextPage = page + 1;

    let pages = [];

    if (transactionTotalPages <= 5 || (transactionTotalPages > 5 && page <= 3)) {
      const maxPages = Math.min(transactionTotalPages, 5);
      pages = Array.from(Array(maxPages).keys(), n => n + 1);
    } else {
      let pageStartFrom = page - 2;
      if ( page + 2 > transactionTotalPages ) {
        pageStartFrom = transactionTotalPages - 4;
      }

      pages = Array.from(Array(5).keys(), n => n + pageStartFrom);
    }

    return (
      <Col className="pb-3">
        <hr/>
        <Pagination aria-label="navigation" className="pull-right" listClassName="mb-0 justify-content-center" size="sm">
          <PaginationItem disabled={ !this.allowReloadTransaction() || prevPage === page }>
            <Link to={`/account/${address}/${prevPage}`} className="page-link">
              <i className="fa fa-angle-left" aria-hidden="true" />
            </Link>
          </PaginationItem>
          {
            pages.map( num =>(
              <PaginationItem key={num} disabled={ !this.allowReloadTransaction() || page === num }>
                <Link to={`/account/${address}/${num}`} className="page-link">{num}</Link>
              </PaginationItem>
            ))
          }
          <PaginationItem disabled={ !this.allowReloadTransaction() || nextPage === page || nextPage > transactionTotalPages }>
            <Link to={`/account/${address}/${nextPage}`} className="page-link">
              <i className="fa fa-angle-right" aria-hidden="true" />
            </Link>
          </PaginationItem>
        </Pagination>
      </Col>
    );
  }

  renderDetail() {
    const { isGettingPAL, showTooltipCopied, showModalChangeWalletName, showModalExportPrivateKey, showModalExportKeyStore } = this.state;
    const {
      selectedWallet: wallet,
      transactionList,
      isGetTransactionList,
      pendingTxList,
      isUpdatePendingTxList,
      isGetPendingTxList,
      modal,
    } = this.props;

    if (!wallet) {
      return null;
    }

    return (
      <Row>
        <Col xs="12" className="mb-5">
          <Row>
          <Col xs="12" className="mb-5">
            <h3>
              {wallet.name}
              <Button
                color="link"
                size="sm"
                onClick={() => this.setState({ showModalChangeWalletName: true })}
                >
                <i className="far fa-edit" />
              </Button>
              <ChangeWalletName
                showModal={showModalChangeWalletName}
                closeModal={() => this.setState({ showModalChangeWalletName: false })}
              />
            </h3>
            <div className={styles.export}>
              <Button
                outline color="secondary"
                size="sm"
                onClick={this.showModalExportPrivateKey}
              >
                Export Private Key
              </Button>
              <Button
                outline color="secondary"
                size="sm"
                onClick={this.showModalExportKeyStore}
              >
                Export KeyStore
              </Button>
            </div>
            <p>
              <Tooltip
                target="wallet-address"
                isOpen={showTooltipCopied}
                toggle={() => this.setState({showTooltipCopied: false})}
                className="fade"
              >
                Copied!
              </Tooltip>
              <small
                role="button"
                tabIndex={-1}
                onKeyDown={null}
                className={styles.walletAddress}
                id="wallet-address"
                onClick={() => openExplorerLink(`/#/address/${wallet.address}`)}
              >
                {wallet.address}
              </small>
              <Button
                color="link"
                size="sm"
                onClick={() => this.copyKey(wallet.address)}
              >
                <i className="far fa-copy" />
              </Button>
            </p>
            <h1>
              <NumberFormat
                thousandSeparator
                suffix={` ${process.env.PPN_SYMBOL}`}
                displayType="text"
                value={wallet.palBalance || 0}
              />
              <Button
                size="sm"
                color="link"
                disabled={!this.allowReloadTransaction()}
                onClick={() => this.onClickButtonRefreshTransaction()}
              >
                <i className="fas fa-sync-alt" />
              </Button>
            </h1>
            <Button
              color="info"
              size="lg"
              onClick={async () => {
                this.setState({ isGettingPAL: true });
                await getFaucetPal(wallet.address, modal);
                this.setState({ isGettingPAL: false });
              }}
              disabled={isGettingPAL}
            >
              Get Free {process.env.PPN_SYMBOL}
            </Button>
          </Col>

            <Col xs="12">
              <Box title={`Send ${process.env.PPN_SYMBOL}`}>
                <SendTransaction />
              </Box>
            </Col>
          </Row>
        </Col>

        <Col xs="12" className="mb-3">
          <Row>
            <Col xs="12" md="6" className="mb-5">
              <Box title="Transactions" noPadding>
                <Col className="pt-3">
                  <p>
                    <small>Reload transaction</small>
                    <Button
                      size="sm"
                      color="link"
                      className="float-right"
                      disabled={!this.allowReloadTransaction()}
                      onClick={() => this.onClickButtonRefreshTransaction()}
                    >
                      <i className="fas fa-sync-alt" />
                    </Button>
                  </p>
                  <hr/>
                </Col>
                <TransactionList
                  isLoading={isGetTransactionList}
                  transactionList={transactionList}
                  customStyles={{ height: '250px' }}
                />
                { this.renderTransactionPagination() }
              </Box>
            </Col>
            <Col xs="12" md="6">
              <Box title="Pending Transactions" noPadding>
                <Col className="pt-3">
                  <p>
                    <small>Reload transaction</small>
                    <Button
                      size="sm"
                      color="link"
                      className="float-right"
                      disabled={!this.allowReloadTransaction()}
                      onClick={() => this.onClickButtonRefreshTransaction()}
                    >
                      <i className="fas fa-sync-alt" />
                    </Button>
                  </p>
                  <hr/>
                </Col>
                <TransactionList
                  isLoading={isUpdatePendingTxList || isGetPendingTxList}
                  transactionList={pendingTxList}
                  customStyles={{ height: '328px' }}
                />
              </Box>
            </Col>
          </Row>

        </Col>
        <ExportKey
          showModal={showModalExportPrivateKey}
          closeModal={this.closeModalExportPrivateKey}
          wallet={wallet}
          exportType="privateKey"
        />
        <ExportKey
          showModal={showModalExportKeyStore}
          closeModal={this.closeModalExportKeyStore}
          wallet={wallet}
          exportType="keyStore"
        />
      </Row>
    )
  }

  render() {
    return (
      <Layout>
        <div className={styles.details}>
          { this.renderDetail() }
        </div>
      </Layout>
    );
  }
}

Details.defaultProps = {
  doAddDefaultNotification: null,
  doGetTransactionList: null,
  doGetPendingTxList: null,
  makeChangeWallet: null,
  doCreateTransaction: null,
  doUpdatePendingTx: null,
  doUpdatePendingTxList: null,

  selectedWallet: null,
  isChangeWallet: false,

  transactionList: [],
  isGetTransactionList: false,
  transactionPage: 1,
  transactionTotalPages: 1,

  isCreateTransaction: false,
  newTransaction: null,

  pendingTxList: [],
  isGetPendingTxList: false,

  isUpdatePendingTxList: false,
  modal: null,
};

Details.propTypes = {
  doAddDefaultNotification: PropTypes.func,
  doGetTransactionList: PropTypes.func,
  doGetPendingTxList: PropTypes.func,
  makeChangeWallet: PropTypes.func,
  doCreateTransaction: PropTypes.func,
  doUpdatePendingTx: PropTypes.func,
  doUpdatePendingTxList: PropTypes.func,

  selectedWallet: PropTypes.object,
  isChangeWallet: PropTypes.bool,

  transactionList: PropTypes.array,
  isGetTransactionList: PropTypes.bool,
  transactionPage: PropTypes.number,
  transactionTotalPages: PropTypes.number,

  isCreateTransaction: PropTypes.bool,
  newTransaction: PropTypes.object,

  pendingTxList: PropTypes.array,
  isGetPendingTxList: PropTypes.bool,

  isUpdatePendingTxList: PropTypes.bool,
  modal: PropTypes.object,

  doGetBalance: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  selectedWallet: state.wallet.selectedWallet,
  isChangeWallet: state.wallet.isChangeWallet,

  transactionList: state.account.transactionList,
  isGetTransactionList: state.account.isGetTransactionList,
  getTransactionListError: state.account.getTransactionListError,
  transactionPage: state.account.transactionPage,
  transactionTotalPages: state.account.transactionTotalPages,

  isCreateTransaction: state.account.isCreateTransaction,
  newTransaction: state.account.newTransaction,

  pendingTxList: state.clientStorage.pendingTxList,
  modal: state.modal.modal,
});

const mapDispatchToProps = dispatch => ({
  doGetTransactionList: (address, page) => dispatch(getTransactionList(address, page)),
  doGetPendingTxList: address => dispatch(getPendingTxList(address)),
  makeChangeWallet: wallet => dispatch(changeWallet(wallet)),
  doCreateTransaction: tx => dispatch(createTransaction(tx)),
  doUpdatePendingTx: (address, idx, tx) => dispatch(updatePendingTx(address, idx, tx)),
  doUpdatePendingTxList: (address, txList) => dispatch(updatePendingTxList(address, txList)),
  doGetBalance: address => dispatch(getBalance(address)),
  doAddDefaultNotification: (text) => dispatch(addDefaultNotification(text)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Details);
