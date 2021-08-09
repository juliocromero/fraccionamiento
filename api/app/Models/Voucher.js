'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Voucher extends Model {
    static get createdAtColumn() {
        return null;
    }
        
    static get updatedAtColumn() {
        return null;
    }
    static get dates() {
        return super.dates.concat(['expiration_date', 'admission_date', 'manufacturing_date'])
    }
      
    static castDates(field, value) {
        if (field === 'expiration_date' || field === 'admission_date' || field === 'manufacturing_date') {
          return value.format('YYYY-MM-DD HH:mm:ss')
        }
    }
    fractions() {
        return this.hasMany('App/Models/Fraction', 'voucher_id')
    }
    users() {
        return this.belongsTo('App/Models/User')
    }
    materials() {
        return this.belongsTo('App/Models/Material')
    }
    lots() {
        return this.belongsTo('App/Models/Lot')
    }
}

module.exports = Voucher
