import './ag-grid-theme-custom.scss';

import React, { Component } from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import memoizeOne from 'memoize-one';
import { AgGridReact } from '@ag-grid-community/react';
import { AllCommunityModules, ModuleRegistry } from '@ag-grid-community/all-modules';
import { AllEnterpriseModules } from '@ag-grid-enterprise/all-modules';
import {
  cloneDeep,
  filter,
  findIndex,
  forEach,
  get,
  head,
  includes,
  isEqual,
  isObject,
  isUndefined,
  map,
  noop,
  size,
} from 'lodash';

import { bound } from '../../utils/object';

import {
  AG_GRID_LOCALE_ZH,
  CELL_VALUE_TYPE,
  COLUMN_RESIZED_SOURCE,
  ORDER_COL_ID,
  ROW_CHANGE_TYPE,
  SELECTOR_COL_ID,
} from './constants';
import {
  copyRow,
  getCellAlignCssValue,
  getCurrentRowData,
  getIsPrName,
  getNestedColumns,
  getRowDefaultHeight,
  moveInArray,
  produceRowData,
} from './helper';
import TextAreaCellEditor from './CellEditors/TextAreaCellEditor';
import OrderCellRender from './CellRenders/OrderCellRender';
import SelectorCellRender from './CellRenders/SelectorCellRender';
import PrNameCellRender from './CellRenders/PrNameCellRender';
import PrFunctionGroupCellRender from './CellRenders/PrFunctionGroupCellRender';
import CommonCellRender from './CellRenders/CommonCellRender';
import NumberCellRender from './CellRenders/NumberCellRender';
import EnumCellRender from './CellRenders/EnumCellRender';
import EcpDefinitionRender from './CellRenders/EcpDefinitionRender';
import ApprovalPointCellRender from './CellRenders/ApprovalPointCellRender';
import SpecialCellRender from './CellRenders/SpecialCellRender';
import TextCellRender from './CellRenders/TextCellRender';
import EnumCellEditor from './CellEditors/EnumCellEditor';
import MiscSelectCellEditor from './CellEditors/MiscSelectCellEditor';
// import ApprovalPointCellEditor from './CellEditors/ApprovalPointCellEditor';
import PureTextCellEditor from './CellEditors/PureTextCellEditor';
// import AuthTagCellEditor from './CellEditors/AuthTagCellEditor';
// import OrganizationCellEditor from './CellEditors/OrganizationCellEditor';
import DispatchUndoRedoAction from './UndoRedoService/DispatchUndoRedoAction';
import { handleSuppressKeyboardEvent } from './helper/suppressKeyboardEvent';
import UndoRedoService from './UndoRedoService';
import FilterService from './FilterService';
import HeaderGroupRender from './HeaderRenders/HeaderGroupRender';
import PrNameCellEditor from './CellEditors/PrNameCellEditor';

ModuleRegistry.registerModules([...AllCommunityModules, ...AllEnterpriseModules]);

const Wrapper = styled.div`
  width: 100%;
  height: 100%;
`;

const selectorCol = {
  parentId: '0',
  id: SELECTOR_COL_ID,
  field: SELECTOR_COL_ID,
  colId: SELECTOR_COL_ID,
  headerName: '',
  pinned: 'left',
  width: 100,
  editable: false,
  cellRenderer: 'selectorCellRenderer',
  rowDrag: true,
  suppressCellFlash: true,
  headerCheckboxSelection: true,
  headerCheckboxSelectionFilteredOnly: true,
  checkboxSelection: true,
  filter: false,
  lockPosition: true,
};

const prFunctionCol = {
  parentId: '0',
  id: 'prFunction',
  field: 'prFunction',
  colId: 'prFunction',
  name: '所属职能',
  hide: true,
  filter: false,
};

