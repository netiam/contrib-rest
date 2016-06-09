import teamFixture from './team'

export default Object.freeze({
  data: {
    type: 'user',
    attributes: {
      username: 'user+team',
      email: 'test+team@neti.am',
      birthday: new Date(2015, 7, 3)
    },
    relationships: {
      team: {
        data: {
          type: 'team',
          id: teamFixture.id
        }
      }
    }
  }
})
