/**
 * App module
 */
!function (exports) {
    var
        extendClass = function (Child, Parent) {
            var F = new Function();
            F.prototype = Parent.prototype;
            Child.prototype = new F();
            Child.prototype.constructor = Child;
            Child.parent = Parent.prototype;
            return Child;
        },
        isFunction = function (f) {
            return (typeof f === 'function');
        },
        isArray = function (arr) {
            var isArray = exports.Array.isArray;
            if (!isArray) {
                isArray = function (arr) {
                    return exports.Object.prototype.toString.call(arr) === '[object Array]';
                };
            }
            return isArray(arr);
        },
        isObject = function (obj) {
            var res = false;
            if (isArray(obj) === false) {
                res = (typeof obj === 'object');
            }
            return res;
        },

        isNumber = function (entity) {
            return (typeof entity === 'undefined') ? false : !isNaN(entity);
        },
        isString = function (entity) {
            return !!entity ? Object.prototype.toString.call(entity) === '[object String]' : false;
        },
        isEmpty = function (e) {
            if (typeof e === 'undefined') {
                return true;
            }
            if (e === 0) { // if e is a number
                return false;
            }
            var res = !e || (e == null) || (typeof e == 'undefined') || (e === '');
            if (res) {
                if (Object.prototype.toString.call(e) === '[object Array]') {
                    res = e.length == 0;
                }
            }
            if (res) {
                var pr;
                for (pr in e) {
                    if (Object.prototype.hasOwnProperty.call(e, pr)) {
                        res = false;
                        break;
                    }
                }
            }
            return res;
        },

        /**
         * Iterates through the entity and invokes the callback with the item as an
         * callback argument: callback(item).
         * If the callback function returns true then iteration process will be
         * interrupted.
         * @param {Object|Array} entity
         * @param {function} callback will be called like this: callback(item)
         * @param {type} context default is item context
         * @returns {Boolean} true if no errors
         */
        each = function (entity, callback, context) {
            var error = false;
            context = context || false;
            if (typeof entity === 'undefined') {
                error = true;
            }
            if (typeof callback !== 'function') {
                error = true;
            }
            if (!error) {
                if (Object.prototype.toString.call(entity) === '[object Array]') {
                    var i = 0,
                        len = entity.length;
                    for (i = 0; i < len; i++) {
                        if (context) {
                            if (callback.call(context, entity[i])) {
                                break;
                            }
                        } else {
                            if (callback.call(entity[i], entity[i])) {
                                break;
                            }
                        }
                    }
                } else {
                    if (Object.prototype.toString.call(entity) === '[object Object]') {
                        var item;
                        for (item in entity) {
                            if (Object.prototype.hasOwnProperty.call(entity, item)) {
                                if (context) {
                                    if (callback.call(context, item)) {
                                        break;
                                    }
                                } else {
                                    if (callback.call(item, item)) {
                                        break;
                                    }
                                }
                            }
                        }
                    }
                }
            }
            return !error;
        },

        /**
         * Checks if a value exists in an array
         * @param needle
         * @param haystack
         * @param strict
         * @returns {boolean}
         */
        inArray = function (needle, haystack) {
            var length = haystack.length;
            for (var i = 0; i < length; i++) {
                /* jshint eqeqeq: false, curly: false */
                if (haystack[i] == needle) return true;
            }
            return false;
        },
        noop = new Function(),

        isHTMLElement = function () {
            if ("HTMLElement" in window) {
                //  Quick and easy. And reliable.
                return function (el) {
                    return el instanceof HTMLElement;
                };
            } else if ((document.createElement("a")).constructor) {
                // We can access an element's constructor. So, this is not IE7
                var ElementConstructors = {}, nodeName;
                return function (el) {
                    return el && typeof el.nodeName === "string" &&
                        el instanceof ((nodeName = el.nodeName.toLowerCase()) in ElementConstructors ?
                            ElementConstructors[nodeName] :
                            (ElementConstructors[nodeName] = document.createElement(nodeName)).constructor);
                };
            } else {
                // Not that reliable, but we don't seem to have another choice. Probably IE7
                return function (el) {
                    return typeof el === "object" && el.nodeType === 1 && typeof el.nodeName === "string";
                };
            }
        }()
        ;

    // Observer
    var
        Observer = function () {
            "use strict";
            var
                publisher = {
                    subscribers: {
                        any: []
                    },

                    on: function (type, fn, context, once) {
                        type = type || 'any';
                        fn = typeof fn === "function" ? fn : context[fn];

                        if (typeof this.subscribers[type] === "undefined") {
                            this.subscribers[type] = [];
                        }

                        var subscribers = this.subscribers[type], len = subscribers.length, i;
                        // prevent adding the same handlers
                        for (i = 0; i < len; i++) {
                            if (subscribers[i].fn === fn && subscribers[i].context === context) {
                                return false;
                            }
                        }

                        this.subscribers[type].push({fn: fn, context: context || this, once: !!once});
                    },
                    once: function (type, fn, context) {
                        this.on(type, fn, context, true);
                    },
                    remove: function (type, fn, context) {
                        this.fireSubscribers('unsubscribe', type, fn, context);
                    },
                    /**
                     * Fire event on current object
                     * @param {String} type
                     * @param {Object} publication
                     * @param {Boolean} async If true then event will be invoked asynchronously. True by default
                     */
                    fire: function (type, publication, async) {
                        var self = this;
                        async = !!async;
                        if (async) {
                            setTimeout(function (t, p) {
                                return function () {
                                    self.fireSubscribers('publish', t, p);
                                };

                            }(type, publication), 0);
                        } else {
                            this.fireSubscribers('publish', type, publication);
                        }
                    },
                    fireSubscribers: function (action, type, arg, context) {
                        this._eveEnabled = this._eveEnabled || true;
                        this._logEvents = this._logEvents || false;
                        if (!this._eveEnabled) {
                            return;
                        }
                        var pubtype = type || 'any',
                            subscribers = this.subscribers[pubtype],
                            i,
                            max = subscribers ? subscribers.length : 0;

                        for (i = 0; i < max; i += 1) {
                            if (action === 'publish') {
                                if (typeof subscribers[i] !== 'undefined') {
                                    subscribers[i].fn.call(subscribers[i].context, arg);
                                    if (subscribers[i].once) {
                                        this.remove(subscribers[i], subscribers[i].fn, subscribers[i].context);
                                    }
                                    if (this._logEvents) {
                                        console.log('Observer event (action, type, arg, context): ', action, type, arg, context);
                                    }
                                }
                            } else {
                                if (typeof subscribers[i] !== 'undefined') {
                                    if (subscribers[i].fn === arg && subscribers[i].context === context) {
                                        subscribers.splice(i, 1);
                                        if (this._logEvents) {
                                            console.log('Observer event removed (action, type, arg, context): ', action, type, arg, context);
                                        }
                                    }
                                }
                            }
                        }
                    },
                    removeAllEventHandlers: function (type) {
                        var subscribers = this.subscribers[type];
                        if (Object.prototype.toString.call(subscribers) !== '[object Array]') {
                            return;
                        }
                        this.subscribers[type] = [];
                    },
                    clear: function () {
                        this.subscribers = {
                            any: []
                        };
                    },
                    pause: function () {
                        this._eveEnabled = false;
                    },
                    resume: function () {
                        this._eveEnabled = true;
                    },
                    log: function (enabled) {
                        enabled = enabled || false;
                        this._logEvents = enabled;
                    }
                };

            function makePublisher(o) {
                var i;
                for (i in publisher) {
                    if (Object.prototype.hasOwnProperty.call(publisher, i) && typeof publisher[i] === "function") {
                        o[i] = publisher[i];
                    }
                }
                // create the own instance of the subscribers
                o.subscribers = {any: []};
                return o;
            }

            return makePublisher;
        }();


    exports.smalllib = {
        extendClass: extendClass,
        isFunction: isFunction,
        isObject: isObject,
        isArray: isArray,
        isNumber: isNumber,
        isString: isString,
        isEmpty: isEmpty,
        isHTMLElement: isHTMLElement,
        noop: noop,
        each: each,
        Observer: Observer,
        inArray: inArray
    };
}(this);