'use strict'

const express = require("express"),
    ProductoController = require('../controllers/producto'),
    producto = express.Router()
producto
    .route('/')
    .get(  ProductoController.productsGet)
    .post( ProductoController.productsPost)
producto
    .route("/new")
    .get( ProductoController.productsNewGet )
    .post( ProductoController.productsNewPost )
producto
    .route("/new/excel")
    .get( ProductoController.excelGet )
    .post( ProductoController.excelPost )
producto
    .route("/:idProducto")
    .get( ProductoController.productsIdProductoGet )
    .put( ProductoController.productsIdProductoPut )
    .delete( ProductoController.productsIdProductoDelete )

module.exports = producto