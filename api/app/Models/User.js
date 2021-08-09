'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

/** @type {import('@adonisjs/framework/src/Hash')} */
const Hash = use('Hash')

class User extends Model {
  static get createdAtColumn() {
    return null;
}
    
static get updatedAtColumn() {
    return null;
}
  static boot () {
    super.boot()

    /**
     * A hook to hash the user password before saving
     * it to the database.
     */
    this.addHook('beforeSave', async (userInstance) => {
      if (userInstance.dirty.password) {
        userInstance.password = await Hash.make(userInstance.password)
      }
    })
  }

  static get dates() {
    return super.dates.concat(['F_Inicio', 'F_Fin'])
  }
  
  static castDates(field, value) {
    if (field === 'F_Inicio' || field === 'F_Fin') {
      return value.format('YYYY-MM-DD HH:mm:ss')
    }
  }
  alarms() {
    return this.hasMany('App/Models/Alarm', 'user_id')
  }
  fractions() {
    return this.hasMany('App/Models/Fraction', 'user_id')
  }
  vouchers() {
    return this.hasMany('App/Models/Voucher', 'user_id')
  }
  rejected_fractions() {
    return this.hasMany('App/Models/Fraction', 'user_id')
  }
  old_products() {
    return this.hasMany('App/Models/OldProduct', 'user_id')
  }
  tokens () {
    return this.hasMany('App/Models/Token')
  }
}

module.exports = User
