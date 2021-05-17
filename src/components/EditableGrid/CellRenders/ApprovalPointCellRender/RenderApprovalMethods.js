import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { findIndex, forEach, isArray, isEmpty, map } from 'lodash';

import Icon from '../../../Icon';

import { APPROVAL_METHODS, ON_DEMAND_ICON, SPECIAL_ICON } from './constant';
import { APPROVAL_POINT_METHODS, getMethodsImgIcon } from './helper';

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  padding: 2px 4px;
  margin: 2px 6px 2px;
  border-radius: 6px;
  flex-wrap: wrap;
  border: 1px solid #eeeeee;
`;

const Name = styled.span`
  margin-right: 2px;
`;

const IconWrapper = styled.div`
  display: flex;
  align-items: center;
  cursor: ${(props) => (props.disabled ? 'not-allowed;' : 'pointer')};
  &:focus {
    outline: none !important;
  }
`;

const StyledIcon = styled(Icon)`
  ${(props) => (props.disabled ? 'cursor: not-allowed;' : '')};
`;

const BracketWrapper = styled.div`
  display: inline-flex;
  margin: 1px;
  width: 6px;
  justify-content: center;
  align-items: center;
  color: ${(props) => props.color};
`;

const renderMethods = (style, method, disabled) => {
  const APPROVAL_METHODS_IMG_ICON = getMethodsImgIcon();
  const fillColor = disabled ? '#999' : '#182026';
  const width =
    APPROVAL_METHODS_IMG_ICON[method] === SPECIAL_ICON[APPROVAL_METHODS_IMG_ICON[method]]
      ? 42
      : APPROVAL_METHODS_IMG_ICON[method] ===
        ON_DEMAND_ICON[APPROVAL_METHODS_IMG_ICON[method]]
      ? 28
      : 14;
  const viewBox =
    APPROVAL_METHODS_IMG_ICON[method] === SPECIAL_ICON[APPROVAL_METHODS_IMG_ICON[method]]
      ? '0 0 42 16'
      : APPROVAL_METHODS_IMG_ICON[method] ===
        ON_DEMAND_ICON[APPROVAL_METHODS_IMG_ICON[method]]
      ? '0 0 28 16'
      : '0 0 16 16';
  if (APPROVAL_METHODS_IMG_ICON[method] === 'SOLID_STAR') {
    return (
      <IconWrapper style={style} disabled={disabled}>
        <svg height={14} width={width} viewBox={viewBox} fill={fillColor}>
          <polygon points="16,6.1 10.5,5.3 8,0.3 5.5,5.3 0,6.1 4,10 3.1,15.5 8,12.9 12.9,15.5 12,10 16,6.1 " />
        </svg>
      </IconWrapper>
    );
  }
  if (APPROVAL_METHODS_IMG_ICON[method] === 'SOLID_STAR_ON_DEMAND') {
    return (
      <IconWrapper style={style} disabled={disabled}>
        <svg height={14} width={width} viewBox={viewBox} fill={fillColor}>
          <g>
            <path d="M3.3,13.9c-1.4-1.5-2.1-3.4-2.1-5.5c0-2.2,0.7-4.1,2.1-5.6h1c-1.3,1.5-2,3.4-2,5.5s0.7,4,2.1,5.5L3.3,13.9L3.3,13.9z" />
            <path d="M25.3,13.9h-1c1.4-1.6,2.1-3.4,2.1-5.6c0-2.1-0.7-4-2.1-5.5h1c1.4,1.5,2.1,3.4,2.1,5.5C27.3,10.5,26.6,12.3,25.3,13.9z" />
          </g>
          <polygon points="22,6.1 16.5,5.3 14,0.3 11.5,5.3 6,6.1 10,10 9.1,15.5 14,12.9 18.9,15.5 18,10 22,6.1 " />
        </svg>
      </IconWrapper>
    );
  }
  if (APPROVAL_METHODS_IMG_ICON[method] === 'HOLLOW_STAR_ON_DEMAND') {
    return (
      <IconWrapper style={style} disabled={disabled}>
        <svg height={14} width={width} viewBox={viewBox} fill={fillColor}>
          <g>
            <path d="M3.4,13.6C2,12.1,1.3,10.2,1.3,8.1C1.3,5.9,2,4,3.4,2.5h1c-1.3,1.5-2,3.4-2,5.5s0.7,4,2.1,5.5L3.4,13.6L3.4,13.6z" />
            <path d="M25.4,13.6h-1c1.4-1.6,2.1-3.4,2.1-5.6c0-2.1-0.7-4-2.1-5.5h1c1.4,1.5,2.1,3.4,2.1,5.5C27.4,10.2,26.7,12,25.4,13.6z" />
          </g>
          <path d="M22.8,6.1L17,5.3L14.4,0l-2.6,5.3L5.9,6.1l4.2,4.1L9.2,16l5.1-2.7l5.3,2.7l-1.1-5.8L22.8,6.1L22.8,6.1z M14.4,12l-3.7,2 l0.7-4.1l-3-2.9l4.1-0.6l1.9-3.8l1.9,3.8l4.1,0.6l-2.9,2.9l0.7,4.1L14.4,12L14.4,12z" />
        </svg>
      </IconWrapper>
    );
  }
  if (APPROVAL_METHODS_IMG_ICON[method] === 'DOUBLE_CIRCLE') {
    return (
      <IconWrapper style={style} disabled={disabled}>
        <svg height={14} width={width} viewBox={viewBox} fill={fillColor}>
          <circle cx="8" cy="8" r="4.2" />
          <g>
            <path
              d="M8,16c-4.4,0-8-3.6-8-8s3.6-8,8-8s8,3.6,8,8S12.4,16,8,16z M8,1.5C4.4,1.5,1.5,4.4,1.5,8s2.9,6.5,6.5,6.5s6.5-2.9,6.5-6.5
		S11.6,1.5,8,1.5z"
            />
          </g>
        </svg>
      </IconWrapper>
    );
  }
  if (APPROVAL_METHODS_IMG_ICON[method] === 'DOUBLE_CIRCLE_ON_DEMAND') {
    return (
      <IconWrapper style={style} disabled={disabled}>
        <svg height={14} width={width} viewBox={viewBox} fill={fillColor}>
          <circle cx="14.4" cy="8" r="4.2" />
          <g>
            <path
              d="M14.4,16c-4.4,0-8-3.6-8-8s3.6-8,8-8s8,3.6,8,8S18.8,16,14.4,16z M14.4,1.5c-3.6,0-6.5,2.9-6.5,6.5s2.9,6.5,6.5,6.5
		s6.5-2.9,6.5-6.5S18,1.5,14.4,1.5z"
            />
          </g>
          <g>
            <path d="M3.3,13.9c-1.4-1.5-2.1-3.4-2.1-5.5c0-2.2,0.7-4.1,2.1-5.6h1c-1.3,1.5-2,3.4-2,5.5s0.7,4,2.1,5.5L3.3,13.9L3.3,13.9z" />
            <path d="M25.3,13.9h-1c1.4-1.6,2.1-3.4,2.1-5.6c0-2.1-0.7-4-2.1-5.5h1c1.4,1.5,2.1,3.4,2.1,5.5C27.3,10.5,26.6,12.3,25.3,13.9z" />
          </g>
        </svg>
      </IconWrapper>
    );
  }
  return (
    <StyledIcon
      disabled={disabled}
      style={style}
      icon={APPROVAL_METHODS[APPROVAL_METHODS_IMG_ICON[method]]}
      color={fillColor}
      size={14}
      width={width}
      viewBox={viewBox}
    />
  );
};

export const getMethodsWithBrackets = (
  style,
  disabled,
  methods,
  methodBrackets,
  isShowMethodsName
) => {
  if (methods && !isEmpty(methods)) {
    const fillColor = disabled ? '#999' : '#182026';
    let result = [];
    if (methodBrackets) {
      result.push(<BracketWrapper color={fillColor}>(</BracketWrapper>);
    }
    const APPROVAL_METHODS_IMG_ICON = getMethodsImgIcon();
    const tempMethods = isArray(methods) ? methods : [methods];
    forEach(tempMethods, (method) => {
      if (APPROVAL_METHODS_IMG_ICON[method]) {
        if (isShowMethodsName) {
          const index = findIndex(APPROVAL_POINT_METHODS, (item) => item.id === method);
          const name = index !== -1 ? APPROVAL_POINT_METHODS[index].name : '';
          result.push(
            <Wrapper>
              <Name>{name}</Name>
              {renderMethods(style, method, disabled)}
            </Wrapper>
          );
        } else {
          result.push(renderMethods(style, method, disabled));
        }
      }
    });
    if (methodBrackets) {
      result.push(<BracketWrapper color={fillColor}>)</BracketWrapper>);
    }
    return result;
  } else {
    return [];
  }
};

function RenderApprovalMethods(props) {
  const { style, methods, methodBrackets, disabled, isShowMethodsName } = props;
  const result = getMethodsWithBrackets(
    style,
    disabled,
    methods,
    methodBrackets,
    isShowMethodsName
  );
  return map(result, (item, index) => <Fragment key={index}>{item}</Fragment>);
}

RenderApprovalMethods.propTypes = {
  methods: PropTypes.oneOfType([PropTypes.array, PropTypes.string]),
  isShowMethodsName: PropTypes.bool,
  methodBrackets: PropTypes.bool,
  disable: PropTypes.bool,
};

RenderApprovalMethods.defaultProps = {
  isShowMethodsName: false,
  methodBrackets: false,
  disabled: false,
};

export default RenderApprovalMethods;
