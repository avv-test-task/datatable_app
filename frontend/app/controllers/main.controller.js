'use strict';

const angular = require('angular');

angular
    .module('datatableApp')
    .controller('MainController', MainController);

MainController.$inject = ['DataService', 'DTOptionsBuilder', '$q'];

/**
 * @function MainController
 * @param {Object} DataService
 * @param {Object} DTOptionsBuilder
 * @param {Object} $q
 */
function MainController(DataService, DTOptionsBuilder, $q) {
    const vm = this;

    vm.itemsA = [];
    vm.itemsB = [];
    vm.selectedItemsA = {};
    vm.selectedItemsB = {};
    vm.dtInstanceA = {};
    vm.dtInstanceB = {};
    vm.isLoading = false;

    vm.loadItems = loadItems;
    vm.moveSelected = moveSelected;
    vm.hasSelection = hasSelection;

    vm.dtOptionsA = createDataTableOptions();
    vm.dtOptionsB = createDataTableOptions();

    activate();

    /**
     * @function activate
     */
    function activate() {
        loadItems();
    }

    /**
     * @function createDataTableOptions
     * @returns {Object}
     */
    function createDataTableOptions() {
        return DTOptionsBuilder.newOptions()
            .withOption('paging', true)
            .withOption('pageLength', 10)
            .withOption('lengthChange', false)
            .withOption('searching', false)
            .withOption('ordering', false)
            .withOption('info', true)
            .withOption('dom', 't<"table-footer"ip>');
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
        console.error('Error loading items:', error);
    }

    /**
     * @function moveSelected
     * @param {string} position
     */
    function moveSelected(position) {
        const selectedItems = position === 'a' ? vm.selectedItemsA : vm.selectedItemsB;
        const items = position === 'a' ? vm.itemsA : vm.itemsB;
        const promises = [];

        items.forEach(function onItemCheck(item) {
            if (selectedItems[item.id]) {
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
        console.error('Error moving items:', error);
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
        Object.keys(vm.selectedItemsA).forEach(function onKeyA(key) {
            delete vm.selectedItemsA[key];
        });
        Object.keys(vm.selectedItemsB).forEach(function onKeyB(key) {
            delete vm.selectedItemsB[key];
        });
    }

    /**
     * @function hasSelection
     * @param {string} position
     * @returns {boolean}
     */
    function hasSelection(position) {
        const selectedItems = position === 'a' ? vm.selectedItemsA : vm.selectedItemsB;
        return Object.keys(selectedItems).some(function onKeyCheck(key) {
            return selectedItems[key];
        });
    }
}

module.exports = {};
