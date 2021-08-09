'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class OldMaterial extends Model {
    static get createdAtColumn() {
        return null;
    }
        
    static get updatedAtColumn() {
        return null;
    }
    static get dates() {
        return super.dates.concat(['F_Inicio', 'F_Fin'])
    }
      
    static castDates(field, value) {
        if (field === 'F_Inicio' || field === 'F_Fin') {
          return value.format('YYYY-MM-DD HH:mm:ss')
        }
    }
}

module.exports = OldMaterial
