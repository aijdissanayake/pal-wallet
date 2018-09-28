import React, { Component } from 'react';
import { remote } from 'electron';
import styles from './Version.scss';


class Version extends Component {
  constructor(props) {
    super(props)

    this.state = {
      appVersion: remote.app.getVersion(),
    };
  }

  render() {
    const { appVersion } = this.state;

    return (
      <div className={styles.version}>
        <span className={styles.currentVersion}>Version {appVersion}</span>
      </div>
    )
  }
}

export default Version;
