import userFixture from './user'
import projectFixture from './project'

export default Object.freeze({
  data: {
    id: '1573a1e9-9eee-4ef1-9f6f-316c34110e5d',
    type: 'user',
    attributes: Object.assign({}, userFixture, {username: 'hello new username'}),
    relationships: {
      projects: {
        data: [
          {
            type: 'project',
            id: projectFixture.id
          }
        ]
      }
    }
  }
})
