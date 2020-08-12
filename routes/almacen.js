'use strict'

const express = require("express"),
    AlmacenController = require('../controllers/almacen'),
    almacen = express.Router()

almacen
    .route("/")
    .get(  AlmacenController.almacenGet )
    .post( AlmacenController.almacenPost )
almacen.put('/:idAlmacen/add' , AlmacenController.almacenIdAlmacenAddPut )
almacen.put('/:idAlmacen/sub' , AlmacenController.almacenIdAlmacenSubPut )
 
module.exports = almacen