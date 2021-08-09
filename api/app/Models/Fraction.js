'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Fraction extends Model {
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
        if (field === 'create_date' ) {
          return value.format('YYYY-MM-DD HH:mm:ss')
        }
    }
    rejected_fractions() {
        return this.hasMany('App/Models/RejectedFraction', 'fraction_id')
    }
    users() {
        return this.belongsTo('App/Models/User')
    }
    lots() {
        return this.belongsTo('App/Models/Lot')
    }
}

module.exports = Fraction