const gridStaticOptions = {
  localeText: AG_GRID_LOCALE_ZH,
  enableRangeSelection: true,
  enableRangeHandle: true,
  fillHandleDirection: 'xy',
  suppressClearOnFillReduction: true,
  suppressDragLeaveHidesColumns: true,
  enableCellChangeFlash: true,
  animateRows: true,
  rowSelection: 'multiple', // 多行选中模式
  suppressRowClickSelection: true, // 阻止点击选中行，只能通过checkbox选中整行
  suppressRowTransform: true, // 使rowSpan生效
  stopEditingWhenGridLosesFocus: false, // 当网格失焦时，停止编辑状态   为防止选择框类型的单元格编辑态会意外退出编辑状态，该配置值应该始终为false
  immutableData: true,
  // suppressMoveWhenRowDragging: true,
  undoRedoCellEditing: true,
  groupUseEntireRow: true, // group row is full width,
  groupDefaultExpanded: 1, // 0 for none, 1 for first level only, etc. Set to -1 to expand everything.
};

class EditableGrid extends Component {
  constructor(props) {
    super(props);
    this.gridApi = null;
    this.columnApi = null;
    this.dragMovingNode = null; // 标识被拖拽的行
    this.lastOverNode = null; // 标识“行拖拽”操作中，被覆盖的行
    this.gridRef = React.createRef();
    this.undoRedoService = null;
    this.columnWidthChangeMap = {};
    this.originalColumns = []; // 记录每次"拖拽表头移动"前的初始列数据columns
    this.movedColumns = {}; // 记录每次"拖拽表头移动"移动的列数据columns
    bound(this, DispatchUndoRedoAction);
    bound(this, UndoRedoService);
    bound(this, FilterService);
  }

  produceOriginalColumns = memoizeOne((columns) => {
    return map(columns, (item) => {
      const commonCellRendererParams = this.getCommonCellRendererParams({ column: item });

      // prName列
      if (getIsPrName(item.valueType) && item.parentId !== '0') {
        return {
          ...item,
          cellRenderer: 'prNameCellRenderer',
          cellRendererParams: {
            ...commonCellRendererParams,
            highlightText: this.props.highlightText,
          },
          cellEditor: 'prNameCellEditor',
          cellEditorParams: {},
          cellStyle: { padding: 0 },
          editable: (params) => {
            const { column, data } = params;
            const { colId } = column;
            return !!get(data, colId);
          },
        };
      }

      // prNumber列
      if (item.valueType === CELL_VALUE_TYPE.PR_NUMBER) {
        return {
          ...item,
          editable: false,
          cellRenderer: 'numberCellRenderer',
          cellRendererParams: {
            ...commonCellRendererParams,
            highlightText: this.props.highlightText,
            shouldMarkDataStatus: this.props.shouldMarkDataStatus,
          },
        };
      }

      // enum列
      if (item.valueType === CELL_VALUE_TYPE.ENUM_VALUE) {
        return {
          ...item,
          cellRenderer: 'enumCellRenderer',
          cellRendererParams: {
            ...commonCellRendererParams,
          },
          cellEditor: 'enumCellEditor',
          cellEditorParams: {},
        };
      }

      // text cellRender
      if (item.valueType === CELL_VALUE_TYPE.PURE_TEXT) {
        return {
          ...item,
          cellRenderer: 'textCellRenderer',
          cellRendererParams: {
            ...commonCellRendererParams,
          },
          cellEditor: 'pureTextCellEditor',
          cellEditorParams: {},
        };
      }

      // PR_LIST_SHARED cellRender
      if (item.valueType === CELL_VALUE_TYPE.PR_LIST_SHARED) {
        return {
          ...item,
          cellRenderer: 'textCellRenderer',
          cellRendererParams: {
            ...commonCellRendererParams,
          },
          cellEditor: 'pureTextCellEditor',
          cellEditorParams: {},
        };
      }

      // ECP_DEFINITION列
      if (item.valueType === CELL_VALUE_TYPE.ECP_DEFINITION) {
        return {
          ...item,
          filter: false,
          cellRenderer: 'ecpDefinitionRenderer',
          cellRendererParams: {
            ...commonCellRendererParams,
          },
        };
      }

      // APPROVAL_POINT 列
      if (item.valueType === CELL_VALUE_TYPE.APPROVAL_POINT) {
        return {
          ...item,
          filter: false,
          cellRenderer: 'approvalPointCellRenderer',
          cellRendererParams: {
            ...commonCellRendererParams,
          },
          // cellEditor: 'approvalPointCellEditor',
          cellEditorParams: {
            ...this.props.approvalPointCellEditorParams,
          },
        };
      }

      //  IT_SYSTEM 列
      if (item.valueType === CELL_VALUE_TYPE.IT_SYSTEM) {
        return {
          ...item,
          cellRenderer: 'specialCellRenderer',
          cellRendererParams: {
            ...commonCellRendererParams,
          },
          cellEditor: 'miscSelectCellEditor',
          cellEditorParams: {
            multiple: true,
          },
        };
      }

      //  AUTH_TAG 列
      if (item.valueType === CELL_VALUE_TYPE.AUTH_TAG) {
        return {
          ...item,
          cellRenderer: 'specialCellRenderer',
          cellRendererParams: {
            ...commonCellRendererParams,
          },
          // cellEditor: 'authTagCellEditor',
          cellEditorParams: {},
        };
      }

      //  ORGANIZATION 列
      if (item.valueType === CELL_VALUE_TYPE.ORGANIZATION) {
        return {
          ...item,
          cellRenderer: 'specialCellRenderer',
          cellRendererParams: {
            ...commonCellRendererParams,
          },
          // cellEditor: 'organizationCellEditor',
          cellEditorParams: {},
        };
      }

      // special 列
      const specialItems = [CELL_VALUE_TYPE.PERSON, CELL_VALUE_TYPE.POSITION_GROUP];
      if (includes(specialItems, item.valueType)) {
        return {
          ...item,
          filter: false,
          cellRenderer: 'specialCellRenderer',
          cellRendererParams: {
            ...commonCellRendererParams,
          },
        };
      }

      return {
        ...item,
        headerGroupComponentFramework: HeaderGroupRender,
        headerGroupComponentParams: {
          onHideCol: this.handleHideCols,
        },
        cellRendererParams: {
          ...commonCellRendererParams,
          shouldMarkDataStatus: this.props.shouldMarkDataStatus,
        },
      };
    });
  });

