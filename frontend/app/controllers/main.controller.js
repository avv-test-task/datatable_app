var angular = require('angular');

angular
    .module('datatableApp')
    .controller('MainController', MainController);

MainController.$inject = ['DataService', 'DTOptionsBuilder', '$q'];

function MainController(DataService, DTOptionsBuilder, $q) {
        var vm = this;

        vm.itemsA = [];
        vm.itemsB = [];
        vm.selectedItemsA = {};
        vm.selectedItemsB = {};
        vm.dtInstanceA = {};
        vm.dtInstanceB = {};
        vm.isLoading = false;

        vm.dtOptionsA = DTOptionsBuilder.newOptions()
            .withOption('paging', true)
            .withOption('pageLength', 10)
            .withOption('lengthChange', false)
            .withOption('searching', false)
            .withOption('ordering', false)
            .withOption('info', true)
            .withOption('dom', 't<"table-footer"ip>');

        vm.dtOptionsB = DTOptionsBuilder.newOptions()
            .withOption('paging', true)
            .withOption('pageLength', 10)
            .withOption('lengthChange', false)
            .withOption('searching', false)
            .withOption('ordering', false)
            .withOption('info', true)
            .withOption('dom', 't<"table-footer"ip>');

        vm.loadItems = loadItems;
        vm.moveSelected = moveSelected;
        vm.hasSelection = hasSelection;

        loadItems();

        function loadItems() {
            DataService.getItems('a').then(function(data) {
                vm.itemsA = data;
            });

            DataService.getItems('b').then(function(data) {
                vm.itemsB = data;
            });
        }

        function moveSelected(position) {
            var selectedItems = position === 'a' ? vm.selectedItemsA : vm.selectedItemsB;
            var items = position === 'a' ? vm.itemsA : vm.itemsB;
            var promises = [];

            items.forEach(function(item) {
                if (selectedItems[item.id]) {
                    promises.push(DataService.switchItem(item.id));
                }
            });

            if (promises.length === 0) {
                return;
            }

            vm.isLoading = true;

            $q.all(promises).then(function() {
                for (var key in vm.selectedItemsA) {
                    if (vm.selectedItemsA.hasOwnProperty(key)) {
                        delete vm.selectedItemsA[key];
                    }
                }
                for (var key in vm.selectedItemsB) {
                    if (vm.selectedItemsB.hasOwnProperty(key)) {
                        delete vm.selectedItemsB[key];
                    }
                }
                loadItems();
            }).finally(function() {
                vm.isLoading = false;
            });
        }

        function hasSelection(position) {
            var selectedItems = position === 'a' ? vm.selectedItemsA : vm.selectedItemsB;
            return Object.keys(selectedItems).some(function(key) {
                return selectedItems[key];
            });
        }

    }

module.exports = {};

