import { mergeDeep } from '@ag-grid-community/core/dist/es6/utils/object';
import { Events } from '@ag-grid-community/core/dist/es6/events';
import { get } from 'lodash';

let FilterService = {};

// initialize the extended filterService
FilterService.initExtFilterService = function () {
  this.filterService = this.gridRef.current.api.context.getBean('filterService');
  this.filterService.filterManager.__proto__.onFilterChanged =
    extendedFilterChangedHandler;

  this.filterService.currentFilterModels = {}; // 存储当前的filterModels
  this.filterService.getCurrentFilterModels = getCurrentFilterModels;
  this.filterService.setCurrentFilterModels = setCurrentFilterModels;
  this.filterService.getColCurrentFilterModel = getColCurrentFilterModel;
  this.filterService.setColCurrentFilterModel = setColCurrentFilterModel;
};

const extendedFilterChangedHandler = function (
  filterInstance,
  additionalEventAttributes
) {
  this.updateActiveFilters();
  this.updateFilterFlagInColumns('filterChanged', additionalEventAttributes);
  this.checkExternalFilter();
  this.allAdvancedFilters.forEach(function (filterWrapper) {
    filterWrapper.filterPromise.then(function (filter) {
      if (filter !== filterInstance && filter.onAnyFilterChanged) {
        filter.onAnyFilterChanged();
      }
    });
  });
  let filterChangedEvent = {
    type: Events.EVENT_FILTER_CHANGED,
    api: this.gridApi,
    columnApi: this.columnApi,
    column: get(filterInstance, 'providedFilterParams.column'),
    filterInstance,
  };
  if (additionalEventAttributes) {
    mergeDeep(filterChangedEvent, additionalEventAttributes);
  }
  // because internal events are not async in ag-grid, when the dispatchEvent
  // method comes back, we know all listeners have finished executing.
  this.processingFilterChange = true;
  this.eventService.dispatchEvent(filterChangedEvent);
  this.processingFilterChange = false;
};

const getCurrentFilterModels = function () {
  return this.currentFilterModels;
};
const setCurrentFilterModels = function (models) {
  this.currentFilterModels = models;
};

const getColCurrentFilterModel = function (colId) {
  return this.currentFilterModels[colId];
};
const setColCurrentFilterModel = function (colId, model) {
  this.currentFilterModels[colId] = model;
};

export default FilterService;
