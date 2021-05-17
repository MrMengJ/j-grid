import React, { Component } from 'react';
import styled from 'styled-components';
import { TagInput as BpTagInput, Classes } from '@blueprintjs/core';

import { getPrimaryColor, getRGBA } from '../../utils/style';

const StyledTagInput = styled(BpTagInput)`
  &.${Classes.INPUT}.${Classes.ACTIVE},
    &.${Classes.INPUT}:focus,
    &.${Classes.TAG_INPUT}.${Classes.ACTIVE} {
    box-shadow: 0 0 0 1px ${(props) => getPrimaryColor(props.theme.PRIMARY_COLOR)},
      0 0 0 3px ${(props) => getRGBA(getPrimaryColor(props.theme.PRIMARY_COLOR), 0.3)},
      inset 0 1px 1px ${(props) => getRGBA(props.theme.BLACK, 0.2)};
  }
  ,
  .${Classes.INPUT} :disabled {
    color: #999999;
    background-color: ${(props) => (props.disabled ? '#eeeeee' : '')}!important;
    box-shadow: ${(props) => (props.disabled ? 'none' : '')}!important;
  }
  .bp3-button {
    padding: 3px !important;
  }
  ${(props) => (props.maxHeight ? `max-height:${props.maxHeight}px;overflow-y:auto` : '')}
`;

class TagInput extends Component {
  render() {
    return <StyledTagInput {...this.props} />;
  }
}

TagInput.propTypes = {
  //    reference BpTagInput
};

export default TagInput;
