'use strict'

const express = require('express'),
    CategoryController = require('../controllers/categoria'),
    category = express.Router()

category
    .get('/', CategoryController.categoriesGet )

category
    .route('/new')
    .get( CategoryController.categoriesNewGet )
    .post( CategoryController.categoriesNewPost )

category
    .route('/:idCategoria')
    .get( CategoryController.categoriesIdCategoryGet )
    .put( CategoryController.categoriesIdCategoryPut )
    .delete( CategoryController.categoriesIdCategoryDelete )

module.exports = category