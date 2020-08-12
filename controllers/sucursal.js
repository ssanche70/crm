'use strict'

const   SucursalModel = require('../models/sucursal'),
        ProductModel = require('../models/producto'),
        AlmacenModel = require('../models/almacen'),
        Utilidad = require('../ayuda/utilidad')

function sucursalesGet(req, res) {
    SucursalModel.getSucursales( (error, sucursales) => {
        (error) ? ( 
            Utilidad.printError(res, { msg: `Error al obtener las sucursales: ${error}`, tipo: 0})
        ) : ( 
            res.render('./sucursales/manager', { sucursales, usuario: req.session.user })
        )
    })
}

function sucursalesNewGet(req, res) {
    res.render('./sucursales/new', { usuario : req.session.user })
}

function sucursalesNewPost(req, res) {
    let nuevaSucursal = {
        plaza: req.body.plaza,
        ciudad: req.body.ciudad
    }
    SucursalModel.createSucursal(nuevaSucursal, error => {
        if(error){ 
            Utilidad.printError(res, { msg: `Error al guardar la nueva sucursal, plaza repetida: ${error}`, tipo: 1})
        } else { 
            res.json({msg:"",tipo:3})
            SucursalModel.getIdSucursalByPlaza(nuevaSucursal.plaza, (error, idSucursal) => {
                (error) ? (
                    Utilidad.printError(res, {msg: `Error al buscar el id de la sucursal: ${error}`, tipo: 0})
                ) : (
                    generarAlmacenes(req, res, idSucursal)
                )
            })
        }
    })
}

function sucursalesIdSucursalGet(req, res) {
    let idSucursal = req.params.idSucursal,
        usuario = req.session.user
    SucursalModel.getSucursalById(idSucursal, (error, sucursalUpdate) => {
        (error) ? ( 
            Utilidad.printError(res, { msg: `Error al obtener la sucursal: ${error}`, tipo: 0 })
        ) : ( 
            (comprobarSucursal(sucursalUpdate)) ? (
                res.render('./sucursales/update', {  usuario, sucursalUpdate })
            ) : (
                res.redirect('/sucursales')
            )

        )
    })
}

function sucursalesIdSucursalPut(req, res) {
    let sucursalUpdate = {
        idSucursal: req.params.idSucursal,
        plaza: req.body.plaza,
        ciudad: req.body.ciudad
    }
    SucursalModel.updateSucursal(sucursalUpdate, error => {
        (error) ? ( 
            Utilidad.printError(res, { msg: `Error al actualizar sucursal, plaza repetida: ${error}`, tipo: 1 })
        ) : ( 
            res.json({msg:"",tipo:3})
        )
    })
}

function sucursalesIdSucursalDelete(req, res) {
    let idSucursal = req.params.idSucursal
    SucursalModel.deleteSucursal(idSucursal, error => {
        if(error) Utilidad.printError(res, {msg:`Error al eliminar la sucursal: ${error}`, tipo: 0})
        res.redirect('/sucursales')
    })
}

function generarAlmacenes(req, res, idSucursal){
    ProductModel.getAllIdProducto((error, productos) => {
        if(error){
            Utilidad.printError(res, {msg: `Error al obtener los ids de los productos: ${error}`, tipo: 0})
        }else{
            let values = []
            for(let i=0 ; productos[i] ; i++){
                values.push([ idSucursal, productos[i].idProducto])
            }     
            
            AlmacenModel.createAlmacenes(values, (error) => {
                if(error) Utilidad.printError(res, {msg:`Error al crear el almacen: ${error}`, tipo: 1})
            })
        }
    })
}

function comprobarSucursal(sucursalUpdate){
    try {
        return sucursalUpdate.idSucursal != null
    } catch (error) {
        return false
    }
}

module.exports = {
    sucursalesGet,
    sucursalesNewGet,
    sucursalesNewPost,
    sucursalesIdSucursalGet,
    sucursalesIdSucursalPut,
    sucursalesIdSucursalDelete
}