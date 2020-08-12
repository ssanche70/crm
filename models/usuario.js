/**
 * Created by Raul Perez on 11/04/2017.
 */
'use strict'

const UserModel = require('./coneccion')


function getUserById(idUser, next) {
    UserModel
        .query(`SELECT u.idUsuario, u.username, u.nombre, u.apellido, u.status, u.permisos, u.idSucursal, s.plaza
                FROM usuarios u 
                JOIN sucursales s ON u.idSucursal = s.idSucursal
                WHERE u.idUsuario = ?`, idUser ,(error, resultado, fields) => {

            next(error, resultado[0])
        })
}

function getUserByUsername(username, next) {
    UserModel
        .query(`SELECT u.idUsuario, u.username, u.password, u.status, u.permisos, u.idSucursal 
                FROM usuarios u 
                WHERE u.username = ? `, username ,(error, resultado, fields) => {

            next(error, resultado[0])
        })
}

function getUsers(next) {
    UserModel
        .query(`SELECT u.username, u.nombre, u.apellido, u.permisos, u.status, u.idUsuario, s.plaza 
                FROM usuarios u 
                INNER JOIN sucursales s ON u.idSucursal = s.idSucursal` , (error, resultado, fields) => {

            next(error, resultado)
        })
}

function getUsersBySucursal(idUsuario, idSucursal, next) {
    UserModel
        .query(`SELECT u.username, u.nombre, u.apellido, u.permisos, u.status, u.idUsuario 
                FROM usuarios u 
                WHERE (u.idSucursal = ? AND u.permisos = 0) OR u.idUsuario = ?`, [idSucursal, idUsuario] ,(error, resultado, fields) => {

            next(error, resultado)
        })
}

function createUser(user, next) {
    UserModel
        .query(`INSERT INTO usuarios 
                SET ?`, user, (error, resultado, fields) => {

            next(error)
        })
}

function updateUser(user, next) {
    UserModel
        .query(`UPDATE usuarios 
                SET ? 
                WHERE idUsuario = ?`, [user,user.idUsuario], (error, resultado, fields) => {

            next(error)
        })
}


module.exports = {
    getUserById,
    getUserByUsername,
    getUsers,
    getUsersBySucursal,
    createUser,
    updateUser
}