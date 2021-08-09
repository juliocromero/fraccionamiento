'use strict'
const Fraction = use('App/Models/Fraction')
const Material = use('App/Models/Material')
const User = use('App/Models/User');
const Lot = use('App/Models/Lot');
const Voucher = use("App/Models/Voucher");
const Query = require("../../Utils/Query");
var moment = require('moment');
const Response = use('App/Models/Response');
const Database = use("Database");
const { validate } = use('Validator');

class VoucherController {

  //listado de voucher 
  async index({ request, response, view, auth }) {
    try {
      const user = await auth.getUser()
      var query = Voucher.query();
      var {
        sortBy,
        descending,
        page,
        perPage,
      } = request.all();
      let { sap  , lot_id , material_id , admission_date_min , admission_date_max,  expiration_date_min, expiration_date_max} = request.get()
      // Seteo valores por defectos
      sortBy = sortBy || 'admission_date'
      descending = descending || 'DESC'
      sap = sap || null
      material_id = material_id || []
      admission_date_min = admission_date_min || null
      lot_id = lot_id || []
      admission_date_max = admission_date_max || []
      expiration_date_min = expiration_date_min || null
      expiration_date_max = expiration_date_max || null
      page = page || 1
      perPage = perPage || 10


      if (sap) {
        query.where('sap','like',  `%${sap}%`)
      }
      if (lot_id > 0) {
        query.whereIn('lot_id', lot_id)
      }
      if (material_id.length > 0) {
        query.whereIn('material_id' , material_id)
      }
      //console.log(admission_date_min)
      if(admission_date_min && admission_date_max){
        query.whereBetween('admission_date', [admission_date_min , admission_date_max])
      }
      if(expiration_date_min && expiration_date_max){
        query.whereBetween('expiration_date', [expiration_date_min , expiration_date_max])
      }
      let voucher = await query.with('users').with('materials').with('lots').orderBy(sortBy, descending).paginate(page, perPage);
      voucher = voucher.toJSON();
      // console.log(voucher)
      //creo un array para insertar usuario y voucher_id
      let arrVouchers = voucher.data.map(item => {
        return {
          "id": item.id,
          "sap": item.sap,
          "expiration_date": item.expiration_date,
          "quantity": item.quantity,
          "lot_id": item.lots.id,
          "user": item.users.username,
          "material_id": item.materials.id,
          "manufacturing_date": item.manufacturing_date,
          "admission_date": item.admission_date,
          "status": item.status,
        }
      })
      let resp = await Promise.all(arrVouchers)
      voucher.data = resp
      response.status(200).json({ menssage: 'Listado de Voucher', data: voucher })
    } catch (error) {
      console.log(error)
      if (error.name == 'InvalidJwtToken') {
        return response.status(400).json({ menssage: 'Usuario no Valido' })
      }

      response.status(404).json({ menssage: 'Hubo un error al realizar la operación', error });
    }
  }

  //voucher por parametro segun su id 
  async show({ response, params, auth }) {
    try {
      var sap = params.id
      const voucher = await Voucher.query().where('sap', sap).fetch();
      const user = await auth.getUser();
      return response.status(200).json({ menssage: 'Voucher', voucher });
    } catch (error) {
      console.log(error)
      if (error.name == 'InvalidJwtToken') {
        return response.status(400).json({ menssage: 'Usuario no Valido' })
      }
      return response.status(400).json({
        menssage: 'Voucher no encontrado',
        id
      })
    }
  }

