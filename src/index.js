import React, { Suspense } from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { ConnectedRouter } from 'connected-react-router';
import { enableES5 } from 'immer';
import 'normalize.css';
import '@blueprintjs/icons/lib/css/blueprint-icons.css';
import '@blueprintjs/core/lib/css/blueprint.css';

import App from './containers/App';
import reportWebVitals from './reportWebVitals';
import LoadingSpinner from './components/Loading/LoadingSpinner';
import ErrorBoundary from './components/ErrorBoundary';
import { GlobalStyle } from './globalStyle';
import configureStore from './configureStore';
import history from './utils/history';

enableES5();
const initialState = {};
export const store = configureStore(initialState, history);

ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <ConnectedRouter history={history}>
        <ErrorBoundary>
          <Suspense fallback={<LoadingSpinner />}>
            <GlobalStyle />
            <App />
          </Suspense>
        </ErrorBoundary>
      </ConnectedRouter>
    </Provider>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
