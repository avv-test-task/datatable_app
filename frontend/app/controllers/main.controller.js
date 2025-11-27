'use strict';

const angular = require('angular');
const jQuery = require('jquery');

angular
.module('datatableApp')
.controller('MainController', MainController);

MainController.$inject = ['DataService', 'DTOptionsBuilder', '$q', '$timeout', '$scope'];

/**
* @function MainController
* @param {Object} DataService
* @param {Object} DTOptionsBuilder
* @param {Object} $q
* @param {Object} $timeout
* @param {Object} $scope
*/
function MainController(DataService, DTOptionsBuilder, $q, $timeout, $scope) {
    const vm = this;
    
    vm.itemsA = [];
    vm.itemsB = [];
    vm.selectAllA = false;
    vm.selectAllB = false;
    vm.dtInstanceA = {};
    vm.dtInstanceB = {};
    vm.isLoading = false;
    
    vm.loadItems = loadItems;
    vm.moveSelected = moveSelected;
    vm.hasSelection = hasSelection;
    vm.toggleSelectAll = toggleSelectAll;
    vm.onCheckboxChange = onCheckboxChange;
    
    vm.dtOptionsA = createDataTableOptions('a');
    vm.dtOptionsB = createDataTableOptions('b');
    
    activate();
    
    /**
    * @function activate
    */
    function activate() {
        loadItems();
    }

    /**
    * @function getItems
    * @param {string} position
    * @returns {Array}
    */
    function getItems(position) {
        return position === 'a' ? vm.itemsA : vm.itemsB;
    }

    /**
    * @function getSelectAllValue
    * @param {string} position
    * @returns {boolean}
    */
    function getSelectAllValue(position) {
        return position === 'a' ? vm.selectAllA : vm.selectAllB;
    }

    /**
    * @function setSelectAllValue
    * @param {string} position
    * @param {boolean} value
    */
    function setSelectAllValue(position, value) {
        if (position === 'a') {
            vm.selectAllA = value;
        } else {
            vm.selectAllB = value;
        }
    }

    /**
    * @function getDtInstance
    * @param {string} position
    * @returns {Object}
    */
    function getDtInstance(position) {
        return position === 'a' ? vm.dtInstanceA : vm.dtInstanceB;
    }

    /**
    * @function getTableIndex
    * @param {string} position
    * @returns {number}
    */
    function getTableIndex(position) {
        return position === 'a' ? 0 : 1;
    }
    
    /**
    * @function createDataTableOptions
    * @param {string} position
    * @returns {Object}
    */
    function createDataTableOptions(position) {
        return DTOptionsBuilder.newOptions()
        .withOption('paging', true)
        .withOption('pageLength', 10)
        .withOption('lengthChange', false)
        .withOption('searching', false)
        .withOption('ordering', false)
        .withOption('info', true)
        .withOption('deferRender', false)
        .withOption('dom', 't<"table-footer"ip>')
        .withOption('initComplete', function onInitComplete() {
            setupSelectAllCheckbox(position);
        })
        .withOption('drawCallback', function onDrawCallback() {
            setupSelectAllCheckbox(position);
        });
    }
    
    /**
    * @function loadItems
    */
    function loadItems() {
        DataService.getItems('a')
        .then(onLoadItemsASuccess)
        .catch(onLoadItemsError);
        
        DataService.getItems('b')
        .then(onLoadItemsBSuccess)
        .catch(onLoadItemsError);
    }
    
    /**
    * @function onLoadItemsASuccess
    * @param {Array} data
    */
    function onLoadItemsASuccess(data) {
        vm.itemsA = data;
    }
    
    /**
    * @function onLoadItemsBSuccess
    * @param {Array} data
    */
    function onLoadItemsBSuccess(data) {
        vm.itemsB = data;
    }
    
    /**
    * @function onLoadItemsError
    * @param {Object} error
    */
    function onLoadItemsError(error) {
        // In production: log to error tracking service (e.g., Sentry)
        // Example: Sentry.captureException(error);
    }
    
    /**
    * @function moveSelected
    * @param {string} position
    */
    function moveSelected(position) {
        const items = getItems(position);
        const promises = [];
        
        items.forEach(function onItemCheck(item) {
            if (item.selected) {
                promises.push(DataService.switchItem(item.id));
            }
        });
        
        if (promises.length === 0) {
            return;
        }
        
        vm.isLoading = true;
        
        $q.all(promises)
        .then(onMoveSelectedSuccess)
        .catch(onMoveSelectedError)
        .finally(onMoveSelectedFinally);
    }
    
    /**
    * @function onMoveSelectedSuccess
    */
    function onMoveSelectedSuccess() {
        clearSelections();
        loadItems();
    }
    
    /**
    * @function onMoveSelectedError
    * @param {Object} error
    */
    function onMoveSelectedError(error) {
        // In production: log to error tracking service (e.g., Sentry)
        // Example: Sentry.captureException(error);
    }
    
    /**
    * @function onMoveSelectedFinally
    */
    function onMoveSelectedFinally() {
        vm.isLoading = false;
    }
    
    /**
    * @function clearSelections
    */
    function clearSelections() {
        vm.itemsA.forEach(function onItemClear(item) {
            item.selected = false;
        });
        vm.itemsB.forEach(function onItemClear(item) {
            item.selected = false;
        });
        vm.selectAllA = false;
        vm.selectAllB = false;
    }
    
    /**
    * @function toggleSelectAll
    * @param {string} position
    */
    function toggleSelectAll(position) {
        const isSelected = getSelectAllValue(position);
        const items = getItems(position);
        
        items.forEach(function onItemToggle(item) {
            item.selected = isSelected;
        });
        
        $timeout(function onTimeout() {
            const dtInstance = getDtInstance(position);
            let tableElement = null;
            
            if (dtInstance && dtInstance.DataTable) {
                const table = dtInstance.DataTable;
                tableElement = jQuery(table.table().node());
            } else {
                const tableIndex = getTableIndex(position);
                tableElement = jQuery('table.display').eq(tableIndex);
            }
            
            if (tableElement.length === 0) {
                return;
            }
            
            const checkboxes = tableElement.find('tbody input[type="checkbox"]');
            
            checkboxes.each(function onCheckboxUpdate() {
                const checkbox = jQuery(this);
                const row = checkbox.closest('tr');
                const itemId = parseInt(row.attr('data-item-id'), 10);
                
                const item = items.find(function onItemFind(i) {
                    return i.id === itemId;
                });
                
                if (item) {
                    checkbox.prop('checked', isSelected);
                    item.selected = isSelected;
                }
                
            });
            
            $scope.$apply();
        }, 100);
    }
    
    /**
    * @function onCheckboxChange
    * @param {string} position
    * @param {Object} item
    */
    function onCheckboxChange(position, item) {
        const items = getItems(position);
        const allSelected = items.every(function onItemCheck(i) {
            return i.selected === true;
        });
        
        setSelectAllValue(position, allSelected);
    }
    
    /**
    * @function hasSelection
    * @param {string} position
    * @returns {boolean}
    */
    function hasSelection(position) {
        const items = getItems(position);
        return items.some(function onItemCheck(item) {
            return item.selected === true;
        });
    }
    
    /**
    * @function setupSelectAllCheckbox
    * @param {string} position
    */
    function setupSelectAllCheckbox(position) {
        const dtInstance = getDtInstance(position);
        const selectAllValue = getSelectAllValue(position);
        
        if (dtInstance && dtInstance.DataTable) {
            const tableNode = jQuery(dtInstance.DataTable.table().node());
            const selectAllCheckbox = tableNode.find('thead input[type="checkbox"]').first();
            
            if (selectAllCheckbox.length > 0) {
                selectAllCheckbox.off('change.selectAll').on('change.selectAll', function onSelectAllChange() {
                    const isSelected = jQuery(this).prop('checked');
                    setSelectAllValue(position, isSelected);
                    toggleSelectAll(position);
                });
                
                selectAllCheckbox.prop('checked', selectAllValue);
            }
        }
    }
}

module.exports = {};