  //crear voucher Metodo POST
  async store({ auth, request, response }) {
    try {
      let { sap, expiration_date, quantity, lot_id, manufacturing_date, material_id } = request.all();

      const user = await auth.getUser();
      const user_id = user.id
      if (user.rol_id == 1) {
        //console.log(user_id)
        //validacion de datos 
        const rules = {

          expiration_date: 'required',
          quantity: 'required',

        }
        manufacturing_date = manufacturing_date || null
        const validation = await validate({ sap, expiration_date, quantity, manufacturing_date, material_id, lot_id }, rules)
        if (validation.fails()) {
          return response.status(200).json(new Response(false, 'Hubo error al cargar el vale',))
        }
        const material = await Material.findBy('id', material_id)
        //console.log(material.id)
        if (material == null) {
          return response.status(200).json(new Response(false, 'Material no encontrado',))
        }
        if (expiration_date <= moment()) {
          return response.status(200).json(new Response(false, 'Vale ya expirado',))
        }




        //si existe el lote sumo la cantidad
        let lotes =  Lot.query()
         lotes.orWhere((builder) => {
           builder.where('material_id', material_id)
           .where('id', lot_id)
         })
  
         let resultadoLote = await lotes.fetch();
         resultadoLote = resultadoLote.toJSON();
         //console.log(resultadoLote)
         if (resultadoLote == `${[]}`) {
          const CreateLote1 = await Database.table('lots').insert({ id: lot_id, material_id: material_id, quantity: quantity, quantity_act: quantity, expiration_date: expiration_date });
        }else{
          resultadoLote.map(async(e) =>{
            //console.log( 'arrayMAP' , e)
             const p = e.quantity += quantity;
             const h = e.quantity_act += quantity;
             //console.log('resultado' ,p , h )
             const UpdateQuanty = await Database.table('lots').where({'id': e.id , 'material_id': e.material_id}).update({quantity : p , quantity_act: h , expiration_date: expiration_date})
          })
        }
        const newVoucher = {
          sap,
          expiration_date: moment(expiration_date).format('YYYY-MM-DD HH:mm:ss'),
          quantity,
          user_id: user_id,
          lot_id,
          manufacturing_date,
          admission_date: moment().format('YYYY-MM-DD HH:mm:ss'),
          material_id
        }
        const voucher = await Voucher.create(newVoucher);
        return response.status(200).json(new Response(true, 'Vale cargado con exito!', voucher))
      } else {
        return response.status(400).json(new Response(false, 'Usuario sin permisos suficiente'))
      }
    } catch (error) {
      console.log(error)
      if (error.name == 'InvalidJwtToken') {
        return response.status(400).json({ menssage: 'Usuario no Valido' })
      }
      return response.status(400).json(new Response(false, 'Hubo un error al procesar la solicitud'))
    }

  }

  async groups({ request, response, auth }) {

    try {
      const user = await auth.getUser();
      var query = Voucher.query();
      var {
        sap,
        product,
        expiration_date,
        field
      } = request.all();

      //condiciones de la query
      sap = sap || []
      product = product || []
      expiration_date = expiration_date || []
      field = field || []
      if (sap.length > 0) {
        console.log(query)
        query.whereIn('sap', sap[0])
      }

      if (product.length > 0) {
        query.whereIn('product', product)
      }

      if (expiration_date.length > 0) {
        query.whereIn('expirate_date', expiration_date)
      }
      let voucher = await Voucher.query().with('users').with('products').fetch();
      voucher = voucher.toJSON()
      var arrVouchers = voucher.map(item => {
        return {
          "id": item.id,
          "sap": item.sap,
          "expiration_date": item.expiration_date,
          "entry_quantity": item.entry_quantity,
          "actual_quantity": item.actual_quantity,
          "user": item.users.username,
          "product": item.products.username,
          "manufacturing_date": item.manufacturing_date,
          "lot": item.lot,
          "admission_date": item.admission_date,
        }
      })

      const resp = await Promise.all(arrVouchers)
      response.status(200).json({ menssage: 'Listado de Voucher', data: resp })
    } catch (error) {
      console.log(error)
      if (error.name == 'InvalidJwtToken') {
        return response.status(400).json({ menssage: 'Usuario no Valido' })
      }
      response.status(404).json({ menssage: 'Hubo un error al realizar la operación', error });
    }
  }

  //opcion Edit Voucher
  async update({ auth, request, response, params: { id } }) {
    const data = request.only(["sap", "expiration_date", "entry_quantity", "actual_quantity", "manufacturing_date", "lot", "admission_date"])
    const user = await auth.getUser();
    const user_id = user.id
    try {
      if (user.rol_id == 1) {
        const voucher = await Voucher.find(id);
        voucher.sap = data.sap || voucher.sap;
        voucher.expiration_date = data.expiration_date || voucher.expiration_date;
        voucher.entry_quantity = data.entry_quantity || voucher.entry_quantity;
        voucher.actual_quantity = data.actual_quantity || voucher.actual_quantity;
        voucher.manufacturing_date = data.manufacturing_date || voucher.manufacturing_date;
        voucher.lot_id = data.lot_id || voucher.lot_id;
        voucher.admission_date = data.admission_date || voucher.admission_date
        await voucher.save();
        response.status(200).json({ menssage: 'Vale modificado con exito', data: voucher })
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
        menssage: "Hubo un error al modificar el Vale",
        id
      })
    }

  }


  async destroy({ params, request, response }) {
  }
}

module.exports = VoucherController
