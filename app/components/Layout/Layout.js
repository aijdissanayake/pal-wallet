/*
Layout.js
===================
The container of pages with custom scrollbars
*/
import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
  Container
} from 'reactstrap';
import PropTypes from 'prop-types';
import Header from 'components/Header/Header';
import Sidebar from 'components/Sidebar/Sidebar';
import NotificationContainer from 'components/NotificationContainer/NotificationContainer';
import Loading from 'components/Loading/Loading';
import { Scrollbars } from 'react-custom-scrollbars';
import styles from './Layout.scss';

class Layout extends Component {
  render() {
    const { children } = this.props;
    return (
      <Scrollbars
        autoHide
        className={styles.wrapper}
      >
        <Header />
        <Sidebar />
        <div className={styles.content}>
          <Container fluid>
            {children}
          </Container>
        </div>
        <NotificationContainer />
        <Loading />
      </Scrollbars>
    )
  }
}

Layout.defaultProps = {
  children: null,
};

Layout.propTypes = {
  children: PropTypes.node,
};

export default connect(null, null)(Layout);
