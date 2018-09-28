/*
NotificationContainer.js
===================
Container to hold a list of notifications
*/
import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import Notify from './Notify/Notify';
import styles from './NotificationContainer.scss';

class NotificationContainer extends Component {
  constructor(props) {
    super(props)

    this.state = {
      notificationList: [],
    };

    this.updateNotificationList = this.updateNotificationList.bind(this);
  }

  // Update notifications by props into list
  componentWillReceiveProps(nextProps) {
    const [currentTimestamp, nextTimestamp] = [this.props.timestamp, nextProps.timestamp];// eslint-disable-line

    if (currentTimestamp !== nextTimestamp) {
      this.updateNotificationList(nextProps);
    }
  }

  // Update the notification list
  updateNotificationList(nextProps) {
    const { timestamp, text, color } = nextProps;
    const { notificationList } = this.state;

    // Pop notifications older than 2
    notificationList.unshift({ timestamp, text, color });
    if (notificationList.length >= 2) {
      notificationList.pop();
    }

    this.setState({ notificationList });
  }

  render() {
    const { notificationList } = this.state;

    return (
      <div className={styles.notificationContainer}>
        { notificationList.map(noti => <Notify key={noti.timestamp} text={noti.text} color={noti.color} />) }
      </div>
    )
  }
}

NotificationContainer.defaultProps = {
  timestamp: 0,
};

NotificationContainer.propTypes = {
  timestamp: PropTypes.number,
};

const mapStateToProps = state => ({
  timestamp: state.notification.timestamp,
  color: state.notification.color,
  text: state.notification.text,
});

export default connect(mapStateToProps, null)(NotificationContainer);
