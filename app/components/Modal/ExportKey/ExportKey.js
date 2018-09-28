/*
ExportKey.js
===================
Export key modal. Handles both export to
private key and keystore
*/
import React, { Component } from 'react';
import { connect } from 'react-redux';
import path from 'path';
import fs from 'fs';
import { remote } from 'electron';
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
  Tooltip,
} from 'reactstrap';
import {
  createNewWallet,
  importNewWallet,
  exportKeyStoreState,
} from 'actions/walletActions';
import { copyToClipboard } from 'lib/helperFunctions';
import { validator } from 'lib/validationFunctions';
import { keyStoreToPKey, pKeyToKeyStore } from 'lib/keyFunctions';
import styles from './ExportKey.scss';

const defaultState = {
  privateKey: null,
  keyStore: null,
  password: '',
  passwordError: '',
  isClose: false,
  showTooltipCopied: false,
  fileName: '',
};

class ExportKey extends Component {
  constructor(props) {
    super(props);

    this.state = {
      showModal: props.showModal,
      ...defaultState,
      showTooltipCopied: false,
    }

    this.onPasswordChange = this.onPasswordChange.bind(this);
    this.onExport = this.onExport.bind(this);
  }
  
  // Toggle modal
  componentWillReceiveProps(nextProps) {
    const { showModal } = this.props;
    if (nextProps.showModal !== showModal) {
      this.setState({ showModal: nextProps.showModal });
    }
  }

  // Password verification
  onPasswordChange(e) {
    const newState = {
      password: e.target.value,
    };

    newState.passwordError = validator('password', newState.password);
    this.setState(newState);
  }

  // Copy Private Key to clipboard
  copyKey(text) {
    copyToClipboard(text);
    const self = this;
    this.setState({showTooltipCopied: true}, () => setTimeout(() => self.setState({showTooltipCopied: false}), 3000));
  }

  // On export of key
  async onExport() {
    const { password } = this.state;
    const { wallet, exportType, setExportKeyStoreState } = this.props;

    // Get private key from keystore
    const pKeyResult = keyStoreToPKey(JSON.stringify(wallet.keyStore), password);
    if (pKeyResult.privateKey) {
      // If export by privatekey, just return the privatekey
      // and set state to close
      if (exportType === 'privateKey') {
        this.setState({
          privateKey: pKeyResult.privateKey,
          isClose: true,
        });
      } else if (exportType === 'keyStore') {
        const desktopPath = remote.app.getPath('desktop')
        const defaultFilename = 'keystore'
        const defaultPath = path.resolve(desktopPath, defaultFilename);

        // Get path to save keystore
        remote.dialog.showSaveDialog(remote.getCurrentWindow(), {
          message: 'Choose a directory to store your keystore',
          defaultPath,
        }, async (fileName) => {
          if (!fileName) {
            return;
          }

          // SHow loading screen for export
          setExportKeyStoreState('start');

          setTimeout(async () => {
            // Export current privatekey to a new keystore using scrypt algorithm
            const keyStoreResult = await pKeyToKeyStore(password, pKeyResult.privateKey, true);
            const data = JSON.stringify(keyStoreResult.keyStore);

            if (keyStoreResult.keyStore) {
              // Write the address and private key to local filesystem
              fs.writeFile(fileName, data, (err) => {
                if (err) {
                  this.setState({
                    passwordError: 'Unable to export keystore. Please try again!',
                  });

                  setExportKeyStoreState('fail');
                  return;
                }
                this.setState({
                  keyStore: keyStoreResult.keyStore,
                  fileName,
                  isClose: true,
                });
              });
            } else {
              this.setState({
                passwordError: 'Unable to export keystore. Please try again!',
              });
              setExportKeyStoreState('fail');
            }

            // Success
            setExportKeyStoreState('success');
          }, 1000);
        });
      }
      return;
    }

    // Show any error during the process of exporting
    this.setState({
      passwordError: pKeyResult.error,
    });
  }

  // Renders the password field, hide if at closing view
  renderPasswordField() {
    const { isClose, passwordError } = this.state;

    if (isClose) {
      return null;
    }

    return (
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
    );
  }

