import Sequelize from 'sequelize'
import {db} from '../utils/db'

const CompositePrimaryKey = db.define('CompositePrimaryKey', {
  firstname: {
    type: Sequelize.STRING,
    primaryKey: true
  },
  lastname: {
    type: Sequelize.STRING,
    primaryKey: true
  }
})

export default CompositePrimaryKey