  produceOrderColDef = () => {
    return {
      parentId: '0',
      id: ORDER_COL_ID,
      field: ORDER_COL_ID,
      colId: ORDER_COL_ID,
      headerName: '序号',
      pinned: 'left',
      width: 68,
      editable: false,
      suppressCellFlash: true,
      suppressMovable: true,
      filter: false,
      lockPosition: true,
      cellRenderer: 'orderCellRenderer',
      cellRendererParams: {
        onRowHeightChanged: this.handleRowHeightChanged,
        onAddRow: this.handleAddRow,
      },
      cellStyle: { padding: 0 },
      valueGetter: (params) => {
        const {
          node: { rowIndex },
          data,
        } = params;
        return { rowIndex, data };
      },
      suppressKeyboardEvent: () => true, // 阻止粘贴,复制
    };
  };

  produceSelectorColDef = memoizeOne((showSelectorCol) => {
    return showSelectorCol
      ? {
          ...selectorCol,
          cellStyle: { padding: 0 },
          suppressKeyboardEvent: () => true, // 阻止粘贴,复制
          rowDragText: (params) => {
            const {
              rowNode: { data },
            } = params;
            return get(data, 'number', '');
          },
          valueGetter: (params) => {
            if (!params.data) {
              return { modified: false };
            }
            const {
              data: { modified },
            } = params;
            return { modified };
          },
        }
      : null;
  });

  producePrFunctionColDef = memoizeOne((groupedByPrFunction) => {
    return groupedByPrFunction
      ? {
          ...prFunctionCol,
          rowGroup: true,
          keyCreator: (params) =>
            map(get(params, 'value.pathArray', []), (item) => get(item, 'name', '')).join(
              ' - '
            ),
        }
      : null;
  });

  produceColumnDefs = memoizeOne(
    ({ columns, orderColOptions, selectorColOptions, prFunctionColOptions }) => {
      const newOrderOptions = orderColOptions ? [orderColOptions] : [];
      const newSelectorColOptions = selectorColOptions ? [selectorColOptions] : [];
      const newPrFunctionColOptions = prFunctionColOptions ? [prFunctionColOptions] : [];
      return getNestedColumns([
        ...newOrderOptions,
        ...newSelectorColOptions,
        ...newPrFunctionColOptions,
        ...columns,
      ]);
    },
    isEqual
  );

