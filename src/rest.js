import {HAS_MANY} from './relationships'
import create from './methods/create'
import read from './methods/read'
import update from './methods/update'
import del from './methods/delete'

export default function({
  model,
  idField = 'id',
  idParam = 'id',
  scopes = ['defaultScope'],
  relationship} = {}) {

  return function(req, res) {
    const {method} = req
    let isList = false

    if (!req.params[idParam]) {
      isList = true
    }

    if (relationship && relationship.type === HAS_MANY) {
      if (req[idParam] === relationship.idParam) {
        throw new Error('The relationship "idParam" must not match the base "idParam"')
      }
      if (!req.params[relationship.idParam]) {
        isList = true
      }
    }

    if (method === 'GET' && isList) {
      return read({
        model,
        scopes,
        relationship,
        req,
        res
      })
    }

    if (method === 'POST') {
      return create({
        model,
        scopes,
        relationship,
        req,
        res
      })
    }

    if (method === 'GET') {
      return read({
        model,
        scopes,
        idField,
        idParam,
        relationship,
        req,
        res
      })
    }

    if (method === 'HEAD') {
      return read({
        model,
        scopes,
        idField,
        idParam,
        relationship,
        req,
        res
      })
    }

    if (method === 'PATCH' || method === 'PUT') {
      return update({
        model,
        scopes,
        idField,
        idParam,
        relationship,
        req,
        res
      })
    }

    if (method === 'DELETE') {
      return del({
        model,
        scopes,
        idField,
        idParam,
        relationship,
        req,
        res
      })
    }
  }
}
