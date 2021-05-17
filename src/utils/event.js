export const isLeftMouseClick = (event) => {
  return event.button === 0;
};

export const isRightMouseClick = (event) => {
  // in mac os, ctrl + left click will also trigger contextMenu event
  return event.button === 2 || (event.ctrlKey && event.button === 1);
};
