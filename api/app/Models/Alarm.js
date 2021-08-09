'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Alarm extends Model {
    static get createdAtColumn() {
        return null;
    }
        
    static get updatedAtColumn() {
        return null;
    }
    static get dates() {
        return super.dates.concat(['create_date'])
    }
      
    static castDates(field, value) {
        if (field === 'create_date') {
          return value.format('YYYY-MM-DD HH:mm:ss')
        }
    }
    users() {
        return this.belongsTo('App/Models/User', 'user_id')
    }
}


module.exports = Alarm
