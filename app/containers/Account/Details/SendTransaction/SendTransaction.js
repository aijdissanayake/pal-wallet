import React, { Component } from 'react';// eslint-disable-line
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import Web3 from 'web3';
import Decimal from 'decimal.js';
import {
  FormGroup,
  Label,
  Input,
  Button,
  FormFeedback,
  Row,
  Col,
} from 'reactstrap';
import NumberFormat from 'react-number-format';
import { addSuccessNotification } from 'actions/notificationActions';
import { savePendingTx } from 'actions/clientStorageActions';
import { keyStoreToPKey } from 'lib/keyFunctions';
import styles from './SendTransaction.scss';

class SendTransaction extends Component {
  constructor(props) {
    super(props);

    this.state = {
      to: '',
      toError: '',
      amount: '',
      amountError: '',
      data: '',
      password: '',
      passwordError: '',
    };

    this.regexLeadingZero = /^0+\B/;
    this.regexAddress = /^(0x)?[0-9a-f]{40}$/;

    this.allowSubmit = this.allowSubmit.bind(this);
    this.onInputChange = this.onInputChange.bind(this);
    this.onBlurAmount = this.onBlurAmount.bind(this);
    this.onClickButtonSendPAL = this.onClickButtonSendPAL.bind(this);
    this.resetData = this.resetData.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    const { isSavePendingTx, pendingTxList, selectedWallet } = this.props;

    if (nextProps.selectedWallet && (!selectedWallet || selectedWallet.address !== nextProps.selectedWallet.address)) {
      this.resetData();
    }

    if (isSavePendingTx !== nextProps.isSavePendingTx && pendingTxList.length !== nextProps.pendingTxList.length) {
      this.resetData();
    }
  }

  componentWillUnmount() {
    this.resetData();
  }

  allowSubmit() {
    const { selectedWallet, isSavePendingTx } = this.props;
    const { to, amount, toError, amountError, password, passwordError } = this.state;
    const tempAmount = new Decimal(amount || 0);
    const walletAmount = new Decimal(selectedWallet.palBalance);
    if (!toError && this.regexAddress.test(to.toLowerCase()) &&
        !amountError && tempAmount.comparedTo(0) > 0 && tempAmount.comparedTo(walletAmount) <= 0 &&
        !passwordError && password.length >= 9 &&
        !isSavePendingTx) {
      return true;
    }

    return false;
  }

  resetData() {
    this.setState({
      to: '',
      toError: '',
      amount: '',
      amountError: '',
      data: '',
      password: '',
      passwordError: '',
    });
  }

  onInputChange(key, value) {
    const { selectedWallet } = this.props;
    const newState = {};

    if (key === 'to') {
      if (value.length > 0 && !this.regexAddress.test(value.toLowerCase())) {
        newState.toError = 'Recipient&apos;s address incorrect with format.';
      } else if (value === selectedWallet.address) {
        newState.toError = 'Can&apos;t use your address as recipient&apos;s address.';
      } else {
        newState.toError = '';
      }
      newState.to = value;
    } else if (key === 'amount') {
      const symbol = process.env.PPN_SYMBOL;
      if (!value || value === '0') {
        newState.amountError = `Amount of ${symbol} should be greater than 0.`;
      } else {
        const inputAmount = new Decimal(value || 0);
        const walletAmount = new Decimal(selectedWallet.palBalance);

        if (inputAmount.comparedTo(walletAmount) > 0) {
          newState.amountError = `Amount of ${symbol} should be equal to or lesser than ${symbol} amount of account.`;
        } else {
          newState.amountError = '';
        }
      }

      newState.amount = value.replace(this.regexLeadingZero, "") || '';
    } else if (key === 'password') {
      newState.password = value;

      if (value.length < 9) {
        newState.passwordError = `Your password must be at least 9 characters.`;
      } else {
        newState.passwordError = '';
      }
    } else if (key === 'data') {
      newState.data = value;
    }

    this.setState(newState);
  }

  onBlurAmount(e) {
    const value = e.target.value.replace(` ${process.env.PPN_SYMBOL}`, '');

    if (value === '0') {
      this.setState({ amount: '', amountError: '' });
    }
  }