  handleHeaderMouseDown = () => {
    this.originalColumns = map(this.columnApi.getAllGridColumns(), (item) => ({
      colId: item.colId,
      pinned: item.pinned,
      visible: item.visible,
    }));
  };

  handleHeaderMouseUp = () => {
    this.dispatchColMoveAction();
  };

  componentDidMount() {
    this.initExtUndoRedoService();
    this.initExtFilterService();
  }

  componentWillUnmount() {
    this.removeListener();
  }

  handleGridReady = (params) => {
    this.gridApi = params.api;
    this.columnApi = params.columnApi;

    this.props.onGridReady({ ...params, gridInstance: this });
  };

  handleRemoveCurrentRow = (data) => {
    if (this.props.controlSelf) {
      this.gridApi.applyTransactionAsync({
        remove: [data],
      });
    }
    const index = findIndex(this.props.rowData, (item) => item.id === data.id);
    this.dispatchRowChangeAction([{ row: data, index }], ROW_CHANGE_TYPE.REMOVE);
    this.props.onRemoveRows([data]);
  };

  handleRemoveSelectedRow = () => {
    const selectedRows = this.gridApi.getSelectedRows();
    if (size(selectedRows) > 0) {
      const { controlSelf, rowData, onRemoveRows } = this.props;
      if (controlSelf) {
        this.gridApi.applyTransactionAsync({
          remove: selectedRows,
        });
      }
      const removedRows = map(selectedRows, (selectedRowItem) => {
        const index = findIndex(rowData, (item) => item.id === selectedRowItem.id);
        return { row: selectedRowItem, index };
      });
      this.dispatchRowChangeAction(removedRows, ROW_CHANGE_TYPE.REMOVE);
      onRemoveRows(selectedRows);
    }
  };

  handleHideCols = (columns) => {
    const colIds = map(columns, (item) => item.colId);
    if (this.props.controlSelf) {
      this.columnApi.setColumnsVisible(colIds, false);
    } else {
      this.props.onHideCol(colIds);
    }
    const oldValue = { colIds, visible: true };
    const newValue = { colIds, visible: false };
    this.dispatchColHideUndoRedoAction({ oldValue, newValue });
  };

  getRowNodeId = (data) => {
    return data.id;
  };

  getRowHeight = ({ data }) => {
    return get(data, 'height', getRowDefaultHeight());
  };

  getMainMenuItems = (params) => {
    const defaultMenuItems = ['pinSubMenu'];
    const { column } = params;
    const { colId } = column;
    if (includes([ORDER_COL_ID, SELECTOR_COL_ID], colId)) {
      return defaultMenuItems;
    }

    const removeCol = {
      name: '隐藏列',
      action: () => {
        this.handleHideCols([column]);
      },
    };
    return ['pinSubMenu', removeCol];
  };

  getContextMenuItems = (params) => {
    const {
      node: { data },
      column,
    } = params;
    const colId = get(column, 'colId');
    if (!colId) {
      return [];
    }

    const defaultItems = ['copy', 'paste', 'separator'];
    const selectedRows = this.gridApi.getSelectedRows();
    const deleteColOrRow = {
      name: '删除',
      subMenu: [
        {
          name: '当前行',
          action: () => {
            this.handleRemoveCurrentRow(data);
          },
        },
        {
          name: '选中的行',
          disabled: size(selectedRows) < 1,
          action: this.handleRemoveSelectedRow,
        },
      ],
    };
    const addNewRow = {
      name: '向上插入行',
      action: () => this.handleInsertRowUp(data),
    };
    const addSubRow = {
      name: '向下插入行',
      action: () => this.handleInsertRowDown(data),
    };
    return [
      ...defaultItems,
      addNewRow,
      addSubRow,
      deleteColOrRow,
      ...this.props.extendedContextMenuItems,
    ];
  };

  getCellStyle = (params) => {
    const {
      colDef: { align },
    } = params;
    let justifyContent = getCellAlignCssValue(align);
    return { justifyContent };
  };

