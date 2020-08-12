'use strict'

const UserModel = require('../models/usuario'),
      Utilidad = require('../ayuda/utilidad'),
      bcrypt = require('bcrypt-nodejs')

function index(req, res) {
    (req.session.user) ? res.redirect("/almacen") : res.redirect("/login")
}

function loginGet(req, res) {
    (req.session.user) ? res.redirect("/almacen") : res.render('login')
}

function loginPost(req, res){
    let username = req.body.username.toLowerCase(),
        password = req.body.password
    
    UserModel.getUserByUsername(username, (error, usuario) =>{
        let promesa = Utilidad.returnPromise(!error, true, { msg: `Error con la base de datos : ${error}`, tipo: 0 })
        promesa
                .then(() => {
                    return Utilidad.returnPromise(usuario, true, { msg: 'Error username incorrecto', tipo: 1 })
                })
                .then(() => {
                    return Utilidad.returnPromise(usuario.status, true, { msg: 'Error usuario inactivo', tipo: 2 })
                })
                .then(() => {
                    try{
                        return Utilidad.returnPromise( password === usuario.password || bcrypt.compareSync(password, usuario.password) , true, { msg: 'Error contraseña incorrecta', tipo: 3 })
                    } catch (error){
                        return Utilidad.returnPromise( false , true, { msg: 'Error contraseña incorrecta', tipo: 3 })
                    }
                })
                .then(() => {
                    req.session.user = usuario
                    res.json({msg:'Datos correctos', tipo: 4})
                })
                .catch( error => {
                    Utilidad.printError(res, error)
                })
    })
}

function logout(req, res) {
    req.session = null
    res.redirect("/login")
}

function error404(req, res) {
    res.redirect('/almacen')
}

module.exports = {
    index,
    loginGet,
    loginPost,
    logout,
    error404
}
