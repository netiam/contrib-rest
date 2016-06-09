import profileFixture from './profile'

export default Object.freeze({
  data: {
    type: 'user',
    attributes: {
      username: 'user+profile',
      email: 'test+profile@neti.am',
      birthday: new Date(2015, 7, 3)
    },
    relationships: {
      profile: {
        data: {
          type: 'profile',
          id: profileFixture.id
        }
      }
    }
  }
})
