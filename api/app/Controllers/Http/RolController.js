'use strict'

const Rol = use("App/Models/Rol");
const Query = require("../../Utils/Query");
const Response = use('App/Models/Response');
const { validate } = use('Validator');
class RolController {
 
  async index ({ request, response, auth }) {
     
    try{
      const user = await auth.getUser()
      var query = Rol.query();
      var {
        page,
        perPage,
      } = request.all()
       // Seteo valores por defectos
       page = page || 1
       perPage = perPage || 10

       let rols = await Rol.query().paginate(page, perPage);
       return  response.status(200).json({ menssage: 'Roles', data: rols})
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
      const user = await getUser()
      let { rol} = request.all()
      if( rol == null || rol == ''){
        return response.status(400).json(new Response(false, 'Rol no Puede ser vacio',))
      }
      const newStatus = {
        rol,
      }
      const rols = await Rol.create(newStatus)
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
    const data = request.only(['rol'])
    try{
      const user = await auth.getUser()
      if( 'rol' == null || 'rol' == ''){
        return response.status(400).json(new Response(false, 'Rol no encontrado',))
      }
      const rols = await Rol.find(id);
     rols.rol = data.rol || rols.rol
     await rols.save();
     response.status(200).json({ menssage: 'Rol modificado con exito!', data: rols })
    }catch(error){
      console.log(error)
      if (error.name == 'InvalidJwtToken') {
        return response.status(400).json({ menssage: 'Usuario no Valido' })
      }
      return response.status(400).json({ menssage: 'Hubo un error al realizar la operación'})
    }
  }
  async destroy ({ params, auth, response }) {
    const id = params.id
    try{
      const user = await auth.getUser()
      const rols = await Rol.findOrFail(id);
      await rols.delete();
      return response.status(200).json({ menssage: 'Rol eliminado con Exito!'})
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

module.exports = RolController
