import { endsWith, isEmpty } from 'lodash';
import { parse } from 'query-string';
import history from '../utils/history';

export const composeQuery = (compose) => {
  return `?compose=${compose}`;
};

export const goBack = () => {
  const { pathname, search } = history.location;
  const compose = parse(search).compose;
  if (endsWith(pathname, '/edit')) {
    history.push(pathname.substring(0, pathname.length - '/edit'.length));
  } else if (!isEmpty(compose)) {
    history.push(pathname);
  } else {
    history.goBack();
  }
};
