import { KeyCode } from '../constants';

export const getExtEventRange = function (_this_) {
  return function (keyboardEvent) {
    switch (keyboardEvent.which) {
      case KeyCode.Z:
        return keyboardEvent.shiftKey
          ? _this_.undoRedoService.redo()
          : _this_.undoRedoService.undo();

      case KeyCode.Y:
        return _this_.undoRedoService.redo();

      default:
        break;
    }
  };
};

export const doGridOperations = function (keyboardEvent, cellComp) {
  // check if ctrl or meta key pressed
  if (!keyboardEvent.ctrlKey && !keyboardEvent.metaKey) {
    return;
  }
  // if the cell the event came from is editing, then we do not
  // want to do the default shortcut keys, otherwise the editor
  // (eg a text field) would not be able to do the normal cut/copy/paste
  if (cellComp.isEditing()) {
    return;
  }
  // for copy / paste, we don't want to execute when the event
  // was from a child grid (happens in master detail)
  if (!this.mouseEventService.isEventFromThisGrid(keyboardEvent)) {
    return;
  }
  // eslint-disable-next-line default-case
  switch (keyboardEvent.which) {
    case KeyCode.A:
      return this.onCtrlAndA(keyboardEvent);
    case KeyCode.C:
      return this.onCtrlAndC(keyboardEvent);
    case KeyCode.V:
      return this.onCtrlAndV();
    case KeyCode.D:
      return this.onCtrlAndD(keyboardEvent);
    case KeyCode.Z:
      keyboardEvent.stopPropagation(); // 此事件是响应到单元格上面的事件，在此需要阻止事件冒泡到getExtEventRange中去
      return keyboardEvent.shiftKey
        ? this.undoRedoService.redo()
        : this.undoRedoService.undo();
    case KeyCode.Y:
      keyboardEvent.stopPropagation(); // 此事件是响应到单元格上面的事件，在此需要阻止事件冒泡到getExtEventRange中去
      return this.undoRedoService.redo();
  }
};
