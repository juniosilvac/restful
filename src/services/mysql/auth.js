const sha1 = require('sha1')
const jwt = require('jsonwebtoken')

const auth = deps => {
  return {
    authenticate: (email, password) => {
      return new Promise((resolve, reject) => {
        const { connection, errorHandler } = deps
        const queryString = 'select id, email from users where email = ? and password = ?'
        const queryData = [email, sha1(password)]
        connection.query(queryString, queryData, (error, results) => {
          if (error || !results.length) {
            errorHandler(error, 'Falha ao localizar o usuário', reject)
            return false
          }
          const {email, id} = results[0]
          const token = jwt.sign(
            {email, id},
            process.env.JWT_SECRET,
            {expiresIn: 60 * 60 * 24})
          resolve({ token })
        })
      })
    },
    save: (email, password) => {
      return new Promise((resolve, reject) => {
        const { connection, errorHandler } = deps
        connection.query('insert into auth (email, password) values (?, ?)', [email, sha1(password)], (error, results) => {
          if (error) {
            errorHandler(error, `Falha ao salvar a usuário ${email}`, reject)
            return false
          }
          resolve({ user: { email, id: results.insertId } })
        })
      })
    },
    update: (id, password) => {
      return new Promise((resolve, reject) => {
        const { connection, errorHandler } = deps
        connection.query('update auth set email = ? where id = ?', [sha1(password), id], (error, results) => {
          if (error || !results.affectedRows) {
            errorHandler(error, `Falha ao atualizar o usuário de id ${id}`, reject)
            return false
          }
          resolve({ user: { id }, affectedRows: results.affectedRows })
        })
      })
    },
    del: (id) => {
      return new Promise((resolve, reject) => {
        const { connection, errorHandler } = deps
        connection.query('delete from auth where id = ?', [id], (error, results) => {
          if (error || !results.affectedRows) {
            errorHandler(error, `Falha ao remover a usuário de id ${id} `, reject)
            return false
          }
          resolve({ affectedRows: results.affectedRows })
        })
      })
    }
  }
}

module.exports = auth
