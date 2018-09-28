/*
UnRegistered.js
===================
The view to show when not registered.
*/
// @flow
import _ from 'lodash';
import React, { Component } from 'react';
import { shell } from 'electron';
import { Row, Col, Button } from 'reactstrap';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { registerSuperNode } from '../../actions/superNode';

import styles from './SuperNode.scss';

class UnRegistered extends Component {
  render() {
    const { registerSN, wallets, selectedWalletName, modal } = this.props;

    return (
      <Col xs={12} className="d-flex">
        <div className="border">
          <Row noGutters className="d-flex">
            <Col className={`d-flex flex-column align-items-center justify-content-center ${styles.unregistered}`} xs={12}>
              <h4>Begin your journey as a Supernode now!</h4>
              <Button
                className="greenBtn align-items-center"
                onClick={() => {
                  if (!selectedWalletName && modal) {
                    modal.toggle('Invalid Account!', 'please select an account from the list');
                    return;
                  }
                  const wallet = _.find(wallets, w => w.name === selectedWalletName);
                  if (wallet) {
                    registerSN(wallet.address, modal);
                  }
                }}
              >
                <p>Register</p>
              </Button>
              <Button 
                onClick={() => shell.openExternal('https://medium.com/@palnetwork_/worst-case-scenario-rewards-for-nodes-2cb8a5e4a9a5')}
                color="link"
              >
                Want to know more? Read here!
              </Button>
            </Col>
          </Row>
        </div>
      </Col>
    );
  }
}

UnRegistered.defaultProps = {
  selectedWalletName: null,
  wallets: [],
  modal: null,
};

UnRegistered.propTypes = {
  registerSN: PropTypes.func.isRequired,
  selectedWalletName: PropTypes.string,
  wallets: PropTypes.array,
  modal: PropTypes.object,
};

const mapStateToProps = state => ({
  wallets: state.wallet.wallets,
  selectedWalletName: state.superNode.selectedWalletName,
  modal: state.modal.modal,
});

const mapDispatchToProps = dispatch => ({
  registerSN: (address, modal) => {
    dispatch(registerSuperNode(address, modal));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(UnRegistered);
