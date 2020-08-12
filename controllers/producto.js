'use strict'

const ProductModel = require('../models/producto'),
      CategoryModel = require('../models/categoria'),
      SucursalModel = require('../models/sucursal'),
      AlmacenModel = require('../models/almacen'),
      TecnicaModel = require('../models/tecnica'),
      BasicoModel = require('../models/basico'),
      Utilidad = require('../ayuda/utilidad'),
      fs = require('fs'),
      xlstojson = require("xls-to-json-lc"),
      xlsxtojson = require("xlsx-to-json-lc"),
      excel = require('./excel')

function productsGet(req, res) {
    CategoryModel.getNamesOfCategories((error, categorias) => {
        if(!error){
            res.render('./products/manager', { usuario: req.session.user, categorias })        
        }
    })
}

function productsPost(req, res){
    let usuario = req.session.user,
        categoria = req.body.categoria
    ProductModel.getProductsByCategory( categoria, (error, productos) => { 
        if(!error) res.send(productos)
    })
}

function productsNewGet(req, res) {
    CategoryModel.getNamesOfCategories( (error, categorias) => { 
        (error) ? (
            Utilidad.printError(res, { msg: `Error al obtener las categorias: ${error}`, tipo: 0})
        ) : (
            res.render("./products/new",{ usuario: req.session.user, categorias })
        )
    })
}

function productsNewPost(req, res) {
    let nombreCategoria = req.body.categoria
    CategoryModel.getIdCategoryByName(nombreCategoria, (error, idCategoria) => {
        if(error){
            Utilidad.printError(res, { msg: `Error al buscar el id de la categoria: ${error}`, tipo: 0})
            return
        }
        let nuevoProducto = {
            nombre: req.body.nombre,
            descripcion: req.body.descripcion,
            codigo: req.body.codigo,
            minimo: req.body.minimo,
            esbasico: req.body.basico === 'Si',
            idCategoria
        }
        ProductModel.createProduct(nuevoProducto, error => { 
            if(error) {
                Utilidad.printError(res, {msg: `Error al guardar el nuevo producto: ${error}`, tipo: 1})
            } else {
                generarAlmacenes(req, res, nuevoProducto.codigo)
                if(nuevoProducto.esbasico) generarBasicosEnUso(req, res, nuevoProducto.codigo)
                res.json({msg:"",tipo:3})
            }
        })
    })
}

function productsIdProductoGet(req, res) {
    let usuario = req.session.user,
        idProducto = req.params.idProducto
    CategoryModel.getNamesOfCategories( (error, categorias) => { 
        if(error){
            Utilidad.printError(res, { msg: `Error al obtener las categorias: ${error}`, tipo: 0})
            return
        }
        ProductModel.getProductById(idProducto, (error, productoUpdate) => { 
            if(error){
                Utilidad.printError(res, { msg: `Error al obtener el producto: ${error}`, tipo: 0})
            }else{  
                (comprobarProducto(productoUpdate)) ? (
                    req.session.productoUpdate = productoUpdate,
                    res.render("./products/update",{ usuario, categorias, productoUpdate })
                ) : (
                    res.redirect('/products')
                )
                
            }
        })
    })
}

function productsIdProductoPut(req, res) {
    let nombreCategoria = req.body.categoria,
        idProducto = req.params.idProducto
    CategoryModel.getIdCategoryByName(nombreCategoria, (error, idCategoria) => { 
        if(error){
            Utilidad.printError(res, { msg: `Error al buscar el id de la categoria: ${error}`, tipo: 0})
            return
        }
        let productoUpdate = {
            idProducto,
            nombre: req.body.nombre,
            descripcion: req.body.descripcion,
            codigo: req.body.codigo,
            minimo: req.body.minimo,
            esbasico: req.body.basico === 'Si',
            idCategoria
        }
        ProductModel.updateProduct(productoUpdate, error => { 
            if(error) {
                Utilidad.printError(res, {msg: `Error al editar el producto: ${error}`, tipo: 1})
            } else {
                if(productoUpdate.esbasico && !req.session.productoUpdate.esBasico){ 
                    generarBasicosEnUso(req, res, productoUpdate.codigo)
                }
                res.json({msg:"",tipo:3})
            }
        })
    })
}

function productsIdProductoDelete(req, res) {
    let idProducto = req.params.idProducto
    ProductModel.deleteProduct(idProducto, error => {
        if(error) Utilidad.printError(res, {msg:`Error al borrar producto: ${error}`, tipo: 0})
        res.redirect('/products')
    })
}

