/*
Notify.js
===================
The actual notify view
*/
import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Alert } from 'reactstrap';
import styles from './Notify.scss';

class Notify extends Component {
  constructor(props) {
    super(props);

    this.state = {
      visible: true,
    };

    this.timer = null;
    this.colors = { default: 'white', error: 'danger', warning: 'warning', success: 'success' };

    this.onDismiss = this.onDismiss.bind(this);
    this.getContent = this.getContent.bind(this);
  }

  componentDidMount() {
    const { autoClose, displayTime } = this.props;
    if (autoClose) {
      const self = this;
      this.timer = setTimeout(() => self.onDismiss(), displayTime || 4000);
    }
  }

  componentWillUnmount() {
    if (this.timer) {
      clearTimeout(this.timer);
    }
  }

  onDismiss() {
    this.setState({ visible: false });
  }

  getContent() {
    const { children, text } = this.props;

    if (children) {
      return children;
    }

    return text;
  }

  render() {
    const { color } = this.props;
    const { visible } = this.state;

    return (
      <Alert
        color={this.colors[color] || 'white'}
        className={styles.notify}
        isOpen={visible}
        toggle={() => this.onDismiss()}
      >
        {this.getContent()}
      </Alert>
    )
  }
}

Notify.defaultProps = {
  color: 'white', // Accept: default, error, warning, success
  children: null,
  text: '',
  autoClose: true,
  displayTime: 4000,
};

Notify.propTypes = {
  color: PropTypes.string,
  children: PropTypes.node,
  text: PropTypes.string,
  autoClose: PropTypes.bool,
  displayTime: PropTypes.number,
};


export default connect(null, null)(Notify);
