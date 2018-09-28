/*
AccountList.js
===================
Account list to show in dashboard
*/
// @flow
import _ from 'lodash';
import React, { Component, Fragment } from 'react';
import { Row, Col, Button } from 'reactstrap';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { weiToPalString, historyPush } from '../../lib/helperFunctions';

import styles from './Dashboard.scss';

class AccountList extends Component {
  render() {
    const { wallets, history } = this.props;

    if (wallets.length === 0) {
      return null;
    }

    return (
      <Fragment>
        <h4>Accounts</h4>
        <Row noGutters>
          {
            _.map(wallets, (wallet, index) => (
                <Col key={`wallet-${index}`} className="d-flex" xs={12} lg={4}>
                  <div
                    onKeyDown={() => {}}
                    tabIndex={-1}
                    role="button"
                    className={`border ${styles.account}`}
                    onClick={() => historyPush(history, `/account/${wallet.address}`)}
                  >
                    <h3 className={styles.name}>{wallet.name}</h3>
                    <div className={styles.editIcon}>
                      <Button color="link" size="sm">
                        <i className="far fa-edit" />
                      </Button>
                    </div>
                    <hr />
                    <p>{weiToPalString(wallet.weiBalance)} {process.env.PPN_SYMBOL}</p>
                  </div>
                </Col>
            ))
          }
        </Row>
      </Fragment>
    );
  }
}

AccountList.defaultProps = {
  wallets: [],
};

AccountList.propTypes = {
  wallets: PropTypes.array,
  history: PropTypes.object.isRequired,
};

const mapStateToProps = state => ({
  wallets: state.wallet.wallets,
});

export default withRouter(connect(mapStateToProps)(AccountList));
