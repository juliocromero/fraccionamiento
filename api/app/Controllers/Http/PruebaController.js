'use strict'
var JsBarcode = require('jsbarcode');
var QRCode = require('qrcode');
const Voucher = use("App/Models/Voucher");
class PruebaController {
  
  async index ({ request, response, view }) {
    let p = await Voucher.all();
    p = p.toJSON()
    console.log(p)
    QRCode.toString(`${p[0].id}`,{type:'terminal'}, function (err, url) {
      console.log(url)
    })
    
  }

  async create ({ request, response, view }) {
  }

  /**
   * Create/save a new prueba.
   * POST pruebas
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async store ({ request, response }) {
  }

  /**
   * Display a single prueba.
   * GET pruebas/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async show ({ params, request, response, view }) {
  }

  /**
   * Render a form to update an existing prueba.
   * GET pruebas/:id/edit
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async edit ({ params, request, response, view }) {
  }

  /**
   * Update prueba details.
   * PUT or PATCH pruebas/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async update ({ params, request, response }) {
  }

  /**
   * Delete a prueba with id.
   * DELETE pruebas/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async destroy ({ params, request, response }) {
  }
}

module.exports = PruebaController
