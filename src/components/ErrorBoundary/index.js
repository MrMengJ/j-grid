import React, { Component } from 'react';
import styled from 'styled-components';
import { Button, Intent, NonIdealState } from '@blueprintjs/core';

const Wrapper = styled.div`
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
`;

const StyledButton = styled(Button)`
  width: 60px;
  &:focus {
    outline: none;
  }
`;

class ErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  handleRetry = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <Wrapper>
          <NonIdealState
            title="网络繁忙"
            action={
              <StyledButton intent={Intent.NONE} onClick={this.handleRetry} text="刷新" />
            }
            description="抱歉，请稍后再试"
          />
        </Wrapper>
      );
    }
    return this.props.children;
  }
}

ErrorBoundary.propTypes = {};

export default ErrorBoundary;
