import React, { Suspense } from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';

import App from './containers/App';
import reportWebVitals from './reportWebVitals';
import LoadingSpinner from './components/Loading/LoadingSpinner';
import ErrorBoundary from './components/ErrorBoundary';
import { GlobalStyle } from './globalStyle';
import configureStore from './configureStore';
import history from './utils/history';

const initialState = {};
export const store = configureStore(initialState, history);

ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <ErrorBoundary>
        <Suspense fallback={<LoadingSpinner />}>
          <GlobalStyle />
          <App />
        </Suspense>
      </ErrorBoundary>
    </Provider>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
