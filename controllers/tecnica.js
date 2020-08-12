/**
 * Created by Raul Perez on 12/04/2017.
 */
'use strict'

const TecnicaModel = require('../models/tecnica'),
      SucursalModel = require('../models/sucursal'),
      ProductModel = require('../models/producto'),
      BasicoModel = require('../models/basico'),
      Utilidad = require('../ayuda/utilidad')

function tecnicasGet(req, res) {
    let usuario = req.session.user

    if( usuario.permisos === 2 ){ // si es administrador general
        // busco todas las tecnicas
        TecnicaModel.getTecnicas( (error, tecnicas) => {
            (error) ? ( // si hubo error
                Utilidad.printError(res, { msg: `Error al obtener las tecnicas: ${error}`, tipo: 0 })
            ) : ( // si no hubo error
                res.render('./tecnicas/manager', { usuario, tecnicas } )
            )
        })
    } else { // si es administrador de sucursal
        // busco todas las tecnicas
        TecnicaModel.getTecnicasBySucursal(usuario.idSucursal, (error, tecnicas) => {
            (error) ? ( // si hubo error
                Utilidad.printError(res, { msg: `Error al obtener las tecnicas: ${error}`, tipo: 0 })
            ) : ( // si no hubo error
                res.render('./tecnicas/manager', { usuario, tecnicas } )
            )
        })
    }
}

function tecnicasNewGet(req, res) {
    let usuario = req.session.user

    if( usuario.permisos === 2 ){ // si es administrador general
        // busco las sucursales
        SucursalModel.getPlazasOfSucursales( (error, sucursales) => { // si no hubo error
            (error) ? (
                Utilidad.printError(res, { msg: `Error al buscar las sucursales: ${error}`, tipo: 0})
            ) : (
                res.render('./tecnicas/new', { usuario, sucursales })
            )
        })
    } else { // si es administrador de sucursal
        res.render('./tecnicas/new', { usuario })
    }
}

function tecnicasNewPost(req, res) {
    let usuario = req.session.user,
        plaza = req.body.plaza
    
    if( usuario.permisos === 2 ){ // si es administrador general
        // busco la sucursal
        SucursalModel.getIdSucursalByPlaza(plaza, (error, idSucursal) => { // si no hubo error
            if(error){
                Utilidad.printError(res, { msg: `Error al buscar la sucursal: ${error}`, tipo: 0})
                return
            }
            // creamos la nueva tecnica
            let nuevaTecnia = {
                nombre: req.body.name,
                apellido: req.body.last_name,
                idSucursal
            }
            // guardamos a la nueva tecnica
            createTecnica(res, nuevaTecnia)
        })
    } else { // si es administrador de sucursal
        // creamos la nueva tecnica
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

    if( usuario.permisos === 2 ){ // si es administrador general
        // busco las sucursales
        SucursalModel.getPlazasOfSucursales( (error, sucursales) => { // si no hubo error
            if(error){
                Utilidad.printError(res, { msg: `Error al obtener las sucursales: ${error}`, tipo: 0})
                return
            }
            // busco la tecnica a editar
            TecnicaModel.getTecnicaById(idTecnica, (error, tecnicaUpdate) => { // si no hubo error
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
    } else { // si es administrador de sucursal
        // busco la tecnica a editar
        TecnicaModel.getTecnicaById(idTecnica, (error, tecnicaUpdate) => { // si no hubo error
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

    if( usuario.permisos === 2 ){ // si es administrador general
        // busco las sucurales
        SucursalModel.getIdSucursalByPlaza(plaza, (error, idSucursal) => { // si no hubo error
            if(error){
                Utilidad.printError(res, { msg: `Error al obtener las sucursales: ${error}`, tipo: 0})
                return
            }
            // edito la tecnica
            let tecnicaUpdate = {
                idTecnica,
                nombre: req.body.name,
                apellido: req.body.last_name,
                idSucursal
            }
            // actualizo la tecnica en la base de datos
            updateTecnica(res, tecnicaUpdate)
        })
    } else { // si es administrador de sucursal
        // edito la tecnica
        let tecnicaUpdate = {
            idTecnica,
            nombre: req.body.name,
            apellido: req.body.last_name
        }
        // actualizo la tecnica en la base de datos
        updateTecnica(res, tecnicaUpdate)
    }
}

function createTecnica(res, tecnica) {
    // guardamos a la nueva tecnica
    TecnicaModel.createTecnica(tecnica, error => {
        if(error){
            Utilidad.printError(res, { msg: `Error al guardar la nueva tecnica: ${error}`, tipo: 0})
            return
        }
        // creo el basico en uso de la tecnica creada
        generarBasicosEnUso(res, tecnica)
        res.redirect('/tecnicas')
    })
}

function updateTecnica(res, tecnica) {
    TecnicaModel.updateTecnica(tecnica, error => { // si no hubo error
        (error) ? (
            Utilidad.printError(res, { msg: `Error al actualizar tecnica: ${error}`, tipo: 0})
        ) : (
            res.redirect('/tecnicas')
        )
    })
}

function generarBasicosEnUso(res, tecnica){
    // obtenemos el id de la tecnica creada
    let nombreCompleto = tecnica.nombre+' '+tecnica.apellido

    TecnicaModel.getIdTecnicaByFullNameAndIdSucursal(nombreCompleto, tecnica.idSucursal, (error, idTecnica) => {
        if(error){ // si hubo error
            Utilidad.printError(res, {msg:`Error al obtener la tecnica: ${error}`, tipo: 0})
        } else { // si no hubo error
            // busco todos los productos basicos
            ProductModel.getIdProductsBasicos((error, productosBasicos) => {
                if(error){ // si hubo un error
                    Utilidad.printError(res, {msg:`Error al obtener los productos basicos: ${error}`, tipo: 0})
                } else { // si no hubo error
                    // genero un basico en uso por cada producto basico existente
                    productosBasicos.forEach(productoBasico => generarBasicoEnUso(res, idTecnica, productoBasico.idProducto))
                }
            })
        }
    })
}

function generarBasicoEnUso(res, idTecnica, idProducto) {
    // creo el basico
    let basico = {
        idTecnica,
        idProducto,
        enUso: false
    }
    // guardo el basico
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
