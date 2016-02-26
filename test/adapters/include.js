import util from 'util'
import CompositePrimaryKey from '../models/composite-primary-key'
import User from '../models/user'
import Profile from '../models/profile'
import Project from '../models/project'
import Campaign from '../models/campaign'
import Component from '../models/component'
import Node from '../models/node'
import Transition from '../models/transition'
import {
  setup,
  teardown
} from '../utils/db'
import {
  include,
  includePath,
  isIncluded,
  hasAssociation,
  getAssociationModel
} from '../../src/adapters/sequelize'

describe('netiam', () => {
  describe('Adapters - sequelize#include', () => {

    before(setup)
    after(teardown)

    it('should check associations', () => {
      hasAssociation(User, 'campaigns').should.eql(true)
      hasAssociation(User, 'campaigns.nodes').should.eql(true)
      hasAssociation(User, 'campaigns.nodes.components').should.eql(true)
      hasAssociation(User, 'campaigns.nodes.transitions').should.eql(true)

      hasAssociation(User, 'projects').should.eql(true)

      hasAssociation(User, 'profile').should.eql(true)

      hasAssociation(User, 'foo').should.eql(false)
      hasAssociation(User, 'campaigns.foo').should.eql(false)
      hasAssociation(User, 'campaigns.nodes.bar').should.eql(false)
    })

    it('should get model for association', () => {
      getAssociationModel(User, 'campaigns').should.eql(Campaign)
      getAssociationModel(User, 'campaigns.nodes').should.eql(Node)
      getAssociationModel(User, 'campaigns.nodes.components').should.eql(Component)
      getAssociationModel(User, 'campaigns.nodes.transitions').should.eql(Transition)

      getAssociationModel(User, 'projects').should.eql(Project)

      getAssociationModel(User, 'profile').should.eql(Profile)
    })

    it('should check if path match any include param', () => {
      isIncluded(User, 'campaigns', [
        'campaigns.nodes.components',
        'campaigns.nodes.transitions'
      ]).should.eql(true)
      isIncluded(User, 'campaigns.nodes', [
        'campaigns.nodes.components',
        'campaigns.nodes.transitions'
      ]).should.eql(true)
      isIncluded(User, 'campaigns.nodes.transitions', [
        'campaigns.nodes.components',
        'campaigns.nodes.transitions'
      ]).should.eql(true)
      isIncluded(User, 'campaigns.nodes.components', [
        'campaigns.nodes.components',
        'campaigns.nodes.transitions'
      ]).should.eql(true)

      isIncluded(User, 'foo', [
        'campaigns.nodes.components',
        'campaigns.nodes.transitions'
      ]).should.eql(false)
      isIncluded(User, 'campaigns.foo', [
        'campaigns.nodes.components',
        'campaigns.nodes.transitions'
      ]).should.eql(false)
      isIncluded(User, 'campaigns.nodes.foo', [
        'campaigns.nodes.components',
        'campaigns.nodes.transitions'
      ]).should.eql(false)
      isIncluded(User, 'campaigns.foo.components', [
        'campaigns.nodes.components',
        'campaigns.nodes.transitions'
      ]).should.eql(false)
    })

    it('should create include query for path', () => {
      includePath(User, 'campaigns').should.eql({
        model: Campaign,
        as: 'campaigns'
      })
      includePath(User, 'campaigns.nodes').should.eql({
        model: Campaign,
        as: 'campaigns',
        include: [
          {
            model: Node,
            as: 'nodes'
          }
        ]
      })
      includePath(User, 'campaigns.nodes.components').should.eql({
        model: Campaign,
        as: 'campaigns',
        include: [
          {
            model: Node,
            as: 'nodes',
            include: [
              {
                model: Component,
                as: 'components'
              }
            ]
          }
        ]
      })
      includePath(User, 'campaigns.nodes.transitions').should.eql({
        model: Campaign,
        as: 'campaigns',
        include: [
          {
            model: Node,
            as: 'nodes',
            include: [
              {
                model: Transition,
                as: 'transitions'
              }
            ]
          }
        ]
      })
    })

    it('should filter falsy include values', () => {
      include(User, ['foo']).should.be.Array().of.length(0)
      include(User, ['foo', '']).should.be.Array().of.length(0)
      include(User, ['foo', '.bar']).should.be.Array().of.length(0)
    })

    it('should create include query for param', () => {
      const query = include(User, [
        'profile',
        'projects',
        'campaigns',
        'campaigns.nodes',
        'campaigns.nodes.components',
        'campaigns.nodes.transitions'
      ])

      query.should.eql([
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
          include: [
            {
              model: Node,
              as: 'nodes',
              include: [
                {
                  model: Component,
                  as: 'components'
                },
                {
                  model: Transition,
                  as: 'transitions'
                }
              ]
            }
          ]
        }
      ])
    })

  })
})
