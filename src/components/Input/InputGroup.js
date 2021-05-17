import React, { Component } from 'react';
import styled from 'styled-components';
import { Classes, InputGroup as BpInputGroup } from '@blueprintjs/core';

import { getPrimaryColor, getRGBA } from '../../utils/style';

const StyledInputGroup = styled(BpInputGroup)`
  .${Classes.INPUT}.${Classes.ACTIVE}, .${Classes.INPUT}:focus {
    box-shadow: 0 0 0 1px ${(props) => getPrimaryColor(props.theme.PRIMARY_COLOR)},
      0 0 0 3px ${(props) => getRGBA(getPrimaryColor(props.theme.PRIMARY_COLOR), 0.3)},
      inset 0 1px 1px ${(props) => getRGBA(props.theme.BLACK, 0.2)};
  }
  .${Classes.INPUT} :disabled {
    color: #999999;
    background-color: ${(props) => (props.disabled ? '#eeeeee' : '')}!important;
    box-shadow: ${(props) => (props.disabled ? 'none' : '')}!important;
  }
  .bp3-button {
    padding: 3px !important;
  }
`;

class InputGroup extends Component {
  render() {
    return <StyledInputGroup {...this.props} />;
  }
}

InputGroup.propTypes = {};

export default InputGroup;
