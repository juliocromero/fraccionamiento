'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Product extends Model {
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
    
    old_products() {
        return this.hasMany('App/Models/OldProduct')
    }
    group_materials() {
        return this.hasMany('App/Models/GroupMaterial', 'product_id')
    }
    semi_elaborate_materials() {
        return this.hasMany('App/Models/SemiElaborateMaterial', 'product_id')
    }
    vouchers() {
        return this.hasMany('App/Models/Voucher', 'product_id')
    }
    type() {
        return this.belongsTo('App/Models/Type', 'type_id')
    }
    materials() {
        return this.belongsTo('App/Models/Material', 'material_id')
    }
}

module.exports = Product
