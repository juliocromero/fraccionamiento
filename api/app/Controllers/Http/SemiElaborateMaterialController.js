'use strict'
const SemiElaborateMaterial = use("App/Models/SemiElaborateMaterial");
const SemiElaborate = use("App/Models/SemiElaborate");
const Product = use("App/Models/Product");
const Query = require("../../Utils/Query");
const Response = use('App/Models/Response');
const Database = use("Database");
const { validate } = use('Validator');
class SemiElaborateMaterialController {
 
  async index ({ request, response, auth }) {
    try{
      const user = await auth.getUser();
      var query = SemiElaborateMaterial.query()
      var {
        page,
        perPage,
      } = request.all();
      page = page || 1
      perPage = perPage || 10
      const materials = await SemiElaborateMaterial.query().paginate(page, perPage);
      response.status(200).json({ menssage: 'Listado de material semi Elaborado', data: materials })
    }catch(error){
      console.log(error)
      if (error.name == 'InvalidJwtToken') {
        return response.status(400).json({ menssage: 'Usuario no Valido' })
      }
      return response.status(400).json({  menssage: 'Hubo un error al realizar la operación', error  })
    }
  }

  async store ({ request, response, auth}) {
    try{
      let { product_id, semi_elaborate_id , quantity} = request.all();
      const user = await auth.getUser();
      //validacion de datos
      const rules = {
        product_id: 'required',
        semi_elaborate_id: 'required',
        quantity: 'required'
      }
      const product = await Product.findBy('id', product_id)
      if(product == null || product == '' ){
        return response.status(401).json({menssage: 'no se encontro el producto'})
      }
      
      const elaborate = await SemiElaborate.findBy('id', semi_elaborate_id)
      if( elaborate == null || elaborate == ''){
        return response.status(401).json({menssage: 'no se encontro el elaborado'})
      }
      var calculo = await SemiElaborate.query().fetch();
      calculo = calculo.toJSON();
      console.log(calculo)
      const validation = await validate({product_id , semi_elaborate_id, quantity}, rules)
      if (user.rol_id == 1) {
        const newMaterials = {
        product_id ,
        semi_elaborate_id,
        quantity
        }
        const materials = await SemiElaborateMaterial.create(newMaterials)
        return response.status(200).json({ menssage: 'Semi Elaborate cargado con exito!' , data: materials})
      }else{
        return response.status(400).json({ menssage: 'Usuario sin permiso Suficiente'})
      }
    }catch(error){
      console.log(error)
      if (error.name == 'InvalidJwtToken') {
        return response.status(400).json({ menssage: 'Usuario no Valido' })
      }
       return response.status(400).json({ menssage: 'Hubo un error al realizar la operación'})
    }
  }

 
  async show ({ params, request, response, auth }) {
    try {
      const semi_elaborate_id = params.id
      const user = await auth.getUser();
      const semiElaborate = await SemiElaborateMaterial.query().where('semi_elaborate_id', semi_elaborate_id).fetch();
      return response.status(200).json({ menssage: 'Semi Elaborados Material', data: semiElaborate });
    } catch (error) {
      console.log(error)
      if (error.name == 'InvalidJwtToken') {
        return response.status(400).json({ menssage: 'Usuario no Valido' })
      }
      return response.status(400).json({
        menssage: 'Semi Elaborate Material no encontrado',
        
      })
    }
  }

  async show1 ({ params: {id}, request, response, auth }) {
    try {
      let {ton_batch } = request.get()
      const user = await auth.getUser();
      let semiElaborate = await SemiElaborateMaterial.query().with('semi').where({semi_elaborate_id: id}).fetch();
      semiElaborate = semiElaborate.toJSON();
     
     let resp1=  semiElaborate.map(async(item) => {
         let resultado = ton_batch * item.quantity / item.semi.ton_batch
          return {
            "id": item.id,
            "material_id": item.material_id,
            "semi_elaborate_id": item.semi_elaborate_id,
            "quantity": resultado
          }
      });
      let list = await Promise.all(resp1) 
       return response.status(200).json({ menssage: 'Semi Elaborados Material', data: list });
    } catch (error) {
      console.log(error)
      if (error.name == 'InvalidJwtToken') {
        return response.status(400).json({ menssage: 'Usuario no Valido' })
      }
      return response.status(400).json({
        menssage: 'Semi Elaborate Material no encontrado',
        id
      })
    }
  }

 
 
  async update ({ params: {id}, request, response , auth}) {
    try {
      const data = request.only(["product_id", "semi_elaborate_id", "quantity"])
      const user = await auth.getUser();
      const user_id = user.id
      if(data.product_id== null || data.product_id == "") {
        return response.status(400).json({menssage: ' No se encontro el producto'})
      }
      if(data.semi_elaborate_id == null|| data.semi_elaborate_id == "") {
        return response.status(400).json({menssage: ' No se encontro el semi elaborado'})
      }
      if(data.quantity == null || data.quantity == "") {
        return response.status(400).json({menssage: ' No se encontro la cantidad'})
      }
    
      if (user.rol_id == 1) {
        const Semi = await SemiElaborateMaterial.find(id);
        Semi.product_id = data.product_id || Semi.product_id;
        Semi.semi_elaborate_id = data.semi_elaborate_id || Semi.semi_elaborate_id;
        Semi.quantity = data.quantity || Semi.quantity;
        await Semi.save();
        response.status(200).json({ menssage: 'Material Elaborado modificado con Exito!', data: Semi })
      }
      else {
        response.status(400).json({ menssage: "Usuario sin permisos para realizar la operacion" })
      }
    } catch (error) {
      console.log(error)
      if (error.name == 'InvalidJwtToken') {
        return response.status(400).json({ menssage: 'Usuario no Valido' })
      }
      response.status(400).json({
        menssage: "Hubo un error al realizar la operación",
      })
    }
  }

  /**
   * Delete a semielaboratematerial with id.
   * DELETE semielaboratematerials/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async destroy ({ params, request, response }) {
  }
}

module.exports = SemiElaborateMaterialController
