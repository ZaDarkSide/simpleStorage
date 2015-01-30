/* jshint browser: true */
/* global define: false */

// AMD shim
(function (root, factory) {

	"use strict";

	if (typeof define === 'function' && define.amd) {
		define(factory);
	} else {
		root.simpleStorage = factory();
	}

}(this, function () {

	"use strict";

	var
        VERSION = "0.2.0",

        /* This is the object, that holds the cached values */
        _storage = false,
        /* This is the object that holds the TTL values */
        _storage_meta = false,

        /* How much space does the storage take */
        _storage_size = 0,

        _storage_available = false,

        _ttl_timeout = null;

	// This method might throw as it touches sessionStorage and doing so
	// can be prohibited in some environments
	function _init() {

		// If sessionStorage does not exist, the following throws
		// This is intentional
		window.sessionStorage.setItem("__simpleStorageInitTest", "tmpval");
		window.sessionStorage.removeItem("__simpleStorageInitTest");

		// Load data from storage
		_load_storage();

		// remove dead keys
		_handleTTL();

		// start listening for changes
		_setupUpdateObserver();

		// handle cached navigation
		if ("addEventListener" in window) {
			window.addEventListener("pageshow", function (event) {
				if (event.persisted) {
					_reloadData();
				}
			}, false);
		}

		_storage_available = true;
	}

	/**
     * Sets up a storage change observer
     */
	function _setupUpdateObserver() {
		if ("addEventListener" in window) {
			window.addEventListener("storage", _reloadData, false);
		} else {
			document.attachEvent("onstorage", _reloadData);
		}
	}

	/**
     * Reload data from storage when needed
     */
	function _reloadData() {
		try {
			_load_storage();
		} catch (E) {
			_storage_available = false;
			return;
		}
		_handleTTL();
	}

	function _load_storage() {
		var source = sessionStorage.simpleStorage;
		var sourceMeta = sessionStorage.simpleStorageMeta;

		try {
			if (source) {
				_storage = JSON.parse(source);
			} else {
				// init storage
				_storage = {};
			}

			if (source && sourceMeta) {
				console.log('loading simpleStorage metadata', sourceMeta)
				_storage_meta = JSON.parse(sourceMeta);
			} else {
				// init meta
				_storage_meta = {};
				_storage_meta.TTL = { expire: {}, expireOrder: [] };
			}

		} catch (E) {
			_storage = {};
		}

		_storage_size = _getStorageSize();
	}

	function _save() {
		try {
			sessionStorage.simpleStorage = JSON.stringify(_storage);
			sessionStorage.simpleStorageMeta = JSON.stringify(_storage_meta);
			_storage_size = _getStorageSize();
		} catch (E) {
			return E;
		}
		return true;
	}

	function _getStorageSize() {
		return sessionStorage.simpleStorage ? String(sessionStorage.simpleStorage).length : 0
			   + sessionStorage.simpleStorageMeta ? String(sessionStorage.simpleStorageMeta).length : 0;
	}

	function _handleTTL() {
		var curtime, i, len, expire, expireOrder, keysRemoved = [], nextExpire = Infinity;

		clearTimeout(_ttl_timeout);

		if (!_storage || !_storage_meta) return;

		curtime = +new Date();

		for (i = 0; i < _storage_meta.TTL.expireOrder.length; i++) {
			var key = _storage_meta.TTL.expireOrder[i];
			var item = _storage[key];
			if (_storage_meta.TTL.expire[key] <= curtime) {
				delete _storage[key]; // remove actual data
				delete _storage_meta.TTL.expire[key]; // remove expire timeout
				_storage_meta.TTL.expireOrder.splice(0, 1); // remove expireOrder
				_save();
				keysRemoved.push(key) // defer to outside of for loop to avoid race conditions on array indexing

			} else {
				if (_storage_meta.TTL.expire[key] < nextExpire)
					nextExpire = _storage_meta.TTL.expire[key];
				break; // short circuit
			}
		}

		// dispatch simpleStorageItemRemoved events
		for (var i = 0; i < keysRemoved.length; i++) 
			_dispatchEvent('simpleStorageItemRemoved', { 'key': keysRemoved[i] })

		// set next check
		if (nextExpire != Infinity) 
			_ttl_timeout = setTimeout(_handleTTL, nextExpire - curtime);
	}

	function _setTTL(key, ttl) {
		var curtime = +new Date(), i, len, added = false;

		ttl = Number(ttl) || 0;

		// Set TTL value for the key
		if (ttl !== 0) {
			// If key exists, set TTL
			if (_storage.hasOwnProperty(key)) {

				_storage_meta.TTL.expire[key] = (curtime + ttl);

				// remove from expireOrder array
				if (_storage_meta.TTL.expire.hasOwnProperty(key)) {
					for (i = 0; i < _storage_meta.TTL.expireOrder.length; i++) {
						if (_storage_meta.TTL.expireOrder[i] == key) {
							_storage_meta.TTL.expireOrder.splice(i, 1);
							break;
						}
					}
				}

				// add to expireOrder array, preserving ttl (asc) sort
				for (i = 0; i < _storage_meta.TTL.expireOrder.length; i++) {
					if (_storage_meta.TTL.expire[_storage_meta.TTL.expireOrder[i]] >= (curtime + ttl)) {
						_storage_meta.TTL.expireOrder.splice(i, 0, key);
						added = true;
						break;
					}
				}

				if (!added) {
					_storage_meta.TTL.expireOrder.push(key);
					console.log('new key pushed', key, _storage_meta.TTL.expireOrder)
				}
			} else {
				return false;
			}
		} else {
			// Remove TTL if set
			if (_storage && _storage_meta && _storage_meta.TTL) {

				if (_storage_meta.TTL.expire.hasOwnProperty(key)) {
					delete _storage_meta.TTL.expire[key];
					for (i = 0, len = _storage_meta.TTL.expireOrder.length; i < len; i++) {
						if (_storage_meta.TTL.expireOrder[i] == key) {
							_storage_meta.TTL.expireOrder.splice(i, 1);
							break;
						}
					}
				}
			}
		}

		// schedule next TTL check
		clearTimeout(_ttl_timeout);
		if (_storage && _storage_meta && _storage_meta.TTL && _storage_meta.TTL.expireOrder.length) {
			_ttl_timeout = setTimeout(_handleTTL, Math.max(_storage_meta.TTL.expire[_storage_meta.TTL.expireOrder[0]] - curtime, 0));
		}

		return true;
	}

	function _dispatchEvent(eventName, item) {
		var event = new CustomEvent(
            eventName,
            {
            	detail: item,
            	bubbles: true,
            	cancelable: true
            }
        );
		document.dispatchEvent(event);
	}

	////////////////////////// PUBLIC INTERFACE /////////////////////////

	try {
		_init();
	} catch (E) { }

	return {

		version: VERSION,

		canUse: function () {
			return !!_storage_available;
		},

		set: function (key, value, options) {
			if (!_storage) {
				return false;
			}

			// undefined values are deleted automatically
			if (typeof value == "undefined") {
				return this.deleteKey(key);
			}

			options = options || {};

			// Check if the value is JSON compatible (and remove reference to existing objects/arrays)
			try {
				value = JSON.parse(JSON.stringify(value));
			} catch (E) {
				return E;
			}

			_storage[key] = value;

			_setTTL(key, options.TTL || 0);

			return _save();
		},

		get: function (key) {
			if (!_storage) {
				return false;
			}

			if (_storage.hasOwnProperty(key)) {
				// TTL value for an existing key should be either a positive number or an Infinity
				// so skip checking TTL for key
				if (this.getTTL(key)) {
					return _storage[key];
				}
			}
		},

		deleteKey: function (key) {

			if (!_storage) {
				return false;
			}

			if (key in _storage) {
				delete _storage[key];

				_setTTL(key, 0);

				return _save();
			}

			return false;
		},

		setTTL: function (key, ttl) {
			if (!_storage) {
				return false;
			}

			_setTTL(key, ttl);

			return _save();
		},

		getTTL: function (key) {
			var ttl;

			if (!_storage) {
				return false;
			}

			if (_storage.hasOwnProperty(key)) {
				if (_storage_meta &&
                    _storage_meta.TTL &&
                    _storage_meta.TTL.expire &&
                    _storage_meta.TTL.expire.hasOwnProperty(key)) {

					ttl = Math.max(_storage_meta.TTL.expire[key] - (+new Date()) || 0, 0);

					return ttl || false;
				} else {
					return Infinity;
				}
			}

			return false;
		},

		flush: function () {
			clearTimeout(_ttl_timeout);

			if (!_storage) return false;

			_storage = {};
			_storage_meta = {};
			try {
				sessionStorage.removeItem("simpleStorage");
				sessionStorage.removeItem("simpleStorageMeta");
				return true;
			} catch (E) {
				return E;
			}
		},

		index: function () {
			if (!_storage) {
				return false;
			}

			var index = [], i;
			for (i in _storage) {
				if (_storage.hasOwnProperty(i) && i != "__simpleStorage_meta") {
					index.push(i);
				}
			}
			return index;
		},

		storageSize: function () {
			return _storage_size;
		}
	};

}));