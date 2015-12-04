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
  describe('params', () => {

    before(setup)
    after(teardown)

    it('should not include anything', () => {
      const associations = include({
        Model: User,
        param: []
      })

      should(associations).eql(undefined)
    })

    it('should throw error because of invalid include param', () => {
      (function() {
        include({
          Model: User,
          param: null
        })
      }).should.throw()
    })

    it('should include a document', () => {
      const associations = include({
        Model: User,
        param: 'Project'.split(',')
      })

      associations.should.have.length(1)
      associations[0].should.have.properties(['model'])
    })

    it('should include two documents', () => {
      const associations = include({
        Model: User,
        param: 'Project,User'.split(',')
      })

      associations.should.have.length(2)
      associations[0].should.have.properties(['model'])
      associations[1].should.have.properties(['model'])
    })

    it('should include a nested document', () => {
      const associations = include({
        Model: User,
        param: 'Project.User'.split(',')
      })

      associations.should.have.length(1)
      associations[0].should.have.properties(['model', 'include'])
      associations[0].include.should.have.length(1)
      associations[0].include[0].should.have.properties(['model'])
    })

  })
})
