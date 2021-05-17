import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { get, map, sortBy } from 'lodash';

import { getCellAlignCssValue } from '../../helper';
import { CELL_VALUE_TYPE } from '../../constants';

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: ${(props) => getCellAlignCssValue(props.align)};
  position: relative;
  height: 100%;
  padding: 0 8px;
`;

class SpecialCellRender extends Component {
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
    const { colDef, align } = this.props;
    const { value } = this.state;
    const valueType = get(colDef, 'valueType', '');
    const system = get(value, 'value', []);
    const splitString = valueType === CELL_VALUE_TYPE.AUTH_TAG ? '、' : '/';
    const text = map(sortBy(system, 'sortId'), (item) => item.name).join(splitString);
    return <Wrapper align={align}>{text}</Wrapper>;
  }
}

SpecialCellRender.propTypes = {
  value: PropTypes.any,
};

SpecialCellRender.defaultProps = {};

export default SpecialCellRender;