  getCommonCellRendererParams = ({ column }) => {
    const { align } = column;
    return { align };
  };

  handleColWidthChanged = () => {};

  handleCellMouseOver = (params) => {
    this.props.onCellMouseOver(params);
  };

  handleCellMouseOut = (params) => {
    this.props.onCellMouseOut(params);
  };

  handleCellMouseDown = (params) => {
    this.props.onCellMouseDown(params);
  };

  handleCellValueChanged = (params) => {
    const { onCellValueChanged } = this.props;
    const { colDef, column, data, oldValue, newValue } = params;
    onCellValueChanged({
      colDef,
      column,
      data,
      oldValue,
      newValue,
    });
  };

  //  handle object value
  handleProcessCellForClipboard = (params) => {
    const { value } = params;
    return isObject(value) ? JSON.stringify(value) : value;
  };

  //  handle object value
  handleProcessCellFromClipboard = (params) => {
    const {
      value,
      column: { colDef },
      node: { data },
    } = params;
    const { colId, valueType } = colDef;

    // prName项特殊处理,id使用被粘贴单元格的原值
    if (getIsPrName(valueType)) {
      const id = get(data, `${colId}.id`, '');
      try {
        const valueObj = JSON.parse(value);
        const pasteValue = get(valueObj, 'value');
        if (!pasteValue) {
          // 粘贴值如果为空，则粘贴"原始值"，相当于没改变
          return get(data, colId);
        }
        return { ...valueObj, id };
      } catch (e) {
        if (value) {
          return { value, id };
        }
        // 粘贴值如果为空，则粘贴"原始值"，相当于没改变
        return get(data, colId);
      }
    }

    try {
      return JSON.parse(value);
    } catch (e) {
      return value;
    }
  };

  handleRowDragEnter = (params) => {
    const { node } = params;
    // 在一次拖拽过程中，rowDragEnter可能会发生多次，所以this.dragMovingNode仅获取刚开始拖动时的node，即初始值
    if (!this.dragMovingNode) {
      // 需要深克隆，因为改行在拖拽过程中会被改变值
      this.dragMovingNode = {
        data: cloneDeep(node.data),
        rowIndex: node.rowIndex,
      };
    }
  };

  handleRowDragEnd = (params) => {
    const getDraggedNodeNewSortId = (dragMovingNode, overNode) => {
      if (dragMovingNode.rowIndex < overNode.rowIndex) {
        return overNode.data.sortId + 1;
      } else if (dragMovingNode.rowIndex > overNode.rowIndex) {
        return overNode.data.sortId;
      } else {
        return dragMovingNode.data.sortId;
      }
    };

    if (this.dragMovingNode && this.lastOverNode) {
      const dragEndInSelf = this.dragMovingNode.rowIndex === this.lastOverNode.rowIndex;
      if (dragEndInSelf) {
        return;
      }

      const draggedNodeNewSortId = getDraggedNodeNewSortId(
        this.dragMovingNode,
        this.lastOverNode
      );
      const currentRowData = getCurrentRowData(this.gridApi);
      // 需要更改sortId的行
      const needReorderedRowData = filter(currentRowData, (item) => {
        return (
          item.parentId === this.dragMovingNode.data.parentId &&
          item.sortId >= draggedNodeNewSortId
        );
      });
      forEach(needReorderedRowData, (item) => item.sortId++);

      this.dispatchRowMoveAction({
        oldValue: {
          data: this.dragMovingNode.data,
          rowIndex: this.dragMovingNode.rowIndex,
        },
        newValue: {
          data: {
            ...this.dragMovingNode.data,
            index: findIndex(
              currentRowData,
              (item) => item.id === this.dragMovingNode.data.id
            ),
            prFunction: this.lastOverNode.data.prFunction,
            parentId: this.lastOverNode.data.parentId,
            sortId: draggedNodeNewSortId,
          },
          rowIndex: this.lastOverNode.rowIndex,
        },
      });
      this.props.onRowDragEnd({
        ...params,
        rowData: currentRowData,
        draggedRow: {
          ...this.dragMovingNode.data,
          parentId: this.lastOverNode.data.parentId,
          sortId: draggedNodeNewSortId,
        },
        needReorderedRowData,
      });
    }

    this.dragMovingNode = null; // 重置被拖拽的行
    this.lastOverNode = null; // 重置记录的最后被覆盖的node(行)
  };

