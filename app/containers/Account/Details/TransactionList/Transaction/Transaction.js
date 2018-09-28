import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import {
  Tooltip,
} from 'reactstrap';
import PropTypes from 'prop-types';
import Web3 from 'web3';
import NumberFormat from 'react-number-format';

import { trimPendingTxList } from 'actions/clientStorageActions';
import { openExplorerLink } from 'lib/explorerFunctions';

import styles from './Transaction.scss';


class Transaction extends Component {
  constructor(props) {
    super(props);

    this.state = {
      showTooltip: false,
    };

    this.renderTransaction = this.renderTransaction.bind(this);
    this.renderStatus = this.renderStatus.bind(this);
    this.renderInfo = this.renderInfo.bind(this);
    this.renderAmount = this.renderAmount.bind(this);
  }

  shortenHash = (str) => {
    if (str) {
      const amountCharToKeep = 5;
      const headStr = str.substr(0, amountCharToKeep+2);
      const tailStr = str.substr(str.length - amountCharToKeep, amountCharToKeep);

      return `${headStr}...${tailStr}`;
    }
    return null;
  }

  renderTransaction() {
    const { transaction, selectedWallet } = this.props;
    let status = 'pending';
    let statusText = 'Pending';

    if (transaction.block_hash && transaction.block_number) {
      if (parseInt(transaction.status, 16) === 1) {
        status = 'successful';
        if (selectedWallet.address === transaction.from.toLowerCase()) {
          statusText = 'Sent';
        } else if (selectedWallet.address !== transaction.from.toLowerCase()) {
          statusText = 'Received';
        }
      } else {
        status = 'failed';
        statusText = 'Failed';
      }
    }


    return (
      <div className={[styles.transaction, status, statusText.toLowerCase()].join(' ')}>
        { this.renderStatus(status, statusText) }
        { this.renderInfo() }
        { this.renderAmount() }
      </div>
    );
  }

  renderStatus = (status, statusText) => {
    let statusIconClass = (status === 'successful') ? 'fas fa-check-circle' : 'fas fa-times-circle';
    statusIconClass = (status === 'pending') ? "fas fa-clock" : statusIconClass;

    return (
      <div className={styles.status}>
        <div className={styles.status__icon}>
          <i className={statusIconClass} />
        </div>
        <p className={styles.status__text}>{statusText}</p>
        {/* <p className={styles.status__time}>1 day ago</p> */}
      </div>
    );
  }

  renderInfo() {
    const { showTooltip } = this.state;
    const { transaction, doTrimPendingTxList, idx } = this.props;
    const timeStamp = new Date(transaction.timeStamp);
    const currTime = new Date();
    const isExpired = !transaction.status && (currTime - timeStamp) / 1000 > process.env.TX_TIMEOUT;

    const id = `tx-${idx}`;
    return (
      <div className={styles.info}>
        <div className={styles.info__content}>
          <div
            className={styles.info__txHash}
            role="button"
            tabIndex={-1}
            onKeyDown={null}
            onClick={() => { if (transaction.tx_hash) openExplorerLink(`/#/transaction/${transaction.tx_hash}`) }}
          >
            {this.shortenHash(transaction.tx_hash) || '...'}
          </div>
          {
            isExpired ?
              <Fragment>
                <Tooltip
                  target={id}
                  isOpen={showTooltip}
                  toggle={() => this.setState({showTooltip: false})}
                  className="fade"
                >
                  Too long? Delete transaction
                </Tooltip>
                <i
                  id={id}
                  className={`${styles.info__delete} fas fa-times-circle`}
                  role="button"
                  tabIndex={-1}
                  onKeyDown={null}
                  onClick={() => doTrimPendingTxList(transaction.from, idx)}
                  onMouseEnter={() => this.setState({showTooltip: true})}
                />
              </Fragment>
            :
              null
          }
          <div className={styles.info__transference}>
            <span className={styles.info__from}>{this.shortenHash(transaction.from) || '...'}</span>
            <span className={styles.info__direction}>
              <i className="fas fa-arrow-right"/>
            </span>
            <span className={styles.info__to}>{this.shortenHash(transaction.to) || '...'}</span>
          </div>
        </div>
      </div>
    );
  }

  renderAmount() {
    const web3 = new Web3();
    const { transaction } = this.props;
    const valueInWei = web3.utils.hexToNumberString(transaction.value);
    const valueInToken = web3.utils.fromWei(`${valueInWei}`, 'ether');

    return (
      <div className={styles.amount}>
        <NumberFormat
          thousandSeparator
          suffix={` ${process.env.PPN_SYMBOL}`}
          displayType="text"
          value={valueInToken || 0}
        />
      </div>
    );
  }

  render() {
    const { transaction } = this.props;

    if (transaction) {
      return this.renderTransaction();
    }
    return null;
  }
}

Transaction.defaultProps = {
  transaction: null,
  selectedWallet: null,
};

Transaction.propTypes = {
  transaction: PropTypes.object,
  selectedWallet: PropTypes.object,
  doTrimPendingTxList: PropTypes.func.isRequired,
  idx: PropTypes.number.isRequired,
};

const mapStateToProps = state => ({
  selectedWallet: state.wallet.selectedWallet,
});

const mapDispatchToProps = dispatch => ({
  doTrimPendingTxList: (address, idx) => dispatch(trimPendingTxList(address, idx)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Transaction);
