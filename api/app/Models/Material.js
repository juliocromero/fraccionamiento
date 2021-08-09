'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Material extends Model {
    static get createdAtColumn() {
        return null;
    }
        
    static get updatedAtColumn() {
        return null;
    }

    type() {
        return this.belongsTo('App/Models/Type', 'type_id')
    }
    lots() {
        return this.belongsTo('App/Models/Lot')
    }
}

module.exports = Material