  handleRowDragMove = (params) => {
    this.props.onRowDragMove(params);

    const {
      node: {
        gridOptionsWrapper: {
          gridOptions: { rowDragManaged },
        },
      },
    } = params;
    // 如果ag-grid自己管理drag的逻辑，则不处理
    if (rowDragManaged) {
      return;
    }

    const { node: movingNode, overNode, api: gridApi } = params;
    const overNodeIsGroup = overNode.group;
    const movingData = movingNode.data;
    const overData = overNode.data;
    if (overNodeIsGroup || movingData.id === overData.id) {
      return;
    }

    this.lastOverNode = { data: overNode.data, rowIndex: overNode.rowIndex }; // 记录最后被覆盖的node(行)
    const newRowData = getCurrentRowData(this.gridApi);
    const movingNodeIndex = findIndex(newRowData, (item) => item.id === movingData.id);
    const overNodeIndex = findIndex(newRowData, (item) => item.id === overData.id);
    const groupPrFunction = overNode.data.prFunction;
    if (groupPrFunction) {
      movingData.prFunction = groupPrFunction;
      movingData.parentId = groupPrFunction.id;
    }
    moveInArray(newRowData, movingNodeIndex, overNodeIndex);

    gridApi.applyTransaction({
      update: [movingData],
    });
    gridApi.setRowData(
      produceRowData({
        rowData: newRowData,
        prFunctions: this.props.prFunctions,
      })
    );
  };

  handleRowHeightChanged = (options) => {
    const { data, rowHeight } = options;
    this.dispatchRowHeightModAction(options);
    this.props.onRowHeightChanged({ rowId: data.id, rowHeight });
  };

  handleRowSelect = (params) => {
    const { node } = params;
    const isSelected = node.isSelected();
    this.props.onRowSelect({ ...params, isSelected });
  };

  handleColumnMoved = (options) => {
    this.movedColumns = {
      columns: options.columns,
      toIndex: options.toIndex,
    };
  };

  handleColumnPinned = (options) => {
    // 之所以在"pinned"回调里需要记录movedColumns，是因为有时候"非pinned项"往"pinned项"拖拽列移动的时候只触发columnPinned，而不会触发columnMoved
    const allColumns = this.columnApi.getAllGridColumns();
    const { columns } = options;
    const index = findIndex(
      allColumns,
      (item) => item.colId === get(head(columns), 'colId')
    );
    this.movedColumns = {
      columns: columns,
      toIndex: index,
    };
  };

  handleColumnResized = (options) => {
    if (options.finished && options.source === COLUMN_RESIZED_SOURCE.DRAG) {
      options.columns.forEach((item) => {
        const { colId, actualWidth } = item;
        this.props.onColumnWidthChanged({ colId, width: actualWidth });
      });
      this.dispatchColWidthModAction(options);
    }
  };

  handleFilterModified = (options) => {
    const { column, filterInstance } = options;
    const { colId } = column;
    const { appliedModel } = filterInstance;
    this.filterService.setColCurrentFilterModel(colId, appliedModel);
  };

  handleFilterChanged = (options) => {
    const { source, column } = options;
    const columnIsRemoved = isUndefined(column);
    if (source === 'undoRedo' || columnIsRemoved) {
      return;
    }
    const {
      filterInstance: { appliedModel },
    } = options;
    const { colId } = column;
    this.dispatchFilterAction({
      colId,
      oldModel: this.filterService.getColCurrentFilterModel(colId),
      newModel: appliedModel,
    });
  };

  handleInsertRowUp = (data) => {
    const allRowData = getCurrentRowData(this.gridApi);
    const matchedIndex = findIndex(allRowData, (item) => item.id === data.id);
    if (matchedIndex > -1) {
      const addedRow = copyRow(data, true);
      this.handleAddRow({
        add: addedRow,
        addIndex: matchedIndex,
      });
    }
  };

