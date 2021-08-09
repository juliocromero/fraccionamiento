'use strict'
const Type = use("App/Models/Type");
const Query = require("../../Utils/Query");
const Response = use('App/Models/Response');
const { validate } = use('Validator');
class TypeController {
  
  async index ({ request, response, auth }) {
    try{
      const user = await auth.getUser()
      var query = Type.query();
      var {
        page,
        perPage,
      } = request.all()
       // Seteo valores por defectos
       page = page || 1
       perPage = perPage || 10

       let types = await Type.query().paginate(page, perPage);
       return  response.status(200).json({ menssage: 'Tipos', data: types})
    }catch(error){
      console.log(error)
      if (error.name == 'InvalidJwtToken') {
        return response.status(400).json({ menssage: 'Usuario no Valido' })
      }
      return response.status(400).json({  menssage: 'Hubo un error al realizar la operación', error  })
    }

  }

  async store ({ request, response , auth }) {
    try{
      const user = await auth.getUser()
      let { type} = request.all()
      if( type == null || type == ''){
        return response.status(400).json(new Response(false, 'Tipo no Puede ser vacio o nulo',))
      }
      const newType = {
        type,
      }
      const types = await Type.create(newType)
      return response.status(200).json({ menssage: 'Tipo agregado con exito!'})
    }catch(error){
      console.log(error)
      if (error.name == 'InvalidJwtToken') {
        return response.status(400).json({ menssage: 'Usuario no Valido' })
      }
      return response.status(400).json({ menssage: 'Hubo un error al realizar la operación'})
    }
  }


  async update ({ params: {id}, request, response, auth }) {

    const data = request.only(['type'])
    try{
      const user = await auth.getUser()
      if( 'type' == null || 'type' == ''){
        return response.status(400).json(new Response(false, 'Tipo no encontrado',))
      }
      const types = await Type.find(id);
     types.type = data.type || types.type
     await types.save();
     response.status(200).json({ menssage: 'Rol modificado con exito!', data: types })
    }catch(error){
      console.log(error)
      if (error.name == 'InvalidJwtToken') {
        return response.status(400).json({ menssage: 'Usuario no Valido' })
      }
      return response.status(400).json({ menssage: 'Hubo un error al realizar la operación'})
    }
  }

  async destroy ({ params, request, response, auth }) {
    const id = params.id
    try{
      const user = await auth.getUser()
      const types = await Type.findOrFail(id);
      await types.delete();
      return response.status(200).json({ menssage: 'Tipe eliminado con Exito!'})
    }catch(error){
      console.log(error)
      if (error.name == 'InvalidJwtToken') {
        return response.status(400).json({ menssage: 'Usuario no Valido' })
      }
      response.status(404).json({
        message: "Rol a eliminar no encontrado",
        id
    });
    return;
    }
  }
}

module.exports = TypeController
