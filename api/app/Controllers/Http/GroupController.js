'use strict'
const Group = use("App/Models/Group");
const Plant = use("App/Models/Plant");
const SemiElaborate = use("App/Models/SemiElaborate");
const StatusGroup = use("App/Models/StatusGroup");
const Fraction = use("App/Models/Fraction");
const Material = use("App/Models/Material");
const GroupMaterial = use("App/Models/GroupMaterial");
const { group } = require("@adonisjs/framework/src/Route/Manager");
const Query = require("../../Utils/Query");
const Database = use("Database");
const Response = use('App/Models/Response');
var moment = require('moment');
const { builder } = require("../../Utils/Query");
const { validate } = use('Validator');

class GroupController {

  async index({ request, response, auth }) {
    try {
      var query = Group.query();
      let { plant_id, status_group_id, semi_elaborate_codigo, name, create_date_min, create_date_max, update_date_min, update_date_max } = request.get()
      const user = await auth.getUser()
      var {
        page,
        perPage
      } = request.all();
      // Seteo valores por defectos
      plant_id = plant_id || []
      semi_elaborate_codigo = semi_elaborate_codigo || null
      status_group_id = status_group_id || []
      name = name || []
      create_date_min = create_date_min || null
      create_date_max = create_date_max || null
      update_date_min = update_date_min || null
      update_date_max = update_date_max || null
      page = page || 1
      perPage = perPage || 10

      if (name > 0) {
        query.whereIn('name', name)
      }

      if (plant_id.length > 0) {
        query.whereIn('plant_id', plant_id)
      }
      if (semi_elaborate_codigo) {
        query.whereHas('semi_elaborate', query => query.where('codigo', 'like', `%${semi_elaborate_codigo}%`)).with('semi_elaborate', query => query.where('codigo', 'like', `%${semi_elaborate_codigo}%`))
      }
      if (status_group_id.length > 0) {
        query.whereIn('status_group_id', status_group_id)
      }

      if (create_date_min && create_date_max) {
        query.whereBetween('create_date', [create_date_min, create_date_max])
      }
      if (update_date_min && update_date_max) {
        query.whereBetween('update_date', [update_date_min, update_date_max])
      }
      let group = await query.paginate(page, perPage);
      return response.status(200).json({ menssage: 'Grupos', data: group })
    } catch (error) {
      console.log(error)
      if (error.name == 'InvalidJwtToken') {
        return response.status(400).json({ menssage: 'Usuario no Valido' })
      }
      return response.status(400).json({ menssage: 'Hubo un error al realizar la operación', error })
    }
  }

