import memoizeOne from 'memoize-one';
import { v4 } from 'uuid';
import {
  cloneDeep,
  filter,
  find,
  findIndex,
  forEach,
  get,
  includes,
  isEmpty,
  isNil,
  isNull,
  map,
} from 'lodash';

import { ACTION_TYPE, CELL_VALUE_TYPE } from './constants';

export const getRowDefaultHeight = () => 48;

const isRootPr = (item) => {
  return get(item, 'parentType') === 'FUNCTION';
};

const getRootAncestor = (allData, self) => {
  const selfIsRootPr = isRootPr(self);
  if (isNil(self) || selfIsRootPr) {
    return;
  }
  const selfParent = find(allData, (item) => {
    return item.id === self.parentId;
  });
  if (isRootPr(selfParent)) {
    return selfParent;
  } else {
    return getRootAncestor(allData, selfParent);
  }
};

export const produceRowData = memoizeOne(({ rowData }) => {
  return isNull(rowData)
    ? null
    : map(rowData, (item, index) => {
        return {
          height:
            !isNil(item.height) && item.height >= 0 ? item.height : getRowDefaultHeight(),
          ...item,
          index,
        };
      });
});

export const moveInArray = (arr, fromIndex, toIndex) => {
  const element = arr[fromIndex];
  arr.splice(fromIndex, 1);
  arr.splice(toIndex, 0, element);
};

const SPECIAL_CHARS_REGEXP = /([:\-_]+(.))/g;
const MOZ_HACK_REGEXP = /^moz([A-Z])/;

const camelCase = (name) => {
  return name
    .replace(SPECIAL_CHARS_REGEXP, (_, separator, letter, offset) =>
      offset ? letter.toUpperCase() : letter
    )
    .replace(MOZ_HACK_REGEXP, 'Moz$1');
};

// getStyle
export const getStyle = (element, styleName) => {
  if (!element || !styleName) return null;
  styleName = camelCase(styleName);
  if (styleName === 'float') {
    styleName = 'cssFloat';
  }
  const elementStyle = get('element', 'style', {});
  if (elementStyle[styleName]) {
    return elementStyle[styleName];
  }
  const computed = document.defaultView.getComputedStyle(element, '') || {};
  return computed[styleName];
};

export const getCurrentRowData = (gridApi) => {
  if (!gridApi) {
    return [];
  }

  const result = [];
  gridApi.forEachNode((node) => {
    const { data, group } = node;
    if (!group && data) {
      result.push(data);
    }
  });
  return result;
};

const getRootHeaders = (flatArr) => {
  return filter(flatArr, (item) => item.parentId === '0');
};

export const getNestedColumns = (flatArr) => {
  let result;
  const rootHeaders = getRootHeaders(flatArr);
  result = cloneDeep(rootHeaders);

  const existChild = (data, flatArr) => {
    return findIndex(flatArr, (item) => item.parentId === data.id) > -1;
  };

  const getChildren = (data, flatArr) => {
    return filter(flatArr, (item) => item.parentId === data.id);
  };

  const attachChildren = (data, flatArr) => {
    if (existChild(data, flatArr)) {
      data.children = getChildren(data, flatArr);
      data.marryChildren = true;
      forEach(data.children, (item) => {
        attachChildren(item, flatArr);
      });
    }
  };

  forEach(result, (item) => {
    attachChildren(item, flatArr);
  });

  return result;
};

export const copyRow = (row, isCreate = false) => {
  if (isCreate) {
    const needIgnoredField = ['id', 'number', 'sortId', 'index'];
    const result = {};
    forEach(row, (item, key) => {
      if (!includes(needIgnoredField, key)) {
        result[key] = item;
      } else {
        result[key] = null;
      }
    });
    return { ...result, id: v4(), number: null, sortId: row.sortId + 1 };
  }

  return cloneDeep(row);
};

export const isLeftAlign = (align) => {
  return align === 'left';
};

export const isCenterAlign = (align) => {
  return align === 'center';
};

export const isRightAlign = (align) => {
  return align === 'right';
};

export const getCellAlignCssValue = (align) => {
  let justifyContent = 'flex-start';
  if (isLeftAlign(align)) {
    justifyContent = 'flex-start';
  } else if (isCenterAlign(align)) {
    justifyContent = 'center';
  } else if (isRightAlign(align)) {
    justifyContent = 'flex-end';
  }
  return justifyContent;
};

export const checkValueHasChanged = memoizeOne((row, columnKey) => {
  const showDiffData = get(row, 'showDiffData', false);
  const diffData = get(row, `diffData.${columnKey}`, null);
  return showDiffData && !isNull(diffData);
});

export const getCellDataIsChanged = (row, columnKey) => {
  return checkValueHasChanged(row, columnKey);
};

export const getIsMatchHighlightText = (highlightText, cellValue) => {
  return !isEmpty(highlightText) && includes(cellValue, highlightText);
};

export const getRowHasBeDeleted = (operationType) => {
  return ACTION_TYPE[operationType] === ACTION_TYPE.DELETED;
};

export const getColumnWidth = (column) => {
  return column.actualWidth;
};

export const getIsPrName = (valueType) => {
  return valueType === CELL_VALUE_TYPE.PR_NAME;
};
