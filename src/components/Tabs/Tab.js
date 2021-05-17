import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

class Tab extends Component {
  static displayName = `Tab`;
  render() {
    const { className, panel } = this.props;
    return <div className={classNames(className)}>{panel}</div>;
  }
}

Tab.propTypes = {
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  disabled: PropTypes.bool,
  classNames: PropTypes.string,
  style: PropTypes.object,
  title: PropTypes.node,
  panel: PropTypes.node,
  panelClassName: PropTypes.string,
};

Tab.defaultProps = {
  disabled: false,
  className: '',
  style: {},
  title: null,
};

export default Tab;
