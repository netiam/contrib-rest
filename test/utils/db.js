import Sequelize from 'sequelize'

export const db = new Sequelize('netiam', 'netiam', 'netiam', {
  dialect: 'sqlite',
  storage: './test/db.sqlite'
})

export function setup(done) {
  db
    .sync()
    .then(() => done())
    .catch(done)
}
