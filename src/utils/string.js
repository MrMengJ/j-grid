import { forEach } from 'lodash';

/**
 *
 *  Get string actual length
 *  Chinese take 2, English take 1
 * @param {string} str  The string
 * @returns {number} Returns string length
 *
 */
export const getStringLength = (str) => {
  let result = 0,
    charCode = -1;
  forEach(str, (item, i) => {
    charCode = str.charCodeAt(i);
    if (charCode >= 0 && charCode <= 128) {
      result += 1;
    } else {
      result += 2;
    }
  });
  return result;
};

/**
 *
 * Slice string
 * @param {string} str  The string
 * @param {number} limitLength  Limit length
 * @returns {string} Returns sliced string
 *
 */
export const sliceString = (str, limitLength) => {
  if (getStringLength(str) <= limitLength) {
    return str;
  } else {
    const getStr = (str, limitLength, start = 0, end = str.length - 1) => {
      const middle = Math.floor((start + end) / 2);
      const middleStr = str.substr(0, middle);
      const middleStrLength = getStringLength(middleStr);
      if (end <= start) {
        return middleStr;
      }
      if (middleStrLength > limitLength) {
        const end = middle - 1;
        return getStr(str, limitLength, start, end);
      } else if (middleStrLength < limitLength - 1) {
        const start = middle + 1;
        return getStr(str, limitLength, start, end);
      } else {
        return middleStr;
      }
    };
    return getStr(str, limitLength);
  }
};
