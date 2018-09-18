# simpleStorage

Cross-browser key-value store database to store data locally in the browser.

*simpleStorage* is a fork of [jStorage](http://www.jstorage.info/) that only includes the minimal set of features. Basically it is a wrapper for native `JSON` + `localStorage` with some TTL magic mixed in.

The module has no dependencies, you can use it as a standalone script (introduces `simpleStorage` global) or as an AMD module. All modern browsers (including mobile) are supported, older browsers (IE7, Firefox 3) are not.

*simpleStorage* is **very** small - about **1kB** in size when minimized and gzipped.

[![Build Status](https://travis-ci.org/ZaDarkSide/simpleStorage.png?branch=master)](https://travis-ci.org/ZaDarkSide/simpleStorage)

## Install

Quickest way to get up and running woulr be to use [jsDelivr CDN](http://www.jsdelivr.com/projects/simplestorage):

```html
<script src="https://cdn.jsdelivr.net/npm/simplestorage.js@0.2.1/simpleStorage.min.js"></script>
```

Otherwise you can download [simpleStorage.js](https://github.com/ZaDarkSide/simpleStorage/blob/master/simpleStorage.js) or install it with bower:

    bower install simpleStorage

and include the following script in your web application: *bower_components/simpleStorage/simpleStorage.js*

or install with npm

    npm install simplestorage.js

## Support simpleStorage development

[![Donate to author](https://www.paypalobjects.com/en_US/i/btn/btn_donate_SM.gif)](https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=DB26KWR2BQX5W)

If you want to support with Bitcoins, then my wallet address is `15Z8ADxhssKUiwP3jbbqJwA21744KMCfTM`

## Usage

*simpleStorage* API is a subset of jStorage with slight modifications, so for most cases it should work out of the box if you are converting from jStorage. Main difference is between return values - if an action failed because of an error (storage full, storage not available, invalid data used etc.), you get the error object as the return value. jStorage never indicated anything if an error occurred.

Possible error codes (from `err.code`):

  * **"LS_NOT_AVAILABLE"** means that localStorage is not supported by this browser
  * **"LS_DISABLE"** means that localStorage is supported by this browser but it can't be used for whatever reason (privacy mode, manual disabling etc.)
  * **"LS_QUOTA_EXCEEDED"** means that the allocated quota for localStorage is all used up or would be if current value is stored
  * *anything else*, no idea

### set(key, value[, options])

Store or update a value in local storage.

```javascript
simpleStorage.set(key, value[, options])
```

Where

  * **key** - the key for the value
  * **value** - value to be stored (can be any JSONeable value)
  * **options** - optional options object. Currently the only available option is `TTL` which sets the time-to-live (TTL) value in milliseconds for the given key/value

```javascript
// the following entry expires in 100 seconds
simpleStorage.set(key, value, {TTL: 100000})
```

Return values

  * **true** - value was stored
  * **false** - value was not stored
  * Error object - value was not stored because of an error. See `error.code` for explanation

### get(key)

Retrieve a value from local storage.

```javascript
value = simpleStorage.get(key)
```

Where

  * **key** - the key to be retrieved

Method returns the value for a key or undefined if the key was not found.

### hasKey(key)

Checks if there's a value with the given key in the local storage.

```javascript
simpleStorage.hasKey(key)
```

Where

  * **key** - the key to be checked

Method returns true if the given key exists, false otherwise.

### deleteKey(key)

Removes a value from local storage.

```javascript
simpleStorage.deleteKey(key)
```

Return values

  * **true** - value was deleted
  * **false** - value was not found
  * Error object - value was not deleted because of an error. See `error.code` for explanation

### setTTL(key, ttl)

Set a millisecond timeout. When the timeout is reached, the key is removed automatically from local storage.

```javascript
simpleStorage.setTTL(key, ttl)
```

Where

  * **key** - the key to be updated
  * **ttl** - timeout in milliseconds. If the value is 0, timeout is cleared from the key

Return values

  * **true** - ttl was set
  * **false** - value was not found
  * Error object - ttl was not set because of an error. See `error.code` for explanation

### getTTL(key)

Retrieve remaining milliseconds for a key with TTL

```javascript
ttl = simpleStorage.getTTL(key)
```

Where

  * **key** - the key to be checked

Return values

  * finite **number** - remaining milliseconds
  * **Infinity** - TTL is not set for the selected key
  * **false** - selected key does not exist or is expired

### flush()

Clear all values

```javascript
simpleStorage.flush()
```

Return values

  * **true** - storage was flushed
  * Error object - storage was not flushed because of an error. See `error.code` for explanation

### index()

Retrieve all used keys as an array

```javascript
list = simpleStorage.index()
```

Returns an array of keys.

### storageSize()

Get used storage in symbol count

```javascript
simpleStorage.storageSize()
```

### canUse()

Check if local storage can be used

```javascript
simpleStorage.canUse()
```

Returns true if storage is available

## Demo

See demo [here](http://tahvel.info/simpleStorage/example/).

## Tests

See QUnit tests [here](http://tahvel.info/simpleStorage/tests/).

## License

[Unlicense](http://unlicense.org/)
