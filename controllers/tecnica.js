'use strict'

const TecnicaModel = require('../models/tecnica'),
      SucursalModel = require('../models/sucursal'),
      ProductModel = require('../models/producto'),
      BasicoModel = require('../models/basico'),
      Utilidad = require('../ayuda/utilidad')

function tecnicasGet(req, res) {
    let usuario = req.session.user

    if( usuario.permisos === 2 ){ 
        TecnicaModel.getTecnicas( (error, tecnicas) => {
            (error) ? ( 
                Utilidad.printError(res, { msg: `Error al obtener las tecnicas: ${error}`, tipo: 0 })
            ) : ( 
                res.render('./tecnicas/manager', { usuario, tecnicas } )
            )
        })
    } else { 
        TecnicaModel.getTecnicasBySucursal(usuario.idSucursal, (error, tecnicas) => {
            (error) ? ( 
                Utilidad.printError(res, { msg: `Error al obtener las tecnicas: ${error}`, tipo: 0 })
            ) : ( 
                res.render('./tecnicas/manager', { usuario, tecnicas } )
            )
        })
    }
}

function tecnicasNewGet(req, res) {
    let usuario = req.session.user

    if( usuario.permisos === 2 ){ 
        SucursalModel.getPlazasOfSucursales( (error, sucursales) => { 
            (error) ? (
                Utilidad.printError(res, { msg: `Error al buscar las sucursales: ${error}`, tipo: 0})
            ) : (
                res.render('./tecnicas/new', { usuario, sucursales })
            )
        })
    } else { 
        res.render('./tecnicas/new', { usuario })
    }
}

function tecnicasNewPost(req, res) {
    let usuario = req.session.user,
        plaza = req.body.plaza
    
    if( usuario.permisos === 2 ){ 
        SucursalModel.getIdSucursalByPlaza(plaza, (error, idSucursal) => {
            if(error){
                Utilidad.printError(res, { msg: `Error al buscar la sucursal: ${error}`, tipo: 0})
                return
            }
            let nuevaTecnia = {
                nombre: req.body.name,
                apellido: req.body.last_name,
                idSucursal
            }
            createTecnica(res, nuevaTecnia)
        })
    } else { 
        let nuevaTecnia = {
            nombre: req.body.name,
            apellido: req.body.last_name,
            idSucursal: usuario.idSucursal
        }
        createTecnica(res, nuevaTecnia)
    }
}

function tecnicasIdTecnicaGet(req, res) {
    let usuario = req.session.user,
        idTecnica = req.params.idTecnica

    if( usuario.permisos === 2 ){ 
        SucursalModel.getPlazasOfSucursales( (error, sucursales) => { 
            if(error){
                Utilidad.printError(res, { msg: `Error al obtener las sucursales: ${error}`, tipo: 0})
                return
            }
            TecnicaModel.getTecnicaById(idTecnica, (error, tecnicaUpdate) => { 
                (error) ? (
                    Utilidad.printError(res, { msg: `Error al obtener la tecnica: ${error}`, tipo: 0})
                ) : (
                    (comprobarTecnicaGeneral(tecnicaUpdate)) ? (
                        res.render('./tecnicas/update', { usuario, sucursales, tecnicaUpdate })
                    ) : (
                        res.redirect('/tecnicas')
                    )
                    
                )
            })
        })
    } else { 
        TecnicaModel.getTecnicaById(idTecnica, (error, tecnicaUpdate) => { 
            (error) ? (
                Utilidad.printError(res, { msg: `Error al obtener la tecnica: ${error}`, tipo: 0})
            ) : (
                (comprobarTecnica(tecnicaUpdate, usuario)) ? (
                    res.render('./tecnicas/update', { usuario, tecnicaUpdate })
                ) : (
                    res.redirect('/tecnicas')
                )
            )
        })
    }
}

function tecnicasIdTecnicaPut(req, res) {
    let usuario = req.session.user,
        idTecnica = req.params.idTecnica,
        plaza = req.body.plaza

    if( usuario.permisos === 2 ){ 
        SucursalModel.getIdSucursalByPlaza(plaza, (error, idSucursal) => { 
            if(error){
                Utilidad.printError(res, { msg: `Error al obtener las sucursales: ${error}`, tipo: 0})
                return
            }
            let tecnicaUpdate = {
                idTecnica,
                nombre: req.body.name,
                apellido: req.body.last_name,
                idSucursal
            }
            updateTecnica(res, tecnicaUpdate)
        })
    } else { 
        let tecnicaUpdate = {
            idTecnica,
            nombre: req.body.name,
            apellido: req.body.last_name
        }
        updateTecnica(res, tecnicaUpdate)
    }
}

function createTecnica(res, tecnica) {
    TecnicaModel.createTecnica(tecnica, error => {
        if(error){
            Utilidad.printError(res, { msg: `Error al guardar la nueva tecnica: ${error}`, tipo: 0})
            return
        }
        generarBasicosEnUso(res, tecnica)
        res.redirect('/tecnicas')
    })
}

function updateTecnica(res, tecnica) {
    TecnicaModel.updateTecnica(tecnica, error => { 
        (error) ? (
            Utilidad.printError(res, { msg: `Error al actualizar tecnica: ${error}`, tipo: 0})
        ) : (
            res.redirect('/tecnicas')
        )
    })
}

function generarBasicosEnUso(res, tecnica){
    let nombreCompleto = tecnica.nombre+' '+tecnica.apellido

    TecnicaModel.getIdTecnicaByFullNameAndIdSucursal(nombreCompleto, tecnica.idSucursal, (error, idTecnica) => {
        if(error){ 
            Utilidad.printError(res, {msg:`Error al obtener la tecnica: ${error}`, tipo: 0})
        } else { 
            ProductModel.getIdProductsBasicos((error, productosBasicos) => {
                if(error){ 
                    Utilidad.printError(res, {msg:`Error al obtener los productos basicos: ${error}`, tipo: 0})
                } else { 
                    productosBasicos.forEach(productoBasico => generarBasicoEnUso(res, idTecnica, productoBasico.idProducto))
                }
            })
        }
    })
}

function generarBasicoEnUso(res, idTecnica, idProducto) {
    let basico = {
        idTecnica,
        idProducto,
        enUso: false
    }
    BasicoModel.createBasico(basico, error => {
        if(error) Utilidad.printError(res, {msg:`Error al crear basico en uso: ${error}`, tipo: 0})
    })
}

function comprobarTecnica(tecnicaUpdate, usuario){
    try{
        return tecnicaUpdate.idSucursal === usuario.idSucursal 
    }catch(error){
        return false
    }
}

function comprobarTecnicaGeneral(tecnicaUpdate){
    try{
        return tecnicaUpdate.idTecnica != null 
    }catch(error){
        return false
    }
}

module.exports = {
    tecnicasGet,
    tecnicasNewGet,
    tecnicasNewPost,
    tecnicasIdTecnicaGet,
    tecnicasIdTecnicaPut
}
