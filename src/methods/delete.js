import {apply as applyScope} from '../scope'

export default function({model, scopes, idParam, idField, req, res}) {
  model = applyScope(model, scopes, req, res)

  return model.sequelize
    .transaction(() => {
      return model
        .findOne({where: {[idField]: req.params[idParam]}})
        .then(document => document.destroy())
        .then(() => res.status(204))
    })
}
