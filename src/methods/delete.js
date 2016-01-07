export default function({model, idParam, idField, req, res}) {
  return model.sequelize
    .transaction(transaction => {
      return model
        .findOne({
          where: {
            [idField]: req.params[idParam]
          }
        })
        .then(document => {
          return document.destroy()
        })
        .then(() => {
          res.status(204)
        })
    })
}
