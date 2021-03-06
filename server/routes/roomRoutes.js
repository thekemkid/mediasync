const async = require('async')
// const _ = require('lodash')
const uuid = require('node-uuid')
// const jwt = require('jsonwebtoken')
// const jwtKey = require('../../config/jwtKey.js')
// var validator = require('../../isomorphic/validator')

module.exports = function (db) {
  function convertListOfUsernamesToListOfUserIds (list, done) {
    var ids = []
    async.each(list, function (username, done) {
      db.view('user/byUsername', { key: username }, function (err, doc) {
        if (err) {
          return done()
        }
        if (doc[0]) {
          ids.push(doc[0].id)
          done(null)
        } else {
          done(null)
        }
      })
    }, function (err) {
      if (err) {/* nothing to see here. */}
      done(ids)
    })
  }

  return [
    {
      method: 'POST',
      path: '/api/room',
      config: { auth: 'jwt' },
      handler: function (request, reply) {
        // console.log(request.payload.user)
        var room = request.payload.room
        var creator = request.auth.credentials
        room.resource = 'Room'
        room.creator = creator.id

        console.log(room, creator)

        if (creator.emailValidated) {
          ensureRoomDoesntExist()
        } else {
          reply(new Error('creator email isn\'t valid'))
        }

        function ensureRoomDoesntExist () {
          db.view('room/byName', {key: room.name}, function (err, doc) {
            if (err) reply(new Error('problem connecting to db'))
            else if (doc[0]) reply(new Error('room name taken'))
            else convertControllers()
          })
        }

        function convertControllers () {
          if (room.controllers.length === 1) {
            room.controllers = [creator.id]
            convertInvitedUsers()
          } else if (room.controllers.length > 1) {
            convertListOfUsernamesToListOfUserIds(room.controllers, function (ids) {
              room.controllers = ids
              convertInvitedUsers()
            })
          } else {
            convertInvitedUsers()
          }
        }

        function convertInvitedUsers () {
          if (room.invitedUsers.length > 0) {
            convertListOfUsernamesToListOfUserIds(room.invitedUsers, function (ids) {
              room.invitedUsers = ids
              finaliseRoom()
            })
          } else {
            finaliseRoom()
          }
        }

        function finaliseRoom () {
          // TODO: check for id collisions
          db.save(uuid.v4(), room, function () {
            reply(room)
          })
        }
      }
    },
    {
      method: 'GET',
      path: '/api/room/{roomName}',
      config: { auth: false },
      handler: function (request, reply) {
        const roomName = request.params.roomName ? request.params.roomName : ''
        db.view('room/byName', { key: roomName }, function (err, doc) {
          if (err) return reply(new Error('something went wrong...'))
          if (doc[0]) reply(doc[0])
          else reply('room doesn\'t exist').code(404)
        })
      }
    },
    {
      method: 'GET',
      path: '/api/rooms',
      config: { auth: false },
      handler: function (request, reply) {
        db.view('room/public', function (err, res) {
          if (err) return reply(new Error('something went wrong...'))
          if (res) {
            async.map(res, function (room, done) {
              db.get(room.value.creator, function (err, creator) {
                if (err) return done(new Error('something went wrong...'))

                room.value.creatorUsername = creator.username

                done(null, room)
              })
            }, function (err, res) {
              if (err) return reply(new Error('something went wrong...'))
              reply(res)
            })
          }
          else reply('no rooms').code(404)
        })
      }
    },
    {
      method: 'GET',
      path: '/api/room/user/{userId}',
      config: { auth: false },
      handler: function (request, reply) {
        const userId = request.params.userId ? request.params.userId : ''
        db.view('room/byCreatorId', { key: userId }, function (err, res) {
          // console.log('res', err, res)
          if (err) return reply(new Error('something went wrong...'))
          if (res) reply(res)
          else reply('no rooms').code(404)
        })
      }
    }
  ]
}
