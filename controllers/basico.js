'use strict'

const ProductoModel = require("../models/producto"),
      AlmacenModel = require("../models/almacen"),
      MovimientoModel = require("../models/movimiento"),
      BajaModel = require("../models/baja"),
      TecnicaModel = require("../models/tecnica"),
      BasicoModel = require("../models/basico"),
      Utilidad = require('../ayuda/utilidad')

function basicosGet(req, res) {
    let usuario = req.session.user
    TecnicaModel.getTecnicasNameBySucursal(usuario.idSucursal, (error, tecnicas) => {
        if(error){ 
            Utilidad.printError(res, {msg:`Error al obtener las tecnicas: ${error}`, tipo: 0})
        }else{
            ProductoModel.getProductsBasicos( (error, productos) =>{
                (error) ? ( 
                    Utilidad.printError(res, {msg:`Error al obtener los productos: ${error}`, tipo: 0})
                ) : (
                    req.session.productos = productos,
                    res.render("./basicos/manager",{ usuario, tecnicas ,productos })
                )
            })
        }
    })
}

function basicosPut(req, res) {
    let usuario = req.session.user,
        codigoProducto = getCodigoByName(req.session.productos ,req.body.producto),
        nombreTecnica = req.body.tecnica,
        almacen = null,
        idTecnica = null,
        idProducto = null,
        promesa = new Promise((resolve, reject) =>{
            TecnicaModel.getIdTecnicaByFullNameAndIdSucursal(nombreTecnica, usuario.idSucursal,(error, idTecnica) => {
                return(error) ? ( reject({msg:`Error al obtener el id de la tecnica: ${error}`, tipo: 0}) ) : ( resolve(idTecnica) )
            })
        })

    promesa
            .then(resolved => {
                idTecnica = resolved
                return new Promise((resolve, reject) => {
                    ProductoModel.getIdProductoByCode(codigoProducto, (error, producto) => {
                        return(error) ? ( reject({msg:`Error al obtener el id del producto: ${error}`, tipo: 0}) ) : ( resolve(producto) )
                    })
                })
            })
            .then(resolved => {
                idProducto = resolved.idProducto
                return new Promise((resolve, reject) => {
                    BasicoModel.getBasicoByProductAndTecnica(idProducto, idTecnica, (error, basico) => {
                        return(error) ? ( reject({msg:`Error al obtener el basico: ${error}`, tipo: 0}) ) : ( resolve(basico) )
                    })
                })
            })
            .then(resolved => {
                return new Promise((resolve, reject) => {
                    if(resolved.enUso){
                        reject({msg:`Error el producto esta en uso`, tipo: 11})
                    } else {
                        AlmacenModel.getAlmacenBySucursalAndProduct(usuario.idSucursal, idProducto, (error, almacen) => {
                            return(error) ? ( reject({msg:`Error al obtener el almacen: ${error}`, tipo: 0}) ) : ( resolve(almacen) )
                        })
                    }
                })
            })
            .then(resolved => {
                almacen = resolved
                return new Promise((resolve, reject) => {
                    if(almacen.cantidadAlmacen > 0){
                        almacen.cantidadAlmacen--
                        almacen.cantidadConsumo++
                        AlmacenModel.updateAlmacen(almacen, error => {
                            return(error) ? ( reject({msg:`Error al actualizar el almacen: ${error}`,tipo: 0}) ) : (resolve(true))
                        })
                    } else {
                        reject({msg:`Error no hay productos disponibles`, tipo: 12})
                    }
                })
            })
            .then(resolved => {
                return new Promise((resolve, reject) => {
                    let movimiento = {
                        idUsuario: usuario.idUsuario,
                        idTecnica,
                        idProducto,
                        fecha: fechaActual()
                    }
                    MovimientoModel.createMovimientoBasico(movimiento, error => {
                        return(error) ? ( reject({msg:`Error al crear el movimiento: ${error}`,tipo: 0}) ) : ( resolve(true) )
                    })
                })
            })
            .then(resolved => {
                return new Promise((resolve, reject) => {
                    let basico = {
                        idTecnica,
                        idProducto,
                        enUso: true
                    }
                    BasicoModel.updateBasico(basico, error => {
                        return(error) ? (reject({msg:`Error al actualizar el basico: ${error}`,tipo: 0})) : (resolve(true))
                    })
                })
            })
            .then(resolved => {
                res.send({msg:`Producto asignado correctamente`, tipo: 13})
            })
            .catch(error => {
                Utilidad.printError(res, error)
            })
}

