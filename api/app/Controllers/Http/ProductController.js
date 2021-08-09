'use strict'
const Product = use("App/Models/Product");
const User = use("App/Models/User");
const OldProduct = use("App/Models/OldProduct");
const Type = use("App/Models/Type");
const Query = require("../../Utils/Query");
const Response = use('App/Models/Response');
const Database = use("Database");
const { validate } = use('Validator');

class ProductController {

  //consulto todos los productos lo devuelvo paginados
  async index({ request, response , auth}) {
    try {
      const user = await auth.getUser()
      var query = Product.query();
      var {
        page,
        perPage,
        field
      } = request.all();
      // Seteo valores por defectos
      field = field || []
      page = page || 1
      perPage = perPage || 10
      const product = await Product.query().with('type').with('materials').paginate(page, perPage);
      response.status(200).json({ menssage: 'Listado de Productos', data: product })
    } catch (error) {
      console.log(error)
      if(error.name == 'InvalidJwtToken'){
        return response.status(400).json({menssage: 'Usuario no Valido'})
       }
      response.status(400).json({ menssage: 'Hubo un error al realizar la operación' })
    }
  }


  //metodo para generar nuevos productos
  async store({ auth, request, response }) {
    try {
      let { name, type_id, tolerance, description, material_id, epp, quantity_per_package, version } = request.all()
      const user = await auth.getUser(); //verifico el token para usuario con permiso 
      const user_id = user.id

      //validacion de datos 
      const rules = {
        name: 'required',
        type_id: 'required',
        tolerance: 'required',
        quantity_per_package: 'required',
        version: 'required'
      }
      const validation = await validate({ name, type_id, tolerance, quantity_per_package, version }, rules)
      if (validation.fails()) {
        return response.status(400).json(new Response(false, 'algunos campos no pueden ser vacios',))
      }
      if(user.rol_id == 1){
      const newProduct = {
        name,
        description,
        type_id,
        tolerance,
        quantity_per_package,
        version,
        material_id,
        epp
      }
      const product = await Product.create(newProduct);
      return response.status(200).json(new Response(true, 'Producto cargado con exito!', product))
    }
    } catch (error) {
      console.log(error)
      if(error.name == 'InvalidJwtToken'){
        return response.status(400).json({menssage: 'Usuario no Valido'})
       }
      return response.status(400).json(new Response(false, 'Hubo un error al realizar la operación',))
    }

  }


  async show({ response, params: { id }, auth}) {
    try {
      const user = await auth.getUser();
      const product = await Product.findOrFail(id);
      return response.status(200).json({ menssage: 'Producto', data: product });
    }catch(error){
      console.log(error.name)
      if(error.name == 'InvalidJwtToken'){
        return response.status(400).json({menssage: 'Usuario no Valido'})
       }
      return response.status(400).json({
        menssage: 'Producto no encontrado',
        id
      })
    }
  }

  async update({ auth, request, params: { id }, response }) {
    const { description ,name, type_id, tolerance, quantity_per_package, version, justification } = request.all();
    const user = await auth.getUser();
    if (user.rol_id == 1) {
      try {
        var origProduct = await Product.findOrFail(id);
      } catch (error) {
        console.log(error)
        return response.status(404).json({
          message: "Hubo un error al realizar la operación o el producto no exite",
          id
        });
      }
      if (justification == '' || justification == null) {
        return response.status(404).json({
          message: "Justificacion Requerida",
        });
      }

      if(origProduct.version >= version) {
        return response.status(404).json({
          message: "Version invalida , la version es menor o igual a la anterior",
         
      });

      }
      var p = origProduct.toJSON()
      var product = new OldProduct()
      const insert = await Database.table('old_products').insert({product_id: p.id, description: p.description , name: p.name , tolerance: p.tolerance, quantity_per_package: p.quantity_per_package , version: p.version, justification:justification, user_id: user.id, material_id: p.material_id, type_id: p.type_id, epp: p.epp})
      origProduct.merge({ description: description, name: name , tolerance: tolerance , quantity_per_package: quantity_per_package , version: version ,type_id: type_id })
      await origProduct.save()
      return response.status(200).json({ menssage: 'Fraccionado modificado con exito' })
    } else {
      return response.status(404).json({ message: "Usuario no autorizado a realizar la operación" });
    }
  }

  /**
   * Delete a product with id.
   * DELETE products/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async destroy({ params, request, response }) {
  }
}

module.exports = ProductController
