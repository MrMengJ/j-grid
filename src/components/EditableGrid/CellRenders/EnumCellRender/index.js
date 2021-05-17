import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { find, get } from 'lodash';

import { getCellAlignCssValue } from '../../helper';

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: ${(props) => getCellAlignCssValue(props.align)};
  position: relative;
  height: 100%;
  padding: 0 8px;
`;

class EnumCellRender extends Component {
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

  render() {
    const { value } = this.state;
    const { colDef, align } = this.props;
    const item = find(colDef.data, (item) => item.id === get(value, 'enumId'));
    return <Wrapper align={align}>{get(item, 'name', '')}</Wrapper>;
  }
}

EnumCellRender.propTypes = {
  value: PropTypes.any,
};

EnumCellRender.defaultProps = {};

export default EnumCellRender;
