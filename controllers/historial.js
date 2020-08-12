'use strict'

const MovimientoModel = require('../models/movimiento'),
      BajaModel = require('../models/baja'),
      BasicoModel = require('../models/basico'),
      SucursalModel = require('../models/sucursal'),
      EstadisticaModel = require('../models/estadistica'),
      ProductoModel = require('../models/producto'),
      CategoriaModel = require('../models/categoria'),
      Utilidad = require('../ayuda/utilidad')

function historialMovimientosGet(req, res) {
    let usuario = req.session.user

    if( usuario.permisos === 1){
        CategoriaModel.getNamesOfCategories((error, categorias) => {
            (error) ? (
                Utilidad.printError(res, {msg:`Error al obtener las categorias: ${error}`,tipo: 0})
            ) : (
                res.render('./historial/movimientos',{ usuario, categorias })
            )
        })
    }else{ 
        CategoriaModel.getNamesOfCategories((error, categorias) => {
            (error) ? (
                Utilidad.printError(res, {msg:`Error al obtener las categorias: ${error}`,tipo: 0})
            ) : (
                SucursalModel.getPlazasOfSucursales((error, sucursales) => {
                    (error) ? (
                        Utilidad.printError(res, {msg:`Error al obtener las sucursales: ${error}`, tipo:0})
                    ) : (
                        res.render('./historial/movimientos',{ usuario, sucursales, categorias })
                    )
                })
            )
        })
    }
}

function historialMovimientosPost(req, res) {
    let usuario = req.session.user,
        inicio = req.body.inicio,
        final = sumarDia( req.body.final ),
        idSucursal = usuario.idSucursal,
        categoria = req.body.categoria,
        plaza = (usuario.permisos === 1) ? null : req.body.plaza

    if( usuario.permisos === 1){
        MovimientoModel.getMovimientosNoBasicosByIdSucursalAndCategoria(idSucursal, categoria, inicio, final, (error, movimientos) => {
            if(error){
                Utilidad.printError(res, {msg:`Error al obtener los movimientos: ${error}`, tipo: 0}) 
            }else{
                MovimientoModel.getMovimientosBasicosByIdSucursalAndCategoria(idSucursal, categoria, inicio, final, (error, asignaciones) => {
                    (error) ? (
                        Utilidad.printError(res, {msg:`Error al obtener los movimientos: ${error}`, tipo: 0})
                    ) : (
                        res.send({movimientos, asignaciones})
                    )
                })
            }
        })
    }else{ 
        MovimientoModel.getMovimientosNoBasicosByPlazaAndCategoria(plaza, categoria, inicio, final, (error, movimientos) => {
            if(error){
                Utilidad.printError(res, {msg:`Error al obtener los movimientos: ${error}`, tipo: 0}) 
            }else{
                MovimientoModel.getMovimientosBasicosByPlazaAndCategoria(plaza, categoria, inicio, final, (error, asignaciones) => {
                    (error) ? (
                        Utilidad.printError(res, {msg:`Error al obtener los movimientos: ${error}`, tipo: 0})
                    ) : (
                        res.send({movimientos, asignaciones})
                    )
                })
            }
        })
    }
}

function historialBajasGet(req, res) {
    let usuario = req.session.user

    if( usuario.permisos === 1){ 
        CategoriaModel.getNamesOfCategories((error, categorias) => {
            (error) ? (
                Utilidad.printError(res, {msg:`Error al obtener las categorias: ${error}`,tipo: 0})
            ) : (
                res.render('./historial/bajas',{ usuario, categorias })
            )
        })
    }else{ 
        CategoriaModel.getNamesOfCategories((error, categorias) => {
            (error) ? (
                Utilidad.printError(res, {msg:`Error al obtener las categorias: ${error}`,tipo: 0})
            ) : (
                SucursalModel.getPlazasOfSucursales((error, sucursales) => {
                    (error) ? (
                        Utilidad.printError(res, {msg:`Error al obtener las sucursales: ${error}`, tipo:0})
                    ) : (
                        res.render('./historial/bajas',{ usuario, sucursales, categorias })
                    )
                })
            )
        })
    } 
}

