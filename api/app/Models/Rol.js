'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Rol extends Model {
    static get createdAtColumn() {
        return null;
      }
      
      static get updatedAtColumn() {
        return null;
      }
      Users() {
        return this.hasMany('App/Models/User', 'user_id')
      }
}

module.exports = Rol
