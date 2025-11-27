'use strict';

const angular = require('angular');

require('./bootstrap');

angular.module('datatableApp', [
    'datatables'
]);

require('./services/data.service');
require('./controllers/main.controller');
