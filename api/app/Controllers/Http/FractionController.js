
'use strict'
const Fraction = use('App/Models/Fraction');
const Query = require("../../Utils/Query");
var moment = require('moment');
const Lot = use("App/Models/Lot");
const Group = use("App/Models/Group");
const { table } = require("../../Models/Fraction");
const User = use('App/Models/User');
const RejectedFraction = use('App/Models/RejectedFraction');
const Voucher = use("App/Models/Voucher");
const Response = use('App/Models/Response');
const Database = use("Database");
const { validate } = use('Validator');
class FractionController {

  //devuelvo todo las fraction con su usuario y voucher relacionado

  async index({ request, response, auth }) {
    try {
      const user = await auth.getUser()
      let { material_id, lot, quantity, fraction_number, status_fractions_id, create_date_min, create_date_max } = request.get();
      var query = Fraction.query();
      var {
        sortBy,
        descending,
        page,
        perPage,
      } = request.all();

      // Seteo valores por defectos
      sortBy = sortBy || 'create_date'
      descending = descending || 'DESC'
      page = page || 1
      perPage = perPage || 10
      material_id = material_id || []
      lot = lot || []
      quantity = quantity || null
      fraction_number = fraction_number || []
      status_fractions_id = status_fractions_id || []
      create_date_min = create_date_min || null
      create_date_max = create_date_max || null

      if (material_id > 0) {
        query.whereIn('material_id', material_id)
      }
      if (lot > 0) {
        query.whereIn('lot_id', lot)
      }
      if (quantity > 0) {
        query.whereIn('quantity', quantity)
      }
      if (fraction_number > 0) {
        query.whereIn('fraction_number', fraction_number)
      }
      if (status_fractions_id > 0) {
        query.whereIn('status_fractions_id', status_fractions_id)
      }
      if (create_date_min && create_date_max) {
        query.whereBetween('create_date', [create_date_min, create_date_max])
      }

      let fraction1 = await query.with('users').with('lots').paginate(page, perPage);
      fraction1 = fraction1.toJSON()
      //creo un array para insertar usuario y voucher_id
      let arrFractions = fraction1.data.map(item => {
        return {
          "id": item.id,
          "lot_id": item.lot_id,
          "quantity": item.quantity,
          "material_id": item.material_id,
          "create_date": item.create_date,
          "user_id": item.users.username,
          "status_fractions_id": item.status_fractions_id,
          "fraction_number": item.fraction_number,
          "groups_materials_id": item.groups_materials_id,
        }
      })
      const resp = await Promise.all(arrFractions)
      fraction1.data = resp

      response.status(200).json({ menssage: 'Fraccion', data: fraction1 })
    } catch (error) {
      console.log(error)
      if (error.name == 'InvalidJwtToken') {
        return response.status(400).json({ menssage: 'Usuario no Valido' })
      }
      response.status(404).json({ menssage: 'Hubo un error al realizar la operación', error });
    }
  }



  //Metodo para crear un nuevo fraccionamiento
  async store({ auth, request, response }) {
    try {
      let { quantity, material_id, lot_id } = request.all();
      let conta = 0
      const user = await auth.getUser();
      if (user.rol_id == 1) {
        //console.log(user.id)
        //validacion de datos 
        const rules = {
          material_id: 'required',
          quantity: 'required'

        }
        let validateLot = await Lot.query().where({id : lot_id , material_id: material_id}).fetch()
        validateLot = validateLot.toJSON();
        //console.log(validateLot)
        if (validateLot == `${[]}`) {
          return response.status(200).json(new Response(false, 'Vale no encontrado'))
         }
         if (validateLot[0].quantity_act < quantity) {
          return response.status(200).json(new Response(false, 'Cantidad no disponible en el Vale'))
        }
        if (validateLot[0].expiration_date <= moment()) {
             return response.status(200).json(new Response(false, 'Vale vencido'))
         }
        validateLot.forEach(async (it) => {
         // console.log(it.quantity_act)
          //console.log(quantity)
         
         if(it){
         const regla = it.quantity_act = it.quantity_act - quantity
         console.log(regla)
        const lot = await Database.table('lots').update({ quantity_act: regla}).where({id: it.id , material_id: it.material_id})
         }  
        });
        const materialsValidation = await Fraction.findBy('material_id', material_id);
        // //console.log(materialsValidation)
         if (materialsValidation) {
          var MaxFractionNumber = await Database.from('fractions').where('material_id', material_id).where('lot_id', lot_id).max('fraction_number')
           console.log(MaxFractionNumber)
          if (MaxFractionNumber) {

             const newFraction1 = {

              material_id,
              quantity,
               lot_id,
              user_id: user.id,
              status_fractions_id: 1,
              create_date: moment().format('YYYY-MM-DD HH:mm:ss'),
              fraction_number: MaxFractionNumber[0].max + 1

            }
            const fraction = await Fraction.create(newFraction1);
            return response.status(200).json(new Response(true, 'Fraccinado cargado con exito!', fraction))
           }
        }

        const newFraction = {
          material_id,
          quantity,
          lot_id,
          user_id: user.id,
          status_fractions_id: 1,
          create_date: moment().format('YYYY-MM-DD HH:mm:ss'),
          fraction_number: conta + 1
        }
        const fraction = await Fraction.create(newFraction);
        //console.log(fraction.fraction_number)
        return response.status(200).json(new Response(true, 'Fraccinado cargado con exito!', fraction))
      } else {
        return response.status(400).json(new Response(false, 'Usuario no autorizado a realizar la operación'))
      }
    } catch (error) {
      console.log(error)
      if (error.name == 'InvalidJwtToken') {
        return response.status(400).json({ menssage: 'Usuario no Valido' })
      }
      return response.status(400).json(new Response(false, 'Hubo un error al agregar el fraccionado'))
    }

  }

