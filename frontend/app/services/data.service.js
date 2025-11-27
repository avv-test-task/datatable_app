var angular = require('angular');

angular
    .module('datatableApp')
    .service('DataService', DataService);

DataService.$inject = ['$http'];

function DataService($http) {
    var vm = this;
    var apiBase = '/api';

    vm.getItems = getItems;
    vm.switchItem = switchItem;

    function getItems(position) {
        var endpoint = position === 'a' ? '/table-a' : '/table-b';
        return $http.get(apiBase + endpoint)
            .then(function(response) {
                return response.data;
            });
    }

    function switchItem(id) {
        return $http.post(apiBase + '/move', { id: id })
            .then(function(response) {
                return response.data;
            });
    }
}

module.exports = {};

