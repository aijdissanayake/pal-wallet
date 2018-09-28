/*
VersionCheck.js
===================
Modal to show warning if version check failed
*/
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { shell, remote } from 'electron';
import PropTypes from 'prop-types';
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  FormGroup,
} from 'reactstrap';

import styles from './VersionCheck.scss';

class VersionCheck extends Component {
  constructor(props) {
    super(props);

    this.state = {
      showModal: false,
      appVersion: remote.app.getVersion(),
    }
  }

  componentWillReceiveProps(nextProps) {
    if (!nextProps.isValidVersion) {
      this.setState({ showModal: true });
    }
  }

  // Forward to download link in github
  handleOnClick() {
    shell.openExternal('https://github.com/policypalnet/pal-wallet/releases');// eslint-disable-line
  }

  render() {
    const { showModal, appVersion } = this.state;

    return (
      <Modal
        autoFocus
        centered
        backdrop="static"
        isOpen={showModal}
        className={styles.versionCheck}
      >
        <ModalHeader
          tag="h3"
        >
          Warning
        </ModalHeader>
        <ModalBody>
          <FormGroup>
            <p>Application version: {appVersion} is outdated. Please download the latest version from:</p>
            <Button 
              color="link"
              onClick={this.handleOnClick}
              className={styles.link}
            >
              https://github.com/policypalnet/pal-wallet/releases
            </Button>
          </FormGroup>
        </ModalBody>
        <ModalFooter>
          <Button
            color="primary"
            onClick={this.handleOnClick}
          >
            Download Update
          </Button>
        </ModalFooter>
      </Modal>
    )
  }
}

VersionCheck.defaultProps = {
  isValidVersion: false,
};

VersionCheck.propTypes = {
  isValidVersion: PropTypes.bool,
};


const mapStateToProps = state => ({
  isValidVersion: state.statistics.isValidVersion,
});

export default connect(mapStateToProps)(VersionCheck);