  async store({ auth, request, response }) {
    try {
      let { plant_id, semielaborate_codigo, ton_batch, fractions, materials, status_group_id } = request.all();
      let conta = 0
      const user = await auth.getUser();
      //validacion de datos
      const rules = {
        plant_id: 'required',
        ton_batch: 'required'
      }

      const validation = await validate({ plant_id, ton_batch }, rules)
      //separo las fracciones por item
        let validationsFraction = Fraction.query()
        fractions.forEach(it => {
          validationsFraction.orWhere((builder) => {
            // console.log(it)
            builder.where('material_id', it.material_id)
              .where('lot_id', it.lot_id)
              .where('fraction_number', it.fraction_number)
          })
        });

        // validationsFraction.where('status_fractions_id', '<>', 1)
        let resultQuery = await validationsFraction.fetch()

        resultQuery = resultQuery.toJSON();
        let flat = false
        let arrPromises = resultQuery.map(item => {

          if (item.status_fractions_id == null) {
            flat = true
            return response.status(403).json({ menssage: `El fraccionado ${item.fractions} no se encuentra disponible` });
          }
        })
        await Promise.all(arrPromises)
        if (flat === true) {
          return response.status(400).json({ menssage: 'El fraccionado no se encuentra disponible, ya a sido tomada por un grupo!' })
        }

      const plant = await Plant.findBy('id', plant_id)
      if (plant == null || plant == '') {
        return response.status(200).json(new Response(false, 'No se encontro la planta',))
      }



      //busco el maximo para autoicrementarlo
      var maxName = await Database.from('groups').max('name')

      //busco el el ultimo creado si la fecha cambia para volver a iniciarlizar el name
      var maxCreate = await Database.from('groups').max('create_date');


      //formateo la fecha maxima
      const FormatFecha = moment(maxCreate[0].max).format('YYYY-MM-DD')

      if (maxName && FormatFecha == moment().format('YYYY-MM-DD')) {
        if (user.rol_id == 1) {
          const newGroups = {
            plant_id,
            semielaborate_codigo,
            ton_batch,
            name: maxName[0].max + 1,
            create_date: moment().format('YYYY-MM-DD HH:mm:ss'),
            status_group_id
          }
          //Creo el grupo
          const group = await Group.create(newGroups)


          //actualizo el group_id a la fraccion que pertenece
          if (fractions != `${[]}`) {

               resultQuery.map(async (e) => {
                 //console.log(e)
                 await Database.table('fractions').update({ groups_id: group.id, status_fractions_id: 4 }).where('material_id', e.material_id).where('lot_id', e.lot_id).where('fraction_number', e.fraction_number);
               });
          }

          if (materials != `${[]}`) {

            //Recorro lo materials para insertalos en Groups_materials asociado
            var arrpromises = materials.map(item => {
              return {
                groups_id: group.id,
                material_id: item.material_id,
                quantity: item.quantity,
              }
            })
            const resp = await Promise.all(arrpromises)
            await GroupMaterial.query().insert(resp);
            if(fractions != `${[]}`){
              resultQuery.map(async (e) => {
                let searchGruopMatirials = await Database.table('group_materials').where({ groups_id: group.id, material_id: e.material_id });
                searchGruopMatirials.forEach(async (element) => {
                  await Database.table('fractions').update({ groups_materials_id: element.id }).where('material_id', e.material_id).where('lot_id', e.lot_id).where('fraction_number', e.fraction_number)
                });
              })
            }else {

              materials.map(async (e) => {
                let searchGruopMatirials = await Database.table('group_materials').where({ groups_id: group.id, material_id: e.material_id });
                searchGruopMatirials.forEach(async (element) => {
                  await Database.table('fractions').update({ groups_materials_id: element.id }).where('material_id', e.material_id)
                });
              })
            }
          }
          return response.status(200).json({ menssage: 'Grupo creado con exito', data: group })
        } else {
          return response.status(400).json({ menssage: 'Usuario sin permiso Suficiente' })
        }
      }
      if (user.rol_id == 1) {
        const newGroups = {
          plant_id,
          semielaborate_codigo,
          ton_batch,
          name: conta + 1,
          create_date: moment().format('YYYY-MM-DD HH:mm:ss'),
          status_group_id
        }
        //Creo el grupo
        const group = await Group.create(newGroups)
        //actualizo el group_id a la fraccion que pertenece
        if (fractions != `${[]}`) {
          resultQuery.map(async (e) => {
            //console.log(e)
            await Database.table('fractions').update({ groups_id: group.id, status_fractions_id: 4 }).where('material_id', e.material_id).where('lot_id', e.lot_id).where('fraction_number', e.fraction_number);
          });
        }

        //Recorro lo materials para insertalos en Groups_materials asociado
        if (materials != `${[]}`) {
          var arrpromises = materials.map(item => {
            return {
              groups_id: group.id,
              material_id: item.material_id,
              quantity: item.quantity,
            }
          })
          const resp = await Promise.all(arrpromises)
          await GroupMaterial.query().insert(resp);
          //recorro las fracciones para insertarle el group_materials_id
          if(fractions != `${[]}`){
            resultQuery.map(async (e) => {
              let searchGruopMatirials = await Database.table('group_materials').where({ groups_id: group.id, material_id: e.material_id });
              searchGruopMatirials.forEach(async (element) => {
                await Database.table('fractions').update({ groups_materials_id: element.id }).where('material_id', e.material_id).where('lot_id', e.lot_id).where('fraction_number', e.fraction_number)
              });
            })
          }


        }

        // const frac = await Database.table('fractions').update({ status_fractions_id: 4 }).whereIn('material_id',arrPromiseFrac).whereIn('lot_id', arrPromiseFrac1).whereIn('fraction_number', arrPromiseFrac2);
        return response.status(200).json({ menssage: 'Grupo creado con exito', data: group })

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


  async show({ params: { id }, request, response, auth }) {
    try {
      const user = await auth.getUser()
      const group = await Group.findOrFail(id);
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

  async validateDespachado({ params: { id }, request, response, auth }) {
    try {
      const user = await auth.getUser()
      const group = await Group.findOrFail(id).update({ status_group_id: 2 });

      return response.status(200).json({ menssage: 'Grupo Actualizado y despachado' });
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


  async update({ auth, request, response, params: { id } }) {
    try {
      const data = request.only(["plant_id", "semielaborate_codigo", "status_group_id", "ton_batch", "fractions", "materials"])
      const user = await auth.getUser();
      const user_id = user.id
       
      //recorro groupMaterials depende el status que recibo
        data.materials.forEach(async (it) => {
          let FilterGroupMaterials1 = await GroupMaterial.query().where({ groups_id: id, material_id: it.material_id }).fetch();
            FilterGroupMaterials1 = FilterGroupMaterials1.toJSON();
            if(FilterGroupMaterials1 == `${[]}`){
              //status 1 agrego el elemento nuevo
              if (it.status == 1) {
                var arrpromises = [{
                  groups_id: id,
                  material_id: it.material_id,
                  quantity: it.quantity,
                }]
                const resp = await Promise.all(arrpromises)
                await GroupMaterial.query().insert(resp);
              }
            }
            let FilterGroupMaterials = await GroupMaterial.query().where({ groups_id: id, material_id: it.material_id }).fetch();
            FilterGroupMaterials = FilterGroupMaterials.toJSON();

            // recorro los groups_materials para actualizarlos si es necesario
            FilterGroupMaterials.forEach(async (element) => {

              await Database.table('group_materials').update('quantity', it.quantity).where('id', element.id)


                let validationsFraction = Fraction.query()
                data.fractions.forEach(it => {
                  validationsFraction.orWhere((builder) => {
                    // console.log(it)
                    builder.where('material_id', it.material_id)
                      .where('lot_id', it.lot_id)
                      .where('fraction_number', it.fraction_number)
                  })
                });
                // validationsFraction.where('status_fractions_id', '<>', 1)
                let resultQuery = await validationsFraction.fetch()
                resultQuery = resultQuery.toJSON();
                // console.log('resultadoFracciones', resultQuery)
                resultQuery.forEach(async (item) => {
                  console.log( 'Fractiones' , item.material_id)
                  let FilterMaterias = await GroupMaterial.query().where({ material_id: item.material_id, groups_id: id }).fetch()
                  FilterMaterias = FilterMaterias.toJSON()
                  FilterMaterias.forEach(async (p) => {
                    //  console.log(item)
                      if (item.status_fractions_id == 2) {
                        await Database.table('fractions').update({ status_fractions_id: 4, groups_id: id, groups_materials_id: p.id }).where('id', item.id)
                      }

                  });


                });
            });
        });
      if (data.plant_id == null || data.plant_id == "") {
        return response.status(400).json({ menssage: ' No se encontro la planta' })
      }
      if (data.status_group_id == null || data.status_group_id == "") {
        return response.status(400).json({ menssage: ' No se encontro el estado' })
      }
      if (user.rol_id == 1) {
        const group = await Group.find(id);
        group.plant_id = data.plant_id || group.plant_id;
        group.semielaborate_codigo = data.semielaborate_codigo || group.semielaborate_codigo;
        group.status_group_id = data.status_group_id || group.status_group_id;
        group.ton_batch = data.ton_batch || group.ton_batch;
        group.update_date = moment().format('YYYY-MM-DD HH:mm:ss');
        await group.save();
        response.status(200).json({ menssage: 'Grupo modificado con Exito!', data: group })
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

  async destroy({ params, response, auth }) {
    const id = params.id
    try {
      const user = await auth.getUser()
      if (user.rol_id == 1) {

        const grup = await Group.findOrFail(id);
        await grup.delete();
        return response.status(200).json({ menssage: 'Grupo eliminado con Exito!' })
      }
    } catch (error) {
      console.log(error)
      if (error.name == 'InvalidJwtToken') {
        return response.status(400).json({ menssage: 'Usuario no Valido' })
      }
      response.status(404).json({
        message: "Grupo a eliminar no encontrado",
        id
      });
      return;
    }

  }

  async ReingresoGroup({ params: { id }, response, auth }) {
    try {
      const user = await auth.getUser();
      let grup = await Group.findOrFail(id);
      grup = grup.toJSON()
      //console.log(grup)
      if (grup.status_group_id == 2) {
        await Database.table('groups').update({ status_group_id: 3 }).where('id', id)
      }
      return response.status(200).json({ message: 'Grupo Re ingresado con exito!' })
    } catch (error) {
      console.log(error)
      if (error.name == 'InvalidJwtToken') {
        return response.status(400).json({ message: 'Usuario no Valido' })
      }
    }
  }

  async planes({ response , request , auth}){
    try {
      const user = await auth.getUser()
      let {groups } = request.all()
      //console.log(groups)
      var arrpromises = groups.map(item => {
        return {
          name: 1,
          status_group_id: 1,
          semielaborate_codigo: item.semielaborate_codigo,
          plant_id: item.plant_id,
          ton_batch: item.ton_batch,
          create_date :  moment().format('YYYY-MM-DD HH:mm:ss')
        }
      })
      const resp = await Promise.all(arrpromises)
     // console.log(resp)
      Group.query().insert(resp);
      return response.status(200).json({message: 'Planes Cargado con exitos!' , planes : resp})
    } catch (error) {
      console.log(error)
      if (error.name == 'InvalidJwtToken') {
        return response.status(400).json({ message: 'Usuario no Valido' })
      }
      response.status(400).json({
        menssage: "Hubo un error al realizar la operación",
      })
    }
      
  }
}

module.exports = GroupController
