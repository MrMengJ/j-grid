import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { ICONS } from '../../../../../constants/icons';
import IconBtn from '../IconBtn';

class HeaderSetting extends Component {
  render() {
    const { className, style } = this.props;
    return (
      <IconBtn
        className={className}
        style={style}
        icon={ICONS.SETTING}
        iconProps={{
          viewBox: '0 0 1024 1024',
          color: '#051538',
        }}
        text={'表头设置'}
      />
    );
  }
}

HeaderSetting.propTypes = {
  className: PropTypes.string,
  style: PropTypes.object,
};

HeaderSetting.defaultProps = {
  className: '',
  style: {},
};

export default HeaderSetting;
