'use strict'

class Response {
    constructor (estado, msj, datos) {
        this.feedback = { Estado: estado, mensaje: msj};
        this.datos = datos;
    }
}

module.exports = Response
