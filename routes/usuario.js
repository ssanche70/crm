'use strict'

const express = require('express'),
    UserController = require('../controllers/usuario'),
    user = express.Router()

user
    .get('/', UserController.usersGet )

user
    .route('/new')
    .get( UserController.usersNewGet )
    .post( UserController.usersNewPost )

user
    .route('/:idUsuario')
    .get( UserController.usersIdUsuarioGet )
    .put( UserController.usersIdUsuarioPut )

module.exports = user