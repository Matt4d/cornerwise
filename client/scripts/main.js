'use strict';
require.config({
    paths: {
        // Dependencies:
        "underscore": "lib/underscore-min",
        "backbone": "lib/backbone",
        "leaflet": "http://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.3/leaflet",

        // I don't really want to use jQuery
        "jquery": "http://code.jquery.com/jquery-1.11.3.min",

        // Application: //
        "config": "src/config",
        "routes": "src/routes",

        // Backbone Models:
        "permit": "src/model/permit",

        // Backbone Collections:
        "permits": "src/model/permits",

        // Backbone Views:
        "permits-view": "src/view/permits",
        "map-view": "src/view/map",

        "setup": "src/setup"
    },

    shim: {
        "leaflet": {
            exports: "L"
        }
    }
});

require(["setup"], function(setup) {
    setup.start();
});
