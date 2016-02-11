const _ = require('lodash').runInContext()
import {from} from '../jsonapi'
import Instance from 'sequelize/lib/instance'

const mixin = {
  toJSONApi() {
    return from({documents: this})
  }
}

export default function(Sequelize) {
  _.mixin(Instance.prototype, mixin)
  return Sequelize
}
