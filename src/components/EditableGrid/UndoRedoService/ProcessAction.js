import { forEach, isEmpty, isNull, map } from 'lodash';

import { ProcessActionType, ROW_CHANGE_TYPE } from '../constants';

import {
  ColHideUndoRedoAction,
  ColMoveAction,
  ColWidthModAction,
  FilterUndoRedoAction,
  RowChangeAction,
  RowHeightModAction,
  RowMoveAction,
} from './UndoRedoAction';

export const getProcessAction = function (_this_) {
  const {
    props: { controlSelf },
  } = _this_;
  return function (action, valueExtractor, processActionType) {
    if (action instanceof RowMoveAction) {
      if (!controlSelf) {
        return;
      }
      action.cellValueChanges.forEach((cellValueChange) => {
        const { oldValue, newValue } = cellValueChange;
        if (processActionType === ProcessActionType.UNDO) {
          this.gridApi.applyTransaction({
            remove: [newValue.data],
          });
          this.gridApi.applyTransaction({
            add: [oldValue.data],
            addIndex: oldValue.rowIndex - 1,
          });
        } else if (processActionType === ProcessActionType.REDO) {
          this.gridApi.applyTransaction({
            remove: [oldValue.data],
          });
          this.gridApi.applyTransaction({
            add: [newValue.data],
            addIndex: newValue.rowIndex - 1,
          });
        }
      });
    } else if (action instanceof ColMoveAction) {
      const value = valueExtractor(action.cellValueChanges[0]);
      // 当移动的表头有子表头且大于1时，cellValueChanges.length > 1
      if (action.cellValueChanges.length > 1) {
        const colKey = map(action.cellValueChanges, (item) => item.colId);
        this.focusController.columnApi.setColumnsPinned(colKey, value.pinned);
        this.focusController.columnApi.moveColumns(colKey, value.index);
      } else {
        this.focusController.columnApi.setColumnPinned(
          action.cellValueChanges[0].colId,
          value.pinned
        );
        this.focusController.columnApi.moveColumn(
          action.cellValueChanges[0].colId,
          value.index
        );
      }
    } else if (action instanceof RowHeightModAction) {
      action.cellValueChanges.forEach((cellValueChange) => {
        const row = this.gridApi.getRowNode(cellValueChange.rowId);
        row.setRowHeight(valueExtractor(cellValueChange));
        this.gridApi.onRowHeightChanged();
      });
    } else if (action instanceof ColWidthModAction) {
      action.cellValueChanges.forEach((cellValueChange) => {
        this.focusController.columnApi.setColumnWidth(
          cellValueChange.colId,
          valueExtractor(cellValueChange)
        );
        _this_.columnWidthChangeMap[cellValueChange.colId] =
          valueExtractor(cellValueChange);
      });
    } else if (action instanceof RowChangeAction) {
      // 如果数据变化不由grid自身控制，则不响应撤销/恢复操作，由外层响应
      if (!controlSelf) {
        return;
      }
      action.cellValueChanges.forEach((cellValueChange) => {
        if (cellValueChange.type === ROW_CHANGE_TYPE.ADD) {
          if (processActionType === ProcessActionType.UNDO) {
            this.gridApi.applyTransactionAsync({
              remove: cellValueChange.newValue,
            });
          } else if (processActionType === ProcessActionType.REDO) {
            this.gridApi.applyTransactionAsync({
              add: cellValueChange.newValue,
              addIndex: cellValueChange.index,
            });
          }
        } else if (cellValueChange.type === ROW_CHANGE_TYPE.REMOVE) {
          const { oldValue } = cellValueChange;
          if (processActionType === ProcessActionType.UNDO) {
            forEach(oldValue, (item) => {
              const { row, index } = item;
              this.gridApi.applyTransactionAsync({
                add: [row],
                addIndex: index,
              });
            });
          } else if (processActionType === ProcessActionType.REDO) {
            const removedRows = map(oldValue, (item) => item.row);
            this.gridApi.applyTransactionAsync({
              remove: removedRows,
            });
          }
        } else {
          //todo process update
        }
      });
    } else if (action instanceof FilterUndoRedoAction) {
      forEach(action.cellValueChanges, (cellValueChange) => {
        const { colId } = cellValueChange;
        const value = valueExtractor(cellValueChange);
        const instance = this.gridApi.getFilterInstance(colId);
        instance.setModel({
          values: isNull(value) ? null : value.values,
        });
        this.gridApi.filterManager.onFilterChanged(null, {
          source: 'undoRedo',
        });
      });
    } else if (action instanceof ColHideUndoRedoAction) {
      // 如果数据变化不由grid自身控制，则不响应撤销/恢复操作，由外层响应
      if (!controlSelf) {
        return;
      }
      forEach(action.cellValueChanges, (cellValueChange) => {
        const { oldValue, newValue } = cellValueChange;
        if (processActionType === ProcessActionType.UNDO) {
          if (!isEmpty(oldValue)) {
            const { colIds, visible } = oldValue;
            _this_.columnApi.setColumnsVisible(colIds, visible);
          }
        } else if (processActionType === ProcessActionType.REDO) {
          if (!isEmpty(newValue)) {
            const { colIds, visible } = newValue;
            _this_.columnApi.setColumnsVisible(colIds, visible);
          }
        }
      });
    } else {
      const _this = this;
      action.cellValueChanges.forEach(function (cellValueChange) {
        const rowIndex = cellValueChange.rowIndex,
          rowPinned = cellValueChange.rowPinned,
          columnId = cellValueChange.columnId;
        const rowPosition = { rowIndex: rowIndex, rowPinned: rowPinned };
        const currentRow = _this.getRowNode(rowPosition);
        // checks if the row has been filtered out
        if (!currentRow.displayed) {
          return;
        }
        currentRow.setDataValue(columnId, valueExtractor(cellValueChange));
      });
    }
  };
};
