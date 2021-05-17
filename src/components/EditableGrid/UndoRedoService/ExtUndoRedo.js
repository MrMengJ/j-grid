import {
  FillUndoRedoAction,
  UndoRedoAction as NativeUndoRedoAction,
} from '@ag-grid-community/core/dist/es6/undoRedo/undoRedoStack';

import { ProcessActionType } from '../constants';

export const getExtUndo = function (_this_) {
  return function () {
    if (!this.undoStack) {
      return;
    }
    const undoAction = this.undoStack.pop();
    if (!undoAction || !undoAction.cellValueChanges) {
      return;
    }
    this.processAction(
      undoAction,
      function (cellValueChange) {
        return cellValueChange.oldValue;
      },
      ProcessActionType.UNDO
    );
    if (undoAction instanceof FillUndoRedoAction) {
      this.processRangeAndCellFocus(undoAction.cellValueChanges, undoAction.initialRange);
    } else if (undoAction instanceof NativeUndoRedoAction) {
      this.processRangeAndCellFocus(undoAction.cellValueChanges);
    }
    this.redoStack.push(undoAction);
    _this_.props.undoCallBack(
      undoAction,
      function (cellValueChange) {
        return cellValueChange.oldValue;
      },
      ProcessActionType.UNDO
    );
  };
};

export const getExtRedo = function (_this_) {
  return function () {
    if (!this.redoStack) {
      return;
    }
    const redoAction = this.redoStack.pop();
    if (!redoAction || !redoAction.cellValueChanges) {
      return;
    }
    this.processAction(
      redoAction,
      function (cellValueChange) {
        return cellValueChange.newValue;
      },
      ProcessActionType.REDO
    );
    if (redoAction instanceof FillUndoRedoAction) {
      this.processRangeAndCellFocus(redoAction.cellValueChanges, redoAction.finalRange);
    } else if (redoAction instanceof NativeUndoRedoAction) {
      this.processRangeAndCellFocus(redoAction.cellValueChanges);
    }
    this.undoStack.push(redoAction);
    _this_.props.redoCallBack(
      redoAction,
      function (cellValueChange) {
        return cellValueChange.newValue;
      },
      ProcessActionType.REDO
    );
  };
};
