/*
Box.js
===================
Generic box component to display data
*/
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styles from './Box.scss';

class Box extends Component {
  constructor(props) {
    super(props);

    this.getContentClass = this.getContentClass.bind(this);
  }

  getContentClass() {
    const { noPadding } = this.props;
    const classnames = [styles.box__content];

    if (noPadding) {
      classnames.push('p-0');
    }

    return classnames.join(' ');
  }

  renderTitle = (title) => {
    if (title) {
      return (<h4 className={styles.box__title}>{title}</h4>);
    }

    return null;
  }

  render() {
    const { children, title } = this.props;

    return (
      <div className={styles.box}>
        {this.renderTitle(title)}
        <div className={this.getContentClass()}>
          {children}
        </div>
      </div>
    )
  }
}


Box.defaultProps = {
  children: null,
  title: '',
  noPadding: false,
};

Box.propTypes = {
  children: PropTypes.node,
  title: PropTypes.string,
  noPadding: PropTypes.bool,
};

export default Box;
