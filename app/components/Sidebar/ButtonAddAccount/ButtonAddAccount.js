/*
ButtonAddAccount.js
===================
Button to add/ import new accounts
*/
import React, { Component } from 'react';
import {
  Button,
  Popover,
  PopoverBody,
} from 'reactstrap';
import { CreateNewWallet, ImportPrivateKey, ImportKeyStore } from 'components/Modal';// eslint-disable-line
import styles from './ButtonAddAccount.scss';

export default class ButtonAddAccount extends Component {
  constructor(props) {
    super(props);

    this.state = {
      popoverOpen: false,
      showCreateNewWallet: false,
      showImportWallet: false,
      showImportKeyStore: false,
    };

    this.popoverToggle = this.popoverToggle.bind(this);
    this.showModalCreateNewWallet = this.showModalCreateNewWallet.bind(this);
    this.closeModalCreateNewWallet = this.closeModalCreateNewWallet.bind(this);
    this.showModalImportWallet = this.showModalImportWallet.bind(this);
    this.closeModalImportWallet = this.closeModalImportWallet.bind(this);
    this.showModalImportKeyStore = this.showModalImportKeyStore.bind(this);
    this.closeModalImportKeyStore = this.closeModalImportKeyStore.bind(this);
  }

  popoverToggle() {
    const { popoverOpen } = this.state;
    this.setState({ popoverOpen: !popoverOpen });
  }

  showModalCreateNewWallet() {
    this.setState({ showCreateNewWallet: true }, this.popoverToggle());
  }

  closeModalCreateNewWallet() {
    this.setState({ showCreateNewWallet: false });
  }

  showModalImportWallet() {
    this.setState({ showImportWallet: true }, this.popoverToggle());
  }

  closeModalImportWallet() {
    this.setState({ showImportWallet: false });
  }

  showModalImportKeyStore() {
    this.setState({ showImportKeyStore: true }, this.popoverToggle());
  }

  closeModalImportKeyStore() {
    this.setState({ showImportKeyStore: false });
  }


  render() {
    const { popoverOpen, showCreateNewWallet, showImportWallet, showImportKeyStore } = this.state;

    return (
      <div className={styles.buttonAddAccount}>
        <Button onClick={this.popoverToggle} id="buttonAddAccount" color="primary" outline size="sm">
          <i className="fa fa-plus" aria-hidden="true"/>
        </Button>
        <Popover placement="bottom" isOpen={popoverOpen} target="buttonAddAccount" toggle={this.popoverToggle}>
          <PopoverBody className="text-center">
            <Button
              color="link"
              onClick={this.showModalImportWallet}
            >
              Import Wallet (Private Key)
            </Button>
            <hr />
            <Button
              color="link"
              onClick={this.showModalImportKeyStore}
            >
              Import Wallet (KeyStore)
            </Button>
            <hr />
            <Button
              color="link"
              onClick={this.showModalCreateNewWallet}
            >
              Create New Wallet
            </Button>
          </PopoverBody>
        </Popover>
        <CreateNewWallet
          showModal={showCreateNewWallet}
          closeModal={this.closeModalCreateNewWallet}
        />
        <ImportPrivateKey
          showModal={showImportWallet}
          closeModal={this.closeModalImportWallet}
        />
        <ImportKeyStore
          showModal={showImportKeyStore}
          closeModal={this.closeModalImportKeyStore}
        />
      </div>
    )
  }
}
