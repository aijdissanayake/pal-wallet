/*
CreateNewWallet.js
===================
Modal to create new wallet
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
  createNewWallet,
  importNewWallet,
} from 'actions/walletActions';
import { validator } from 'lib/validationFunctions';
import styles from './CreateNewWallet.scss';

class CreateNewWallet extends Component {
  constructor(props) {
    super(props);

    this.state = {
      showModal: props.showModal,
      walletName: '',
      nameError: '',
      password: '',
      passwordError: '',
    }

    this.onWalletNameChange = this.onWalletNameChange.bind(this);
    this.onPasswordChange = this.onPasswordChange.bind(this);
    this.onClickButtonCreateWallet = this.onClickButtonCreateWallet.bind(this);
    this.updateWallets = this.updateWallets.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    const { showModal, newWalletInfo } = this.props;
    // Toggle modal
    if (nextProps.showModal !== showModal) {
      this.setState({ showModal: nextProps.showModal });
    }

    // Update new wallet info
    if (nextProps.newWalletInfo && nextProps.newWalletInfo !== newWalletInfo) {
      this.updateWallets(nextProps.newWalletInfo);
    }
  }

  componentWillUnmount() {
    this.setState({
      walletName: '',
      nameError: '',
      password: '',
      passwordError: '',
    });
  }

  // Update the new wallet and close the modal
  updateWallets(wallet) {
    const { makeImportNewWallet, closeModal } = this.props;
    const { showModal } = this.state;
    if (showModal) {
      makeImportNewWallet(wallet);
      closeModal();
    }
  }

  // Name verification
  onWalletNameChange(e) {
    const newState = {
      walletName: e.target.value,
    };

    newState.nameError = validator('name', newState.walletName);
    this.setState(newState);
  }

  // Password verification
  onPasswordChange(e) {
    const newState = {
      password: e.target.value,
    };

    newState.passwordError = validator('password', newState.password);
    this.setState(newState);
  }

  // Creation of wallet
  onClickButtonCreateWallet() {
    const { makeCreateNewWallet } = this.props;
    const { walletName, password } = this.state;
    makeCreateNewWallet(walletName, password);
  }

  render() {
    const { showModal, nameError, walletName, passwordError, password } = this.state;
    const { closeModal } = this.props;

    return (
      <Modal
        autoFocus
        centered
        backdrop="static"
        isOpen={showModal}
        toggle={() => this.setState({ 
          walletName: '',
          nameError: '',
          password: '',
          passwordError: '', 
        }, closeModal()) }
        className={styles.createNewWallet}
      >
      <ModalHeader
        tag="h3"
        toggle={() => this.setState({ 
          walletName: '',
          nameError: '',
          password: '',
          passwordError: '', 
        }, closeModal()) }
      >CREATE NEW WALLET</ModalHeader>
      <ModalBody>
        <FormGroup>
          <Label for="wallet-name">Wallet Name</Label>
          <Input
            type="text"
            id="wallet-name"
            placeholder="Input your wallet name"
            maxLength="255"
            invalid={(nameError.length > 0)}
            onChange={this.onWalletNameChange}
          />
          <FormFeedback dangerouslySetInnerHTML={{__html: nameError || '&nbsp;'}} />
        </FormGroup>
        <FormGroup>
          <Label for="wallet-password">Wallet Password</Label>
          <Input
            type="password"
            id="wallet-password"
            placeholder="Your password must be at least 9 characters."
            maxLength="255"
            invalid={(passwordError.length > 0)}
            onChange={this.onPasswordChange}
          />
          <FormFeedback dangerouslySetInnerHTML={{__html: passwordError || '&nbsp;'}} />
        </FormGroup>
      </ModalBody>
      <ModalFooter>
        <Button
          color="primary"
          className={[styles.btnSubmit, 'ppn'].join(" ")}
          disabled={!(
            nameError.length <= 0 &&
            walletName.length > 0 &&
            passwordError.length <= 0 &&
            password.length >= 9
          )}
          onClick={() => this.onClickButtonCreateWallet()}
        >
          Create wallet
        </Button>
      </ModalFooter>
      </Modal>
    )
  }
}

CreateNewWallet.defaultProps = {
  makeCreateNewWallet: null,
  makeImportNewWallet: null,
  showModal: false,
  newWalletInfo: null,
};

CreateNewWallet.propTypes = {
  makeCreateNewWallet: PropTypes.func,
  makeImportNewWallet: PropTypes.func,
  showModal: PropTypes.bool,
  closeModal: PropTypes.func.isRequired,
  newWalletInfo: PropTypes.object,
};

const mapStateToProps = state => ({
  isCreateWallet: state.wallet.isCreateWallet,
  createWalletError: state.wallet.createWalletError,
  newWalletInfo: state.wallet.newWalletInfo,
});

const mapDispatchToProps = dispatch => ({
  makeCreateNewWallet: (walletName, password) => dispatch(createNewWallet(walletName, password)),
  makeImportNewWallet: wallet => dispatch(importNewWallet(wallet)),
});


export default connect(mapStateToProps, mapDispatchToProps)(CreateNewWallet);
