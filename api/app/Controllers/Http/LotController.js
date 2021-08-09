'use strict'

const Material = use('App/Models/Material')
const Lot = use("App/Models/Lot");
const Query = require("../../Utils/Query");
var moment = require('moment');
const Response = use('App/Models/Response');
const { validate } = use('Validator');
class LotController {

  async index ({ request, response, auth }) {

    const user = await auth.getUser()
    try{
      var query = Lot.query();
    var {
      page,
      perPage,
    } = request.all()
    // Seteo valores por defectos
    page = page || 1
    perPage = perPage || 10

    let lot = await Lot.query().with('materials').paginate(page, perPage);
      return response.status(200).json({ menssage: 'Lista de Lots', data: lot })
    }catch(error){
      console.log(error)
      if (error.name == 'InvalidJwtToken') {
        return response.status(400).json({ menssage: 'Usuario no Valido' })
      }
      return response.status(400).json({ menssage: 'Hubo un error al realizar la operación', error })
    }
  }
  

  
  async store ({ request, response, auth }) {
    try{
      const user = await auth.getUser();
      let { id,  material_id , quantity , expiration_date } = request.all();
      //validation de roles

      const rules ={
        material_id : 'required',
        quantity : 'required',
        expiration_date: 'required'
      }
      console.log(material_id , quantity)
      const validation = await validate({ material_id, quantity , expiration_date}, rules)
      if (validation.fails()) {
        return response.status(200).json(new Response(false, 'Hubo error al cargar el lote',))
      }
      const material = await Material.findBy('id', material_id)
      if (material == null || material == '') {
        return response.status(200).json(new Response(false, 'Material no encontrado',))
      }
      const lotsQuantity = await Lot.findBy('material_id', material_id);
      
      if(user.rol_id <= 4){
        const lots = await Lot.create({
          id,
          material_id,
          quantity,
          quantity_act: quantity ,
          expiration_date

        }) 
        return response.status(200).json(new Response(true, 'Lote cargado con exito!', lots))
      } else {
        return response.status(400).json(new Response(false, 'Usuario sin permisos suficiente'))
      }
    }catch(error){
      console.log(error)
      if(error.name == 'InvalidJwtToken'){
        return response.status(400).json({menssage: 'Usuario no Valido'})
       }
      return response.status(400).json({menssage: 'Hubo un error al procesar la solicitud' , error})
    }
  }

  async show ({ params, request, response, auth }) {
    try {
      const user = await auth.getUser();
      const {material_id, id} = request.get();
     // console.log(material_id)
      const lot = await Lot.query().where({material_id: material_id , id : id}).fetch();
      return response.status(200).json({ menssage: 'Lot', data: lot });
    } catch (error) {
      console.log(error)
      if (error.name == 'InvalidJwtToken') {
        return response.status(400).json({ menssage: 'Usuario no Valido' })
      }
      return response.status(400).json({
        menssage: 'Voucher no encontrado',
        id
      })
    }
  }

  async edit ({ params, request, response, view }) {
  }

  /**
   * Update lot details.
   * PUT or PATCH lots/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async update ({ params, request, response }) {
  }

  /**
   * Delete a lot with id.
   * DELETE lots/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async destroy ({ params, request, response }) {
  }
}

module.exports = LotController
