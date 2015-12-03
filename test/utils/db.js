import fs from 'fs'
import Sequelize from 'sequelize'

export const db = new Sequelize('netiam', 'netiam', 'netiam', {
  dialect: 'sqlite',
  storage: './test/db.sqlite',
  logging: false
})

export function setup(done) {
  db
    .sync()
    .then(() => done())
    .catch(done)
}

export function teardown(done) {
  fs.unlink('./test/db.sqlite', done)
}