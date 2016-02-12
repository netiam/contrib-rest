import util from 'util'
import should from 'should'
import {include} from '../src/params'

import User from './models/user'
import Project from './models/project'
import {
  setup,
  teardown
} from './utils/db'

let user

describe('netiam', () => {
  describe('REST - params', () => {

    before(setup)
    after(teardown)

    it('should not include anything', () => {
      const associations = include({
        model: User,
        param: []
      })
      should(associations).eql([])
    })

    it('should throw error because of invalid include param', () => {
      (function() {
        include({
          model: User,
          param: null
        })
      }).should.throw()
    })

    it('should include a document', () => {
      const associations = include({
        model: User,
        param: 'projects'.split(',')
      })

      associations.should.have.length(1)
      associations[0].should.have.properties(['model'])
    })

    it('should include two documents', () => {
      const associations = include({
        model: User,
        param: 'projects,profile'.split(',')
      })

      associations.should.have.length(2)
      associations[0].should.have.properties(['model'])
      associations[1].should.have.properties(['model'])
    })

    it('should include a nested document', () => {
      const associations = include({
        model: User,
        param: 'projects.owner'.split(',')
      })

      associations.should.have.length(1)
      associations[0].should.have.properties(['model', 'include'])
      associations[0].include.should.have.length(1)
      associations[0].include[0].should.have.properties(['model'])
    })

    it.skip('should test invalid parameter combinations for include', () => {

    })

  })
})
