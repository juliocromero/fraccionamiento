'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Group extends Model {
    static get createdAtColumn() {
        return null;
    }
        
    static get updatedAtColumn() {
        return null;
    }
    static get dates() {
        return super.dates.concat(['create_date', 'update_date'])
    }
      
    static castDates(field, value) {
        if (field === 'create_date' || field === 'update_date') {
          return value.format('YYYY-MM-DD HH:mm:ss')
        }
    }
    group_materials() {
        return this.hasMany('App/Models/GroupMaterial', )
    }
    semi_elaborate() {
        return this.belongsTo('App/Models/SemiElaborate' ,'semi_elaborate_id', 'id' )
    }
}

module.exports = Group
