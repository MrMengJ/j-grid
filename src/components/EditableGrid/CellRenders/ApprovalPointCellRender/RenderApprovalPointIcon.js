import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { chunk, map } from 'lodash';

import { getMethodsWithBrackets } from './RenderApprovalMethods';
import { getOrderWithBrackets } from './RenderApprovalOrder';

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

const SpanWrapper = styled.div`
  display: inline-flex;
  margin: 1px;
  width: 14px;
  justify-content: center;
  align-items: center;
`;
const StyledSpan = styled.div`
  display: inline-flex;
  position: relative;
  color: #999999;
  svg {
    fill: #999999;
  }
  &::before {
    background: #e20d0d;
    position: absolute;
    width: 100%;
    height: 2px;
    top: 50%;
    left: 0;
    transform: translateY(-50%);
    content: '';
  }
`;
export const getApprovalPointIcon = ({
  approvalOrder,
  approvalMethods,
  approvalOrderBrackets,
  methodBrackets,
  disabled,
  isShowMethodsName,
}) => {
  let result = [];
  result = result.concat(
    getOrderWithBrackets(approvalOrder, approvalOrderBrackets, disabled)
  );
  const style = { display: 'inline-flex', margin: 1 };
  result = result.concat(
    getMethodsWithBrackets(
      style,
      disabled,
      approvalMethods,
      methodBrackets,
      isShowMethodsName
    )
  );
  return result;
};

function RenderApprovalPointIcon(props) {
  const {
    approvalOrder,
    approvalMethods,
    approvalOrderBrackets,
    methodBrackets,
    isNeedWrap,
    disable,
    isShowMethodsName,
    isDeleteStatus,
  } = props;
  const result = getApprovalPointIcon({
    approvalOrder,
    approvalMethods,
    approvalOrderBrackets,
    methodBrackets,
    disable,
    isShowMethodsName,
    isDeleteStatus,
  });
  if (isDeleteStatus) {
    return map(result, (item, index) => <StyledSpan key={index}>{item}</StyledSpan>);
  }
  if (isNeedWrap) {
    const chunkResult = chunk(result, 2);
    return map(chunkResult, (temp, index) => {
      return (
        <Wrapper key={index}>
          {map(temp, (item, index) => (
            <Fragment key={index}>{item}</Fragment>
          ))}
          {index !== 0 && temp.length < 2 && <SpanWrapper style={{ width: 14 }} />}
        </Wrapper>
      );
    });
  } else {
    return map(result, (item, index) => <Fragment key={index}>{item}</Fragment>);
  }
}
RenderApprovalPointIcon.propTypes = {
  isNeedWrap: PropTypes.bool,
  disable: PropTypes.bool,
};

RenderApprovalPointIcon.defaultProps = {
  isNeedWrap: false,
  disable: false,
};
export default RenderApprovalPointIcon;