function excelGet(req, res) {
    res.render("./products/excel",{ usuario: req.session.user })
}

function excelPost(req, res) {
    let exceltojson

    excel.upload(req, res, err => {
        if(err){
            Utilidad.printError(res, { msg: `error inesperado: ${err}`, tipo: 1})
            return
        }
        if(!req.file){
            Utilidad.printError(res, { msg: `no hay archivo`, tipo: 1})
            return
        }
        if(req.file.originalname.split('.')[req.file.originalname.split('.').length-1] === 'xlsx'){
            exceltojson = xlsxtojson
        }else{
            exceltojson = xlstojson
        }

        exceltojson({ input: req.file.path,  output: null, lowerCaseHeaders :true }, (err, productos) => {
            if( err ) {
                Utilidad.printError(res, { msg: "Error inesperado", tipo: 1})
                return
            }
            fs.unlinkSync(req.file.path)

            for( let i=0,contador=1331 ; i < productos.length ; i++,contador++ ){
  
                let producto = productos[i],
                    nombreCategoria = producto.categoria
                CategoryModel.getIdCategoryByName(nombreCategoria, (error, idCategoria) => {
                    if(error || !idCategoria){ 
                        Utilidad.printError(res, {msg: "Hubo error al agregar alguno de los productos", tipo: 2} )
                    } else {
                        let nuevoProducto = {
                            nombre: producto.nombre,
                            descripcion: producto.descripcion,
                            codigo: producto.codigo,
                            minimo: producto.minimo,
                            esbasico: producto.basico.toLowerCase() === 'si',
                            idCategoria
                        }
                        ProductModel.createProduct(nuevoProducto, error => { 
                            if(error){
                                Utilidad.printError(res, {msg: `Hubo error al agregar alguno de los productos: ${error}`, tipo: 2} )
                            } else {
                                generarAlmacenes(req, res, producto.codigo)
                                if(nuevoProducto.esbasico) generarBasicosEnUso(req, res, producto.codigo)
                            }
                        })
                    }

                })
                
            }
        })
    })
}

function generarAlmacenes(req, res, productCode) {

    ProductModel.getIdProductoByCode(productCode, (error, producto) => {
        if(error){ 
            Utilidad.printError(res, { msg: `Error al obtener el id del producto: ${error}`, tipo: 0})
            return
        }
        SucursalModel.getIdSucursalOfSucursales( (error, sucursales) => {
            if(error){ 
                Utilidad.printError(res, {msg:`Error al obtener el id de las sucursales: ${error}`, tipo: 0})
                return
            }
            sucursales.forEach(sucursal => generalAlmacen(req, res, sucursal.idSucursal, producto.idProducto))
        })
    })
}

function generalAlmacen(req, res, idSucursal, idProducto) {
    let nuevoAlmacen = {
        idProducto,
        idSucursal
    }
    AlmacenModel.createAlmacen(nuevoAlmacen, error => {
        if(error) Utilidad.printError(res, {msg:`Error al crear el almacen: ${error}`, tipo: 1})
    })
}

function generarBasicosEnUso(req, res, productCode) {
    ProductModel.getIdProductoByCode(productCode, (error, producto) => {
        if(error){ 
            Utilidad.printError(res, {msg:`Error al obtener el producto: ${error}`, tipo: 0})
        } else {
            TecnicaModel.getAllIdTecnica((error, tecnicas) => {
                if(error){ 
                    Utilidad.printError(res, {msg:`Error al obtener las tecsnicas: ${error}`, tipo: 0})
                } else { 
                    tecnicas.forEach(tecnica => generarBasicoEnUso(req, res, tecnica.idTecnica, producto.idProducto))
                }
            })
        }
    })
}

function generarBasicoEnUso(req, res, idTecnica, idProducto) {
    let basico = {
        idTecnica,
        idProducto,
        enUso: false
    }
    BasicoModel.getBasicoByProductAndTecnica(basico.idProducto, basico.idTecnica, (error, bas) => {
        if(bas || error){
            console.log(`Error, ya existe basico en uso`)
        }else{
            BasicoModel.createBasico(basico, error => {
                if(error) Utilidad.printError(res, {msg:`Error al crear el basico en uso: ${error}`, tipo: 0})
            })
        }
    })
}

function comprobarProducto(producto){
    try {
        return producto.idProducto != null
    } catch (error) {
        return false
    }
}

module.exports = {
    productsGet,
    productsPost,
    productsNewGet,
    productsNewPost,
    productsIdProductoGet,
    productsIdProductoPut,
    productsIdProductoDelete,
    excelGet,
    excelPost
}
