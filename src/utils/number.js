import { isNumber } from 'lodash';

export const isEven = (number) => {
  if (!isNumber(number)) {
    return false;
  }

  return !(number % 2);
};

export const isOdd = (number) => {
  if (!isNumber(number)) {
    return false;
  }
  return !!(number % 2);
};
