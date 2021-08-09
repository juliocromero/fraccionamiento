'use strict';

/***************************************************************************************
 * Utilidad para manejo de alarmas.
 * Servicios de generacion de alarmas de distintos tipos con mensajes personalizados
 * Servicio de reconocimiento de alarma por ID
 * Servicio para WebSocket
 * 
 * 
 * 
 * 
 ****************************************************************************************/
 // 1 = Alarma(Con ACK), 2 log(Sin ACK), 3 Aviso(Sin ACK), 4 Aviso(Con ACK)
 
const Alarm = use("App/Models/Alarm");
var moment = require('moment');

const Alarma = {
  //Creacion de Log con mensaje personalizado
  async newLog(msg, user_id) {
    return new Promise(async function (resolve, reject) {
      try{
        const log = {
          type: 2, 
          created: moment().format('YYYY-MM-DD HH:mm:ss'), 
          message: msg, 
          ack_date: moment().format('YYYY-MM-DD HH:mm:ss'), 
          user_id: user_id
        };
        const newLog = await Alarm.create(log);
        resolve("Log creado: ",newLog)
      }catch(error){
        reject("Log no pudo ser creado")
      }
    });
  },

  //Creacion de Alarma con mensaje personalizado
  async newAlarm(msg, user_id) {
    return new Promise(async function (resolve, reject) {
      try{
        const alarm = {
          type: 1, 
          created: moment().format('YYYY-MM-DD HH:mm:ss'), 
          message: msg, 
          user_id: user_id
        };
        const newAlarm = await Alarm.create(alarm);
        resolve("Alarma creada: ",newAlarm)
      }catch(error){
        reject("Alarma no pudo ser creada")
      }
    });
  },

  //Creacion de Aviso con mensaje personalizado
  async newAviso(msg, user_id) {
    return new Promise(async function (resolve, reject) {
      try{
        const aviso = {
          type: 3, 
          created: moment().format('YYYY-MM-DD HH:mm:ss'), 
          message: msg, 
          ack_date: moment().format('YYYY-MM-DD HH:mm:ss'), 
          user_id: user_id
        };
        const newAviso = await Alarm.create(aviso);
        resolve("Aviso creado: ",newAviso)
      }catch(error){
        reject("Aviso no pudo ser creado")
      }
    });
  },

  //Creacion de Aviso con reconocimiento con mensaje personalizado
  async newAvisoRec(msg, user_id) {
    return new Promise(async function (resolve, reject) {
      try{
        const aviso = {
          type: 3, 
          created: moment().format('YYYY-MM-DD HH:mm:ss'), 
          message: msg, 
          user_id: user_id
        };
        const newAviso = await Alarm.create(aviso);
        resolve("Aviso creado: ",newAviso)
      }catch(error){
        reject("Aviso no pudo ser creado")
      }
    });
  },

  //Reconocimiento de alarma
  async RecAlarm(id) {
    return new Promise(async function (resolve, reject) {
      try{
        var alarm = await Alarm.findOrFail(id);
        alarm.ack_date = moment().format('YYYY-MM-DD HH:mm:ss');
        await alarma.save();
        resolve("Reconocimiento exitoso: ",alarm)
      }catch(error){
        reject("No se pudo reconocer")
      }
    });
  },

  // Traigo todas las para el WebSocket
  async getAlarms(){
    return new Promise(async function (resolve, reject) {
      
      try{ 
        var alarms = await Alarm.query().whereNull('ack_date').fetch();
        alarms = alarms.toJSON();
        if(alarms.length > 0){
          var arrAlarms = alarms.map((alarm) => alarm.ack_date == null ? alarm.ack = true : alarm.ack = false);
          await Promise.all(arrAlarms);
          resolve(alarms)
        }else{
          resolve([])
        }
      }catch(error){
        reject([])
      }
    });
  },
}

module.exports = Alarma;
