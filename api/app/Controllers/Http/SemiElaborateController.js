'use strict'

const SemiElaborate = use("App/Models/SemiElaborate");
const Group = use("App/Models/Group");
const SemiElaborateMaterial = use("App/Models/SemiElaborateMaterial");
const Query = require("../../Utils/Query");
const Response = use('App/Models/Response');
const { validate } = use('Validator');
const Database = use("Database")
class SemiElaborateController {

  async index({ request, response, auth }) {

    try {
      const user = await auth.getUser()
      var query = SemiElaborate.query();
      let {codigo , description} = request.get()
      var {
        page,
        perPage
      } = request.all();
      page = page || 1
      codigo = codigo || null
      description = description || null
      perPage = perPage || 10
      if(codigo){
        query.where('codigo' , 'like', `%${codigo}%`)
      }
      if(description){
        query.where('description' , 'like' , `%${description}%`)
      }
      const elaborate = await query.paginate(page, perPage);
      response.status(200).json({ menssage: 'Listado de Semi Elaborados Material', data: elaborate })
    } catch (error) {
      console.log(error)
      if (error.name == 'InvalidJwtToken') {
        return response.status(400).json({ menssage: 'Usuario no Valido' })
      }
      return response.status(400).json({ menssage: 'Hubo un error al realizar la operación', error })
    }
  }

  async show({params: {id} , request , response , auth}) {
    try {
      const user = await auth.getUser();
      const semi = await SemiElaborate.findOrFail(id);
      return response.status(200).json({ menssage: 'Semi Elaborate', data: semi });
    } catch (error) {
      console.log(error)
      if (error.name == 'InvalidJwtToken') {
        return response.status(400).json({ menssage: 'Usuario no Valido' })
      }
      return response.status(400).json({ menssage: 'Hubo un error al realizar la operación', error })
    }
  }

  async store({ request, response, auth }) {
    try {
      let { name, description, codigo, ton_batch, materialsQuantity } = request.all();
      const user = await auth.getUser();
      //validacion de datos 
      const rules = {
        codigo: 'required',

      }
      const validation = await validate({ name, description }, rules)
      if (codigo == "" || codigo == null) {
        return response.status(400).json({ menssage: 'Codigo es requerido' })
      }
      if (user.rol_id == 1) {
        const newElaborate = {
          name,
          description,
          codigo,
          ton_batch
        }
        const elaborate = await SemiElaborate.create(newElaborate)
        var arrpromises = materialsQuantity.map(item => {
          return {
            semi_elaborate_id: elaborate.id,
            material_id: item.material_id,
            quantity: item.quantity,
          }
        })
        const resp = await Promise.all(arrpromises)
        SemiElaborateMaterial.query().insert(resp);
        return response.status(200).json({ menssage: 'Semi Elaborate cargado con exito!', data: elaborate })
      } else {
        return response.status(400).json({ menssage: 'Usuario sin permiso Suficiente' })
      }
    } catch (error) {
      console.log(error)
      if (error.name == 'InvalidJwtToken') {
        return response.status(400).json({ menssage: 'Usuario no Valido' })
      }
      if (error.routine == '_bt_check_unique') {
        return response.status(400).json({ menssage: 'El semi elaborado ya existe' })
      }
      return response.status(400).json({ menssage: 'Hubo un error al realizar la operación' })
    }
  }

  async update({ auth, params: { id }, request, response }) {
    const data = request.only(["name", "description", "ton_batch", "materialsQuantity"])
    const user = await auth.getUser();
    try {

      if (user.rol_id == 1) {
        if (data) {
          data.materialsQuantity.forEach(async(item) => {
           //console.log(item.quantity)
           await Database.table('semi_elaborate_materials')
           .update({material_id: item.material_id , quantity: item.quantity})
           .where('semi_elaborate_id' , id)
           .where('material_id', item.material_id);
          });
        }
        const elaborate = await SemiElaborate.find(id);
        elaborate.ton_batch = data.ton_batch || elaborate.ton_batch,
          elaborate.name = data.name || elaborate.name;
        elaborate.description = data.description || elaborate.description;
        await elaborate.save();
        response.status(200).json({ menssage: 'Elaborate modificado con Exito!', data: elaborate })
      }
      else {
        response.status(400).json({ menssage: "Usuario sin permisos para realizar la operacion" })
      }

    } catch (error) {
      console.log(error)
      return response.status(400).json({ menssage: 'Semi elaborado no se encontro o no exite' })
    }
  }
  async destroy({ params, response, auth }) {
    const id = params.id
    try {
      const user = await auth.getUser()
      if (user.rol_id == 1) {

        const semi = await SemiElaborate.findOrFail(id);
        await semi.delete();
        return response.status(200).json({ menssage: 'Semi elaborado eliminado con Exito!' })
      }
    } catch (error) {
      console.log(error)
      if (error.name == 'InvalidJwtToken') {
        return response.status(400).json({ menssage: 'Usuario no Valido' })
      }
      response.status(404).json({
        message: "Semi Elaborado a eliminar no encontrado",
        id
      });
      return;
    }
  }


}

module.exports = SemiElaborateController
