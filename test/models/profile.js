import Sequelize from 'sequelize'
import {db} from '../utils/db'

const Profile = db.define('Profile', {
  id: {
    type: Sequelize.UUID,
    primaryKey: true,
    isUUID: 4,
    defaultValue: Sequelize.UUIDV4
  }
})

export default Profile
