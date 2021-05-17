class UndoRedoAction {
  cellValueChanges = [];
  constructor(cellValueChanges) {
    this.cellValueChanges = cellValueChanges;
  }
}

export class RowMoveAction extends UndoRedoAction {}

export class ColMoveAction extends UndoRedoAction {}

export class RowHeightModAction extends UndoRedoAction {}

export class ColWidthModAction extends UndoRedoAction {}

export class RowChangeAction extends UndoRedoAction {}

export class FilterUndoRedoAction extends UndoRedoAction {}

export class ColHideUndoRedoAction extends UndoRedoAction {}
