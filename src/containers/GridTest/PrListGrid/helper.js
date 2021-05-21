import { v4 } from 'uuid';
import {
  cloneDeep,
  filter,
  find,
  findIndex,
  forEach,
  get,
  has,
  isNil,
  lowerCase,
  map,
  sortBy,
} from 'lodash';

import { isOdd } from '../../../utils/number';

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
      // data.marryChildren = false;
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

export const produceCommonColOptions = (column) => {
  const getWidth = (width) => {
    return width ? width : 100;
  };

  const getColId = (column) => {
    const { id, valueType } = column;
    if (valueType === 'PR_NUMBER') {
      return 'number';
    } else if (valueType === 'PR_NAME') {
      return 'name';
    } else {
      return id;
    }
  };

  const getPinned = (data) => {
    if (has(data, 'fixed')) {
      return lowerCase(data.fixed);
    }
  };

  const getEditable = (data) => {
    return has(data, 'editable') ? data.editable : true;
  };

  const { id, name, parentId, width } = column;
  return {
    ...column,
    id,
    name,
    parentId,
    headerName: name,
    headerTooltip: name,
    editable: getEditable(column),
    width: getWidth(width),
    colId: getColId(column),
    field: getColId(column),
    pinned: getPinned(column),
  };
};

export const produceRowData = (rowData) => {
  const attachChildPrNameValue = (rowData) => {
    return map(rowData, (item, index) => {
      if (isOdd(index)) {
        return {
          ...item,
          'prName-1': {
            id: 'b9be1e9d-2d12-409d-bdf4-fe3942e4c604',
            value: '我是事项111111',
          },
          'prName-2': {
            id: item.id,
            value: item.name,
          },
        };
      }

      return {
        ...item,
        'prName-1': {
          id: v4(),
          value: '我是事项1',
        },
      };
    });
  };

  return attachChildPrNameValue(
    map(sortBy(rowData, 'sortId'), (item) => {
      const { data, ...others } = item;
      return {
        ...others,
        ...data,
      };
    })
  );
};

export const arr2ObjByKey = (arr, key) => {
  const result = {};
  forEach(arr, (item) => {
    result[item[key]] = item;
  });
  return result;
};

export const getPrFunctionRowData = (allRowData, self, prFunctions) => {
  const rootAncestor = getRootAncestor(allRowData, self);
  return rootAncestor
    ? findChildPrFunctionById(rootAncestor.parentId, prFunctions)
    : findChildPrFunctionById(self.parentId, prFunctions);
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

const isRootPr = (item) => {
  return get(item, 'parentType') === 'FUNCTION';
};

const findChildPrFunctionById = (id, prFunctions) => {
  return findPrFunctionById(prFunctions, id);
};

const findPrFunctionById = (prFunctions, id) => {
  return find(prFunctions, (item) => {
    return item.id === id;
  });
};

export const producePath = (self, allPrFunctions) => {
  const pathArray = [self];
  const producePathArray = (self, allPrFunctions, result = []) => {
    const parent = find(allPrFunctions, (item) => item.id === self.parentId);
    if (parent) {
      result.unshift(parent);
      producePathArray(parent, allPrFunctions);
    }
  };
  producePathArray(self, allPrFunctions, pathArray);

  return pathArray;
};