  // Tooltip to show copied
  renderToolTip(data) {
    const { showTooltipCopied } = this.state;
    return (
      <span>
        <Tooltip
          target="export-key-label"
          isOpen={showTooltipCopied}
          toggle={() => this.setState({showTooltipCopied: false})}
          className="fade"
        >
          Copied!
        </Tooltip>
        <Button
          color="link"
          size="sm"
          onClick={() => this.copyKey(data)}
        >
          <i className="far fa-copy" />
        </Button>
      </span>
    )
  }

  // Render export of private key
  renderExportPrivateKey() {
    const { privateKey } = this.state;

    if (!privateKey) {
      return null;
    }

    return (
      <FormGroup>
        <FormGroup>
          <Label id="export-key-label" for="export-key">Private Key (Copy it somewhere safe)</Label>
          {this.renderToolTip(privateKey)}
          <Input
            type="textarea"
            id="export-key"
            placeholder="Optional"
            value={privateKey}
            disabled
          />
        </FormGroup>
      </FormGroup>
    );
  }

  // Render export of key store
  renderExportKeyStore() {
    const { keyStore, fileName } = this.state;

    if (!keyStore) {
      return null;
    }

    const data = JSON.stringify(keyStore);

    return (
      <FormGroup>
        <FormGroup>
          <Label id="export-key-label" for="export-key">File saved at: {fileName}</Label>
          <Input
            type="textarea"
            id="export-key"
            placeholder="Optional"
            value={data}
            disabled
          />
        </FormGroup>
      </FormGroup>
    );
  }

  // Render export button
  renderFooterButton() {
    const { isClose, password, passwordError } = this.state;
    const { closeModal, exportType } = this.props;

    if (isClose) {
      return (
        <Button
          color="primary"
          className={[styles.btnSubmit, 'ppn'].join(" ")}
          onClick={() => {
            closeModal();
            this.setState({...defaultState});
          }}
        >
          Close
        </Button>
      );
    }

    const text = exportType === 'keyStore' ? '(This will take a while)' : "";

    return (
      <div>
        <p className="text-center">{text}</p>
        <Button
          color="primary"
          className={[styles.btnSubmit, 'ppn'].join(" ")}
          disabled={!(
            passwordError.length <= 0 &&
            password.length >= 9
          )}
          onClick={() => this.onExport()}
        >
          Export
        </Button>
      </div>
    );
  }

  render() {
    const { showModal } = this.state;
    const { exportType, closeModal } = this.props;

    const modalName = exportType === 'privateKey' ? 'EXPORT PRIVATE KEY' : "EXPORT KEYSTORE";

    return (
      <Modal
        autoFocus
        centered
        backdrop="static"
        isOpen={showModal}
        toggle={() => this.setState({...defaultState}, closeModal()) }
        className={styles.createNewWallet}
      >
        <ModalHeader
          tag="h3"
          toggle={() => this.setState({...defaultState}, closeModal()) }
        >{modalName}</ModalHeader>
        <ModalBody>
          {this.renderPasswordField()}
          {this.renderExportPrivateKey()}
          {this.renderExportKeyStore()}
        </ModalBody>
        <ModalFooter>
          {this.renderFooterButton()}
        </ModalFooter>
      </Modal>
    )
  }
}

ExportKey.defaultProps = {
  showModal: false,
};

ExportKey.propTypes = {
  wallet: PropTypes.object.isRequired,
  showModal: PropTypes.bool,
  closeModal: PropTypes.func.isRequired,
  setExportKeyStoreState: PropTypes.func.isRequired,
  exportType: PropTypes.string.isRequired,
};

const mapStateToProps = state => ({
  isCreateWallet: state.wallet.isCreateWallet,
  createWalletError: state.wallet.createWalletError,
  newWalletInfo: state.wallet.newWalletInfo,
});

const mapDispatchToProps = dispatch => ({
  makeCreateNewWallet: (walletName, password) => dispatch(createNewWallet(walletName, password)),
  makeImportNewWallet: wallet => dispatch(importNewWallet(wallet)),
  setExportKeyStoreState: state => dispatch(exportKeyStoreState(state)),
});


export default connect(mapStateToProps, mapDispatchToProps)(ExportKey);
