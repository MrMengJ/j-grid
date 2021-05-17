import { get } from 'lodash';

import { getProcessAction } from './ProcessAction';
import { getExtRedo, getExtUndo } from './ExtUndoRedo';
import { doGridOperations, getExtEventRange } from './ExtKeyBoardEventRange';

let UndoRedoService = {};

// initialize the extended undoRedoService
UndoRedoService.initExtUndoRedoService = function () {
  this.undoRedoService = this.gridRef.current.api.context.getBean('undoRedoService');
  this.gridPanel = this.gridRef.current.api.gridPanel;
  this.gridPanel.__proto__.doGridOperations = doGridOperations;
  this.undoRedoService.__proto__.undo = getExtUndo(this);
  this.undoRedoService.__proto__.redo = getExtRedo(this);
  this.undoRedoService.__proto__.processAction = getProcessAction(this);
  // 覆盖默认的 pushActionsToUndoStack
  this.undoRedoService.__proto__.pushActionsToUndoStack = function (action) {
    this.undoStack.push(action);
    this.cellValueChanges = [];
    this.redoStack.actionStack = []; // 当有新的undo action进栈时，清空redo stack
  };
  addListenerForColMove(this);
  addListenerForUndoRedo(this);
  coverStackClear(this);
};

// remove native listening methods to avoid memory leaks
UndoRedoService.removeListener = function () {
  const headerNode = get(this, 'gridPanel.headerRootComp.eGui');
  if (headerNode) {
    headerNode.removeEventListener('mousedown', this.handleHeaderMouseDown);
    document.removeEventListener('mouseup', this.handleHeaderMouseUp);
  }

  document.removeEventListener('keydown', getExtEventRange(this));
};

// add a listener method to get column movement status
const addListenerForColMove = function (_this_) {
  const headerNode = get(_this_, 'gridPanel.headerRootComp.eGui');
  if (headerNode) {
    headerNode.addEventListener('mousedown', _this_.handleHeaderMouseDown);
    document.addEventListener('mouseup', _this_.handleHeaderMouseUp);
  }
};

//add a listener method for keyboard event response when the cell is not selected
const addListenerForUndoRedo = function (_this_) {
  //const root = _this_.gridPanel.eGui;
  document.addEventListener('keydown', getExtEventRange(_this_));
};

// overwrite the clear function in order not to clear the stack
const coverStackClear = function (_this_) {
  _this_.undoRedoService.redoStack.__proto__.clear = function () {};
  _this_.undoRedoService.undoStack.__proto__.clear = function () {};
};

export default UndoRedoService;
