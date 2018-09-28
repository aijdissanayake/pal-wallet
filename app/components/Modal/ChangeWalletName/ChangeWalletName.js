/*
ChangeWalletName.js
===================
Modal to change wallet name
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
import { updateWallet } from 'actions/walletActions';
import { validator } from 'lib/validationFunctions';
import styles from './ChangeWalletName.scss';

class ChangeWalletName extends Component {
  constructor(props) {
    super(props);

    this.state = {
      showModal: props.showModal,
      name: '',
      nameError: '',
    }

    // Only numeric and alphabets
    this.regexName = /^[a-zA-Z0-9\d\-_.,\s]+$/;

    this.onInputChange = this.onInputChange.bind(this);
    this.allowSubmit = this.allowSubmit.bind(this);
    this.onClickButtonSubmit = this.onClickButtonSubmit.bind(this);
  }

  // Toggle modal
  componentWillReceiveProps(nextProps) {
    /* eslint-disable */
    const [currentShowModal, newShowModal] = [this.props.showModal, nextProps.showModal];
    /* eslint-enable */
    if (currentShowModal !== newShowModal) {
      this.setState({ showModal: newShowModal });
    }
  }

  componentWillUnmount() {
    this.setState({ name: '', nameError: '' });
  }

  onInputChange(key, value) {
    const newState = {};

    // Name check
    if (key === 'name') {
      newState.nameError = validator('name', value);
      newState.name = value;
    }

    this.setState(newState);
  }

  onClickButtonSubmit() {
    const { selectedWallet, doUpdateWallet } = this.props;
    const { name } = this.state;
    doUpdateWallet({
      ...selectedWallet,
      name,
    })
    this.props.closeModal();//eslint-disable-line
  }

  allowSubmit() {
    const { name, nameError } = this.state;
    if (name && name.length > 0 && this.regexName.test(name) && !nameError) {
      return true;
    }
    return false;
  }

  render() {
    const { showModal, nameError } = this.state;
    const { closeModal } = this.props;

    return (
      <Modal
        autoFocus
        centered
        backdrop="static"
        isOpen={showModal}
        className={styles.changeWalletName}
      >
      <ModalHeader
        tag="h3"
        toggle={() => this.setState({ showModal: false }, closeModal()) }
      >CHANGE WALLET NAME</ModalHeader>
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
      </ModalBody>
      <ModalFooter>
        <Button
          color="primary"
          className={[styles.btnSubmit, 'ppn'].join(' ')}
          disabled={!this.allowSubmit()}
          onClick={() => this.onClickButtonSubmit()}
        >
          Change name
        </Button>
      </ModalFooter>
      </Modal>
    );
  }
}

ChangeWalletName.defaultProps = {
  doUpdateWallet: null,
  showModal: false,

  selectedWallet: null,
};

ChangeWalletName.propTypes = {
  doUpdateWallet: PropTypes.func,
  showModal: PropTypes.bool,
  closeModal: PropTypes.func.isRequired,
  selectedWallet: PropTypes.object,
};

const mapStateToProps = state => ({
  selectedWallet: state.wallet.selectedWallet,
});

const mapDispatchToProps = dispatch => ({
  doUpdateWallet: walletData => dispatch(updateWallet(walletData)),
});

export default connect(mapStateToProps, mapDispatchToProps)(ChangeWalletName);
