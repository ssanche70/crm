'use strict'

const SucursalModel = require('./coneccion')

function getSucursalById(idSucursal, next) {
    SucursalModel
        .query(`SELECT * 
                FROM sucursales s 
                WHERE s.idSucursal = ?`, idSucursal, (error, resultado, fields) => {

            next(error, resultado[0])
        })
}

function getIdSucursalByPlaza(plaza, next) {
    SucursalModel
        .query(`SELECT s.idSucursal 
                FROM sucursales s 
                WHERE s.plaza = ?`,  plaza, (error, resultado, fields) => {
            try{ 
                next(error, resultado[0].idSucursal)
            }catch(error){ 
                next(error = null, 0)
            }        
        })
}

function getPlazasOfSucursales(next) {
    SucursalModel
        .query(`SELECT s.plaza 
                FROM sucursales s`, (error, resultado, fields) => {

            next(error, resultado)
        })
}

function getIdSucursalOfSucursales(next) {
    SucursalModel
        .query(`SELECT s.idSucursal 
                FROM sucursales s`, (error, resultado, fields) => {

            next(error, resultado)
        })
}

function getSucursales(next) {
    SucursalModel
        .query(`SELECT * 
                FROM sucursales`, (error, resultado, fields) => {

            next(error, resultado)
        })
}

function createSucursal(sucursal, next) {
    SucursalModel
        .query(`INSERT INTO sucursales 
                SET ?`, sucursal, (error, resultado, fields) => {

            next(error)
        })
}

function updateSucursal(sucursal, next) {
    SucursalModel
        .query(`UPDATE sucursales s 
                SET ? 
                WHERE s.idSucursal = ?`, [sucursal,sucursal.idSucursal], (error, resultado, fields) => {

            next(error)
        })
}

function deleteSucursal(idSucursal, next) {
    SucursalModel
        .query(`DELETE FROM sucursales 
                WHERE idSucursal = ? `, idSucursal , (error, resultado, fields) => {

            next(error)
        })
}

module.exports = {
    getSucursalById,
    getPlazasOfSucursales,
    getIdSucursalOfSucursales,
    getIdSucursalByPlaza,
    getSucursales,
    createSucursal,
    updateSucursal,
    deleteSucursal
}