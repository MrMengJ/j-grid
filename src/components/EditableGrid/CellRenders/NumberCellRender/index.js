import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { get, isObject } from 'lodash';

import {
  getCellAlignCssValue,
  getCellDataIsChanged,
  getIsMatchHighlightText,
  getRowHasBeDeleted,
} from '../../helper';

import StatusIcon from './StatusIcon';

const Wrapper = styled.div`
  display: flex;
  justify-content: ${(props) => getCellAlignCssValue(props.align)};
  align-items: center;
  height: 100%;
  padding: 0 8px;
  background-color: ${(props) =>
    props.rowHasBeDeleted
      ? '#f6f6f6'
      : props.dataIsChanged
      ? '#EFC1C1'
      : props.isMatchHighlightText
      ? '#f8f888'
      : 'inherit'};
`;

const TextWrapper = styled.div``;

class NumberCellRender extends Component {
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
    const { shouldMarkDataStatus, data, align, highlightText, column } = this.props;
    const { value } = this.state;

    const isMatchHighlightText = getIsMatchHighlightText(highlightText, value);
    const operationType = get(data, 'operationType');
    const rowHasBeDeleted = getRowHasBeDeleted(operationType);
    const colId = get(column, 'colId');
    const dataIsChanged = getCellDataIsChanged(data, colId);

    return (
      <Wrapper
        align={align}
        isMatchHighlightText={isMatchHighlightText}
        rowHasBeDeleted={rowHasBeDeleted}
        dataIsChanged={dataIsChanged}
      >
        {shouldMarkDataStatus && <StatusIcon type={data.operationType} />}
        <TextWrapper>{isObject(value) ? JSON.stringify(value) : value}</TextWrapper>
      </Wrapper>
    );
  }
}

NumberCellRender.propTypes = {
  shouldMarkDataStatus: PropTypes.bool, // 是否显示当前数据状态 "增"、"删"、"改"
  value: PropTypes.any,
};

NumberCellRender.defaultProps = {
  shouldMarkDataStatus: false,
  value: '',
};

export default NumberCellRender;
