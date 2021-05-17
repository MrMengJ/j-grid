import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { get, isObject } from 'lodash';

import { getCellAlignCssValue } from '../../helper';

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: ${(props) => getCellAlignCssValue(props.align)};
  position: relative;
  height: 100%;
  padding: 0 8px;
`;

class CommonCellRender extends Component {
  constructor(props) {
    super(props);
    this.state = {
      value: props.value,
    };
  }

  refresh(params) {
    const { value } = params;
    this.setState({ value });

    // return true to tell the grid we refreshed successfully
    return true;
  }

  getRenderText = () => {
    const { value } = this.state;
    if (isObject(value)) {
      return get(value, 'value', '');
    }
    return value ? value : '';
  };

  render() {
    const { align } = this.props;
    return <Wrapper align={align}>{this.getRenderText()}</Wrapper>;
  }
}

CommonCellRender.propTypes = {
  value: PropTypes.any,
};

CommonCellRender.defaultProps = {};

export default CommonCellRender;
