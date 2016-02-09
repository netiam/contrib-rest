import Promise from 'bluebird'
import Sequelize from 'sequelize'
import {
  db,
  setup,
  teardown
} from '../utils/db'
import mixin from '../../src/mixins/jsonapi'

const M1 = db.define('Model1', {})

describe('netiam', () => {
  describe('Mixins - JSON API', () => {

    before(setup)
    after(teardown)

    it('initializes mixin', done => {
      M1.create({})
        .then(m1 => {
          m1.toJSONApi.should.be.Function()
          return m1
            .toJSONApi()
            .then(json => {
              json.should.have.properties(['data', 'included'])
              json.data.should.have.properties(['id', 'type', 'attributes'])
            })
        })
        .then(() => done())
        .catch(done)
    })

  })
})
