/*
Sidebar.js
===================
Sidebar
*/
import React, { Component } from 'react';
import { shell } from 'electron';
import logoImg from 'assets/images/logo/ppn-logo.svg';
import Version from 'components/Version/Version';
import styles from './Sidebar.scss';
import Menu from './Menu/Menu';
import Help from './Help/Help';
import AccountList from './AccountList/AccountList';
import ButtonAddAccount from './ButtonAddAccount/ButtonAddAccount';

class Sidebar extends Component {
  constructor(props) {
    super(props);

    this.handleOnClickLogo = () => shell.openExternal('https://www.pal.network/');// eslint-disable-line
  }

  render() {
    return (
      <aside className={styles.mainSidebar}>
        <div onClick={() => this.handleOnClickLogo()} className={styles.brand} role="presentation">
          <img src={logoImg} className={styles['brand__logo--big']} alt="PAL Network" />
          <img src={logoImg} className={styles['brand__logo--mini']} alt="PAL Network" />
        </div>
        <div className={[styles.menuGroup, 'mb-3'].join(' ')}>
          <h4 className={styles.menuGroup__title}>MENU</h4>
          <Menu />
        </div>
        <div className={[styles.menuGroup, 'flex-grow-1', 'd-flex', 'flex-column'].join(' ')}>
          <h4 className={styles.menuGroup__title}>
            ACCOUNT
            <ButtonAddAccount />
          </h4>
          <div className="flex-grow-1 position-relative">
            <AccountList />
          </div>
        </div>
        <div className={styles.menuGroup}>
          <Help />
          <Version />
        </div>
      </aside>
    )
  }
}

export default Sidebar;
