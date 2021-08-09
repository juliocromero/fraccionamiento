'use strict'

const RejectedFraction = use("App/Models/RejectedFraction");
const Query = require("../../Utils/Query");
const Response = use('App/Models/Response');
class RejectedFractionController {

  async index ({ request, response, view, auth }) {
    try{
      const user = await auth.geUser();
      var query = RejectedFraction.query();
      var {
        sortBy,
        descending,
        page,
        perPage,
      } = request.all();
      // Seteo valores por defectos
      sortBy = sortBy || 'rejected_date'
      descending = descending || 'DESC'
      page = page || 1
      perPage = perPage || 10

      const rejected = await RejectedFraction.query().orderBy(sortBy, descending).paginate(page, perPage);
      response.status(200).json({ menssage: 'Fracciones Rechazadas', data: rejected })
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

module.exports = RejectedFractionController
