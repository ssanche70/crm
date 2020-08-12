'use strict'

const express = require("express"),
    HistorialController = require('../controllers/historial'),
    historial = express.Router()

historial
    .route('/movimientos')
    .get( HistorialController.historialMovimientosGet )
    .post( HistorialController.historialMovimientosPost )
historial
    .route('/bajas')
    .get( HistorialController.historialBajasGet )
    .post( HistorialController.historialBajasPost )
historial.get("/general", HistorialController.historialGeneralGet )
historial.get("/sucursal", HistorialController.historialSucursalGet )
historial.post("/sucursaltop", HistorialController.historialSucursalTopPost )
historial.post("/sucursalbas", HistorialController.historialSucursalBasicosPost )
historial.post("/generaltop", HistorialController.historialGeneralTopPost )
historial.post("/generalbas", HistorialController.historialGeneralBasicosPost )

module.exports = historial;