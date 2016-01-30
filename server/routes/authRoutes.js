// const _ = require('lodash')
const bcrypt = require('bcrypt')
const Jwt = require('jsonwebtoken')

const jwtKey = require('../../config/jwtKey.js')
const signupKey = require('../../config/signUpKey.js')

function sanitizeUser (user) {
  return {
    username: user.username,
    email: user.email
  }
}

module.exports = function (db) {
  return [
    {
      method: 'POST',
      path: '/api/auth/signin',
      config: {auth: false},
      handler: function (request, reply) {
        var username = request.payload.username
        var password = request.payload.password
        db.view('user/byUsername', { key: username }, function (err, doc) {
          if (err) {
            return reply('user doesn\'t exist').code(401)
          }
          if (doc[0]) {
            bcrypt.compare(password, doc[0].value.password, function (err, res) {
              if (err) return reply(new Error('something went wrong...'))
              if (!res) return reply('invalid password').code(401) // unauthorised

              var obj = {
                username: username,
                email: doc[0].value.email,
                agent: request.headers['user-agent'],
                expiresIn: '1000d'
              }
              Jwt.sign(obj, jwtKey, { algorithm: 'HS256' }, function (token) {
                reply(sanitizeUser(doc[0].value)).header('Authorization', token).code(201)
              })
            })
          } else {
            reply('user doesn\'t exist').code(404)
          }
        })
      }
    },
    {
      method: 'GET',
      path: '/api/auth/validate/{token?}',
      config: {auth: false},
      handler: function (request, reply) {
        Jwt.verify(request.params.token, signupKey, function (err, decoded) {
          if (err) return reply(new Error('Problem with verification'))
          db.view('user/byUsername', { key: decoded.username }, function (err, doc) {
            if (err) {
              return reply('problem getting user from database').code(404)
            }
            if (doc[0]) {
              db.merge(doc[0].value._id, { emailValidated: true }, function (err, res) {
                if (err) return reply('problem updating user in database').code(404)
                else {
                  reply()
                    .redirect('https://' + request.headers.host + '/validationSuccess')
                    .code(301)
                }
              })
            } else {
              reply('user doesn\'t exist').code(404)
            }
          })
        })
      }
    }
  ]
}