import React from 'react';
import styled, { ThemeProvider } from 'styled-components';
import { Redirect, Route, Switch } from 'react-router-dom';

import theme from '../../constants/theme';
import GridTest from '../GridTest';

const Wrapper = styled.div`
  max-width: 2560px;
  min-width: 1280px;
  height: 100%;
  margin: 0 auto;
  overflow-y: auto;
`;

function App() {
  return (
    <ThemeProvider
      theme={{
        ...theme.default,
        PRIMARY_COLOR: '#4185f3',
      }}
    >
      <Wrapper>
        <Switch>
          <Route exact path={'/grid-test'} component={GridTest} />
          <Redirect to={'/grid-test'} />
        </Switch>
      </Wrapper>
    </ThemeProvider>
  );
}

export default App;
