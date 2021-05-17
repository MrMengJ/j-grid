import { find, findIndex, isArray, isEmpty } from 'lodash';

import { getRowDefaultHeight } from '../helper';
import { ROW_CHANGE_TYPE } from '../constants';

import {
  ColHideUndoRedoAction,
  ColMoveAction,
  ColWidthModAction,
  FilterUndoRedoAction,
  RowChangeAction,
  RowHeightModAction,
  RowMoveAction,
} from './UndoRedoAction';

let DispatchUndoRedoAction = {};

DispatchUndoRedoAction.dispatchRowMoveAction = function ({ oldValue, newValue }) {
  let action = new RowMoveAction([{ oldValue, newValue }]);
  this.undoRedoService.pushActionsToUndoStack(action);
};

DispatchUndoRedoAction.dispatchColMoveAction = function () {
  let cellValueChanges = [];
  if (!isEmpty(this.movedColumns.columns)) {
    let newIndex = this.movedColumns.toIndex;
    this.movedColumns.columns.forEach((item) => {
      const { colId, pinned } = item;
      const oldIndex = findIndex(this.originalColumns, (item) => item.colId === colId);
      if (~oldIndex) {
        cellValueChanges.push({
          colId,
          oldValue: {
            index: oldIndex,
            pinned: this.originalColumns[oldIndex].pinned,
          },
          newValue: { index: newIndex++, pinned },
        });
        this.props.onMoveCol({
          colId,
          toIndex: newIndex - 1,
        });
      }
    });
    const action = new ColMoveAction(cellValueChanges);
    this.undoRedoService.pushActionsToUndoStack(action);
    this.movedColumns = {};
  }
};

DispatchUndoRedoAction.dispatchRowHeightModAction = function (options) {
  const { data, rowHeight } = options;
  const nodeHeight = find(this.props.rowData, (item) => item.id === data.id).height;
  const oldHeight = nodeHeight || getRowDefaultHeight();
  const action = new RowHeightModAction([
    { rowId: data.id, oldValue: oldHeight, newValue: rowHeight, data },
  ]);
  this.undoRedoService.pushActionsToUndoStack(action);
};

DispatchUndoRedoAction.dispatchColWidthModAction = function (options) {
  let cellValueChanges = [];
  options.columns.forEach((item) => {
    const { colId, actualWidth } = item;
    if (this.columnWidthChangeMap[colId]) {
      cellValueChanges.push({
        colId,
        oldValue: this.columnWidthChangeMap[colId],
        newValue: actualWidth,
      });
    } else {
      const oldWidth = find(this.columnDefs, (item) => item.colId === colId)?.width;
      cellValueChanges.push({
        colId,
        oldValue: oldWidth,
        newValue: actualWidth,
      });
    }
    this.columnWidthChangeMap[colId] = actualWidth;
  });
  const action = new ColWidthModAction(cellValueChanges);
  this.undoRedoService.pushActionsToUndoStack(action);
};

DispatchUndoRedoAction.dispatchRowChangeAction = function (options, type) {
  let action;
  if (type === ROW_CHANGE_TYPE.ADD) {
    const { add, addIndex } = options;
    action = new RowChangeAction([
      {
        type: ROW_CHANGE_TYPE.ADD,
        oldValue: null,
        newValue: isArray(add) ? add : [add],
        index: addIndex,
      },
    ]);
  } else if (type === ROW_CHANGE_TYPE.REMOVE) {
    action = new RowChangeAction([
      { type: ROW_CHANGE_TYPE.REMOVE, oldValue: options, newValue: null },
    ]);
  } else if (type === ROW_CHANGE_TYPE.REPLACE) {
    const { add, addIndex, removed } = options;
    action = new RowChangeAction([
      {
        type: ROW_CHANGE_TYPE.REPLACE,
        oldValue: removed,
        newValue: add,
        index: addIndex,
      },
    ]);
  } else {
    //todo handle rowChange
  }
  this.undoRedoService.pushActionsToUndoStack(action);
};

DispatchUndoRedoAction.dispatchFilterAction = function (options) {
  const { colId, oldModel, newModel } = options;
  const action = new FilterUndoRedoAction([
    { colId, oldValue: oldModel, newValue: newModel },
  ]);
  this.undoRedoService.pushActionsToUndoStack(action);
};

DispatchUndoRedoAction.dispatchColHideUndoRedoAction = function (options) {
  const { oldValue, newValue } = options;
  const action = new ColHideUndoRedoAction([{ oldValue, newValue }]);
  this.undoRedoService.pushActionsToUndoStack(action);
};

export default DispatchUndoRedoAction;
