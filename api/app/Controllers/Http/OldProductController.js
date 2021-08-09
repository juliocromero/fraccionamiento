'use strict'
const OldProduct = use("App/Models/OldProduct");
const Query = require("../../Utils/Query");
const Response = use('App/Models/Response');

class OldProductController {
  
  async index ({ request, response, auth }) {
    try{
      const user = await  auth.getUser()
      var query = OldProduct.query();
      var {
        page,
        perPage,
      } = request.all();
      // Seteo valores por defectos
      page = page || 1
      perPage = perPage || 10

      const oldProduct = await OldProduct.query().paginate(page, perPage);
      response.status(200).json({ menssage: 'Productos Viejos', data: oldProduct })
    }catch(error){
      console.log(error)
      if(error.name == 'InvalidJwtToken'){
        return response.status(400).json({menssage: 'Usuario no Valido'})
       }
      response.status(400).json({ menssage: 'Hubo un error al realizar la operación'})
    }
  }


  async create ({ request, response, view }) {
  }

  async store ({ request, response }) {
  }

 
  async show ({ params, request, response, view }) {
  }

  async edit ({ params, request, response, view }) {
  }

  async update ({ params, request, response }) {
  }

  
  async destroy ({ params, request, response }) {
  }
}

module.exports = OldProductController
