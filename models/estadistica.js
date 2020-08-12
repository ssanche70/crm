'use strict'

const EstadisticaModel = require('./coneccion')

function getTopTen(idSucursal, inicio, final, next) {
    EstadisticaModel
        .query(`SELECT p.nombre, p.codigo, SUM(cantidad) cantidad 
                FROM bajas b 
                JOIN productos p ON b.idProducto = p.idProducto
                JOIN usuarios u ON b.idUsuario = u.idUsuario
                WHERE p.esBasico = 0 AND u.idSucursal = ? AND (b.fecha BETWEEN ? AND ?)  
                GROUP BY p.codigo ORDER BY cantidad DESC LIMIT 10` , [idSucursal, inicio, final], (error, resultado, fields) => {

            next(error, resultado)
        })
}

function getComparacion(idSucursal, idProducto, inicio, final, next) {
    EstadisticaModel
        .query(`SELECT concat(t.nombre, ' ', t.apellido) nombre, COUNT(*) cantidad
                FROM bajasbasicos b 
                JOIN tecnicas t ON b.idTecnica = t.idTecnica
                JOIN usuarios u ON b.idUsuario = u.idUsuario
                WHERE (u.idSucursal = ? OR t.idSucursal = ?) AND (b.idProducto = ?) AND (b.fecha BETWEEN ? AND ?) 
                GROUP BY nombre` , [idSucursal, idSucursal, idProducto, inicio, final], (error, resultado, fields) => {

            next(error, resultado)
        })
}

module.exports = {
    getTopTen,
    getComparacion
}