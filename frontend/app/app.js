var angular = require('angular');
var jQuery = require('jquery');

window.jQuery = jQuery;
window.$ = jQuery;

angular.module('datatableApp', [
    'datatables'
]);

require('./app.config');
require('./services/data.service');
require('./controllers/main.controller');

