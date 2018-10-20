import Sequelize from 'sequelize'
import cls from 'continuation-local-storage'
import uuid from 'uuid'

const namespace = cls.createNamespace(uuid.v4())
Sequelize.useCLS(namespace)

export const db = new Sequelize('netiam', 'netiam', 'netiam', {
  dialect: 'sqlite',
  storage: './test/db.sqlite',
  logging: false,
  operatorsAliases: false
})

export function setup(done) {
  db
    .sync()
    .then(() => done())
    .catch(done)
}

export function teardown(done) {
  db
    .drop()
    .then(() => done())
    .catch(done)
}
