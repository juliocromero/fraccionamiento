'use strict'
const Group = use("App/Models/Group");
const Material = use("App/Models/Material");
const GroupMaterial = use('App/Models/GroupMaterial');
const Database = use("Database");
const { validate } = use('Validator');
class GroupMaterialController {

  async index({ request, response, auth }) {

    try {
      const user = await auth.getUser()
      let { groups_id } = request.get()
      var query = GroupMaterial.query();
      var {
        page,
        perPage,
      } = request.all()
      // Seteo valores por defectos
      page = page || 1
      perPage = perPage || 10
      if (groups_id) {
        let groupMaterials = await GroupMaterial.query().where('groups_id', groups_id).paginate(page, perPage);
        return response.status(200).json({ menssage: 'Grupos de Material', data: groupMaterials })
      } else {
        let groupMaterials = await GroupMaterial.query().paginate(page, perPage);
        return response.status(200).json({ menssage: 'Grupos de Material', data: groupMaterials })
      }
    } catch (error) {
      console.log(error)
      if (error.name == 'InvalidJwtToken') {
        return response.status(400).json({ menssage: 'Usuario no Valido' })
      }
      return response.status(400).json({ menssage: 'Hubo un error al realizar la operación', error })
    }
  }

  /**
   * Render a form to be used for creating a new groupmaterial.
   * GET groupmaterials/create
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async create({ request, response, view }) {
  }

  /**
   * Create/save a new groupmaterial.
   * POST groupmaterials
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async store({ request, response, auth }) {
    try {
      const user = await auth.getUser();
      let { groups_id, material_id, quantity } = request.all();

      //validation de rules campo por campo
      const rules = {
        groups_id: 'required',
        material_id: "required",
        quantity: "required"
      }
      const mat = await Material.findBy('id', material_id);
      if (mat == null || mat == '') {
        response.status(401).json({ menssage: 'No  se encontro el material' })
      }
      const gro = await Group.findBy('id', groups_id);
      if (gro == null || gro == '') {
        response.status(401).json({ menssage: 'NO se encontro el grupo' });
      }

      if (user.rol_id == 1) {
        const NewGroupMaterials = {
          groups_id,
          material_id,
          quantity
        }
        const resp = await GroupMaterial.create(NewGroupMaterials);
        return response.status(200).json({ menssage: 'Grupo Material creado con exito!', data: resp });
      } else {
        return response.status(400).json({ menssage: 'Usuario sin permiso Suficiente' })
      }
    } catch (error) {
      console.log(error)
      if (error.name == 'InvalidJwtToken') {
        return response.status(400).json({ menssage: 'Usuario no Valido' })
      }
      return response.status(400).json({ menssage: 'Hubo un error al realizar la operación' })
    }
  }

  /**
   * Display a single groupmaterial.
   * GET groupmaterials/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async show({ params, request, response, auth }) {
    try {
      let { group_id } = request.get();
      const user = await auth.getUser()
      const group = await Group.query().where('group_id', group_id).fetch();
      return response.status(200).json({ menssage: 'GRUPOS', data: group });
    } catch (error) {
      console.log(error)
      if (error.name == 'InvalidJwtToken') {
        return response.status(400).json({ menssage: 'Usuario no Valido' })
      }
      return response.status(400).json({
        menssage: 'Grupo no encontrado',
        id
      })
    }
  }

  /**
   * Render a form to update an existing groupmaterial.
   * GET groupmaterials/:id/edit
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async edit({ params, request, response, view }) {
  }

  /**
   * Update groupmaterial details.
   * PUT or PATCH groupmaterials/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async update({ params, request, response }) {
  }

  /**
   * Delete a groupmaterial with id.
   * DELETE groupmaterials/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async destroy({ params: { id }, request, response , auth}) {
    try {
      const user = await auth.getUser()
      let groupMaterials = await GroupMaterial.findOrFail(id);
     // groupMaterials = groupMaterials.toJSON()
      //console.log(groupMaterials)
      await groupMaterials.delete();
      return response.status(200).json({ menssage: 'Groups Materials eliminado con Exito!' })
    } catch (error) {
      console.log(error)
      if (error.name == 'InvalidJwtToken') {
        return response.status(400).json({ menssage: 'Usuario no Valido' })
      }
      response.status(404).json({
        message: "Group Materials  no encontrado",
        id
      });
      return;
    }
  }
}

module.exports = GroupMaterialController
