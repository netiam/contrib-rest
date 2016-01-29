import url from 'url'
import User from '../models/user'
import {
  setup,
  teardown
} from '../utils/db'
import {
  fields,
  filter,
  include,
  page,
  sort
} from '../../src/request'

describe('netiam', () => {
  describe('REST - request parts', () => {

    before(setup)
    after(teardown)

    it('should parse include', () => {
      let struct

      struct = include('comments.author,articles,people')

      struct.should.be.Array()
      struct.should.have.length(3)
      struct.should.eql(['comments.author', 'articles', 'people'])

      struct = include('')

      struct.should.be.Array()
      struct.should.have.length(0)

      struct = include(null)

      struct.should.be.Array()
      struct.should.have.length(0)
    })

    it('should parse fields', () => {
      let struct

      struct = fields({
        articles: 'title,body',
        people: 'name'
      })

      struct.should.have.properties(['articles', 'people'])
      struct.articles.should.be.Array()
      struct.articles.should.have.length(2)
      struct.articles[0].should.eql('title')
      struct.articles[1].should.eql('body')

      struct.people.should.be.Array()
      struct.people.should.have.length(1)
      struct.people[0].should.eql('name')

      struct = fields({})

      struct.should.be.Object()
      struct.should.be.empty()

      struct = fields(null)

      struct.should.be.Object()
      struct.should.be.empty()

      struct = fields()

      struct.should.be.Object()
      struct.should.be.empty()
    })

    it('should parse sort', () => {
      let struct

      struct = sort('-created,title')

      struct.should.be.Array()
      struct.should.have.length(2)

      struct[0].should.be.Object()
      struct[0].should.have.properties(['field', 'order'])
      struct[0].should.field = 'created'
      struct[0].should.order = 'DSC'

      struct[1].should.be.Object()
      struct[1].should.have.properties(['field', 'order'])
      struct[1].should.field = 'title'
      struct[1].should.order = 'ASC'

      struct = sort('')

      struct.should.be.Array()
      struct.should.have.length(0)

      struct = sort(null)

      struct.should.be.Array()
      struct.should.have.length(0)

      struct = sort()

      struct.should.be.Array()
      struct.should.have.length(0)
    })

    it('should parse page', () => {
      let struct

      struct = page({
        number: 1
      })

      struct.should.be.Object()
      struct.limit = 10
      struct.offset = 0

      struct = page({
        number: 0
      })

      struct.should.be.Object()
      struct.limit = 10
      struct.offset = 0

      struct = page({
        number: 2,
        size: 50
      })

      struct.should.be.Object()
      struct.limit = 50
      struct.offset = (2 - 1) * 50

      struct = page({
        limit: 22,
        offset: 15
      })

      struct.should.be.Object()
      struct.limit = 22
      struct.offset = 15

      struct = page({
        before: 'a',
        after: 'b'
      })

      struct.should.be.Object()
      struct.should.have.property('where')
      struct.where.should.have.property('$and')

      struct.where.$and.should.be.Array()

      struct.where.$and[0].should.have.property('lt')
      struct.where.$and[0].lt.should.eql('a')

      struct.where.$and[1].should.have.property('gt')
      struct.where.$and[1].gt.should.eql('b')

      struct = page({})

      struct.should.be.Object()
      struct.limit = 10
      struct.offset = 0

      struct = page(null)

      struct.should.be.Object()
      struct.limit = 10
      struct.offset = 0

      struct = page()

      struct.should.be.Object()
      struct.limit = 10
      struct.offset = 0
    })

    it('should parse filter', done => {
      const f = filter('id EQ  \'1\' AND (username EQ \'eliias\' OR birthday GT 1985)')
      User
        .findAll({
          where: f.toObject()
        })
        .then(users => {
          console.log(users)
          done()
        })
        .catch(done)
    })

  })
})
