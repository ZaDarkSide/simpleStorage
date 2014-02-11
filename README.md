# simpleStorage

This is a fork of [jStorage](http://www.jstorage.org/) that only includes the minimal set of features. Older Internet Explorer versions are not supported.

simpleStorage does not have any dependencies, you can use it as a standalone script (introduces `simpleStorage`) global or as an AMD module (adds no globals).

simpleStorage is about 1kB in size when minimized and gzipped

## Usage

### set(key, value[, options])

Store or update a value in local storage.

```javascript
simpleStorage.set(key, value[, options])
```

Where

  * **key** - the key for the value
  * **value** - value to be stored (can be any JSONeable value)
  * **options** - optional options object. Currently only available option is `options.TTL` which can be used to set the TTL value to the key `simpleStorage.set(key, value, {TTL: 1000})`

Return values

  * **true** - value was stored
  * **true** - value was not stored
  * Error object - value was stored because of an error

### get(key)

Retrieve a value from local storage.

```javascript
value = simpleStorage.get(key)
```

Where

  * **key** - the key to be retrieved

Method returns the value for a key or undefined if the key was not found.

### deleteKey(key)

Removes a value from local storage.

```javascript
simpleStorage.deleteKey(key)
```

Return values

  * **true** - value was deleted
  * **true** - value was not found
  * Error object - value was not deleted because of an error

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
  * **true** - value was not found
  * Error object - ttl was not set because of an error

### getTTL(key)

Retrieve remaining milliseconds for a key

```javascript
ttl = simpleStorage.getTTL(key)
```

Where

  * **key** - the key to be checked

Returns remaining milliseconds or 0 if TTL was not set (or key was not found)

### flush()

Clear all values

```javascript
simpleStorage.flush()
```

Return values

  * **true** - storage was flushed
  * Error object - storage was not flushed because of an error

### index()

Retrieve all used keys as an array

```javascript
list = simpleStorage.index()
```

Returns an array.

### storageSize()

Get used storage in symbol count

```javascript
size = simpleStorage.storageSize()
```

### storageAvailable()

Check if local storage can be used

```javascript
canUse = simpleStorage.storageAvailable()
```

Returns true if storage is available

## Demo

See demo [here](http://tahvel.info/simpleStorage/example/).

## License

[Unlicense](http://unlicense.org/)
