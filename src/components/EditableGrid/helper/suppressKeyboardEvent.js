import { includes } from 'lodash';

const NAVIGATION_KEYS = {
  KEY_LEFT: 37,
  KEY_UP: 38,
  KEY_RIGHT: 39,
  KEY_DOWN: 40,
  KEY_PAGE_UP: 33,
  KEY_PAGE_DOWN: 34,
  KEY_PAGE_HOME: 36,
  KEY_PAGE_END: 35,
};

export const handleSuppressKeyboardEvent = (params) => {
  const { colDef, editing, event } = params;
  const cellEditors = ['textAreaCellEditor', 'pureTextCellEditor', 'prNameCellEditor'];
  if (editing && includes(cellEditors, colDef.cellEditor)) {
    const keyCode = event.keyCode;
    const isNavigationKey = includes(NAVIGATION_KEYS, keyCode);
    const isEnterKey = keyCode === 13;
    if (isNavigationKey || (event.shiftKey && isEnterKey)) {
      return true;
    }
  }
  return false;
};