  //
  async show({ response, params: { id }, auth }) {
    try {
      const user = await auth.getUser();
      const validate = await Fraction.findBy('id', id);
      //console.log(validate)
      if (validate.status_fractions_id == 2) {
        const updateStatus = await Database.table('fractions').where('id', id).update({ status_fractions_id: 1 })
        return true
      } else {
        return false
      }
    } catch (error) {
      if (error.name == 'InvalidJwtToken') {
        return response.status(400).json({ menssage: 'Usuario no Valido' })
      }
      return response.status(400).json(new Response(false, 'Usuario no autorizado a realizar la operación'))
    }

  }

  async ListGroupMaterials({ response, params, request }) {
    try {
      let { group_materials_id } = request.get()
      const groupMaterials = await Fraction.query().where('groups_materials_id', group_materials_id).fetch();
      return response.status(200).json({ menssage: 'Fractions Group Materials!', groupMaterials })
    } catch (error) {
      if (error.name == 'InvalidJwtToken') {
        return response.status(400).json({ menssage: 'Hubo un error al realizar la operacion', error })
      }
    }
  }



  async show1({ response, params: { id }, auth }) {
    try {
      const user = await auth.getUser();
      const validate = await Fraction.findBy('id', id);
      console.log(validate)
      if (validate.status_fractions_id == 1) {
        const updateStatus = await Database.table('fractions').where('id', id).update({ status_fractions_id: 2 })
        return true
      } else {
        return false
      }
    } catch (error) {
      if (error.name == 'InvalidJwtToken') {
        return response.status(400).json({ menssage: 'Usuario no Valido' })
      }
      return response.status(400).json(new Response(false, 'Usuario no autorizado a realizar la operación'))
    }
  }
  async filtroParamsMAterilas({ request, response, auth }) {

    try {
      const user = await auth.getUser()
      const { material_id } = request.get();
      const fractionMaterials = await Fraction.query().where({material_id: material_id ,status_fractions_id : 1}).fetch();
      return response.status(200).json({ menssage: 'Material', fractionMaterials })

    } catch (error) {
      console.log(error)
      if (error.name == 'InvalidJwtToken') {
        return response.status(400).json({ menssage: 'Usuario no Valido' })
      }
      response.status(404).json({ menssage: 'Hubo un error al realizar la operación', error });
    }
  }


