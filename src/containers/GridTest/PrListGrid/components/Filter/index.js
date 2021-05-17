import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { ICONS } from '../../../../../constants/icons';
import IconBtn from '../IconBtn';

class Filter extends Component {
  render() {
    const { className, style } = this.props;
    return (
      <IconBtn
        className={className}
        style={style}
        icon={ICONS.FILTER}
        iconProps={{
          viewBox: '0 0 1024 1024',
          color: '#051538',
        }}
        text={'筛选'}
      />
    );
  }
}

Filter.propTypes = {
  className: PropTypes.string,
  style: PropTypes.object,
};

Filter.defaultProps = {
  className: '',
  style: {},
};

export default Filter;
