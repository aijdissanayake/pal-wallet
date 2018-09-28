/*
ImportKeyStore.js
===================
import Key store modal
*/
import $ from 'jquery';
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
  InputGroup,
} from 'reactstrap';
import {
  DEFAULT_WALLET_DATA,
  importNewWallet,
  exportKeyStoreState,
} from 'actions/walletActions';
import { validator } from 'lib/validationFunctions';
import { keyStoreToPKey } from 'lib/keyFunctions';
import styles from './ImportKeyStore.scss';

class ImportKeyStore extends Component {
  constructor(props) {
    super(props);

    this.state = {
      showModal: props.showModal,
      name: '',
      nameError: '',
      file: null,
      password: '',
      passwordError: '',
      fileError: '',
    }

    this.regexName = /^[a-zA-Z0-9\d\-_.,\s]+$/;

    this.onInputChange = this.onInputChange.bind(this);
    this.allowSubmit = this.allowSubmit.bind(this);
    this.onClickButtonImportWallet = this.onClickButtonImportWallet.bind(this);
  }

  // Toggle modal and update wallets
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
      file: null,
      password: '',
      passwordError: '',
      fileError: '',
    });
  }

  // On input changes
  onInputChange(key, value) {
    const newState = {};

    // Name verification
    if (key === 'name') {
      newState.nameError = validator('name', value);
      newState.name = value;
    }
    // Password verification
    else if (key === 'password') {
      newState.passwordError = validator('password', value);
      newState.password = value;
    }
    // File verification
    else if (key === 'file') {
      try {
        newState.file = value.files ? value.files[0] : null;
      } catch (error) {
        newState.file = null;
        newState.fileError = `File opening error: ${error}`;
      }
    }

    this.setState(newState);
  }

  // On click of import wallet
  onClickButtonImportWallet() {
    const { name, password, file } = this.state;
    const { makeImportNewWallet, setExportKeyStoreState } = this.props;

    try {
      // Get file from path
      $.get(file.path, async (keyObject) => {
        // Set loading screen
        setExportKeyStoreState('start');

        setTimeout(async () => {
          // Attempt to convert keystore to private key
          const privateKeyResult = await keyStoreToPKey(keyObject, password);
          if (privateKeyResult.error) {
            this.setState({
              passwordError: privateKeyResult.error || '',
            })
            setExportKeyStoreState('fail');
          } else {
            // If successful, import wallet
            // with the privatekey
            const wallet = {
              ...DEFAULT_WALLET_DATA,
              name,
              privateKey: privateKeyResult.privateKey,
              password,
            }
            makeImportNewWallet(wallet);
            setExportKeyStoreState('success');
          }
        }, 1000);
      });
    } catch (error) {
      console.log('File open error');
      this.setState({
        fileError: 'Invalid File',
      })
    }
  }

  // Validations
  allowSubmit() {
    const { name, nameError, file, password  } = this.state;
    if (this.regexName.test(name) && password.length >= 9 && !nameError && file) {
      return true;
    }
    return false;
  }

  render() {
    const { showModal, nameError, file, passwordError, fileError } = this.state;
    const { closeModal } = this.props;

    const fileName = file ? file.name : '';

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
          <Label for="wallet-password">Wallet Password</Label>
          <Input
            type="password"
            id="wallet-password"
            placeholder="Input your wallet password"
            maxLength="255"
            invalid={(passwordError.length > 0)}
            onChange={(e) => this.onInputChange('password', e.target.value)}
          />
          <FormFeedback dangerouslySetInnerHTML={{__html: passwordError || '&nbsp;'}} />
        </FormGroup>
        <FormGroup>
          <Label for="keystore">Keystore</Label>
          <InputGroup>
            <Button
              color="info"
              onClick={() => {
                $('#keystore').click();
              }}
            >
              Select File
              <Input
                ref={node => { this.fileInput = node }}
                type="file"
                name="file"
                id="keystore"
                className={styles.fileInput}
                onChange={(e) => {this.onInputChange('file', e.target)}}
              />
            </Button>
            <p className={styles.filePath}>{fileName}</p>
          </InputGroup>
          <FormFeedback dangerouslySetInnerHTML={{__html: fileError || '&nbsp;'}} />
        </FormGroup>
      </ModalBody>
      <ModalFooter>
        <div>
          <p className="text-center">(This might take a while)</p>
          <Button
            color="primary"
            className={[styles.btnSubmit, 'ppn'].join(' ')}
            disabled={!this.allowSubmit()}
            onClick={() => this.onClickButtonImportWallet()}
          >
            Import wallet
          </Button>
        </div>
      </ModalFooter>
      </Modal>
    )
  }
}

ImportKeyStore.defaultProps = {
  makeImportNewWallet: null,
  showModal: false,
  newWalletInfo: null,
};

ImportKeyStore.propTypes = {
  makeImportNewWallet: PropTypes.func,
  showModal: PropTypes.bool,
  closeModal: PropTypes.func.isRequired,
  setExportKeyStoreState: PropTypes.func.isRequired,
  newWalletInfo: PropTypes.object,
};

const mapStateToProps = state => ({
  newWalletInfo: state.wallet.newWalletInfo,
});

const mapDispatchToProps = dispatch => ({
  makeImportNewWallet: privateKey => dispatch(importNewWallet(privateKey)),
  setExportKeyStoreState: state => dispatch(exportKeyStoreState(state)),
});

export default connect(mapStateToProps, mapDispatchToProps)(ImportKeyStore);
