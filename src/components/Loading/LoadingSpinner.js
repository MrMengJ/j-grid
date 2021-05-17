import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Classes, Intent, NonIdealState, Spinner } from '@blueprintjs/core';

import { getPrimaryColor } from '../../utils/style';

const StyledSpinner = styled(Spinner)`
  &.${Classes.INTENT_PRIMARY} .${Classes.SPINNER_HEAD} {
    stroke: ${(props) => getPrimaryColor(props.theme.PRIMARY_COLOR)};
  }
`;

function LoadingSpinner({ className }) {
  return (
    <NonIdealState className={className}>
      <StyledSpinner intent={Intent.PRIMARY} />
    </NonIdealState>
  );
}

LoadingSpinner.propTypes = {
  className: PropTypes.string,
};

export default LoadingSpinner;
