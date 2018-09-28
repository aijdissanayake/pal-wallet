/*
PackageHistory.js
===================
Shows the latest 10 packages that the current supernode
worked on.
*/
// @flow
import _ from 'lodash';
import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Scrollbars } from 'react-custom-scrollbars';
import { truncateHash } from '../../lib/helperFunctions';
import { showPackageDetails } from '../../actions/superNode';

import styles from './SuperNode.scss';

class PackageHistory extends Component {
  renderPackages() {
    const { packages, showPkgDetails } = this.props;

    if (_.isEmpty(packages)) {
      return (
        <div className={styles.packageDetail}>
          <h5>No packages mined</h5>
        </div>
      )
    };

    return _.map(packages, (pkg, index) => {
      const timeStamp = new Date(pkg.timeStamp);
      const txHash = truncateHash(pkg.txHash);

      const transactionsText = ` with ${pkg.txs.length} Transactions`;
      const color = pkg.status ? styles.colPass : styles.colFail;
      const logoColor = pkg.status ? styles.packageLogoPass : styles.packageLogoFail;
      const statusText = pkg.status ? 'Successfully processed package' : 'Unable to process package';
      const logoSign = pkg.status ? 'fas fa-check-circle' : 'fas fa-times-circle';

      return (
        <div
          className={styles.packageDetail}
          key={`package-${index}`}
        >
          <div className={`${styles.bar} ${color}`} />
          <i className={`${styles.packageLogo} ${logoSign} ${logoColor}` } />
          <div className={styles.packageInfo}>
            <p>{statusText}</p>
            <div
              className={`anchorLink ${styles.anchorLink}`}
              role="button"
              tabIndex={-1}
              onKeyUp={() => {}}
              onClick={() => showPkgDetails(pkg)}
            >
              {txHash}
            </div>
            <span>{transactionsText}</span>
          </div>
          <div className={styles.packageReward}>
            <p className={styles.packageTime}>{`${timeStamp.toDateString()} ${timeStamp.toLocaleTimeString()}`}</p>
          </div>
        </div>
      )
    });
  }

  render() {
    return (
      <Fragment>
        <h3>Package History</h3>
        <div className={`border ${styles.packageDetailContainer}`}>
          <Scrollbars>
            {this.renderPackages()}
          </Scrollbars>
        </div>
      </Fragment>
    );
  }
}

PackageHistory.defaultProps = {
  packages: [],
};

PackageHistory.propTypes = {
  packages: PropTypes.array,
  showPkgDetails: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  packages: state.superNode.packages,
});

const mapDispatchToProps = dispatch => ({
  showPkgDetails: (pkg) => {
    dispatch(showPackageDetails(pkg));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(PackageHistory);
