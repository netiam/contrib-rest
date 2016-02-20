# netiam-contrib-rest

[![Build Status](https://travis-ci.org/netiam/contrib-rest.svg)](https://travis-ci.org/netiam/contrib-rest)
[![Dependencies](https://david-dm.org/netiam/contrib-rest.svg)](https://david-dm.org/netiam/contrib-rest)
[![npm version](https://badge.fury.io/js/netiam-contrib-rest.svg)](http://badge.fury.io/js/netiam-contrib-rest)

> A REST plugin for netiam

## Get it

```
npm i -S netiam netiam-contrib-rest
```

## Example

```js
netiam({plugins})
  .rest({model: User})
  .json()
```

## Compound Documents

To reduce the number of HTTP requests, you can *embed* related documents within
the response object. You can do so, by utilizing the `include` parameter.

```
GET /articles?include=comments
```

Youc an also include more than one document at the same time.

```
GET /articles?include=comments,links
```

There is also support for deeply nested documents and documents on the same branch.

```
GET /articles?include=comments.author.profile,comments.author.image
```

## Transactions

This plugin does support transactions via [`sequelize cls`](http://sequelize.readthedocs.org/en/latest/docs/transactions/#automatically-pass-transactions-to-all-queries) namespaces.
However, it does not enforce transactions as you might use a database engine w/o
any support for transactions.

**How to**

```js
// test/utils/db.js
import Sequelize from 'sequelize'
import cls from 'continuation-local-storage'
import uuid from 'uuid'

const namespace = cls.createNamespace(uuid.v4())
Sequelize.cls = namespace

export const db = new Sequelize('database', 'username', 'password', {
  …
})
```

## License

[MIT License](http://en.wikipedia.org/wiki/MIT_License)
