export const getInLocalStorage = (key) => {
  return localStorage.getItem(key);
};

export const setInLocalStorage = (key, value) => {
  return localStorage.setItem(key, value);
};

export const getColumnChangeStorage = () => {
  return JSON.parse(getInLocalStorage('columnChangeList'));
};

export const setColumnChangeStorage = (value) => {
  return setInLocalStorage('columnChangeList', JSON.stringify(value));
};

export const getRowChangeStorage = () => {
  return JSON.parse(getInLocalStorage('rowChangeList'));
};

export const setRowChangeStorage = (value) => {
  return setInLocalStorage('rowChangeList', JSON.stringify(value));
};

export const getColumnMoveStorage = () => {
  return JSON.parse(getInLocalStorage('columnMoveList'));
};

export const setColumnMoveStorage = (value) => {
  return setInLocalStorage('columnMoveList', JSON.stringify(value));
};
