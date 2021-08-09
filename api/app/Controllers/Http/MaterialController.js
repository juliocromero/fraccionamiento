'use strict'

const User = use('App/Models/User')
const Material = use("App/Models/Material");

const Voucher = use("App/Models/Voucher");
const Type = use("App/Models/Type");
const OldMaterial = use("App/Models/OldMaterial");
const Query = require("../../Utils/Query");
var moment = require('moment');
const Response = use('App/Models/Response');
const Database = use("Database");
const { validate } = use('Validator');
const Helpers = use('Helpers');
const Drive = use('Drive');
const fs = require('fs');
class MaterialController {

  async index({ request, response, view, auth }) {
    try {
      const user = await auth.getUser()
      var query = Material.query();
      let { type_id, id, description } = request.get()
      var {
        page,
        perPage,
      } = request.all()
      // Seteo valores por defectos
      page = page || 1
      id = id || []
      type_id = type_id || []
      description = description || null
      perPage = perPage || 10

      if (id > 0) {
        query.whereIn('id', id)
      }
      if (type_id > 0) {
        query.whereIn('type_id', type_id)
      }
      if (description) {
        query.where('description', 'like', `%${description}%`)
      }
      let materials = await query.with('type').paginate(page, perPage);
      materials = materials.toJSON();
      let arrPromises = materials.data.map(e => {
        let buff = fs.readFileSync(`storage/archivos/material/${e.img}`);
        let base64data = buff.toString('base64')
        // let img = response.download(Helpers.appRoot());
        return {
          "id": e.id,
          "description": e.description,
          "tolerance": e.tolerance,
          "version": e.version,
          "img_name": e.img,
          "img": base64data
        }
      })
      let resp = await Promise.all(arrPromises)
      materials.data = resp
      return response.status(200).json({ menssage: 'Materiales', data: materials })

    } catch (error) {
      console.log(error)
      if (error.name == 'InvalidJwtToken') {
        return response.status(400).json({ menssage: 'Usuario no Valido' })
      }
      return response.status(400).json({ menssage: 'Hubo un error al realizar la operación', error })
    }
  }
  async ListMaterials({ request, response, auth }) {
    try {
      const user = await auth.getUser()
      var query = Material.query();
      let materials = await query.with('type').fetch();
      materials = materials.toJSON();
      let arrPromises = materials.map(item => {
        return {
          "id": item.id,
          "name": item.description
        }
      })
      let resp = await Promise.all(arrPromises)
      return response.status(200).json({ menssage: 'Materiales', data: resp })
    } catch (error) {
      console.log(error)
      if (error.name == 'InvalidJwtToken') {
        return response.status(400).json({ menssage: 'Usuario no Valido' })
      }
      return response.status(400).json({ menssage: 'Hubo un error al realizar la operación', error })
    }
  }

  async update({ params: { id }, request, response, auth }) {
    const { description, tolerance, epp, type_id, version, justification , img} = request.all();
    const user = await auth.getUser();
    if (user.rol_id == 1) {
      try {
        var origMaterial = await Material.findOrFail(id);
        if (justification == null || justification == '') {
          return response.status(404).json({
            message: "Justificacion Requerida",
          });
        }
        if (origMaterial.version >= version) {
          return response.status(404).json({
            message: "Version invalida , la version es menor o igual a la anterior",

          });
        }
        var m = origMaterial.toJSON();
        var materials = new OldMaterial();
        const insert = await Database.table('old_materials').insert({ material_id: m.id, description: m.description, tolerance: m.tolerance, version: m.version, justification: justification, user_id: user.id, type_id: m.type_id, epp: m.epp , img: m.img})
        origMaterial.merge({ description: description, tolerance: tolerance, epp: epp, type_id: type_id, version: version , img: img })
        await origMaterial.save();
        return response.status(200).json({ menssage: 'Materials modificado con exito' })
      } catch (error) {
        console.log(error)
        return response.status(404).json({
          message: "Hubo un error al realizar la operación o el Materials no exite",
          id
        });
      }
    } else {
      return response.status(404).json({ message: "Usuario no autorizado a realizar la operación" });
    }
  }

