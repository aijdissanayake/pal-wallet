/*
CreateAccount.js
===================
Account creation in dashboard
*/

// @flow
import React, { Component, Fragment } from 'react';
import { Row, Col, Button } from 'reactstrap';

import { CreateNewWallet, ImportPrivateKey, ImportKeyStore } from 'components/Modal';// eslint-disable-line

import styles from './Dashboard.scss';

class CreateAccount extends Component {
  constructor(props) {
    super(props);

    this.state = {
      showCreateNewWallet: false,
      showImportWallet: false,
      showImportKeyStore: false,
    };

    this.showModalCreateNewWallet = this.showModalCreateNewWallet.bind(this);
    this.closeModalCreateNewWallet = this.closeModalCreateNewWallet.bind(this);
    this.showModalImportWallet = this.showModalImportWallet.bind(this);
    this.closeModalImportWallet = this.closeModalImportWallet.bind(this);
    this.showModalImportKeyStore = this.showModalImportKeyStore.bind(this);
    this.closeModalImportKeyStore = this.closeModalImportKeyStore.bind(this);
  }

  showModalCreateNewWallet() {
    this.setState({ showCreateNewWallet: true });
  }

  closeModalCreateNewWallet() {
    this.setState({ showCreateNewWallet: false });
  }

  showModalImportWallet() {
    this.setState({ showImportWallet: true });
  }

  closeModalImportWallet() {
    this.setState({ showImportWallet: false });
  }

  showModalImportKeyStore() {
    this.setState({ showImportKeyStore: true });
  }

  closeModalImportKeyStore() {
    this.setState({ showImportKeyStore: false });
  }

  render() {
    const { showCreateNewWallet, showImportWallet, showImportKeyStore } = this.state;

    return (
      <Fragment>
        <h4>Manage</h4>
        <div className={`${styles.border} border`}>
          <Row className={`${styles.createAccount}`} noGutters>
            <Col xs={12} lg={4}>
              <Button
                className="greenBtn"
                onClick={this.showModalCreateNewWallet}
              >Create Account</Button>
              <div className={`${styles.create}`} />
            </Col>
            <Col xs={12} lg={4}>
              <h6 className={styles.import}>Import</h6>
              <Button
                outline color="secondary"
                onClick={this.showModalImportKeyStore}
              >By Keystore + Pass</Button>
            </Col>
            <Col xs={12} lg={4}>
              <Button
                outline color="secondary"
                onClick={this.showModalImportWallet}
              >By Private Key</Button>
            </Col>
          </Row>
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
      </Fragment>
    );
  }
}

export default CreateAccount;