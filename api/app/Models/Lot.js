'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Lot extends Model {
    static get createdAtColumn() {
        return null;
    }
        
    static get updatedAtColumn() {
        return null;
    }

    materials() {
        return this.belongsTo('App/Models/Material', 'material_id')
    }
}

module.exports = Lot
