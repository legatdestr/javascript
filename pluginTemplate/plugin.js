/**
 * inspired by the article of Чупурнов Валерий
 */

;(function (factory) {

    if (typeof define === 'function' && define.amd) {
        // AMD
        define(['jquery'], factory);
    } else if (typeof exports === 'object') {
        // Node/CommonJS for Browserify
        module.exports = factory;
    } else {
        // use global browser vars
        factory(jQuery);
    }

}(function ($) {
    "use strict";

    function PluginName(elm, options) {
        var
            self = {},
            init = function () {
                $(elm).after('<div class="pluginName ' + options.position + '"></div>');
            };
        self.init = init;
        return self;
    }

    $.fn.pluginName = function (opt) {
        return this.each(function (opt) {
            var instance;
            if (!this.data('pluginName')) {
                instance = new PluginName(this, $.extend(true, $.fn.pluginName.defaultOptions), opt);
                instance.init();
                this.data('pluginName', instance);
            }
        });
    };


    $.fn.pluginName.defaultOptions = {
        position: 'top'
    };

}));