  async update({ auth, params: { id }, request, response }) {
    //const data = request.only(["justification", "quantity", "status"])
    let { justification, quantity } = request.all();

    const user = await auth.getUser();
    if (user.rol_id == 1) {
      try {
        var origFraction = await Fraction.findOrFail(id);
      } catch (error) {
        console.log(error)
        if (error.name == 'InvalidJwtToken') {
          return response.status(400).json({ menssage: 'Usuario no Valido' })
        }
        return response.status(404).json({
          message: "El fraccionado no se encuentra disponible o no existe",
          id
        });
      }
      if (justification == '' || justification == null) {
        return response.status(404).json({
          message: "Justificacion Requerida", origFraction
        });
      }
      const FracGroupStatus = await Fraction.findBy('id', id);
      console.log(FracGroupStatus.groups_id)
      if (FracGroupStatus.groups_id == null) {
        let LotFracUpdate = await Lot.findBy('id', FracGroupStatus.lot_id);
        LotFracUpdate = LotFracUpdate.toJSON();
        //console.log(LotFracUpdate)
        if (Math.sign(quantity) == 1) {
          let h = origFraction.quantity + quantity
          await Database.table('fractions').update({ quantity: h }).where('id', id);
          let p = LotFracUpdate.quantity_act - quantity
          await Database.table('lots').update({ quantity_act: p }).where('id', LotFracUpdate.id);
        } else if (Math.sign(quantity) == -1) {
          //console.log(Math.sign(quantity))
          let h = origFraction.quantity + quantity
          //console.log(h)
          await Database.table('fractions').update({ quantity: h }).where('id', id);
          let p = LotFracUpdate.quantity_act - quantity
          await Database.table('lots').update({ quantity_act: p }).where('id', LotFracUpdate.id);
        }
        return response.status(200).json({ menssage: 'Fraccionado modificado con exito' })
      }
      //console.log(FracGroupStatus.fraction_number)
      let searchGruopFrac = await Group.query().where('id', FracGroupStatus.groups_id).fetch();
      searchGruopFrac = searchGruopFrac.toJSON();
      // console.log(searchGruopFrac)
      if (searchGruopFrac[0].status_group_id != 2) {
        let LotFracUpdate = await Lot.findBy('id', FracGroupStatus.lot_id);
        LotFracUpdate = LotFracUpdate.toJSON();
        //console.log(LotFracUpdate)
        if (Math.sign(quantity) == 1) {
          let h = origFraction.quantity + quantity
          await Database.table('fractions').update({ quantity: h }).where('id', id);
          let p = LotFracUpdate.quantity_act - quantity
          await Database.table('lots').update({ quantity_act: p }).where('id', LotFracUpdate.id);
        } else if (Math.sign(quantity) == -1) {
          //console.log(Math.sign(quantity))
          let h = origFraction.quantity + quantity
          // console.log(h)
          await Database.table('fractions').update({ quantity: h }).where('id', id);
          let p = LotFracUpdate.quantity_act - quantity
          await Database.table('lots').update({ quantity_act: p }).where('id', LotFracUpdate.id);
        }
      } else {
        return response.status(400).json({ menssage: 'El grupo ya fue despachado no se puede modificar!' })
      }
      var f = origFraction.toJSON()
      //almaceno los valores viejos para luego guardarlos en la base de datos

      var rejetedFractions = new RejectedFraction();
      //rejetedFractions.fill({fraction_id: f.id, user_id:user.id, rejected_date: moment().format('YYYY-MM-DD HH:mm:ss'), justification:justification})
      //origFraction.status = status
      const insert = await Database.table('rejected_fractions').insert({ fraction_id: f.id, user_id: user.id, rejected_date: moment().format('YYYY-MM-DD HH:mm:ss'), justification: justification })
      await origFraction.save()
      return response.status(200).json({ menssage: 'Fraccionado modificado con exito' })

      //guardo los fraccionados viejos
    } else {
      response.status(404).json({ message: "Usuario sin permiso suficiente" });
    }
  }


  async destroy({ params: { id }, request, response, auth }) {
    try {
      const user = await auth.getUser();
      const validate = await Fraction.findBy('id', id);

      console.log(validate.groups_id)
      const validateGroup = await Group.findBy('id', validate.groups_id);
      console.log(validateGroup.status_group_id)
      if (validate.groups_id == null) {
        if (user.rol_id <= 2) {
          try {
            const fraction = await Fraction.findOrFail(id);
            await fraction.delete();
            response.status(200).json({ menssage: 'Fracion eliminada con exito!' });
            return;
          } catch (error) {
            response.status(404).json({
              message: "Fraccion a eliminar no encontrado",
              id
            });
            return;
          }
        } else {
          response.status(403).json({ message: "Usuario sin permisos suficientes" });
          return;
        }
      } else {
        if (validateGroup.status_group_id == 1) {
          if (user.rol_id <= 2) {
            try {
              const fraction = await Fraction.findOrFail(id);
              await fraction.delete();
              response.status(200).json({ menssage: 'Fracion eliminada con exito!' });
              return;
            } catch (error) {
              response.status(404).json({
                message: "Fraccion a eliminar no encontrado",
                id
              });
              return;
            }
          } else {
            response.status(403).json({ message: "Usuario sin permisos suficientes" });
            return;
          }
        } else {
          return response.status(404).json({ menssage: 'La fraccion no se puede eliminar por que ya fue despachada!' })
        }
      }

    } catch (error) {
      console.log(error)
      if (error.name == 'InvalidJwtToken') {
        return response.status(400).json({ menssage: 'Usuario no Valido' })
      }
      response.status(404).json({ menssage: 'Hubo un error al realizar la operación', error });
    }
  }
}

module.exports = FractionController
