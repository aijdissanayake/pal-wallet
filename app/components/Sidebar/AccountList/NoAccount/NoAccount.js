/*
NoAccount.js
===================
View to show when there are no accounts
*/
import React, { PureComponent } from 'react';
import styles from './NoAccount.scss';

export default class NoAccount extends PureComponent {
  render() {
    return (
      <div className={styles.noAccount}>
        <p>No account detected</p>
        <p><small>Import/create a wallet to begin</small></p>
      </div>
    )
  }
}
