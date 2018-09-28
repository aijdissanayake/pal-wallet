/*
Help.js
===================
Help view at the bottom of the sidebar
*/
import React, { Component } from 'react';
// import { NavLink } from 'react-router-dom';
import { shell } from 'electron';
import {
  Nav,
  NavItem,
  NavLink,
} from 'reactstrap';
import styles from './Help.scss';

export default class Help extends Component {
  constructor(props) {
    super(props);

    this.urlHelp = 'https://medium.com/@palnetwork_/pal-testnet-wallet-step-by-step-guide-48e0a36a1b87';

    this.handleOnClickHelp = () => shell.openExternal(this.urlHelp);// eslint-disable-line
  }

  render() {
    return (
      <Nav vertical className={styles.help}>
        <NavItem>
          <NavLink onClick={this.handleOnClickHelp} className={styles.help__link}>
            <i className="far fa-question-circle" />
            Help
          </NavLink>
        </NavItem>
      </Nav>
    )
  }
}
