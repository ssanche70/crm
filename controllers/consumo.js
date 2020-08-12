'use strict'

const AlmacenModel = require('../models/almacen'),
      BajaModel = require('../models/baja'),
      CategoryModel = require('../models/categoria'),
      SucursalModel = require('../models/sucursal'),
      Utilidad = require('../ayuda/utilidad')

function consumosGet(req, res) {
    let usuario = req.session.user

    if( usuario.permisos < 2){
        CategoryModel.getNamesOfCategories((error, categorias) => {
            if(!error){
                res.render('./consumos/manager', {usuario, categorias})
            }
        })
    }else{
        SucursalModel.getPlazasOfSucursales((error, sucursales) => {
            if(!error){
                CategoryModel.getNamesOfCategories((error, categorias) => {
                    if(!error){
                        res.render('./consumos/manager', {usuario, sucursales, categorias})
                    }
                })
            }
        })
    }
}

function consumoPost(req, res){
    let usuario = req.session.user,
        categoria = req.body.categoria, 
        sucursal = (usuario.permisos < 2) ? usuario.idSucursal : req.body.plaza    

    if( usuario.permisos === 2){ 
        AlmacenModel.getConsumoByPlazaAndCategory( sucursal, categoria, (error, consumos) => {
            if(!error) res.send(consumos)             
        })
    }else{ 
        AlmacenModel.getConsumoBySucursalAndCategory( sucursal, categoria, (error, consumos) => {
            if(!error) res.send(consumos) 
        })
    }    
}

function consumosIdConsumoPut(req, res) {
    let cantidad = parseInt(req.body.cantidad)
    if( isNaN(cantidad) || cantidad === 0 ){
        res.send("")
    }else{ 
        let usuario = req.session.user,
            idAlmacen = req.params.idConsumo

        AlmacenModel.getConsumoById(idAlmacen, (error, almacen) => {
            if(error){ 
                Utilidad.printError(res, {msg:`Error al obtener el almacen: ${error}`, tipo: 0})
            } else if(almacen.cantidadConsumo === 0){ 
                res.send("")
            } else { 
                let verificar = ( cantidad >= almacen.cantidadConsumo ),
                    almacenUpdate = {
                        idAlmacen,
                        cantidadConsumo: ( verificar ) ? ( 0 ) : ( almacen.cantidadConsumo - cantidad )
                    }
                AlmacenModel.updateAlmacen(almacenUpdate, error => {
                    if(error){
                        Utilidad.printError(res, {msg:`Error al actualizar el almacen: ${error}`, tipo: 0})
                    } else {
                        let baja = {
                            idUsuario: usuario.idUsuario,
                            idProducto: almacen.idProducto,
                            cantidad: ( verificar ) ? ( almacen.cantidadConsumo ) : ( cantidad ),
                            fecha: fechaActual()
                        }
                        BajaModel.createBajaNoBasico(baja, error => {
                            (error) ? ( 
                                Utilidad.printError(res, {msg:`Error al crear el movimiento: ${error}`, tipo: 0})
                            ) : ( 
                                (verificar) ? ( res.send('0') ) : ( res.send(`${almacenUpdate.cantidadConsumo}`))
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
    consumosGet,
    consumosIdConsumoPut,
    consumoPost
}