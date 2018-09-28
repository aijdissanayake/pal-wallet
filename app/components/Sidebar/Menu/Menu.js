/*
Menu.js
===================
Menu at the sidebar
*/
import React, { Component } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Nav,
  NavItem,
} from 'reactstrap';
import styles from './Menu.scss';


export default class Menu extends Component {
  render() {
    return (
      <Nav vertical className={styles.menu}>
        <NavItem>
          <NavLink exact to="/" className="nav-link">
            <i className="fa fa-chart-bar" />
            Dashboard
          </NavLink>
        </NavItem>
        <NavItem>
          <NavLink to="/supernode" className="nav-link">
            <i className="fab fa-codepen" />
            Supernode
          </NavLink>
        </NavItem>
      </Nav>
    )
  }
}
