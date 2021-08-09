'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class SemiElaborateMaterial extends Model {
    static get createdAtColumn() {
        return null;
    }
        
    static get updatedAtColumn() {
        return null;
    }
    semi() {
        return this.belongsTo('App/Models/SemiElaborate')
    }
}

module.exports = SemiElaborateMaterial
