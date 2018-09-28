/*
ImportWallet.js
===================
import Wallet via private key
*/
import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  FormGroup,
  Label,
  Input,
  FormFeedback,
} from 'reactstrap';
import {
  DEFAULT_WALLET_DATA,
  importNewWallet
} from 'actions/walletActions';
import { validator } from 'lib/validationFunctions';
import styles from './ImportPrivateKey.scss';

class ImportPrivateKey extends Component {
  constructor(props) {
    super(props);

    this.state = {
      showModal: props.showModal,
      name: '',
      nameError: '',
      privateKey: '',
      privateKeyError: '',
      password: '',
      passwordError: '',
    }

    // Validations
    this.regexPrivateKey = /^(0x)?[0-9a-f]{64}$/;
    this.regexName = /^[a-zA-Z0-9\d\-_.,\s]+$/;

    this.onInputChange = this.onInputChange.bind(this);
    this.allowSubmit = this.allowSubmit.bind(this);
    this.onClickButtonImportWallet = this.onClickButtonImportWallet.bind(this);
  }

  // Toggle modal
  componentWillReceiveProps(nextProps) {
    const { showModal, newWalletInfo, closeModal } = this.props;
    if (nextProps.showModal !== showModal) {
      this.setState({ showModal: nextProps.showModal });
    }

    if (nextProps.newWalletInfo && nextProps.newWalletInfo !== newWalletInfo) {
      closeModal();
    }
  }

  componentWillUnmount() {
    this.setState({
      name: '',
      nameError: '',
      privateKey: '',
      privateKeyError: '',
      password: '',
      passwordError: '',
    });
  }

  // On input change
  onInputChange(key, value) {
    const newState = {};

    if (key === 'name') {
      newState.nameError = validator('name', value);
      newState.name = value;
    } else if (key === 'privateKey') {
      newState.privateKeyError = validator('privateKey', value);
      newState.privateKey = value;
    } else if (key === 'password') {
      newState.passwordError = validator('password', value);
      newState.password = value;
    }

    this.setState(newState);
  }

  // import the waller
  onClickButtonImportWallet() {
    const { makeImportNewWallet } = this.props;
    const { name, privateKey, password } = this.state;

    const wallet = {
      ...DEFAULT_WALLET_DATA,
      name,
      privateKey,
      password,
    }

    makeImportNewWallet(wallet);
  }

  // Validate again
  allowSubmit() {
    const { name, privateKey, nameError, privateKeyError, password } = this.state;
    if (this.regexName.test(name) && this.regexPrivateKey.test(privateKey) && password && password.length >= 9 && !nameError && !privateKeyError) {
      return true;
    }
    return false;
  }

  render() {
    const { showModal, nameError, privateKeyError, passwordError } = this.state;
    const { closeModal } = this.props;

    return (
      <Modal
        autoFocus
        centered
        backdrop="static"
        isOpen={showModal}
        className={styles.importWallet}
      >
      <ModalHeader
        tag="h3"
        toggle={() => this.setState({ showModal: false }, closeModal()) }
      >IMPORT NEW WALLET</ModalHeader>
      <ModalBody>
        <FormGroup>
          <Label for="wallet-name">Wallet name</Label>
          <Input
            type="text"
            id="wallet-name"
            placeholder="Input your wallet name"
            maxLength="255"
            invalid={(nameError.length > 0)}
            onChange={(e) => this.onInputChange('name', e.target.value)}
          />
          <FormFeedback dangerouslySetInnerHTML={{__html: nameError || '&nbsp;'}} />
        </FormGroup>
        <FormGroup>
          <Label for="private-key">Private key</Label>
          <Input
            type="password"
            id="private-key"
            placeholder="Input the private key"
            invalid={(privateKeyError.length > 0)}
            onChange={(e) => this.onInputChange('privateKey', e.target.value)}
          />
          <FormFeedback dangerouslySetInnerHTML={{__html: privateKeyError || '&nbsp;'}} />
        </FormGroup>
        <FormGroup>
          <Label for="wallet-password">Wallet Password</Label>
          <Input
            type="password"
            id="wallet-password"
            placeholder="Your password must be at least 9 characters."
            maxLength="255"
            invalid={(passwordError.length > 0)}
            onChange={(e) => this.onInputChange('password', e.target.value)}
          />
          <FormFeedback dangerouslySetInnerHTML={{__html: passwordError || '&nbsp;'}} />
        </FormGroup>
      </ModalBody>
      <ModalFooter>
        <Button
          color="primary"
          className={[styles.btnSubmit, 'ppn'].join(' ')}
          disabled={!this.allowSubmit()}
          onClick={() => this.onClickButtonImportWallet()}
        >
          Import wallet
        </Button>
      </ModalFooter>
      </Modal>
    )
  }
}

ImportPrivateKey.defaultProps = {
  makeImportNewWallet: null,
  showModal: false,
  newWalletInfo: null,
};

ImportPrivateKey.propTypes = {
  makeImportNewWallet: PropTypes.func,
  showModal: PropTypes.bool,
  closeModal: PropTypes.func.isRequired,
  newWalletInfo: PropTypes.object,
};

const mapStateToProps = state => ({
  newWalletInfo: state.wallet.newWalletInfo,
});

const mapDispatchToProps = dispatch => ({
  makeImportNewWallet: privateKey => dispatch(importNewWallet(privateKey)),
});

export default connect(mapStateToProps, mapDispatchToProps)(ImportPrivateKey);