  onClickButtonSendPAL() {
    const { selectedWallet, doSavePendingTx, doAddSuccessNotification  } = this.props;
    const { to, amount, data, password } = this.state;

    const pKeyResult = keyStoreToPKey(JSON.stringify(selectedWallet.keyStore), password);
    if (pKeyResult.privateKey) {
      const web3 = new Web3();

      const valueInWei = web3.utils.toWei(`${(amount || 0)}`, 'ether');
      const valueInHex = web3.utils.numberToHex(valueInWei);
      const currTime = new Date();

      const transactionData = {
        from: selectedWallet.address,
        privateKey: pKeyResult.privateKey,
        value: valueInHex,
        to,
        data,
        timeStamp: currTime.toISOString(),
      }

      doSavePendingTx(transactionData.from, transactionData);
      doAddSuccessNotification('Saved pending transaction!.');

      this.resetData();
    } else {
      this.setState({
        passwordError: pKeyResult.error,
      })
    }
  }

  render() {
    const { amount, to, data, amountError, toError, passwordError, password } = this.state;

    return (
      <div className={styles.sendTransaction}>
        <p><small>Only send to valid {process.env.PPN_SYMBOL} address.</small></p>
        <hr/>
        <Row>
          <Col md={{ size: true }}>
            <FormGroup>
              <Label for="recipient-address">To</Label>
              <Input
                type="text"
                id="recipient-address"
                placeholder="Recipient's address"
                invalid={(toError.length > 0)}
                value={to}
                onChange={(e) => this.onInputChange('to', e.target.value)}
              />
              <FormFeedback dangerouslySetInnerHTML={{__html: toError || '&nbsp;'}} />
            </FormGroup>
          </Col>

          <Col md={{ size: true }}>
            <FormGroup>
              <Label for="amount">Amount</Label>
              <NumberFormat
                allowNegative={false}
                allowEmptyFormatting={false}
                thousandSeparator
                suffix={` ${process.env.PPN_SYMBOL}`}
                placeholder={`Amount in ${process.env.PPN_SYMBOL}`}
                className={`form-control ${(!amountError || 'is-invalid')}`}
                id="amount"
                value={amount || ''}
                onBlur={(e) => this.onBlurAmount(e)}
                onValueChange={(values) => this.onInputChange('amount', values.value)}
              />

              <FormFeedback dangerouslySetInnerHTML={{__html: amountError || '&nbsp;'}} />
            </FormGroup>
          </Col>

          <Col md={{ size: true }} className="d-none">
            <FormGroup>
              <Label for="data">Data</Label>
              <Input
                type="textarea"
                id="data"
                placeholder="Optional"
                value={data}
                onChange={(e) => this.onInputChange('data', e.target.value)}
              />
            </FormGroup>
          </Col>

          <Col md={{ size: true }}>
            <FormGroup>
              <Label for="transaction-password">Password</Label>
              <Input
                type="password"
                id="transaction-password"
                placeholder="Wallet password"
                invalid={passwordError ? passwordError.length > 0 : false}
                value={password}
                onChange={(e) => this.onInputChange('password', e.target.value)}
              />
              <FormFeedback dangerouslySetInnerHTML={{__html: passwordError || '&nbsp;'}} />
            </FormGroup>
          </Col>

          <Col md={{ size: 'auto' }}>
            <FormGroup className="text-center">
              <Label className="d-none d-md-block" for="submit">&nbsp;</Label>
              <Button
                color="primary"
                id="submit"
                className={[styles.sendTransaction__btnSubmit, 'ppn'].join(' ')}
                disabled={!this.allowSubmit()}
                onClick={() => this.onClickButtonSendPAL()}
              >
                Send
              </Button>
            </FormGroup>
          </Col>
        </Row>
      </div>
    )
  }
}

SendTransaction.defaultProps = {
  doAddSuccessNotification: null,
  doSavePendingTx: null,
  selectedWallet: null,

  isSavePendingTx: false,
  pendingTxList: [],
};

SendTransaction.propTypes = {
  doAddSuccessNotification: PropTypes.func,
  doSavePendingTx: PropTypes.func,
  selectedWallet: PropTypes.object,

  isSavePendingTx: PropTypes.bool,
  pendingTxList: PropTypes.array,
};

const mapStateToProps = state => ({
  selectedWallet: state.wallet.selectedWallet,

  isSavePendingTx: state.clientStorage.isSavePendingTx,
  pendingTxList: state.clientStorage.pendingTxList,
});

const mapDispatchToProps = dispatch => ({
  doSavePendingTx: (address, tx) => dispatch(savePendingTx(address, tx)),
  doAddSuccessNotification: (text) => dispatch(addSuccessNotification(text)),
});

export default connect(mapStateToProps, mapDispatchToProps)(SendTransaction);