function basicosDelete(req, res) {
    let usuario = req.session.user,
        codigoProducto = getCodigoByName(req.session.productos ,req.body.producto),
        nombreTecnica = req.body.tecnica,
        almacen = null,
        idTecnica = null,
        idProducto = null,
        promesa = new Promise((resolve, reject) =>{
            TecnicaModel.getIdTecnicaByFullNameAndIdSucursal(nombreTecnica, usuario.idSucursal,(error, idTecnica) => {
                return(error) ? ( reject({msg:`Error al obtener el id de la tecnica: ${error}`, tipo: 0}) ) : ( resolve(idTecnica) )
            })
        })

    promesa
        .then(resolved => {
            idTecnica = resolved
            return new Promise((resolve, reject) => {
                ProductoModel.getIdProductoByCode(codigoProducto,(error, producto) => {
                    return(error) ? ( reject({msg:`Error al obtener el id del producto: ${error}`, tipo: 0}) ) : ( resolve(producto) )
                })
            })
        })
        .then(resolved => {
            idProducto = resolved.idProducto
            return new Promise((resolve, reject) => {
                BasicoModel.getBasicoByProductAndTecnica(idProducto, idTecnica, (error, basico) => {
                    return(error) ? ( reject({msg:`Error al obtener el basico: ${error}`, tipo: 0}) ) : ( resolve(basico) )
                })
            })
        })
        .then(resolved => {
            return new Promise((resolve, reject) => {
                if(resolved.enUso){
                    AlmacenModel.getAlmacenBySucursalAndProduct(usuario.idSucursal, idProducto, (error, almacen) => {
                        return(error) ? ( reject({msg:`Error al obtener el almacen: ${error}`, tipo: 0}) ) : ( resolve(almacen) )
                    })
                } else {
                    reject({msg:`Error el producto no esta en uso`, tipo: 21})
                }
            })
        })
        .then(resolved => {
            almacen = resolved
            return new Promise((resolve, reject) => {
                almacen.cantidadConsumo--
                AlmacenModel.updateAlmacen(almacen, error => {
                    return(error) ? ( reject({msg:`Error al actualizar el almacen: ${error}`,tipo: 0}) ) : (resolve(true))
                })
            })
        })
        .then(resolved => {
            return new Promise((resolve, reject) => {
                let baja = {
                    idUsuario: usuario.idUsuario,
                    idTecnica,
                    idProducto,
                    fecha: fechaActual()
                }
                BajaModel.createBajaBasico(baja, error => {
                    return(error) ? ( reject({msg:`Error al crear la baja: ${error}`,tipo: 0}) ) : ( resolve(true) )
                })
            })
        })
        .then(resolved => {
            return new Promise((resolve, reject) => {
                let basico = {
                    idTecnica,
                    idProducto,
                    enUso: false
                }
                BasicoModel.updateBasico(basico, error => {
                    return(error) ? (reject({msg:`Error al actualizar el basico: ${error}`,tipo: 0})) : (resolve(true))
                })
            })
        })
        .then(resolved => {
            res.send({msg:`Baja realizada correctamente`, tipo: 23})
        })
        .catch(error => {
            Utilidad.printError(res, error)
        })
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

function fechaActual(){
    let fecha = new Date(); 
    fecha.setHours(fecha.getHours() - 7) 
    return fecha
}

module.exports = {
    basicosGet,
    basicosPut,
    basicosDelete
}