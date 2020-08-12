'use strict'

const AlmacenModel = require('../models/almacen'),
      MovimientoModel = require('../models/movimiento'),
      CategoryModel = require('../models/categoria'),
      SucursalModel = require('../models/sucursal'),
      Utilidad = require('../ayuda/utilidad')

function almacenGet(req, res) { 
    let usuario = req.session.user

    if( usuario.permisos < 2){
        CategoryModel.getNamesOfCategories((error, categorias) => {
            if(!error){
                res.render('./almacen/manager', {usuario, categorias})
            }
        })
    }else{
        SucursalModel.getPlazasOfSucursales((error, sucursales) => {
            if(!error){
                CategoryModel.getNamesOfCategories((error, categorias) => {
                    if(!error){
                        res.render('./almacen/manager', {usuario, sucursales, categorias})
                    }
                })
            }
        })
    }
    
}

function almacenPost(req, res){
    let usuario = req.session.user,
        categoria = req.body.categoria,
        sucursal = (usuario.permisos < 2) ? usuario.idSucursal : req.body.plaza    
   
    if( usuario.permisos === 2){ // si es administrador general
        AlmacenModel.getAlmacenByPlazaAndCategory( sucursal, categoria, (error, almacen) => {
            if(!error) res.send(almacen) 
        })
    }else{ 
        AlmacenModel.getAlmacenBySucursalAndCategory( sucursal, categoria, (error, almacen) => {
            if(!error) res.send(almacen)
        })
    }
}

function almacenIdAlmacenAddPut(req, res) {
    let cantidad = parseInt(req.body.cantidad)
    if( isNaN(cantidad) || cantidad === 0 ){
        res.send("") 
    }else{ 
        let usuario = req.session.user,
            idAlmacen = req.params.idAlmacen
        AlmacenModel.getAlmacenById(idAlmacen, (error, almacen) => {
            if(error){
                Utilidad.printError(res, {msg:`Error al obtener el almacen: ${error}`, tipo: 0})
            } else { 
                let almacenUpdate = {
                    idAlmacen,
                    cantidadAlmacen: almacen.cantidadAlmacen + cantidad
                }
                AlmacenModel.updateAlmacen(almacenUpdate, error => {
                    if(error){ 
                        Utilidad.printError(res, {msg:`Error al actualizar el almacen: ${error}`, tipo: 0})
                    } else { 
                        let movimiento = {
                            idUsuario: usuario.idUsuario,
                            idProducto: almacen.idProducto,
                            cantidad,
                            tipo: 1, 
                            fecha: fechaActual()
                        }
                        MovimientoModel.createMovimientoNoBasico(movimiento, error => {
                            (error) ? ( 
                                Utilidad.printError(res, {msg:`Error al crear el movimiento: ${error}`, tipo: 0})
                            ) : ( 
                                res.send(''+almacenUpdate.cantidadAlmacen)
                            )
                        })
                    }
                })
            }
        })
    }
}

function almacenIdAlmacenSubPut(req, res) {
    let cantidad = parseInt(req.body.cantidad)
    if( isNaN(cantidad) || cantidad === 0 ){
        res.send("") 
    }else{
        let usuario = req.session.user,
            idAlmacen = req.params.idAlmacen

        AlmacenModel.getConsumoById(idAlmacen, (error, almacen) => {
            if(error){ 
                Utilidad.printError(res, {msg:`Error al obtener el almacen: ${error}`, tipo: 0})
            } else if(almacen.cantidadAlmacen === 0){ 
                res.send("")
            } else { 
                let verificar = ( cantidad >= almacen.cantidadAlmacen ),
                    almacenUpdate = {
                        idAlmacen,
                        cantidadAlmacen: ( verificar ) ? ( 0 ) : ( almacen.cantidadAlmacen - cantidad ),
                        cantidadConsumo: ( verificar ) ? ( almacen.cantidadConsumo+almacen.cantidadAlmacen ) : ( almacen.cantidadConsumo+cantidad )
                    }
                AlmacenModel.updateAlmacen(almacenUpdate, error => {
                    if(error){
                        Utilidad.printError(res, {msg:`Error al actualizar el almacen: ${error}`, tipo: 0})
                    } else {
                        let movimiento = {
                            idUsuario: usuario.idUsuario,
                            idProducto: almacen.idProducto,
                            cantidad: ( verificar ) ? ( almacen.cantidadAlmacen ) : ( cantidad ),
                            tipo: 0, 
                            fecha: fechaActual()
                        }
                        MovimientoModel.createMovimientoNoBasico(movimiento, error => {
                            (error) ? (
                                Utilidad.printError(res, {msg:`Error al crear el movimiento: ${error}`, tipo: 0})
                            ) : ( 
                                (verificar) ? ( res.send('0') ) : ( res.send(`${almacenUpdate.cantidadAlmacen}`))
                            )
                        })
                    }
                })
            }
        })
    }
}

function fechaActual(){
    let fecha = new Date();
    fecha.setHours(fecha.getHours() - 7) 
    return fecha 
}

module.exports = {
    almacenGet,
    almacenIdAlmacenAddPut,
    almacenIdAlmacenSubPut,
    almacenPost
}