import util from 'util'
import CompositePrimaryKey from '../models/composite-primary-key'
import User from '../models/user'
import Profile from '../models/profile'
import Project from '../models/project'
import Campaign from '../models/campaign'
import Node from '../models/node'
import Component from '../models/component'
import {
  idQuery,
  idValue,
  validateIncludePath,
  includeQuery,
  isIncluded
} from '../../src/adapters/sequelize'

describe('netiam', () => {
  describe('Adapters - sequelize', () => {

    it('should return idValue from model', () => {
      const value = idValue({
        model: CompositePrimaryKey,
        document: {
          firstname: 'hannes',
          lastname: 'moser'
        }
      })
      value.should.eql('hannes-moser')
    })

    it('should return idField from primaryKeys', () => {
      idQuery({
        model: CompositePrimaryKey,
        id: 'abc-def'
      }).should.eql({
        firstname: 'abc',
        lastname: 'def'
      })
      idQuery({
        model: User,
        id: 'abc'
      }).should.eql({
        id: 'abc'
      })
    })

    it('should throw error', () => {
      (function() {
        idQuery({
          model: CompositePrimaryKey,
          id: 'abc'
        })
      }).should.throw();

      (function() {
        idQuery({
          model: User,
          id: 'abc-def'
        })
      }).should.throw()
    })

    it('should validate include path', () => {
      validateIncludePath({
        model: User,
        path: 'campaigns'
      }).should.eql(true)

      validateIncludePath({
        model: User,
        path: 'campaigns.nodes'
      }).should.eql(true)

      validateIncludePath({
        model: User,
        path: 'campaigns.nodes.components'
      }).should.eql(true)

      validateIncludePath({
        model: User,
        path: 'projects'
      }).should.eql(true)

      validateIncludePath({
        model: User,
        path: 'profile'
      }).should.eql(true)

      validateIncludePath({
        model: User,
        path: ''
      }).should.eql(false)

      validateIncludePath({
        model: User,
        path: 'foo'
      }).should.eql(false)

      validateIncludePath({
        model: User,
        path: 'foo.bar'
      }).should.eql(false)

      validateIncludePath({
        model: User,
        path: 'profile.foo'
      }).should.eql(false)

      validateIncludePath({
        model: User,
        path: 'profile.foo.bar'
      }).should.eql(false)

      validateIncludePath({
        model: User,
        path: 'components.foo'
      }).should.eql(false)

      validateIncludePath({
        model: User,
        path: 'components.foo.bar'
      }).should.eql(false)
    })

    it('should build an include query', () => {
      includeQuery({
        model: User,
        param: 'profile,projects,campaigns.nodes.components'
      }).should.eql([
        {
          model: Profile,
          as: 'profile'
        },
        {
          model: Project,
          as: 'projects'
        },
        {
          model: Campaign,
          as: 'campaigns',
          include: {
            model: Node,
            as: 'nodes',
            include: {
              model: Component,
              as: 'components'
            }
          }
        }
      ])
    })

    it('should check if path is included', () => {
      isIncluded({
        model: User,
        path: 'profile',
        include: 'profile,projects,campaigns.nodes.components'
      }).should.eql(true)

      isIncluded({
        model: User,
        path: 'projects',
        include: 'profile,projects,campaigns.nodes.components'
      }).should.eql(true)

      isIncluded({
        model: User,
        path: 'campaigns.nodes.components',
        include: 'profile,projects,campaigns.nodes.components'
      }).should.eql(true)

      isIncluded({
        model: User,
        path: 'campaigns.nodes',
        include: 'profile,projects,campaigns.nodes.components'
      }).should.eql(true)

      isIncluded({
        model: User,
        path: 'campaigns',
        include: 'profile,projects,campaigns.nodes.components'
      }).should.eql(true)

      isIncluded({
        model: User,
        path: '',
        include: 'profile,projects,campaigns.nodes.components'
      }).should.eql(false)

      isIncluded({
        model: User,
        path: 'nodes',
        include: 'profile,projects,campaigns.nodes.components'
      }).should.eql(false)

      isIncluded({
        model: User,
        path: 'nodes.components',
        include: 'profile,projects,campaigns.nodes.components'
      }).should.eql(false)
      isIncluded({
        model: User,
        path: 'campaigns.components',
        include: 'profile,projects,campaigns.nodes.components'
      }).should.eql(false)
    })

  })
})
