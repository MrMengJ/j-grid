import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import memoizeOne from 'memoize-one';
import cssVars from 'css-vars-ponyfill';
import {
  cloneDeep,
  filter,
  find,
  findIndex,
  forEach,
  get,
  head,
  includes,
  isEmpty,
  keys,
  map,
  mapValues,
  sortBy,
  uniq,
} from 'lodash';

import EditableGrid from '../../../components/EditableGrid';
import {
  fetchCurrentPrs,
  fetchPrList,
  fetchPrsByPaging,
  fetchTemplateConfig,
  updatePrs,
} from '../api';
import LoadingSpinner from '../../../components/Loading/LoadingSpinner';
import {
  getColumnChangeStorage,
  getColumnMoveStorage,
  getRowChangeStorage,
  setColumnChangeStorage,
  setColumnMoveStorage,
  setRowChangeStorage,
} from '../../../helper/storage';
import {
  ColHideUndoRedoAction,
  ColMoveAction,
  ColWidthModAction,
  RowChangeAction,
  RowHeightModAction,
  RowMoveAction,
} from '../../../components/EditableGrid/UndoRedoService/UndoRedoAction';
import { getCurrentRowData } from '../../../components/EditableGrid/helper';
import {
  ProcessActionType,
  ROW_CHANGE_TYPE,
} from '../../../components/EditableGrid/constants';
import { off } from '../../../utils/dom';
import { getRGBA } from '../../../utils/style';

import Filter from './components/Filter';
import HeaderSetting from './components/HeaderSetting';
import {
  arr2ObjByKey,
  getPrFunctionRowData,
  produceCommonColOptions,
  producePath,
  produceRowData,
} from './helper';

const Wrapper = styled.div`
  width: 100%;
  height: 100%;
  padding: 20px;
`;

const Content = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const Operation = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
`;

const Left = styled.div``;

const Right = styled.div`
  display: flex;
`;

const GridContainer = styled.div`
  flex-grow: 1;
