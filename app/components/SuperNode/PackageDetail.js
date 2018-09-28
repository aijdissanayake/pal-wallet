/*
PackageDetail.js
===================
Show all the packaged txs in the selected package
*/
// @flow
import _ from 'lodash';
import React, { Component, Fragment } from 'react';
import { Row, Col, Table } from 'reactstrap';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { truncateHash, weiToPalString } from '../../lib/helperFunctions';
import { openExplorerLink } from '../../lib/explorerFunctions';

import styles from './SuperNode.scss';

class PackageDetail extends Component {
  // Render the package details
  renderDetails() {
    // Check if a package is selected
    const { selectedPkg } = this.props;
    if (!selectedPkg) {
      return (
        <div className={styles.packageDetail}>
          <h5 style={{ marginTop: 20 }}>No Details</h5>
        </div>
      )
    }

    const status = selectedPkg.status ? 'Success' : 'Failed';
    const color = selectedPkg.status ? styles.colPass : styles.colFail;
    const timeStamp = new Date(selectedPkg.timeStamp);

    return (
      <Col xs={12}>
        <Row className={styles.header} noGutters>
          <Col xs={12} md={4} className={styles.detailItem}>
            <span>Hash: </span>
            <span>{truncateHash(selectedPkg.txHash)}</span>
          </Col>
          <Col xs={12} md={4} className={styles.detailItem}>
            <span>Size: </span>
            <span>{selectedPkg.size}bytes</span>
          </Col>
          <Col xs={12} md={4} className={styles.detailItem}>
            <span>Num Txs: </span>
            <span>{selectedPkg.txs.length}</span>
          </Col>
          <Col xs={12} md={4} className={styles.detailItem}>
            <span>Status: </span>
            <span className={color}>{status}</span>
          </Col>
          <Col xs={12} md={8} className={styles.detailItem}>
            <span>Timestamp: </span>
            <span className={styles.timeStamp}>{timeStamp.toString()}</span>
          </Col>
        </Row>
        <Row noGutters>
          <Col xs={12}>
            <Table className={styles.table} cellPadding={0} cellSpacing={0} border={0} striped style={{ marginBottom: 0 }}>
              <thead>
                <tr>
                  <th>Transaction Id</th>
                  <th>From</th>
                  <th>To</th>
                  <th>{process.env.PPN_SYMBOL}</th>
                </tr>
              </thead>
            </Table>
          </Col>
          <Col xs={12} className={styles.detailTable}>
            <Table className={styles.table} cellPadding={0} cellSpacing={0} border={0} striped>
              <tbody>
                {
                  _.map(selectedPkg.txs, (tx, index) => {
                      const value = weiToPalString(tx.value);

                      return (
                        <tr key={`table-${index}`}>
                          <th scope="row">
                            <div
                              onKeyDown={null}
                              tabIndex={-1}
                              role="button"
                              className="anchorLink"
                              onClick={() => openExplorerLink(`/#/transaction/${tx.transactionHash}`)}
                            >
                              {truncateHash(tx.transactionHash)}
                            </div>
                          </th>
                          <td>
                            <div
                              onKeyDown={null}
                              tabIndex={-1}
                              role="button"
                              className="anchorLink"
                              onClick={() => openExplorerLink(`/#/address/${tx.fromAddress}`)}
                            >
                              {truncateHash(tx.fromAddress)}
                            </div>
                          </td>
                          <td>
                          <div
                              onKeyDown={null}
                              tabIndex={-1}
                              role="button"
                              className="anchorLink"
                              onClick={() => openExplorerLink(`/#/address/${tx.toAddress}`)}
                            >
                              {truncateHash(tx.toAddress)}
                            </div>
                          </td>
                          <td>{value}</td>
                        </tr>
                      );
                    }
                  )
                }
              </tbody>
            </Table>
          </Col>
        </Row>
      </Col>
    );

  }

  render() {
    return (
      <Fragment>
        <h3>Package Details</h3>
        <Row className={`border align-items-start ${styles.packageDetails}`} noGutters>
          {this.renderDetails()}
        </Row>
      </Fragment>
    );
  }
}

PackageDetail.defaultProps = {
  selectedPkg: null,
};

PackageDetail.propTypes = {
  selectedPkg: PropTypes.object,
};

const mapStateToProps = state => ({
  selectedPkg: state.superNode.selectedPkg,
});

export default connect(mapStateToProps, null)(PackageDetail);
