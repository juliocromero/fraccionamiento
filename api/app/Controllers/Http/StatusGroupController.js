'use strict'
const StatusGroup = use("App/Models/StatusGroup");
const Query = require("../../Utils/Query");
const Response = use('App/Models/Response');
const { validate } = use('Validator');
class StatusGroupController {

  async index ({ request, response, auth }) {
        try{
          const user = await auth.getUser()
          var query = StatusGroup.query();
          var {
            page,
            perPage,
          } = request.all()
           // Seteo valores por defectos
           page = page || 1
           perPage = perPage || 10

           let status = await StatusGroup.query().paginate(page, perPage);
           return  response.status(200).json({ menssage: 'Estados', data: status})
        }catch(error){
          console.log(error)
          if (error.name == 'InvalidJwtToken') {
            return response.status(400).json({ menssage: 'Usuario no Valido' })
          }
          return response.status(400).json({  menssage: 'Hubo un error al realizar la operación', error  })
        }
       
   
  }

  async store ({ request, response , auth}) {
    try{
      const user = await auth.getUser()
      let { status_group} = request.all()
      if( status_group == null || status_group == ''){
        return response.status(400).json(new Response(false, 'Estado no encontrado',))
      }
      const newStatus = {
        status_group,
      }
      const status = await StatusGroup.create(newStatus)
      return response.status(200).json({ menssage: 'Estado agregado con exito!'})
    }catch(error){
      console.log(error)
      if (error.name == 'InvalidJwtToken') {
        return response.status(400).json({ menssage: 'Usuario no Valido' })
      }
      return response.status(400).json({ menssage: 'Hubo un error al realizar la operación'})
    }
  }

  async update ({ params: {id}, request, response , auth }) {
    const data = request.only(['status_group'])
    try{
      const user = await auth.getUser()
      if( 'status_group' == null || 'status_group' == ''){
        return response.status(400).json(new Response(false, 'Estado no encontrado',))
      }
      const status = await StatusGroup.find(id);
     status.status_group = data.status_group || status.status_group
     await status.save();
     response.status(200).json({ menssage: 'Estado modificado con exito!', data: status })
    }catch(error){
      console.log(error)
      if (error.name == 'InvalidJwtToken') {
        return response.status(400).json({ menssage: 'Usuario no Valido' })
      }
      return response.status(400).json({ menssage: 'Hubo un error al realizar la operación'})
    }
  }
  async destroy ({ params, request, response , auth }) {
    const id = params.id
    try{
      const user = await auth.getUser()
      const status = await StatusGroup.findOrFail(id);
      await status.delete();
      return response.status(200).json({ menssage: 'Estado eliminado con Exito!'})
    }catch(error){
      console.log(error)
      if (error.name == 'InvalidJwtToken') {
        return response.status(400).json({ menssage: 'Usuario no Valido' })
      }
      response.status(404).json({
        message: "Estado a eliminar no encontrado",
        id
    });
    return;
    }
  }
}

module.exports = StatusGroupController
