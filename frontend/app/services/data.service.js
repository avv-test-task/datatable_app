'use strict';

const angular = require('angular');

angular
    .module('datatableApp')
    .service('DataService', DataService);

DataService.$inject = ['$http'];

/**
 * @function DataService
 * @param {Object} $http
 */
function DataService($http) {
    const service = this;
    const apiBase = '/api';

    service.getItems = getItems;
    service.switchItem = switchItem;

    /**
     * @function getItems
     * @param {string} position
     * @returns {Promise}
     */
    function getItems(position) {
        const endpoint = position === 'a' ? '/table-a' : '/table-b';
        return $http.get(apiBase + endpoint)
            .then(onGetItemsSuccess)
            .catch(onGetItemsError);
    }

    /**
     * @function switchItem
     * @param {number} id
     * @returns {Promise}
     */
    function switchItem(id) {
        return $http.post(apiBase + '/move', { id: id })
            .then(onSwitchItemSuccess)
            .catch(onSwitchItemError);
    }

    /**
     * @function onGetItemsSuccess
     * @param {Object} response
     * @returns {Array}
     */
    function onGetItemsSuccess(response) {
        return response.data;
    }

    /**
     * @function onGetItemsError
     * @param {Object} error
     * @returns {Promise}
     */
    function onGetItemsError(error) {
        return Promise.reject(error);
    }

    /**
     * @function onSwitchItemSuccess
     * @param {Object} response
     * @returns {Object}
     */
    function onSwitchItemSuccess(response) {
        return response.data;
    }

    /**
     * @function onSwitchItemError
     * @param {Object} error
     * @returns {Promise}
     */
    function onSwitchItemError(error) {
        return Promise.reject(error);
    }
}

module.exports = {};
