import React from 'react';
import { TextArea as BpTextArea } from '@blueprintjs/core';
import styled from 'styled-components';
import { getPrimaryColor, getRGBA } from '../../utils/style';

const StyledBpTextArea = styled(BpTextArea)`
  resize: none;
  background-color: ${(props) => (props.disabled ? '#eeeeee' : '')}!important;
  box-shadow: ${(props) => (props.disabled ? 'none' : '')}!important;
  &:focus {
    box-shadow: 0 0 0 1px ${(props) => getPrimaryColor(props.theme.PRIMARY_COLOR)},
      0 0 0 3px ${(props) => getRGBA(getPrimaryColor(props.theme.PRIMARY_COLOR), 0.3)},
      inset 0 1px 1px
        ${(props) => getRGBA(getPrimaryColor(props.theme.PRIMARY_COLOR), 0.2)}!important;
  }
`;

function TextArea(props) {
  return <StyledBpTextArea {...props} />;
}

TextArea.propTypes = {};

export default TextArea;
