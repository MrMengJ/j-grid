/**
 * Combine all reducers in this file and export the combined reducers.
 * If we were to do this in store.js, reducers wouldn't be hot reloadable.
 */
import { combineReducers } from 'redux';
import { connectRouter } from 'connected-react-router';

import history from './utils/history';

/**
 * Creates the main reducer with the dynamically injected ones
 */
export default function createReducer(injectedReducers) {
  return combineReducers({
    router: connectRouter(history),
    ...injectedReducers,
  });
}
