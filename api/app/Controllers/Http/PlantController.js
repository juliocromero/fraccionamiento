'use strict'

const Plant = use("App/Models/Plant");
const Query = require("../../Utils/Query");
const Response = use('App/Models/Response');
const { validate } = use('Validator');
class PlantController {

  async index({ request, response, view, auth }) {

    try {
      const user = await auth.getUser()
      var query = Plant.query();
      var {
        page,
        perPage,
      } = request.all()
      // Seteo valores por defectos
      page = page || 1
      perPage = perPage || 10

      let plant = await Plant.query().paginate(page, perPage);
      return response.status(200).json({ menssage: 'Plantas', data: plant })

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
      const user = await auth.getUser()
      let { plant } = request.all()
      if (plant == null || plant == '') {
        return response.status(400).json(new Response(false, 'Planta no puede ser vacia',))
      }
      const newPlant = {
        plant,
      }
      const plants = await Plant.create(newPlant)
      return response.status(200).json({ menssage: 'Planta agregado con exito!' })
    } catch (error) {
      console.log(error)
      if (error.name == 'InvalidJwtToken') {
        return response.status(400).json({ menssage: 'Usuario no Valido' })
      }
      return response.status(400).json({ menssage: 'Hubo un error al realizar la operación' })
    }
  }


  async update({ params: { id }, request, response, auth }) {
    const data = request.only(['plant'])
    try {
      const user = await auth.getUser()
      if ('plant' == null || 'plant' == '') {
        return response.status(400).json(new Response(false, 'Planta no encontrado',))
      }
      const plants = await Plant.find(id);
      plants.plant = data.plant || plants.plant
      await plants.save();
      response.status(200).json({ menssage: 'Planta modificado con exito!', data: plants })
    } catch (error) {
      console.log(error)
      if (error.name == 'InvalidJwtToken') {
        return response.status(400).json({ menssage: 'Usuario no Valido' })
      }
      return response.status(400).json({ menssage: 'Hubo un error al realizar la operación' })
    }
  }


  async destroy({ params, response, auth }) {
    const id = params.id
    try {
      const user = await auth.getUser()
      const plants = await Plant.findOrFail(id);
      await plants.delete();
      return response.status(200).json({ menssage: 'Planta eliminado con Exito!' })
    } catch (error) {
      console.log(error)
      if (error.name == 'InvalidJwtToken') {
        return response.status(400).json({ menssage: 'Usuario no Valido' })
      }
      response.status(404).json({
        message: "Planta a eliminar no encontrado",
        id
      });
      return;
    }
  }
}

module.exports = PlantController
