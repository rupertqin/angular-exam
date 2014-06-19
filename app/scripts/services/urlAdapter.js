'use strict';

angular.module('jxbFrontApp').service('UrlAdapter', [
    '$window',
    'I18n',
    function($window, i18n) {

        this.devModeAdapter = _devModeAdapter;
        this.localeModeAdapter = _localeModeAdapter;

        var config = $window._config,
            _ = $window._;

        function _getSearchParams() {
            var location = $window.location,
                params = location.search.slice(1).split('&'),
                settings = {};

            _.each(params, function(param) {
                var pair = param.split('=');
                var key = decodeURIComponent(pair[0]);

                // allow just a key to turn on a flag, e.g., test.html?debug
                var value = pair[1] ? decodeURIComponent(pair[1]) : true;
                settings[key] = value;
            });
            return settings;
        }

        function _devModeAdapter() {
            var settings = _getSearchParams();
            if ('online' in settings) {
                config.api.online = !(settings['online'] === 'false');
            }
            if ('offline' in settings) {
                config.api.online = (settings['offline'] === 'false');
            }

            // TODO console for dev mode
            console.debug('online', '=', config.api.online);
        }

        function _localeModeAdapter() {
            var settings = _getSearchParams(),
                locale = 'locale' in settings && _.contains(config.locale.locales, settings['locale']) ?
                        settings['locale'] : config.locale.defaults.locale;

            i18n.setLocale(locale);

            // TODO console for dev mode
            console.debug('locale', '=', locale);
        }
    }
]);
