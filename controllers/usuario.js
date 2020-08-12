'use strict'

const UserModel = require('../models/usuario'),
      SucursalModel = require('../models/sucursal'),
      Utilidad = require('../ayuda/utilidad'),
      bcrypt = require('bcrypt-nodejs')

function usersGet(req, res) {
    let usuario = req.session.user,
        idSucursal = req.session.user.idSucursal
    if( usuario.permisos === 2 ){ 
        UserModel.getUsers((error, usuarios) => { 
            (error) ? (
                Utilidad.printError(res, {msg: `Error al obtener los usuarios: ${error}`, tipo: 0})
            ) : ( 
                res.render('./users/manager', {usuarios, usuario})
            )
        })
    } else { 
        UserModel.getUsersBySucursal(usuario.idUsuario, idSucursal, (error, usuarios) => { 
            (error) ? ( 
                Utilidad.printError(res, {msg: `Error al obtener los usuarios: ${error}`, tipo: 0})
            ) : ( 
                res.render('./users/manager', {usuarios, usuario})
            )
        })
    }
}

function usersNewGet(req, res) {
    let usuario = req.session.user

    if( usuario.permisos === 2 ){ 
        SucursalModel.getPlazasOfSucursales( (error, sucursales) => { 
            (error) ? ( 
                Utilidad.printError(res, {msg: `Error no se pudieron obtener las sucursales: ${error}`, tipo: 0})
            ) : ( 
                res.render('./users/new', {sucursales, usuario})
            )
        })
    } else { 
        res.render('./users/new',{ usuario })
    }
}

function usersNewPost(req, res) {
    let usuario = req.session.user,
        plaza = req.body.plaza
    
    if( usuario.permisos === 2 ){ 
        SucursalModel.getIdSucursalByPlaza(plaza, (error, idSucursal) => {
            if (error) {
                Utilidad.printError(res, {msg: `Error al obtener la sucursal: ${error}`, tipo: 0})
                return
            }
            let nuevoUsuario = {
                username: req.body.username.toLowerCase(),
                nombre: req.body.name,
                apellido: req.body.last_name,
                password: req.body.password,
                idSucursal: idSucursal,
                permisos: 1
            }
            nuevoUsuario.password = bcrypt.hashSync(nuevoUsuario.password)
            createUser(res, nuevoUsuario)
        })
    } else { 
        let nuevoUsuario = {
            username: req.body.username.toLowerCase(),
            nombre: req.body.name,
            apellido: req.body.last_name,
            password: req.body.password,
            idSucursal: usuario.idSucursal,
            permisos: 0
        }
        nuevoUsuario.password = bcrypt.hashSync(nuevoUsuario.password)
        createUser(res, nuevoUsuario)
    }
}

function usersIdUsuarioGet(req, res) {
    let usuario = req.session.user, 
        idUsuario = req.params.idUsuario 

    if( usuario.permisos === 2 ){
        SucursalModel.getPlazasOfSucursales( (error, sucursales) => { 
            if(error){
                Utilidad.printError(res, { msg: `Error al obtener la sucursal: ${error}`, tipo:0})
                return
            }
            UserModel.getUserById(idUsuario, (error, usuarioUpdate) => { 
                (error) ? (
                    Utilidad.printError(res, { msg: `Error al obtener el usuario: ${error}`, tipo:0})
                ) : (
                    (comprobarUsuarioGeneral(usuarioUpdate)) ? (
                        res.render('./users/update', { sucursales, usuarioUpdate, usuario })
                    ) : (
                        res.redirect('/users')
                    )
                )
            })
        })
    } else { 
        UserModel.getUserById(idUsuario, (error, usuarioUpdate) => { 
            (error) ? (
                Utilidad.printError(res, { msg: `Error al obtener el usuario: ${error}`, tipo:0})
            ) : ( 
                (comprobarUsuario(usuarioUpdate, usuario)) ?  (
                    res.render('./users/update', { usuarioUpdate, usuario })
                ) : (
                    res.redirect("/users")
                )
            )
        })
    }
}

function usersIdUsuarioPut(req ,res) {
    let usuario = req.session.user, 
        idUsuario = req.params.idUsuario 

    if( usuario.permisos === 2 ){ 
        let plaza = req.body.plaza  
        SucursalModel.getIdSucursalByPlaza(plaza, (error, idSucursal) => { 
            if (error){
                Utilidad.printError(res, { msg : `Error al buscar la nueva sucursal: ${error}` , tipo : 0})
                return
            }
            let usuarioUpdate = {
                idUsuario,
                username: req.body.username.toLowerCase(),
                nombre: req.body.name,
                apellido: req.body.last_name,
                password: req.body.password,
                idSucursal,
                permisos:  req.body.permisos === "Administrador" ? 1 : 0,
                status: req.body.status === "Activo"
            }
            if( usuarioUpdate.password != "" ) {
                usuarioUpdate.password = bcrypt.hashSync(usuarioUpdate.password) 
            }else{
                delete usuarioUpdate.password 
            }
            if(idSucursal === 0){ 
                delete usuarioUpdate.idSucursal
                delete usuarioUpdate.permisos
                delete usuarioUpdate.status
            }
            updateUser(res, usuarioUpdate)
        })
    } else { 
        let usuarioUpdate = {
            idUsuario,
            username: req.body.username.toLowerCase(),
            nombre: req.body.name,
            apellido: req.body.last_name,
            password: req.body.password,
            status: req.body.status === "Activo"
        }
        if( usuarioUpdate.password != "" ) {
            usuarioUpdate.password = bcrypt.hashSync(usuarioUpdate.password) 
        }else{
            delete usuarioUpdate.password 
        }  
        if(usuarioUpdate.idUsuario == usuario.idUsuario){ 
            delete usuarioUpdate.status
        }
        updateUser(res, usuarioUpdate)
    }
}

function createUser(res, user) {    
    UserModel.createUser(user, error => {  
        (error) ? ( 
            Utilidad.printError(res, { msg: `Error al agregar en nuevo usuario: ${error}`, tipo: 1 })
        ) : ( 
            res.json({msg:"",tipo:3})
        )
    })
}

function updateUser(res, user) { 
    UserModel.updateUser(user, error => { 
        (error) ? ( 
            Utilidad.printError(res, { msg: `Error al actualizar el usuario: ${error}` , tipo: 1})
        ) : ( 
            res.json({ msg: "", tipo:3 })
        )
    })
}

function comprobarUsuario(usuarioUpdate, usuario){
    try{
        return usuarioUpdate.idSucursal === usuario.idSucursal && usuarioUpdate.permisos < usuario.permisos || usuarioUpdate.idUsuario === usuario.idUsuario 
    }catch(error){
        return false
    }
}

function comprobarUsuarioGeneral(usuarioUpdate){
    try{
        return usuarioUpdate.idSucursal != null 
    }catch(error){
        return false
    }
}

module.exports = {
    usersGet,
    usersNewGet,
    usersNewPost,
    usersIdUsuarioGet,
    usersIdUsuarioPut
}