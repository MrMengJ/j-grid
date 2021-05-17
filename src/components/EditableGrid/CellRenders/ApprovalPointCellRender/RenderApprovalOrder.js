import React, { Component, Fragment } from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { isEmpty, isNil, map } from 'lodash';

import { FEATURE_TOGGLE } from '../../../../constants/config';

import { getApprovalOrderMap } from './helper';

const SpanWrapper = styled.div`
  display: inline-flex;
  margin: 1px;
  width: ${(props) => (props.width ? `${props.width}px` : '14px')};
  justify-content: center;
  align-items: center;
`;

const BracketWrapper = styled.div`
  display: inline-flex;
  margin: 1px;
  width: 6px;
  justify-content: center;
  align-items: center;
  color: ${(props) => props.color};
`;

const renderOrder = (approvalOrder, disabled) => {
  const approvalOrderMap = getApprovalOrderMap();
  if (FEATURE_TOGGLE.approvalOrderWithCircle) {
    const strokeColor = disabled ? '#999' : '#000';
    return (
      <SpanWrapper>
        <svg viewBox="0 0 16 16" width="14" height="14">
          <circle
            cx="8"
            cy="8"
            r="7"
            stroke={strokeColor}
            fill="transparent"
            strokeWidth="1"
          />
          <text
            x={approvalOrder > 9 ? '1.5' : '4.3'}
            y={approvalOrder > 9 ? 11.5 : 12}
            fontSize={approvalOrder > 9 ? 10 : 12}
            fill={strokeColor}
            fontWeight="bold"
          >
            {approvalOrderMap[approvalOrder]}
          </text>
        </svg>
      </SpanWrapper>
    );
  } else {
    return <SpanWrapper width={approvalOrder > 9 ? 17 : 14}>{approvalOrder}</SpanWrapper>;
  }
};
export const getOrderWithBrackets = (approvalOrder, approvalOrderBrackets, disabled) => {
  const approvalOrderMap = getApprovalOrderMap();
  const fillColor = disabled ? '#999' : '#182026';
  if (isEmpty(approvalOrderMap[approvalOrder]) || isNil(approvalOrder)) {
    return [];
  }

  let result = [];
  if (approvalOrderBrackets) {
    result.push(<BracketWrapper color={fillColor}>(</BracketWrapper>);
  }
  result.push(renderOrder(approvalOrder, disabled));
  if (approvalOrderBrackets) {
    result.push(<BracketWrapper color={fillColor}>)</BracketWrapper>);
  }
  return result;
};

class RenderApprovalOrder extends Component {
  render() {
    const { approvalOrder, approvalOrderBrackets, disabled } = this.props;
    const result = getOrderWithBrackets(approvalOrder, approvalOrderBrackets, disabled);
    return map(result, (item, index) => <Fragment key={index}> {item}</Fragment>);
  }
}
RenderApprovalOrder.propTypes = {
  disabled: PropTypes.bool,
  approvalOrderBrackets: PropTypes.bool,
};

RenderApprovalOrder.defaultProps = {
  disabled: false,
  approvalOrderBrackets: false,
};

export default RenderApprovalOrder;
