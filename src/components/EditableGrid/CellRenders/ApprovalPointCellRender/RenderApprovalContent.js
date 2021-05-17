import React, { Fragment, useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { get, map, slice, noop, isEmpty, isString, isNil } from 'lodash';

import { isUnEmptyArray } from '../../../../utils/array';

import { getApprovalOrderMap, getNewContent, sortedValuesName } from './helper';
import RenderApprovalOrder from './RenderApprovalOrder';
import RenderApprovalMethods from './RenderApprovalMethods';

const ApprovalContent = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  overflow: hidden;
  justify-content: center;
`;

const ApprovalIconWrapper = styled.div`
  align-items: center;
  ${(props) =>
    props.isDiff
      ? 'display: flex;flex-wrap: wrap;margin-bottom: 6px;'
      : props.isShowDescription
      ? 'width: 100%;'
      : 'overflow: hidden;  white-space: nowrap; text-overflow: ellipsis;'};
`;

const CoOrganizerWrapper = styled.div`
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: center;
  ${(props) => (props.isShowMethodsName ? '  flex-direction: column;' : '')}
  ${(props) =>
    props.isShowDescription ? 'margin-bottom: 6px;justify-content: left;' : ''};
  ${(props) =>
    props.hasBorder
      ? 'border-top: 1px solid #e6ecef;padding-top:10px;  margin-top: 10px;'
      : ''}
`;

const NameContent = styled.div`
  display: flex;
  flex: 1;
  width: 100%;
  flex-direction: column;
`;
const Description = styled.div`
  display: flex;
  margin-bottom: 3px;
  width: 100%;
`;
const Label = styled.div`
  display: flex;
  color: #808080;
`;
const Content = styled.div`
  display: flex;
  flex: 1;
  flex-wrap: wrap;
`;

const TestSpan = styled.div`
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
  ${(props) =>
    props.isName
      ? 'display:block;overflow: hidden;white-space: nowrap;text-overflow: ellipsis;'
      : ''}
`;
const More = styled.div`
  display: flex;
  color: #4285f4;
  cursor: pointer;
  justify-content: flex-end;
`;

function RenderApprovalContent(props) {
  const {
    data,
    isDeleteStatus,
    onHeightChange,
    isNormalDisPlay,
    isShowDescription,
    hasAuthInfo,
    isShowMethodsName,
    isDiff,
  } = props;

  const [isExpand, setIsExpand] = useState(true);
  const [disPlayData, setDisplayData] = useState(data);
  const wrapperRef = useRef();

  useEffect(() => {
    if (data.length > 2 && !isNormalDisPlay && isUnEmptyArray(data)) {
      setDisplayData(slice(data, 0, 1));
      setIsExpand(false);
    } else {
      setDisplayData(data);
      setIsExpand(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  useEffect(() => {
    if (
      data.length > 2 &&
      !isNormalDisPlay &&
      isUnEmptyArray(data) &&
      wrapperRef &&
      wrapperRef.current &&
      isExpand
    ) {
      if (onHeightChange) {
        onHeightChange(wrapperRef.current.scrollHeight);
      }
    }
    // eslint-disable-next-line
  }, [disPlayData]);

  const handleExpand = () => {
    setDisplayData(data);
    setIsExpand(true);
  };

  const renderAuthInfo = (value) => {
    if (hasAuthInfo) {
      const authPeople = get(value, 'authPeople', []);
      const authorizedPeople = get(value, 'authorizedPeople', []);
      return (
        <>
          <Description>
            <Label>授权人：</Label>
            <Content>
              {isEmpty(authPeople)
                ? '无'
                : map(authPeople, (item) => item.name).join('、')}
            </Content>
          </Description>
          <Description>
            <Label>被授权人：</Label>
            <Content>
              {isEmpty(authorizedPeople)
                ? '无'
                : map(authorizedPeople, (item) => item.name).join('、')}
            </Content>
          </Description>
        </>
      );
    } else {
      return null;
    }
  };

  const renderReferenceData = (orgName, positionName, isDeleteStatus) => {
    if (isShowMethodsName) {
      return (
        <>
          {!isEmpty(orgName) && (
            <Description>
              <Label>部门：</Label>
              <Content>{orgName}</Content>
            </Description>
          )}
          {!isEmpty(positionName) && (
            <Description>
              <Label>岗位组：</Label>
              <Content>{positionName}</Content>
            </Description>
          )}
        </>
      );
    } else {
      const tempText = (orgName + positionName).split('');
      if (isDeleteStatus) {
        return map(tempText, (item, index) => <TestSpan key={index}>{item}</TestSpan>);
      }
      return map(tempText, (item, index) => <span key={index}>{item}</span>);
    }
  };

  const renderApproval = (value) => {
    if (isShowMethodsName) {
      const methods = get(value, 'methods', []);
      const approvalOrder = get(value, 'approvalOrder', null);
      const approvalOrderBrackets = get(value, 'approvalOrderBrackets', false);
      const methodBrackets = get(value, 'methodBrackets', false);
      const style = { display: 'inline-flex', margin: 1 };
      const approvalOrderMap = getApprovalOrderMap();
      return (
        <NameContent>
          <Description>
            <Label>审批顺序：</Label>
            <Content>
              {!isEmpty(approvalOrderMap[approvalOrder]) && !isNil(approvalOrder) ? (
                <RenderApprovalOrder
                  approvalOrder={approvalOrder}
                  approvalOrderBrackets={approvalOrderBrackets}
                />
              ) : (
                '无'
              )}
            </Content>
          </Description>
          <Description>
            <Label style={{ lineHeight: '28px' }}>审批方式：</Label>
            <Content>
              {!isEmpty(methods) ? (
                <RenderApprovalMethods
                  style={style}
                  methods={methods}
                  methodBrackets={methodBrackets}
                  isShowMethodsName={isShowMethodsName}
                />
              ) : (
                '无'
              )}
            </Content>
          </Description>
        </NameContent>
      );
    } else {
      return getNewContent(value, false, isShowMethodsName);
    }
  };

  if (isDeleteStatus) {
    if (isString(disPlayData)) {
      return (
        <ApprovalIconWrapper>
          {map(disPlayData.split(''), (item, index) => {
            return (
              <TestSpan key={index} isName={true}>
                {item}
              </TestSpan>
            );
          })}
        </ApprovalIconWrapper>
      );
    }
    return (
      <ApprovalContent ref={wrapperRef}>
        {map(disPlayData, (tempItem, index) => {
          const position = sortedValuesName(get(tempItem, 'referenceData', []));
          const organization = sortedValuesName(get(tempItem, 'organization', []));
          return (
            <CoOrganizerWrapper key={index}>
              <ApprovalIconWrapper isDiff={true}>
                {getNewContent(tempItem, true, isShowMethodsName, isDeleteStatus)}
                {renderReferenceData(organization, position, isDeleteStatus)}
              </ApprovalIconWrapper>
            </CoOrganizerWrapper>
          );
        })}
        {!isExpand && !isEmpty(disPlayData) && <More onClick={handleExpand}>更多</More>}
      </ApprovalContent>
    );
  } else {
    if (isString(disPlayData)) {
      return <ApprovalIconWrapper>{disPlayData}</ApprovalIconWrapper>;
    }
    return (
      <ApprovalContent ref={wrapperRef}>
        {map(disPlayData, (item, index) => {
          const organization = sortedValuesName(get(item, 'organization', []));
          const position = sortedValuesName(get(item, 'referenceData', []));
          const description = get(item, 'description', '');
          return (
            <Fragment key={item.id}>
              <CoOrganizerWrapper
                isShowMethodsName={isShowMethodsName}
                isNormalDisPlay={isNormalDisPlay}
                isShowDescription={isShowDescription}
                hasBorder={index !== 0 && isShowDescription}
              >
                <ApprovalIconWrapper
                  isShowDescription={isShowDescription}
                  isDiff={isDiff}
                >
                  {renderApproval(item)}
                  {renderReferenceData(organization, position)}
                </ApprovalIconWrapper>
              </CoOrganizerWrapper>
              {renderAuthInfo(item)}
              {isShowDescription && (
                <Description>
                  <Label>审批要点：</Label>
                  <Content>{isEmpty(description) ? '无' : description}</Content>
                </Description>
              )}
            </Fragment>
          );
        })}
        {!isExpand && !isEmpty(disPlayData) && <More onClick={handleExpand}>更多</More>}
      </ApprovalContent>
    );
  }
}

RenderApprovalContent.propTypes = {
  data: PropTypes.oneOfType([PropTypes.array, PropTypes.object]).isRequired,
  isDeleteStatus: PropTypes.bool,
  onHeightChange: PropTypes.func,
  isNormalDisPlay: PropTypes.bool,
  isShowDescription: PropTypes.bool,
  hasAuthInfo: PropTypes.bool,
  isShowMethodsName: PropTypes.bool,
};

RenderApprovalContent.defaultProps = {
  isDeleteStatus: false,
  onHeightChange: noop,
  isNormalDisPlay: false,
  isShowDescription: false,
  hasAuthInfo: false,
  isShowMethodsName: false,
};

export default RenderApprovalContent;
