/*
SNAccount.js
===================
A list of accounts to choose from
*/
// @flow
import _ from 'lodash';
import React, { Component } from 'react';
import { Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { setSelectedWallet } from '../../actions/superNode';

import styles from './SuperNode.scss';

class SNAccount extends Component {
  constructor(props) {
    super(props);

    this.toggle = this.toggle.bind(this);
    this.state = {
      dropdownOpen: false
    };
  }

  toggle() {
    this.setState(prevState => ({
      dropdownOpen: !prevState.dropdownOpen
    }));
  }

  render() {
    const { dropdownOpen } = this.state;
    const { wallets, selectedWalletName, setWallet, isMining } = this.props;

    const walletName = selectedWalletName || 'Account';
    return (
      <div className={styles.accountDropDown}>
        <Dropdown isOpen={dropdownOpen} toggle={this.toggle} disabled>
          <DropdownToggle className={styles.dropdownToggle} caret>
            {walletName}
          </DropdownToggle>
          {
            isMining ?
              null
            :
              <DropdownMenu className={styles.dropdownMenu} right>
                {
                  _.map(wallets, (wallet, index) => (
                      <DropdownItem
                        key={`wallet-${index}`}
                        onClick={() => setWallet(wallet.name, wallet.address)}
                      >
                        {wallet.name}
                      </DropdownItem>
                    )
                  )
                }
              </DropdownMenu>
          }
        </Dropdown>
        <div className={styles.accountLogo}>
          <p>A</p>
        </div>
      </div>
    );
  }
}

SNAccount.defaultProps = {
  selectedWalletName: null,
  wallets: [],
};

SNAccount.propTypes = {
  selectedWalletName: PropTypes.string,
  setWallet: PropTypes.func.isRequired,
  wallets: PropTypes.array,
  isMining: PropTypes.bool.isRequired,
};

const mapStateToProps = state => ({
  isMining: state.miner.isMining,
  wallets: state.wallet.wallets,
  selectedWalletName: state.superNode.selectedWalletName,
});

const mapDispatchToProps = dispatch => ({
  setWallet: (name, address) => {
    dispatch(setSelectedWallet(name, address));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(SNAccount);