  async show({ response, params: { id }, auth }) {
    try {
      const user = await auth.getUser();
      const materials = await Material.findOrFail(id);
      return response.status(200).json({ menssage: 'material', data: materials });
    } catch (error) {
      console.log(error.name)
      if (error.name == 'InvalidJwtToken') {
        return response.status(400).json({ menssage: 'Usuario no Valido' })
      }
      return response.status(400).json({
        menssage: 'Material no encontrado',
        id
      })
    }
  }

  async store({ request, response, auth }) {
    try {
      const user = await auth.getUser()
      let { description, tolerance, epp, type_id, version, id, imgRep } = request.all();
      if (imgRep) {
        if (version == null || version == '') {
          return response.status(400).json({ menssage: 'Version no puede ser vacia' })
        }
        if (user.rol_id < 4) {
          const newMat = {
            id,
            description,
            tolerance,
            epp,
            type_id,
            version,
            img: imgRep
          }
          const mtls = await Material.create(newMat)
          return response.status(200).json({ menssage: 'Material agregado con exito!', mtls })
        }

      }
      let img = request.file('img', {
        types: ['image', 'png', 'jpg'],
        size: '4mb'
      })
      if (version == null || version == '') {
        return response.status(400).json({ menssage: 'Version no puede ser vacia' })
      }
      if (user.rol_id < 4) {
        const newMat = {
          id,
          description,
          tolerance,
          epp,
          type_id,
          version,
          img: img.clientName
        }
        const mtls = await Material.create(newMat)
        if (img != null) {
         
          await img.move(`storage/archivos/material`, {
            name: img.clientName,
            overwrite: true
          })
        }

        //  if(!img.moved()){
        //   throw "No se pudo guardar el archivo."
        //  }
        return response.status(200).json({ menssage: 'Material agregado con exito!', mtls })
      }

    } catch (error) {
      console.log(error)
      if (error.name == 'InvalidJwtToken') {
        return response.status(400).json({ menssage: 'Usuario no Valido' })
      }
      if (error.constraint == 'materials_pkey') {
        return response.status(400).json({ menssage: 'Codigo de material ya existe.!' })
      }
      return response.status(400).json({ menssage: 'Hubo un error al realizar la operación' })
    }
  }
  async destroy({ params, response, auth }) {

    try {
      const id = params.id
      const user = await auth.getUser()
      if (user.rol_id == 1) {
        let validation = await Voucher.findBy('material_id', id);
        //validation = validation.toJSON();
        if (validation != null) {
          return response.status(400).json({ menssage: 'El material no se puede borra esta asociado a un vale.!' })
        } else {
          const mtls = await Material.findOrFail(id);
          await mtls.delete();
          return response.status(200).json({ menssage: 'Material eliminado con Exito!' })
        }
      } else {
        return response.status(200).json({ menssage: 'Usuario sin permiso de Eliminar !' })
      }

    } catch (error) {
      console.log(error)
      if (error.detail == `Key (id)=(${id}) is still referenced from table "vouchers".`) {
        return response.status(400).json({ menssage: 'No se puede eliminar este material, esta siendo utilizado!' })
      }
      if (error.name == 'InvalidJwtToken') {
        return response.status(400).json({ menssage: 'Usuario no Valido' })
      }
      response.status(404).json({
        message: "Material a eliminar no encontrado",
        id
      });
      return;
    }
  }

  async ListImg({ request, response, auth }) {
    try {
      const user = await auth.getUser()
      var item = []
      //busco las imagenes que tengo en la carpeta storage
      let dir = fs.readdirSync(`storage/archivos/material`).forEach(it => {
        //console.log(it)
        item.push(it)
      })

      //recorro los item para devolver las img en base64
      let arrPromises = item.map(element =>{
        let buff = fs.readFileSync(`storage/archivos/material/${element}`);
        let base64data = buff.toString('base64')
        
        return {
          'name': element,
          'img': base64data
        }
      })
      let resp = await Promise.all(arrPromises)
       return response.status(200).json({message: 'img' , list: resp})
    } catch (error) {
      console.log(error)
      if (error.name == 'InvalidJwtToken') {
        return response.status(400).json({ menssage: 'Usuario no Valido' })
      }
      return response.status(400).json({ menssage: 'Hubo un error al realizar la operación', error })
    }

  }
}

module.exports = MaterialController
