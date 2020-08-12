'use strict'

const express = require("express"),
    ConsumoController = require('../controllers/consumo'),
    consumo = express.Router()

consumo.get("/", ConsumoController.consumosGet )
consumo.post('/', ConsumoController.consumoPost )
consumo.put("/:idConsumo", ConsumoController.consumosIdConsumoPut )

module.exports = consumo