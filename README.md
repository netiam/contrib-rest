# netiam-contrib-rest

[![Build Status](https://travis-ci.org/netiam/contrib-rest.svg)](https://travis-ci.org/netiam/contrib-rest)
[![Dependencies](https://david-dm.org/netiam/contrib-rest.svg)](https://david-dm.org/netiam/contrib-rest)
[![npm version](https://badge.fury.io/js/netiam-contrib-rest.svg)](http://badge.fury.io/js/netiam-contrib-rest)

> A REST plugin for netiam

## Example

```js
netiam()
  .rest({model: User})
  .json()
```

## Transactions

The plugin does support transactions over Sequelize `cls` namespaces. It does
not enforce transactions as you might use a database engine w/o transaction support.

**How to**

```js
// test/utils/db.js
import Sequelize from 'sequelize'
import cls from 'continuation-local-storage'
import uuid from 'uuid'

const namespace = cls.createNamespace(uuid.v4())
Sequelize.cls = namespace

export const db = new Sequelize('netiam', 'netiam', 'netiam', {
  dialect: 'sqlite',
  storage: './test/db.sqlite',
  logging: false
})
```

## License

[MIT License](http://en.wikipedia.org/wiki/MIT_License)
