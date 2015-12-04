# netiam-contrib-rest

[![Build Status](https://travis-ci.org/netiam/contrib-rest.svg)](https://travis-ci.org/netiam/contrib-rest)
[![Dependencies](https://david-dm.org/netiam/contrib-rest.svg)](https://david-dm.org/netiam/contrib-rest)
[![npm version](https://badge.fury.io/js/netiam-contrib-rest.svg)](http://badge.fury.io/js/netiam-contrib-rest)

> A REST plugin for netiam

## Example

```js
netiam()
  .rest({
    Model: User
    idField: 'id',
    idParam: 'id'}
  })
  .json()
```

## License

[MIT License](http://en.wikipedia.org/wiki/MIT_License)