  handleInsertRowDown = (data) => {
    const allRowData = getCurrentRowData(this.gridApi);
    const matchedIndex = findIndex(allRowData, (item) => item.id === data.id);
    if (matchedIndex > -1) {
      const addedRow = copyRow(data, true);
      this.handleAddRow({
        add: addedRow,
        addIndex: matchedIndex + 1,
      });
    }
  };

  handleAddRow = (options) => {
    const { add, addIndex } = options;
    const currentRowData = getCurrentRowData(this.gridApi);

    // 计算"添加行"导致的需要重新计算sortId的行
    const needReorderedRowData = filter(currentRowData, (item) => {
      return item.parentId === add.parentId && item.sortId >= add.sortId;
    });
    forEach(needReorderedRowData, (item) => item.sortId++);

    if (this.props.controlSelf) {
      this.gridApi.applyTransaction({
        add: [add],
        addIndex,
        update: needReorderedRowData,
      });
    }
    this.props.onAddRow({ add, addIndex, needReorderedRowData });
    this.dispatchRowChangeAction(options, ROW_CHANGE_TYPE.ADD);
  };

  render() {
    const {
      defaultColDef,
      showSelectorCol,
      groupedByPrFunction,
      prFunctions,
      gridOptions,
      onCellClicked,
      onCellDoubleClicked,
    } = this.props;
    const selectorColDef = this.produceSelectorColDef(showSelectorCol);
    const prFunctionColDef = this.producePrFunctionColDef(groupedByPrFunction);
    const orderColDef = this.produceOrderColDef();
    this.columnDefs = this.produceColumnDefs({
      columns: this.produceOriginalColumns(this.props.columnDefs),
      orderColOptions: orderColDef,
      selectorColOptions: selectorColDef,
      prFunctionColOptions: prFunctionColDef,
    });
    const rowData = produceRowData({
      rowData: this.props.rowData,
      prFunctions,
    });

    return (
      <Wrapper className="ag-theme-custom">
        <AgGridReact
          {...gridStaticOptions}
          {...gridOptions}
          ref={this.gridRef}
          columnDefs={this.columnDefs}
          rowData={rowData}
          onGridReady={this.handleGridReady}
          getRowNodeId={this.getRowNodeId}
          getRowHeight={this.getRowHeight}
          getMainMenuItems={this.getMainMenuItems}
          getContextMenuItems={this.getContextMenuItems}
          defaultColDef={{
            filter: true,
            resizable: true,
            addEventListener: this.handleColWidthChanged,
            menuTabs: ['generalMenuTab'],
            cellEditor: 'textAreaCellEditor',
            cellStyle: this.getCellStyle,
            cellRenderer: 'commonCellRenderer',
            suppressKeyboardEvent: handleSuppressKeyboardEvent,
            equals: isEqual,
            ...defaultColDef,
          }}
          frameworkComponents={{
            prFunctionGroupCellRenderer: PrFunctionGroupCellRender,
            selectorCellRenderer: SelectorCellRender,
            orderCellRenderer: OrderCellRender,
            prNameCellRenderer: PrNameCellRender,
            numberCellRenderer: NumberCellRender,
            commonCellRenderer: CommonCellRender,
            enumCellRenderer: EnumCellRender,
            ecpDefinitionRenderer: EcpDefinitionRender,
            approvalPointCellRenderer: ApprovalPointCellRender,
            specialCellRenderer: SpecialCellRender,
            textCellRenderer: TextCellRender,
            prNameCellEditor: PrNameCellEditor,
            textAreaCellEditor: TextAreaCellEditor,
            pureTextCellEditor: PureTextCellEditor,
            enumCellEditor: EnumCellEditor,
            miscSelectCellEditor: MiscSelectCellEditor,
            // approvalPointCellEditor: ApprovalPointCellEditor,
            // authTagCellEditor: AuthTagCellEditor,
            // organizationCellEditor: OrganizationCellEditor,
          }}
          groupRowRendererParams={{
            innerRenderer: 'prFunctionGroupCellRenderer',
            suppressCount: true,
          }}
          onCellMouseOver={this.handleCellMouseOver}
          onCellMouseOut={this.handleCellMouseOut}
          onCellMouseDown={this.handleCellMouseDown}
          processCellForClipboard={this.handleProcessCellForClipboard}
          processCellFromClipboard={this.handleProcessCellFromClipboard}
          onCellValueChanged={this.handleCellValueChanged}
          onRowDragEnter={this.handleRowDragEnter}
          onRowDragMove={this.handleRowDragMove}
          onRowDragEnd={this.handleRowDragEnd}
          onRowSelected={this.handleRowSelect}
          onColumnMoved={this.handleColumnMoved}
          onColumnPinned={this.handleColumnPinned}
          onColumnResized={this.handleColumnResized}
          onFilterChanged={this.handleFilterChanged}
          onFilterModified={this.handleFilterModified}
          onCellClicked={onCellClicked}
          onCellDoubleClicked={onCellDoubleClicked}
        />
      </Wrapper>
    );
  }
}