`;

const prListId = '457ecd28-5daa-432f-82cb-bb5494672dcc';

const OPERATION_TYPE = {
  add: 'add',
  remove: 'remove',
  update: 'update',
  recover: 'recover',
};

const initialModifications = {
  added: {},
  deleted: {},
  modified: {},
  recovered: {},
};

class PrListGrid extends Component {
  constructor(props) {
    super(props);
    this.state = {
      columnDefs: [], // ?????????
      rowData: null, // ??????
      prFunctions: [], // ??????,
      commonApprovalPointConfig: {},
      specialApprovalPointConfig: {},
      selectedRowIds: [], // ??????????????????id
      hidedColIds: [], // ?????????????????????id
    };
    this.modifications = cloneDeep(initialModifications);
    this.modificationsInPosting = {}; // ????????????modifications
    this.isModifying = false; // ?????????????????????????????????
    this.isPostingModification = false; // ?????????????????????????????????????????????????????????????????????
    this.rowSelectTimer = null; // rowSelect???????????????????????????????????????onRowSelect,??????????????????????????????rowSelect????????????????????????????????????setState
    this.temporarySelectedRowIds = []; // ???????????????selectedRowIds
  }

  componentDidMount() {
    // ?????????????????????
    fetchPrList(prListId, '')
      .then((response) => {
        const { prListTemplateItems, prFunctions } = response;
        this.setState({
          columnDefs: sortBy(prListTemplateItems, 'sortId'),
          prFunctions: sortBy(prFunctions, 'sortId'),
        });
      })
      .catch(() => {});

    // ????????????
    fetchPrsByPaging({
      prListId,
      prFunctionIds: ['0'],
      eachPageCount: 200,
      pageNumber: 1,
      keyword: '',
      enumIdsByTemplateId: null,
      referenceIdsByTemplateId: null,
      version: '',
      lastReleaseVersion: false,
      locationPrId: null,
    })
      .then((response) => {
        const { prs } = response;
        this.setState({ rowData: this.initRowHeightByStorage(produceRowData(prs)) });
      })
      .catch(() => {});

    //  ??????????????????????????????
    fetchTemplateConfig(prListId)
      .then((response) => {
        let commonApprovalPointConfig = {};
        let specialApprovalPointConfig = {};
        forEach(response, (item) => {
          const { prListTemplateId, id } = item;
          if (prListTemplateId) {
            specialApprovalPointConfig[id] = item;
          } else {
            commonApprovalPointConfig = item;
          }
        });
        this.setState({
          commonApprovalPointConfig,
          specialApprovalPointConfig,
        });
      })
      .catch(() => {});

    // ????????????css????????????grid??????????????????????????????
    this.handleChangeCssVars(this.props.currentTheme);

    //  ????????????????????????????????????????????????
    // this.postModificationsTimer = setInterval(this.handlePostModifications, 3000);
    // this.syncPrsTimer = setInterval(this.handleSyncPrsFromServer, 10000);

    // on(window, 'beforeunload', this.handleBeforeunload);
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    // ???????????????
    if (this.props.currentTheme !== prevProps.currentTheme) {
      this.handleChangeCssVars(this.props.currentTheme);
    }
  }

  componentWillUnmount() {
    // ???????????????
    clearInterval(this.syncPrsTimer);
    clearInterval(this.postModificationsTimer);

    // ??????????????????
    if (!this.isNoModifications()) {
      this.handlePostModifications();
    }

    off(window, 'beforeunload', this.handleBeforeunload);
  }

  handleChangeCssVars = (primaryColor) => {
    const produceGridColors = (primaryColor) => {
      return primaryColor
        ? {
            'primary-color': primaryColor,
            'selected-row-background-color': getRGBA(primaryColor, 0.3),
            'row-hover-color': getRGBA(primaryColor, 0.1),
            'input-focus-border-color': getRGBA(primaryColor, 0.4),
            'range-selection-background-color': getRGBA(primaryColor, 0.2),
            'range-selection-background-color-2': getRGBA(primaryColor, 0.36),
            'range-selection-background-color-3': getRGBA(primaryColor, 0.486),
            'range-selection-background-color-4': getRGBA(primaryColor, 0.5904),
          }
        : {};
    };

    cssVars({
      rootElement: document, // must be document, otherwise don't work on IE 11
      include: 'style',
      preserveStatic: false, // ????????????
      variables: produceGridColors(primaryColor),
    });
  };

  handleBeforeunload = (event) => {
    if (!this.isNoModifications()) {
      // ??????????????????
      this.handlePostModifications();
      event.returnValue = '';
      return '';
    }
    return null;
  };

  handleSyncPrsFromServer = () => {
    fetchCurrentPrs({
      prListId,
      prFunctionIds: ['0'],
      eachPageCount: 200,
      pageNumber: 1,
      keyword: '',
      enumIdsByTemplateId: null,
      referenceIdsByTemplateId: null,
      version: '',
      lastReleaseVersion: false,
      locationPrId: null,
    })
      .then((response) => {
        const { prs } = response;
        this.mergePrsAndModifications(
          this.initRowHeightByStorage(produceRowData(prs)),
          this.getMergedModifications(this.modificationsInPosting, this.modifications)
        );
      })
      .catch(() => {});
  };

  mergePrsAndModifications = (prs, modifications) => {
    const { added, deleted, modified, recovered } = modifications;
    let copiedPrs = cloneDeep(prs);
    const copiedAdded = cloneDeep(added);
    const copiedDeleted = cloneDeep(deleted);
    const copiedModified = cloneDeep(modified);
    const copiedRecovered = cloneDeep(recovered);

    // ?????? added
    // ??????prs
    forEach(copiedAdded, (addedItem) => {
      const { sortId, parentId } = addedItem;
      // ?????????????????????????????????pr???sortId
      forEach(copiedPrs, (prItem) => {
        if (prItem.parentId === parentId && prItem.sortId >= sortId) {
          prItem.sortId++;
        }
      });
      copiedPrs.push(addedItem);
    });

    // ?????? deleted
    // ??????prs
    forEach(copiedPrs, (item, index) => {
      // ????????????????????????????????????
      if (isEmpty(copiedDeleted)) {
        return false;
      }
      const matchedItem = copiedDeleted[item.id];
      if (matchedItem) {
        copiedPrs.splice(index, 1);
      }
    });
    // ??????deleted
    forEach(copiedDeleted, (item1) => {
      const index = findIndex(copiedPrs, (item2) => item2.id === item1.id);
      if (index < 0) {
        delete copiedDeleted[item1.id];
      }
    });

    // ?????? modified
    // ?????? prs
    forEach(copiedPrs, (item, index) => {
      // ????????????????????????????????????
      if (isEmpty(copiedModified)) {
        return false;
      }

      const matchedItem = copiedModified[item.id];
      if (matchedItem) {
        copiedPrs[index] = { ...item, ...matchedItem };
      }
    });
    //  ?????? modified
    forEach(copiedModified, (item1) => {
      const index = findIndex(copiedPrs, (item2) => item2.id === item1.id);
      if (index < 0) {
        delete copiedModified[item1.id];
      }
    });

    // ?????? recovered
    // ?????? recovered
    forEach(copiedRecovered, (item1) => {
      const index = findIndex(copiedPrs, (item2) => item2.id === item1.id);
      if (index >= 0) {
        delete copiedRecovered[item1.id];
      }
    });

    this.setState({
      rowData: this.initRowHeightByStorage(produceRowData(copiedPrs)),
    });
    this.modifications = {
      added: copiedAdded,
      deleted: copiedDeleted,
      modified: copiedModified,
      recovered: copiedRecovered,
    };
  };

  handlePostModifications = () => {
    // ????????????
    if (this.isNoModifications()) {
      return;
    }

    // ???????????????
    if (this.isModifying) {
      return;
    }

    // ???????????????????????????
    if (this.isPostingModification) {
      return;
    }

    console.log('=====', this.modifications);

    const added = this.modifications.added;
    const modified = this.modifications.modified;
    const deleted = this.modifications.deleted;
    this.modificationsInPosting = cloneDeep(this.modifications);
    this.resetModifications();
    // this.postModifications({ added, modified, deleted });
    this.mockPostModifications({ added, modified, deleted });
  };

  mockPostModifications = (params) => {
    this.isPostingModification = true;
    const promise = () =>
      new Promise((resolve, reject) => {
        // setTimeout(resolve, 1000);
        setTimeout(reject, 5000);
      });
    promise(prListId, params)
      .then(() => {
        console.log('success');
        this.isPostingModification = false;
        this.modificationsInPosting = {};
      })
      .catch(() => {
        console.log('fail');
        this.isPostingModification = false;
        this.modifications = this.getMergedModifications(
          this.modificationsInPosting,
          this.modifications
        );
        this.modificationsInPosting = {};
        console.log('this.modifications', this.modifications);
      });
  };

  postModifications = (params) => {
    this.isPostingModification = true;
    updatePrs(prListId, params)
      .then(() => {
        this.isPostingModification = false;
        this.modificationsInPosting = {};
      })
      .catch(() => {
        this.isPostingModification = false;
        this.modifications = this.getMergedModifications(
          this.modificationsInPosting,
          this.modifications
        );
        this.modificationsInPosting = {};
      });
  };

  // ?????????????????????
  getMergedModifications = (oldData, newData) => {
    const mergeAdded = (oldAdded, { newAdded, newModified, newDeleted }) => {
      let result = cloneDeep(oldAdded);

      // ??? newDeleted ??????
      forEach(result, (item, key) => {
        const matchedItem = newDeleted[item.id];
        if (matchedItem) {
          delete result[key];
        }
      });

      // ??? newModified ??????
      result = mapValues(result, (item) => {
        const matchedItem = newModified[item.id];
        return matchedItem ? { ...item, ...matchedItem } : item;
      });

      // ??? newAdded ??????
      result = { ...result, ...newAdded };

      return result;
    };

    const mergeDeleted = (
      { oldAdded, oldRecovered, oldDeleted },
      { newRecovered, newDeleted }
    ) => {
      // ??? newRecovered ??????
      let transformedOldDeleted = cloneDeep(oldDeleted);
      forEach(transformedOldDeleted, (item, key) => {
        const matchedItem = newRecovered[item.id];
        if (matchedItem) {
          delete transformedOldDeleted[key];
        }
      });

      // ??? oldAdded/oldRecovered ??????
      let transformedNewDeleted = cloneDeep(newDeleted);
      forEach(transformedNewDeleted, (item, key) => {
        const matchedItem = oldAdded[item.id] || oldRecovered[item.id];
        if (matchedItem) {
          delete transformedNewDeleted[key];
        }
      });

      return { ...transformedOldDeleted, ...transformedNewDeleted };
    };

    const mergeModified = (
      { oldModified, oldAdded, oldRecovered },
      { newDeleted, newModified }
    ) => {
      let transformedOldModified = cloneDeep(oldModified);
      // ??? newDeleted ??????
      forEach(transformedOldModified, (item, key) => {
        const matchedItem = newDeleted[item.id];
        if (matchedItem) {
          delete transformedOldModified[key];
        }
      });

      let transformedNewModified = cloneDeep(newModified);
      // ??? oldAdded/oldRecovered ??????
      forEach(transformedNewModified, (item, key) => {
        const matchedItem = oldAdded[item.id] || oldRecovered[item.id];
        if (matchedItem) {
          delete transformedNewModified[key];
        }
      });

      // oldModified ??? newModified ??????
      const result = cloneDeep(transformedOldModified);
      forEach(transformedNewModified, (item, key) => {
        if (result[key]) {
          result[key] = { ...result[key], ...item };
        } else {
          result[key] = item;
        }
      });

      return result;
    };

    const mergeRecovered = (
      { oldRecovered },
      { newModified, newDeleted, newRecovered }
    ) => {
      let transformedOldRecovered = cloneDeep(oldRecovered);
      // oldRecovered ??? newDeleted ??????
      forEach(transformedOldRecovered, (item, key) => {
        const matchedItem = newDeleted[item.id];
        if (matchedItem) {
          delete transformedOldRecovered[key];
        }
      });
      // oldRecovered  ??? newModified ??????
      transformedOldRecovered = mapValues(transformedOldRecovered, (item) => {
        const matchedItem = newModified[item.id];
        return matchedItem ? { ...item, ...matchedItem } : item;
      });

      // ??? newRecovered ??????
      return { ...transformedOldRecovered, ...newRecovered };
    };

    const {
      added: oldAdded,
      deleted: oldDeleted,
      modified: oldModified,
      recovered: oldRecovered,
    } = oldData;
    const {
      added: newAdded,
      deleted: newDeleted,
      modified: newModified,
      recovered: newRecovered,
    } = newData;

    const mergedAdded = mergeAdded(oldAdded, { newAdded, newDeleted, newModified });
    const mergedDeleted = mergeDeleted(
      { oldAdded, oldRecovered, oldDeleted },
      {
        newRecovered,
        newDeleted,
      }
    );
    const mergedModified = mergeModified(
      { oldModified, oldAdded, oldRecovered },
      {
        newAdded,
        newRecovered,
        newDeleted,
        newModified,
      }
    );
    const mergedRecovered = mergeRecovered(
      { oldRecovered },
      { newModified, newDeleted, newRecovered }
    );

    return {
      added: mergedAdded,
      deleted: mergedDeleted,
      modified: mergedModified,
      recovered: mergedRecovered,
    };
  };

  resetModifications = () => {
    this.modifications = cloneDeep(initialModifications);
  };

  isNoModifications = () => {
    const { added, deleted, modified, recovered } = this.getMergedModifications(
      this.modificationsInPosting,
      this.modifications
    );

    return isEmpty(added) && isEmpty(deleted) && isEmpty(modified) && isEmpty(recovered);
  };

  attachChildPrNameCols = (columns) => {
    if (isEmpty(columns)) {
      return [];
    }

    return [
      ...columns,
      {
        colId: 'prName-1',
        editable: true,
        field: 'prName-1',
        fixed: 'LEFT',
        headerName: '??????1',
        headerTooltip: '??????1',
        hide: false,
        id: 'prName-1',
        minWidth: null,
        name: '??????1',
        nameType: 'PR_NAME',
        parentId: '0a2ab66e-35ea-4043-842e-1a67779b0327',
        parentName: null,
        pinned: 'left',
        sortId: 1,
        status: 'NORMAL',
        valueType: 'PR_NAME',
        viewType: 'BASIC_INFO',
        width: 140,
      },
      {
        colId: 'prName-2',
        editable: true,
        field: 'prName-2',
        fixed: 'LEFT',
        headerName: '??????2',
        headerTooltip: '??????2',
        hide: false,
        id: 'prName-2',
        minWidth: null,
        name: '??????2',
        nameType: 'PR_NAME',
        parentId: '0a2ab66e-35ea-4043-842e-1a67779b0327',
        parentName: null,
        pinned: 'left',
        sortId: 1,
        status: 'NORMAL',
        valueType: 'PR_NAME',
        viewType: 'BASIC_INFO',
        width: 140,
      },
    ];
  };

  transformColumns = memoizeOne(({ columns, hidedColIds, columnChangeList }) => {
    return map(columns, (item) => {
      const commonOptions = produceCommonColOptions(item);
      const matchedColumnChangeItem = find(
        columnChangeList,
        (changedItem) => changedItem.id === item.id
      );
      return {
        ...commonOptions,
        width: matchedColumnChangeItem ? matchedColumnChangeItem.width : item.width,
        hide: includes(hidedColIds, item.id),
      };
    });
  });

  handleGridReady = (params) => {
    this.gridApi = params.api;
    this.columnApi = params.columnApi;
    this.gridInstance = params.gridInstance;
    this.initColHeaderByStorage();
  };

  initColHeaderByStorage = () => {
    let columnMoveObject = getColumnMoveStorage() || {};
    if (!isEmpty(columnMoveObject[prListId])) {
      columnMoveObject[prListId].forEach((item) => {
        const { id, toIndex } = item;
        this.columnApi.moveColumn(id, toIndex);
      });
    }
  };

  initRowHeightByStorage = (data) => {
    let rowData = cloneDeep(data);
    let rowChangeObject = getRowChangeStorage() || {};
    if (!isEmpty(rowChangeObject[prListId])) {
      rowChangeObject[prListId].forEach((item) => {
        const { id, height } = item;
        const row = findIndex(rowData, (item) => item.id === id);
        if (~row) {
          rowData[row].height = height;
        }
      });
    }
    return rowData;
  };

  handleChange = (newData) => {
    this.setState({ rowData: newData });
  };

  handleRowDragMove = () => {
    this.isModifying = true;
  };

  handleRowDragEnd = ({ rowData, draggedRow, needReorderedRowData }) => {
    const copiedRowData = cloneDeep(rowData);
    // ????????????????????????sortId
    forEach(copiedRowData, (item1, index) => {
      // ???????????????
      if (item1.id === draggedRow.id) {
        copiedRowData[index] = {
          ...item1,
          parentId: draggedRow.parentId,
          sortId: draggedRow.sortId,
        };
      }

      // ????????????sortId??????
      const matchedItem = find(needReorderedRowData, (item2) => item1.id === item2.id);
      if (matchedItem) {
        item1.sortId = matchedItem.sortId;
      }
    });
    this.setState({
      rowData: copiedRowData,
    });

    // ??????modifications
    const updated = [
      {
        rowId: draggedRow.id,
        modifications: [
          {
            field: 'parentId',
            newValue: draggedRow.parentId,
          },
          {
            field: 'sortId',
            newValue: draggedRow.sortId,
          },
        ],
      },
      ...map(needReorderedRowData, (item) => {
        const { id, sortId } = item;
        return {
          rowId: id,
          modifications: [
            {
              field: 'sortId',
              newValue: sortId,
            },
          ],
        };
      }),
    ];
    this.updateModifications(OPERATION_TYPE.update, updated);
  };

  updateStorageRowHeight = (options) => {
    const { rowId, rowHeight } = options;
    let columnChangeObject = getRowChangeStorage() || {};
    let row = findIndex(columnChangeObject[prListId], (item) => item.id === rowId);
    if (~row) {
      columnChangeObject[prListId][row].height = rowHeight;
      setRowChangeStorage(columnChangeObject);
    } else {
      if (columnChangeObject[prListId]) {
        columnChangeObject[prListId].push({
          id: rowId,
          height: rowHeight,
        });
      } else {
        columnChangeObject[prListId] = [
          {
            id: rowId,
            height: rowHeight,
          },
        ];
      }
      setRowChangeStorage(columnChangeObject);
    }
  };

  handleRowHeightChanged = (options) => {
    const { rowId, rowHeight } = options;
    const newRowData = map(this.state.rowData, (item) => {
      if (item.id === rowId) {
        return { ...item, height: rowHeight };
      }
      return item;
    });
    this.setState({ rowData: newRowData });
    this.updateStorageRowHeight(options);
  };

  handleColumnWidthChanged = (options) => {
    const { colId, width } = options;
    let columnChangeObject = getColumnChangeStorage() || {};
    let col = findIndex(columnChangeObject[prListId], (item) => item.id === colId);
    if (~col) {
      columnChangeObject[prListId][col].width = width;
      setColumnChangeStorage(columnChangeObject);
    } else {
      if (columnChangeObject[prListId]) {
        columnChangeObject[prListId].push({
          id: colId,
          width,
        });
      } else {
        columnChangeObject[prListId] = [
          {
            id: colId,
            width,
          },
        ];
      }
      setColumnChangeStorage(columnChangeObject);
    }
  };

  // ????????????????????????????????????????????????????????????
  updateModifications = (action, data) => {
    // handle add
    if (action === OPERATION_TYPE.add) {
      this.isModifying = true;

      const dataByKey = arr2ObjByKey(data, 'id');
      this.modifications.added = { ...this.modifications.added, ...dataByKey };
      this.isModifying = false;
    }

    // handle remove
    else if (action === OPERATION_TYPE.remove) {
      this.isModifying = true;

      const dataByKey = arr2ObjByKey(data, 'id');
      const { added, modified, recovered } = this.modifications;
      const newDeleted = filter(data, (item) => {
        return !includes(keys(added), item.id);
      });

      // ??????added
      forEach(added, (item, key) => {
        if (dataByKey[key]) {
          delete added[key];
        }
      });

      // ??????modified
      forEach(modified, (item, key) => {
        if (dataByKey[key]) {
          delete modified[key];
        }
      });

      // ??????recovered
      forEach(recovered, (item, key) => {
        if (dataByKey[key]) {
          delete recovered[key];
        }
      });

      // ??????deleted
      const newDeletedByKey = {};
      forEach(newDeleted, (item) => {
        newDeletedByKey[item.id] = item;
      });
      this.modifications.deleted = { ...this.modifications.deleted, ...newDeletedByKey };

      this.isModifying = false;
    }

    //handle update
    else if (action === OPERATION_TYPE.update) {
      this.isModifying = true;

      const { added, modified, recovered } = this.modifications;
      forEach(data, (item) => {
        const { rowId, modifications } = item;
        forEach(modifications, ({ field, newValue }) => {
          if (added[rowId]) {
            added[rowId][field] = newValue; // ??????added
          } else if (recovered[rowId]) {
            recovered[rowId][field] = newValue; // ??????recovered
          } else {
            if (!modified[rowId]) {
              modified[rowId] = { id: rowId };
            }
            modified[rowId][field] = newValue;
          }
        });
      });

      this.isModifying = false;
    }

    //handle recover
    else if (action === OPERATION_TYPE.recover) {
      this.isModifying = true;

      const dataByKey = arr2ObjByKey(data, 'id');
      const { deleted } = this.modifications;
      // ??????deleted
      forEach(deleted, (item, key) => {
        if (dataByKey[key]) {
          delete deleted[key];
        }
      });

      this.isModifying = false;
    }
  };

  handleAddRow = (options) => {
    const { add, addIndex, needReorderedRowData } = options;
    const newRowData = cloneDeep(this.state.rowData);
    //?????????
    newRowData.splice(addIndex, 0, add);
    // ????????????????????????sortId
    forEach(newRowData, (item1) => {
      // ??????????????????????????????sortId????????????????????????
      if (isEmpty(needReorderedRowData)) {
        return false;
      }
      const matchedItem = find(needReorderedRowData, (item2) => item1.id === item2.id);
      if (matchedItem) {
        item1.sortId = matchedItem.sortId;
      }
    });
    this.setState({ rowData: newRowData });
    this.updateModifications(OPERATION_TYPE.add, [add]);
    const updated = map(needReorderedRowData, (item) => {
      const { id, sortId } = item;
      return {
        rowId: id,
        modifications: [
          {
            field: 'sortId',
            newValue: sortId,
          },
        ],
      };
    });
    this.updateModifications(OPERATION_TYPE.update, updated);
  };

  handleRecoverRow = (options) => {
    const { recovered, recoverIndex } = options;
    const newRowData = cloneDeep(this.state.rowData);
    //?????????
    newRowData.splice(recoverIndex, 0, recovered);
    this.setState({ rowData: newRowData });
    this.updateModifications(OPERATION_TYPE.recover, [recovered]);
  };

  handleRemoveRows = (rows) => {
    const removedRowIds = map(rows, (item) => item.id);
    const newRowData = filter(this.state.rowData, (item) => {
      return !includes(removedRowIds, item.id);
    });
    this.setState({
      rowData: newRowData,
    });
    this.updateModifications(OPERATION_TYPE.remove, rows);
  };

  handleMoveColumn = (options) => {
    const { colId, toIndex } = options;
    let columnMoveObject = getColumnMoveStorage() || {};
    let col = findIndex(columnMoveObject[prListId], (item) => item.id === colId);
    if (~col) {
      columnMoveObject[prListId][col].toIndex = toIndex;
      setColumnMoveStorage(columnMoveObject);
    } else {
      if (columnMoveObject[prListId]) {
        columnMoveObject[prListId].push({
          id: colId,
          toIndex,
        });
      } else {
        columnMoveObject[prListId] = [
          {
            id: colId,
            toIndex,
          },
        ];
      }
      setColumnMoveStorage(columnMoveObject);
    }
  };

  handleUndoRedoEffect = (action, valueExtractor, processActionType) => {
    if (action instanceof RowChangeAction) {
      action.cellValueChanges.forEach((cellValueChange) => {
        if (cellValueChange.type === ROW_CHANGE_TYPE.ADD) {
          if (processActionType === ProcessActionType.UNDO) {
            this.handleRemoveRows(cellValueChange.newValue);
          } else if (processActionType === ProcessActionType.REDO) {
            this.handleAddRow({
              add: head(cellValueChange.newValue),
              addIndex: cellValueChange.index,
            });
          }
        } else if (cellValueChange.type === ROW_CHANGE_TYPE.REMOVE) {
          const { oldValue } = cellValueChange;
          if (processActionType === ProcessActionType.UNDO) {
            forEach(oldValue, (item) => {
              const { row, index } = item;
              this.handleRecoverRow({
                recovered: row,
                recoverIndex: index,
              });
            });
          } else if (processActionType === ProcessActionType.REDO) {
            const removedRows = map(oldValue, (item) => item.row);
            this.handleRemoveRows(removedRows);
          }
        } else {
          //todo handle row update
        }
      });
    } else if (action instanceof RowHeightModAction) {
      action.cellValueChanges.forEach((cellValueChange) => {
        this.handleRowHeightChanged({
          rowId: cellValueChange.rowId,
          rowHeight: valueExtractor(cellValueChange),
        });
      });
    } else if (action instanceof ColWidthModAction) {
      action.cellValueChanges.forEach((cellValueChange) => {
        this.handleColumnWidthChanged({
          colId: cellValueChange.colId,
          width: valueExtractor(cellValueChange),
        });
      });
    } else if (action instanceof ColMoveAction) {
      action.cellValueChanges.forEach((cellValueChange) => {
        this.handleMoveColumn({
          colId: cellValueChange.colId,
          toIndex: valueExtractor(cellValueChange).index,
        });
      });
    } else if (action instanceof RowMoveAction) {
      action.cellValueChanges.forEach((cellValueChange) => {
        const { oldValue, newValue } = cellValueChange;
        if (processActionType === ProcessActionType.UNDO) {
          const copiedRowData = cloneDeep(this.state.rowData);
          copiedRowData.splice(newValue.data.index, 1);
          copiedRowData.splice(oldValue.data.index, 0, oldValue.data);
          this.setState({ rowData: copiedRowData });
          const updated = [
            {
              rowId: oldValue.data.id,
              modifications: [
                {
                  field: 'sortId',
                  newValue: oldValue.data.sortId,
                },
                {
                  field: 'parentId',
                  newValue: oldValue.data.parentId,
                },
              ],
            },
          ];
          this.updateModifications(OPERATION_TYPE.update, updated);
        } else if (processActionType === ProcessActionType.REDO) {
          const copiedRowData = cloneDeep(this.state.rowData);
          copiedRowData.splice(oldValue.data.index, 1);
          copiedRowData.splice(newValue.data.index, 0, newValue.data);
          this.setState({ rowData: copiedRowData });
          const updated = [
            {
              rowId: newValue.data.id,
              modifications: [
                {
                  field: 'sortId',
                  newValue: newValue.data.sortId,
                },
                {
                  field: 'parentId',
                  newValue: newValue.data.parentId,
                },
              ],
            },
          ];
          this.updateModifications(OPERATION_TYPE.update, updated);
        }
      });
    } else if (action instanceof ColHideUndoRedoAction) {
      action.cellValueChanges.forEach((cellValueChange) => {
        const { oldValue, newValue } = cellValueChange;
        const { hidedColIds } = this.state;
        if (processActionType === ProcessActionType.UNDO) {
          const { colIds, visible } = oldValue;
          const newHidedColIds = visible
            ? filter(hidedColIds, (item) => {
                return !includes(colIds, item);
              })
            : [...hidedColIds, ...colIds];
          this.setState({
            hidedColIds: newHidedColIds,
          });
        } else if (processActionType === ProcessActionType.REDO) {
          const { colIds, visible } = newValue;
          const newHidedColIds = visible
            ? filter(hidedColIds, (item) => {
                return !includes(colIds, item);
              })
            : [...hidedColIds, ...colIds];
          this.setState({
            hidedColIds: newHidedColIds,
          });
        }
      });
    }
  };

  handleHideCol = (colIds) => {
    const newHidedColIds = uniq([...this.state.hidedColIds, ...colIds]);
    this.setState({
      hidedColIds: newHidedColIds,
    });
  };

  handleCellValueChanged = (params) => {
    const { colDef, data, oldValue, newValue } = params;
    const newRowData = getCurrentRowData(this.gridApi);
    this.setState({ rowData: newRowData });
    const updated = [
      {
        rowId: data.id,
        modifications: [
          {
            field: colDef.id,
            oldValue,
            newValue,
          },
        ],
      },
    ];
    this.updateModifications(OPERATION_TYPE.update, updated);
  };

  handleRowSelect = (params) => {
    if (isEmpty(this.temporarySelectedRowIds)) {
      this.temporarySelectedRowIds = cloneDeep(this.state.selectedRowIds);
    }

    if (params.node.group) {
      return;
    }

    // ??????temporarySelectedRowIds
    const {
      isSelected,
      data: { id },
    } = params;
    if (isSelected) {
      this.temporarySelectedRowIds.push(id);
    } else {
      const index = findIndex(this.temporarySelectedRowIds, (item) => {
        return item === id;
      });
      this.temporarySelectedRowIds.splice(index, 1);
    }

    // ???????????????????????????????????????????????????
    if (this.rowSelectTimer) {
      clearTimeout(this.rowSelectTimer);
    }

    // ??????state ??? ??????temporarySelectedRowIds
    this.rowSelectTimer = setTimeout(() => {
      this.setState({
        selectedRowIds: this.temporarySelectedRowIds,
      });
      this.temporarySelectedRowIds = [];
    }, 0);
  };

  handleExportAsExcel = () => {
    // TODO fetch api in the future
    console.log('?????????Excel log');
  };

  setColsVisible = (colIds) => {
    const { hidedColIds } = this.state;
    if (isEmpty(hidedColIds)) {
      this.setState({ hidedColIds: colIds });
      if (this.gridInstance) {
        this.gridInstance.dispatchColHideUndoRedoAction({
          oldValue: { colIds: colIds, visible: true },
          newValue: { colIds: colIds, visible: false },
        });
      }
    } else {
      this.setState({ hidedColIds: [] });
      if (this.gridInstance) {
        this.gridInstance.dispatchColHideUndoRedoAction({
          oldValue: { colIds: hidedColIds, visible: false },
          newValue: { colIds: hidedColIds, visible: true },
        });
      }
    }
  };

  producePrFunctionColDef = () => {
    const prFunctionCol = {
      parentId: '0',
      id: 'prFunction',
      field: 'prFunction',
      colId: 'prFunction',
      name: '????????????',
    };
    return {
      ...prFunctionCol,
      rowGroup: true,
    };
  };

  render() {
    const {
      columnDefs,
      rowData,
      prFunctions,
      commonApprovalPointConfig,
      specialApprovalPointConfig,
      hidedColIds,
    } = this.state;

    const columnChangeList = get(getColumnChangeStorage(), prListId, {});
    const transformedColumnDefs = this.attachChildPrNameCols(
      this.transformColumns({
        columns: [...columnDefs, this.producePrFunctionColDef()],
        hidedColIds,
        columnChangeList,
      })
    );
    const transformedRowData = map(rowData, (item) => {
      const prFunction = isEmpty(prFunctions)
        ? {}
        : getPrFunctionRowData(rowData, item, prFunctions);
      const pathArray = producePath(prFunction, prFunctions);
      const value = map(pathArray, (item) => get(item, 'name', '')).join(' - ');
      return {
        prFunction: value,
        ...item,
      };
    });

    return (
      <Wrapper>
        {isEmpty(transformedColumnDefs) ? (
          <LoadingSpinner />
        ) : (
          <Content>
            <Operation>
              <Left />
              <Right>
                <Filter />
                <HeaderSetting />
              </Right>
            </Operation>
            <GridContainer>
              <EditableGrid
                columnDefs={transformedColumnDefs}
                rowData={transformedRowData}
                prFunctions={prFunctions}
                gridOptions={{}}
                approvalPointCellEditorParams={{
                  commonApprovalPointConfig,
                  specialApprovalPointConfig,
                }}
                onGridReady={this.handleGridReady}
                onRowDragMove={this.handleRowDragMove}
                onRowDragEnd={this.handleRowDragEnd}
                onRowHeightChanged={this.handleRowHeightChanged}
                onAddRow={this.handleAddRow}
                onRemoveRows={this.handleRemoveRows}
                onHideCol={this.handleHideCol}
                onMoveCol={this.handleMoveColumn}
                onRowSelect={this.handleRowSelect}
                onCellValueChanged={this.handleCellValueChanged}
                onColumnWidthChanged={this.handleColumnWidthChanged}
                onExportAsExcel={this.handleExportAsExcel}
                undoCallBack={this.handleUndoRedoEffect}
                redoCallBack={this.handleUndoRedoEffect}
              />
            </GridContainer>
          </Content>
        )}
      </Wrapper>
    );
  }
}

PrListGrid.propTypes = {
  currentTheme: PropTypes.string,
};

PrListGrid.defaultProps = {};

export default PrListGrid;
