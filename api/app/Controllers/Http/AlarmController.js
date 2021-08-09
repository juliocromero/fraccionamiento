'use strict'
const Alarm = use("App/Models/Alarm");
const User = use("App/Models/User");
const Query = require("../../Utils/Query");
const Response = use('App/Models/Response');
class AlarmController {

   // 1 = Alarma(Con ACK), 2 log(Sin ACK), 3 Aviso(Sin ACK), 4 Aviso(Con ACK)
   
  //muestro todas las alarmas generadas con su usario y reconocidas
  async index ({ request, response, auth }) {
    try{
      const users = await auth.getUser()
      var query = Alarm.query()
      var{
        sortBy,
        descending,
        page,
        perPage,
        type,
        message,
        user,
        ack,
        create_date
      } = request.all()
 
        // Seteo valores por defectos
        sortBy = sortBy || 'create_date'
        descending = descending || 'DESC'
        page = page || 1
        perPage = perPage || 10
        type = type  || []
        message = message || []
        user = user || []
        ack = ack || []
        create_date = create_date || []

        if (message.length > 0) {
          query.whereIn('message', message)
        }
        if (user.length > 0) {
          query.whereIn('user', user)
        }
        if (ack.length > 0) {
          query.whereIn('ack', ack)
        }
        if (create_date.length > 0) {
          query.whereIn('create_date', create_date)
        }
        if (type.length > 0) {
          query.whereIn('type', type)
        }

        let alarm = await query.with('users').orderBy(sortBy, descending).paginate(page, perPage);
        alarm = alarm.toJSON()
         //creo un array para insertar nombre de usuario
         let arrAlarms = alarm.data.map(item => {
          return {
            "id": item.id,
            "type": item.type,
            "create_date": item.create_date,
            "message":item.message,
            "ack_date": item.ack_date,
            "user_id": item.users.username
          }
        })
        const resp = await Promise.all(arrAlarms)
        alarm.data = resp
        response.status(200).json({ menssage: 'Listado de Alarmas', data:alarm  }) 
    }catch(error){
      console.log(error)
      if (error.name == 'InvalidJwtToken') {
        return response.status(400).json({ menssage: 'Usuario no Valido' })
      }
      response.status(404).json({ menssage: 'Hubo un error al realizar la operación', error });
    }
  }

  //metodo post para grupos de alarmas
  async groups ({ request, response, auth }) {
    try{
      const user = await auth.getUser()
      var query = Alarm.query()
      var {
        type,
        message,
        user_id,
        ack_date,
        create_date,
        field
      } = request.all()
      //condiciones de la query
      field = field || []
      type = type || []
      message = message || []
      user_id = user_id || []
      ack_date = ack_date || []
      create_date = create_date || []

      if (type.length > 0) {
        query.whereIn('type', type)
      }
      if (message.length > 0) {
        query.whereIn('message', message)
      }
      if (user_id.length > 0) {
        query.whereIn('user_id', user_id)
      }
      if (ack_date.length > 0) {
        query.whereIn('ack_date', ack_date)
      }
      if (create_date.length > 0) {
        query.whereIn('create_date', create_date)
      }

      let alarm = await query.with('users').fetch();
      alarm = alarm.toJSON()
      //creo un array para insertar nombre de usuario
      let arrAlarms = alarm.map(item => {
       return {
         "id": item.id,
         "type": item.type,
         "create_date": item.create_date,
         "message":item.message,
         "ack_date": item.ack_date,
         "user_id": item.users.username
       }
     })
     const resp = await Promise.all(arrAlarms)
     alarm = resp
     response.status(200).json({ menssage: 'Listado de Alarmas', data:alarm  }) 

    }catch(error){
      console.log(error)
      if (error.name == 'InvalidJwtToken') {
        return response.status(400).json({ menssage: 'Usuario no Valido' })
      }
      response.status(404).json({ menssage: 'Hubo un error al realizar la operación', error });
    }
  }

  async update ({ auth , params: {id}, request, response }) {
    const {alarm} = request.all()
    const user = await auth.getUser();
    if(user.rol_id == 1){
      try{
        var origAlarm = await Alarm.findOrFail(id);
      }catch(error){
        console.log(error)
        if (error.name == 'InvalidJwtToken') {
          return response.status(400).json({ menssage: 'Usuario no Valido' })
        }
        return response.status(404).json({
          menssage: 'Alarma no encontrada',
          id
        })
      }
    }
    if( alarm.ack_date == true){
      alarm.ack_date = moment().format('YYYY-MM-DD HH:mm:ss')

      origAlarm.merge(alarm)
      //guardo las modificaciones realizada 
      await origAlarm.save()
    }
    
  }

  async destroy ({ params, request, response }) {
  }
}

module.exports = AlarmController