EditableGrid.propTypes = {
  columnDefs: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      name: PropTypes.string,
      width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      align: PropTypes.oneOf(['left', 'center', 'right']),
      fixed: PropTypes.oneOf(['left', 'right']),
    })
  ), // 列配置项
  rowData: PropTypes.array, // 表格数据
  prFunctions: PropTypes.array, // 所有"职能"
  onGridReady: PropTypes.func, // grid初始化回调事件
  onCellMouseOver: PropTypes.func, // mouse over event
  onCellMouseOut: PropTypes.func, // mouse out event
  onCellMouseDown: PropTypes.func, // mouse down event
  onCellClicked: PropTypes.func, // 点击"单元格"回调
  onCellDoubleClicked: PropTypes.func, // 双击"单元格"回调
  onRowDragMove: PropTypes.func, // row drag move event
  onRowDragEnd: PropTypes.func, // row drag end event
  defaultColDef: PropTypes.object, // "列"默认配置
  showSelectorCol: PropTypes.bool, // 是否显示"序号"列
  groupedByPrFunction: PropTypes.bool, // 是否以"职能"分组
  rowDragAble: PropTypes.bool, // 是否可以拖动行以更改顺序
  gridOptions: PropTypes.object, // 一些"开关"选项
  onRowHeightChanged: PropTypes.func, // 改变行高回调
  onAddRow: PropTypes.func, // 添加行数据回调
  onRemoveRows: PropTypes.func, // 删除行回调
  onHideCol: PropTypes.func, // 删除列回调
  onMoveCol: PropTypes.func, //移动列回调
  onCellValueChanged: PropTypes.func, // 单元格数据发生改变的回调
  onRowSelect: PropTypes.func, // 行选择回调
  shouldMarkDataStatus: PropTypes.bool, // 是否显示数据状态 "增"、"删"、"改"
  highlightText: PropTypes.string, // 需要高亮的文本
  redoCallBack: PropTypes.func, //重做回调
  undoCallBack: PropTypes.func, //撤销回调
  approvalPointCellEditorParams: PropTypes.object, // 审批点编辑态参数,
  controlSelf: PropTypes.bool, // 是否由grid自己控制数据的变化
  extendedContextMenuItems: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string,
      action: PropTypes.func,
    })
  ),
};

EditableGrid.defaultProps = {
  prFunctions: [],
  onGridReady: noop,
  onCellMouseOver: noop,
  onCellMouseOut: noop,
  onCellMouseDown: noop,
  onCellClicked: noop,
  onCellDoubleClicked: noop,
  onRowDragMove: noop,
  onRowDragEnd: noop,
  defaultColDef: {},
  gridOptions: {},
  showSelectorCol: true,
  groupedByPrFunction: true,
  rowDragAble: true,
  onRowHeightChanged: noop,
  onAddRow: noop,
  onRemoveRows: noop,
  onHideCol: noop,
  onMoveCol: noop,
  onCellValueChanged: noop,
  onRowSelect: noop,
  redoCallBack: noop,
  undoCallBack: noop,
  shouldMarkDataStatus: false,
  highlightText: '',
  approvalPointCellEditorParams: {},
  controlSelf: false,
  extendedContextMenuItems: [],
};

export default EditableGrid;
