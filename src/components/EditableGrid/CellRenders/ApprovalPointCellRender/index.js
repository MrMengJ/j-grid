import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Popover, PopoverInteractionKind } from '@blueprintjs/core';
import { filter, flatten, get, intersection, isEmpty, map } from 'lodash';

import { getCellAlignCssValue, getCellDataIsChanged } from '../../helper';
import { FEATURE_TOGGLE } from '../../../../constants/config';

import RenderApprovalContent from './RenderApprovalContent';
import {
  APPROVAL_POINT_METHODS,
  getMethodBgColor,
  getMethodIdsWithBgColor,
} from './helper';

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: ${(props) => getCellAlignCssValue(props.align)};
  position: relative;
  height: 100%;
  padding: 0 8px;
  background-color: ${(props) =>
    props.isNeedMarkDataStatus
      ? props.isCellDataChanged
        ? '#EFC1C1'
        : 'inherit'
      : props.isMethodsHasBgColor
      ? props.methodsColor
      : 'inherit'};
`;

const PopoverContentWrapper = styled(Wrapper)`
  padding: 0;
  background-color: ${(props) =>
    props.shouldMarkDataStatus
      ? props.isCellDataChanged
        ? '#EFC1C1'
        : 'inherit'
      : props.hasAuthInfo
      ? '#E5E5E5'
      : props.isMethodsHasBgColor
      ? props.methodsColor
      : 'inherit'};
`;

const PopoverContent = styled.div`
  min-width: 180px;
  max-width: 300px;
  padding: 15px;
  h5 {
    padding: 10px 5px;
    margin: 0;
  }
  .bp3-input {
    box-shadow: none;
  }
`;

const PopoverBox = styled(Popover)`
  height: 100%;
  .bp3-popover-target {
    height: 100%;
    width: 100%;
    overflow: hidden;
    &:focus {
      outline: none;
    }
  }
`;

class ApprovalPointCellRender extends Component {
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
    const { align, colDef, data, shouldMarkDataStatus } = this.props;
    const { allowManualInput, colId } = colDef;

    const dataIsChanged = getCellDataIsChanged(data, colId);
    if (allowManualInput && get(value, `manualInput.enabled`, false)) {
      const text = get(value, `manualInput.text`, '');
      return (
        <Wrapper
          align={align}
          dataIsChanged={dataIsChanged}
          shouldMarkDataStatus={shouldMarkDataStatus}
        >
          {text}
        </Wrapper>
      );
    }

    const values = get(value, 'values', []);
    if (FEATURE_TOGGLE.canMaintenanceCoOrganizer && !isEmpty(values)) {
      const approvalMethods = flatten(map(values, (item) => item.methods));
      const isMethodsHasBgColor = !isEmpty(
        intersection(approvalMethods, getMethodIdsWithBgColor(APPROVAL_POINT_METHODS))
      );
      const hasAuthInfo = !isEmpty(
        filter(
          values,
          (item) =>
            !isEmpty(get(item, 'authPeople', [])) ||
            !isEmpty(get(item, 'authorizedPeople', []))
        )
      );
      const popoverContent = (
        <PopoverContent
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <RenderApprovalContent
            data={values}
            hasAuthInfo={hasAuthInfo}
            isNormalDisPlay={true}
            isShowDescription={true}
            isShowMethodsName={FEATURE_TOGGLE.approvalMethodsWithName}
          />
        </PopoverContent>
      );

      return (
        <PopoverBox
          content={popoverContent}
          interactionKind={PopoverInteractionKind.HOVER}
          hoverOpenDelay={600}
          position={'left'}
        >
          <PopoverContentWrapper
            hasAuthInfo={hasAuthInfo}
            isMethodsHasBgColor={isMethodsHasBgColor}
            methodsColor={getMethodBgColor(APPROVAL_POINT_METHODS)}
            shouldMarkDataStatus={shouldMarkDataStatus}
            isCellDataChanged={dataIsChanged && shouldMarkDataStatus}
          >
            <RenderApprovalContent data={values} isNormalDisPlay={true} />
          </PopoverContentWrapper>
        </PopoverBox>
      );
    }

    return null;
  }
}

ApprovalPointCellRender.propTypes = {
  value: PropTypes.any,
};

ApprovalPointCellRender.defaultProps = {};

export default ApprovalPointCellRender;
