import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Icon } from '@blueprintjs/core';
import { omit } from 'lodash';

const StyledIcon = styled(Icon)`
  svg {
    transition: fill 0.2s ease-in-out;
    fill: ${(props) => props.color};
  }
`;

function BpIcon(props) {
  const hovercolor = props.hoverColor;
  return <StyledIcon {...omit(props, 'hoverColor')} hovercolor={hovercolor} />;
}

BpIcon.propTypes = {
  hoverColor: PropTypes.string,
  color: PropTypes.string,
  // reference icon props from '@blueprintjs/core'
};

BpIcon.defaultProps = {
  color: '#999',
};

export default BpIcon;
