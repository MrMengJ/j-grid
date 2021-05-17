import { isElement } from 'lodash';

const BASE = 128;

export const calcBodyFontSize = (element) => {
  return isElement(element) ? element.scrollWidth / BASE : 14;
};
