/*
MessageModal.js
===================
Generic modal used to display messages that does not
requires action
*/
import React, { Component } from 'react';
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from 'reactstrap';

import styles from './MessageModal.scss';

class MessageModal extends Component {
  constructor(props) {
    super(props);

    this.state = {
      showModal: false,
      title: '',
      message: '',
    }

    this.toggle = this.toggle.bind(this);
  }

  toggle(title, message) {
    const { showModal } = this.state;
    this.setState({
      showModal: !showModal,
      title: title || '',
      message: message || '',
    });
  }

  render() {
    const { showModal, title, message } = this.state;

    return (
      <Modal
        autoFocus
        centered
        backdrop="static"
        isOpen={showModal}
        className={styles.messageModal}
      >
      <ModalHeader
        tag="h3"
        className={styles.header}
      >
        {title}
      </ModalHeader>
      <ModalBody
        tag="h5"
        className={styles.body}
      >
        {message}
      </ModalBody>
      <ModalFooter>
        <Button
          color="primary"
          className={[styles.btnSubmit, 'ppn'].join(" ")}
          onClick={() => this.toggle()}
        >
          Ok
        </Button>
      </ModalFooter>
      </Modal>
    )
  }
}

export default MessageModal;
