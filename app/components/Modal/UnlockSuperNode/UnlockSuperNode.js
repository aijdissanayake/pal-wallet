/*
UnlockSuperNode.js
===================
Modal to unlock super node for mining
*/
import React, { Component } from 'react';
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
import { validator } from 'lib/validationFunctions';
import styles from './UnlockSuperNode.scss';

class UnlockSuperNode extends Component {
  constructor(props) {
    super(props);

    this.state = {
      showModal: props.showModal,
      password: '',
      passwordError: '',
    }

    this.onPasswordChange = this.onPasswordChange.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    const { showModal } = this.props;
    if (nextProps.showModal !== showModal) {
      this.setState({ showModal: nextProps.showModal });
    }
  }

  componentWillUnmount() {
    this.setState({
      password: '',
      passwordError: '',
    });
  }

  onPasswordChange(e) {
    const newState = {
      password: e.target.value,
    };

    newState.passwordError = validator('password', newState.password);
    this.setState(newState);
  }

  render() {
    const { showModal, passwordError, password } = this.state;
    const { closeModal, startWithModal } = this.props;

    return (
      <Modal
        autoFocus
        centered
        backdrop="static"
        isOpen={showModal}
        toggle={() => this.setState({ 
          password: '',
          passwordError: '', 
        }, closeModal()) }
        className={styles.createNewWallet}
      >
      <ModalHeader
        tag="h3"
        toggle={() => this.setState({ 
          password: '',
          passwordError: '', 
        }, closeModal()) }
      >Unlock SuperNode</ModalHeader>
      <ModalBody>
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
            passwordError.length <= 0 &&
            password.length >= 9
          )}
          onClick={() => startWithModal(password)}
        >
          Unlock
        </Button>
      </ModalFooter>
      </Modal>
    )
  }
}

UnlockSuperNode.defaultProps = {
  showModal: false,
};

UnlockSuperNode.propTypes = {
  showModal: PropTypes.bool,
  closeModal: PropTypes.func.isRequired,
  startWithModal: PropTypes.func.isRequired,
};

export default UnlockSuperNode;
