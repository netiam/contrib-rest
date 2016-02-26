import {parse} from 'qs'
import {
  setup,
  teardown
} from '../utils/db'
import {normalize} from '../../src/params'

describe('netiam', () => {
  describe('REST - query', () => {

    before(setup)
    after(teardown)

    it('should create query', () => {
      const url = 'include=campaigns,projects&page[number]=2&sort=-name&filter=name EQ \'test\''
      const query = normalize(parse(url))

      query.should.eql({
        limit: 10,
        offset: 10,
        where: {name: 'test'},
        include: ['campaigns', 'projects'],
        order: [['name', 'DESC']]
      })
    })

  })
})
