import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Scrollbars } from 'react-custom-scrollbars';
import styles from './TransactionList.scss';
import Transaction from './Transaction/Transaction';

class TransactionList extends Component {
  constructor(props) {
    super(props);

    this.renderTransactionList = this.renderTransactionList.bind(this);
    this.renderNoTransaction = this.renderNoTransaction.bind(this);
    this.renderLoading = this.renderLoading.bind(this);
  }

  renderTransactionList() {
    const { transactionList, customStyles } = this.props;

    /* eslint-disable */
    return (
      <Scrollbars
        className={styles.transactionList}
        style={customStyles}
      >
        { transactionList.map((tx, idx) => <Transaction key={`${tx.tx_hash}${idx}`} transaction={tx} idx={idx} />) }
      </Scrollbars>
    )
    /* eslint-enable */
  }

  renderNoTransaction = () => {
    const { customStyles } = this.props;

    return (
      <div className={styles.noTransaction} style={customStyles}>
        <p className={styles.noTransaction__firstLine}>SEND {process.env.PPN_SYMBOL} TO CREATE TRANSACTION</p>
        <p className={styles.noTransaction__secondLine}>(You don&apos;t have any transaction at this time.)</p>
      </div>
    );
  }

  renderLoading = () => {
    const { customStyles } = this.props;

    return (
      <div className={styles.loading} style={customStyles}>
        <p className={styles.loading__firstLine}>LOADING... PLEASE WAIT</p>
      </div>
    );
  }

  render() {
    const { isLoading, transactionList } = this.props;

    if (isLoading) {
      return this.renderLoading();
    } if (!isLoading && transactionList.length <= 0) {
      return this.renderNoTransaction();
    } if (!isLoading && transactionList.length > 0) {
      return this.renderTransactionList();
    }

    return null;
  }
}

TransactionList.defaultProps = {
  isLoading: false,
  transactionList: [],
  customStyles: {},
};

TransactionList.propTypes = {
  isLoading: PropTypes.bool,
  transactionList: PropTypes.array,
  customStyles: PropTypes.object,
};

export default TransactionList;
