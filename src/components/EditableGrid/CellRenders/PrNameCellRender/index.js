import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { get, isNil } from 'lodash';

import {
  getCellDataIsChanged,
  getIsMatchHighlightText,
  getRowHasBeDeleted,
} from '../../helper';
import Icon from '../../../Icon';
import { ICONS } from '../../icons';

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  position: relative;
  height: 100%;
  padding: 4px 8px;
  background-color: ${(props) =>
    props.rowHasBeDeleted
      ? '#f6f6f6'
      : props.dataIsChanged
      ? '#EFC1C1'
      : props.isMatchHighlightText
      ? '#f8f888'
      : 'inherit'};
`;

const IconWrapper = styled.div`
  display: flex;
  justify-content: flex-end;
  line-height: 1;
`;

const Text = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex: 1;
  overflow: hidden;
`;

class PrNameCellRender extends Component {
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
    const { data, align, highlightText, column } = this.props;
    const { value } = this.state;

    const isMatchHighlightText = getIsMatchHighlightText(highlightText, value);
    const operationType = get(data, 'operationType');
    const rowHasBeDeleted = getRowHasBeDeleted(operationType);
    const colId = get(column, 'colId');
    const dataIsChanged = getCellDataIsChanged(data, colId);
    const text = get(value, 'value', '');

    return (
      <Wrapper
        isMatchHighlightText={isMatchHighlightText}
        rowHasBeDeleted={rowHasBeDeleted}
        dataIsChanged={dataIsChanged}
      >
        {data.inApproval && !isNil(value) && (
          <IconWrapper>
            <Icon
              icon={ICONS.IN_APPROVAL_MARK}
              tooltipProps={{ content: '事项处于任务中' }}
            />
          </IconWrapper>
        )}
        <Text align={align}>{text}</Text>
      </Wrapper>
    );
  }
}

PrNameCellRender.propTypes = {
  value: PropTypes.any,
};

PrNameCellRender.defaultProps = {
  value: {},
};

export default PrNameCellRender;