function historialBajasPost(req, res){
    let usuario = req.session.user,
        inicio = req.body.inicio,
        final = sumarDia( req.body.final ),
        idSucursal = usuario.idSucursal,
        categoria = req.body.categoria,
        plaza = (usuario.permisos === 1) ? null : req.body.plaza

    if( usuario.permisos === 1){
        BajaModel.getBajasNoBasicosByIdSucursalAndCategoria(idSucursal, categoria, inicio, final, (error, bajas) => {
            if(error){
                Utilidad.printError(res, {msg:`Error al obtener los movimientos: ${error}`, tipo: 0})
            }else{
                BajaModel.getBajasBasicosByIdSucursalAndCategoria(idSucursal, categoria, inicio, final, (error, bajasBasicos) => {
                    (error) ? (
                        Utilidad.printError(res, {msg:`Error al obtener los movimientos: ${error}`, tipo: 0})
                    ) : (
                        res.send({bajas, bajasBasicos})
                    )
                })
            }
        })
    }else{ 
        BajaModel.getBajasNoBasicosByPlazaAndCategoria(plaza, categoria, inicio, final, (error, bajas) => {
            if(error){
                Utilidad.printError(res, {msg:`Error al obtener los movimientos: ${error}`, tipo: 0})
            }else{
                BajaModel.getBajasBasicosByPlazaAndCategoria(plaza, categoria, inicio, final, (error, bajasBasicos) => {
                    (error) ? (
                        Utilidad.printError(res, {msg:`Error al obtener los movimientos: ${error}`, tipo: 0})
                    ) : (
                        res.send({bajas, bajasBasicos})
                    )
                })
            }
        })
    }
}

function historialSucursalGet(req, res) {
    ProductoModel.getProductsBasicos( (error, basicos) => {
        (error) ? (
            Utilidad.printError(res, {msg:`Error al obtener los productos basicos: ${error}` , tipo: 0})
        ) : (
            req.session.basicos = basicos,
            res.render('./historial/sucursal', { basicos, usuario: req.session.user} )
        )
    })
}

function historialSucursalTopPost(req, res) {
    let inicio = req.body.iniciot,
        final = sumarDia( req.body.finalt ),
        idSucursal = req.session.user.idSucursal

    EstadisticaModel.getTopTen(idSucursal, inicio, final, (error, topten) => {
        if(!error){
            res.send(topten)
        }
    })
}

function historialSucursalBasicosPost(req, res) {
    let inicio = req.body.iniciob,
        final = sumarDia( req.body.finalb ),
        idSucursal = req.session.user.idSucursal,
        codigoProducto = getCodigoByName(req.session.basicos, req.body.basico)

    ProductoModel.getIdProductoByCode(codigoProducto,(error, producto) => {
        if(!error){
            EstadisticaModel.getComparacion(idSucursal, producto.idProducto, inicio, final, (error, comparacion) => {
                if(!error){
                    res.send(comparacion)
                }
            })
        }
    })
}

function historialGeneralGet(req, res) {
    SucursalModel.getPlazasOfSucursales((error, sucursales) => {
        if(error){
            Utilidad.printError(res, {msg:`Error al obtener las sucursales: ${error}` , tipo: 0})
            return
        }
        ProductoModel.getProductsBasicos( (error, basicos) => {
            (error) ? (
                Utilidad.printError(res, {msg:`Error al obtener los productos basicos: ${error}` , tipo: 0})
            ) : (
                req.session.basicos = basicos,
                res.render('./historial/general', {basicos, sucursales, usuario: req.session.user} )
            )
        })
    })
}

function historialGeneralTopPost(req, res) {
    let inicio = req.body.iniciot,
        final = sumarDia( req.body.finalt ),
        sucursal = req.body.sucursaltop

    SucursalModel.getIdSucursalByPlaza(sucursal, (error, idSucursal) => {
        if(!error){
            EstadisticaModel.getTopTen(idSucursal, inicio, final, (error, topten) => {
                if(!error){
                    res.send(topten)
                }
            })
        }
    })
}

function historialGeneralBasicosPost(req, res) {
    let inicio = req.body.iniciob,
        final = sumarDia( req.body.finalb ),
        sucursal = req.body.sucursalbas,
        codigoProducto = getCodigoByName(req.session.basicos, req.body.basico)

    SucursalModel.getIdSucursalByPlaza(sucursal, (error, idSucursal) => {
        if(!error){
            ProductoModel.getIdProductoByCode(codigoProducto,(error, producto) => {
                if(!error) {
                    EstadisticaModel.getComparacion(idSucursal, producto.idProducto, inicio, final, (error, comparacion) => {
                        if(!error){
                            res.send(comparacion)
                        }
                    })
                }
            })
        }
    })
}

function sumarDia(fecha) {
    let nuevaFecha = fecha.split('-')
    let dia = parseInt( nuevaFecha[2] )
    dia++
    if ( dia < 10 ) dia = '0' + dia
    return  ( nuevaFecha[0] + '-' + nuevaFecha[1] + '-' + dia )
}

function getCodigoByName(basicos, nombre){
    let productos = basicos,
        longitud = productos.length,
        codigo = null
    for(let i = 0; i < longitud ; i++){
        let producto = productos[i]
        if(producto.nombre === nombre){
            codigo = producto.codigo 
            i = longitud 
        }
    }

    return codigo
}

module.exports = {
    historialMovimientosGet,
    historialMovimientosPost,
    historialBajasGet,
    historialBajasPost,
    historialGeneralGet,
    historialSucursalGet,
    historialSucursalTopPost,
    historialSucursalBasicosPost,
    historialGeneralBasicosPost,
    historialGeneralTopPost
}