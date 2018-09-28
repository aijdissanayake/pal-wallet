/*
Header.js
===================
Top header of the waller
*/
import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import {
  Container,
  Badge,
} from 'reactstrap';
import styles from './Header.scss';

class Header extends Component {
  render() {
    const { isMining } = this.props;
    const badgeColor = isMining ? "danger" : "info";
    const badgeText = isMining ? "Supernode Active" : "Supernode Inactive";

    return (
      <header className={styles.mainHeader}>
        <Container fluid className={styles.content}>
          <div className={styles.blockInfos}>
            <div className={styles.blockInfo}>
              <Badge color={badgeColor}>{badgeText}</Badge>
            </div>
            <div className={styles.blockInfo}>
              # Masternode
              <span className={styles.blockInfo__value}>21</span>
            </div>
          </div>
        </Container>
      </header>
    )
  }
}

Header.defaultProps = {
  isMining: false,
};

Header.propTypes = {
  isMining: PropTypes.bool,
};

const mapStateToProps = state => ({
  isMining: state.miner.isMining,
});

export default connect(mapStateToProps)(Header);

