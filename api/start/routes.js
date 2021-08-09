'use strict'

/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| Http routes are entry points to your web application. You can create
| routes for different URLs and bind Controller actions to them.
|
| A complete guide on routing is available here.
| http://adonisjs.com/docs/4.1/routing
|
*/

/** @type {typeof import('@adonisjs/framework/src/Route/Manager')} */
const Route = use('Route')

Route.get('/api/v1', () => {
  return { greeting: 'Welcome API Fraccionamiento - Systelec S.A' }
})


//Users 
Route.post("api/v1/register", "UserController.store");
Route.post("api/v1/login", "UserController.login");
Route.post("api/v1/logout", "UserController.logout");
Route.put("api/v1/change_pass", "UserController.update");
Route.put("api/v1/restore_pass", "UserController.restore");
Route.put("api/v1/user/:docket", "UserController.docket");
Route.get("api/v1/user", "UserController.index");
Route.delete("api/v1/user/:id", "UserController.destroy");
Route.put("api/v1/change_status", "UserController.status");


//Voucher

Route.get("api/v1/voucher", "VoucherController.index");
Route.get("api/v1/voucher/:id", "VoucherController.show");
Route.post("api/v1/voucher", "VoucherController.store");
Route.post("api/v1/voucher/groups", "VoucherController.groups");
Route.put("api/v1/voucher/:id", "VoucherController.update");


//fraccionamiento 
Route.get("api/v1/fraction", "FractionController.index");
Route.get("api/v1/fractions", "FractionController.filtroParamsMAterilas");
Route.get("api/v1/liberarFraction/:id", "FractionController.show");
Route.get("api/v1/fractionValidate/:id", "FractionController.show1");

Route.get("api/v1/group_fractions", "FractionController.ListGroupMaterials");
Route.post("api/v1/fraction", "FractionController.store");
Route.post("api/v1/fraction/groups", "FractionController.groups");
Route.put("api/v1/fraction/:id", "FractionController.update");
Route.delete("api/v1/fraction/:id", "FractionController.destroy");

//rejeted fractiones
Route.get("api/v1/rejected_fraction", "RejectedFractionController.index");

//Historicos Productos
Route.get("api/v1/oldMaterials", "OldProductController.index");

//material
Route.get("api/v1/materials", "MaterialController.index");
Route.get("api/v1/ListImg", "MaterialController.ListImg");
Route.get("api/v1/Listmaterials", "MaterialController.ListMaterials");
Route.get("api/v1/materials/:id", "MaterialController.show");
Route.post("api/v1/materials", "MaterialController.store");
Route.put("api/v1/materials/:id", "MaterialController.update");
Route.delete("api/v1/materials/:id", "MaterialController.destroy");

//Grupos
Route.get("api/v1/group", "GroupController.index");
Route.put("api/v1/reIngreso/:id", "GroupController.ReingresoGroup");
Route.get("api/v1/group/:id", "GroupController.show");
Route.get("api/v1/groupDespachado/:id", "GroupController.validateDespachado");
Route.get("api/v1/list", "GroupController.list");
Route.post("api/v1/group", "GroupController.store");
Route.post("api/v1/planes", "GroupController.planes");
Route.post("api/v1/group/:id", "GroupController.store");
Route.post("api/v1/group/groups", "GroupController.groups");
Route.put("api/v1/group/:id", "GroupController.update");
Route.delete("api/v1/group/:id", "GroupController.destroy");


//Alarmas
Route.get("api/v1/alarm", "AlarmController.index");
Route.post("api/v1/alarm/groups", "AlarmController.groups");
Route.put("api/v1/alarm/:id", "AlarmController.update");


//Grupos de estados
Route.get("api/v1/status_group", "StatusGroupController.index");
Route.post("api/v1/status_group", "StatusGroupController.store");
Route.put("api/v1/status_group/:id", "StatusGroupController.update");
Route.delete("api/v1/status_group/:id", "StatusGroupController.destroy");

//Planta 
Route.get("api/v1/plant", "PlantController.index");
Route.post("api/v1/plant", "PlantController.store");
Route.put("api/v1/plant/:id", "PlantController.update");
Route.delete("api/v1/plant/:id", "PlantController.destroy");

//Rol
Route.get("api/v1/rol", "RolController.index");
Route.post("api/v1/rol", "RolController.store");
Route.put("api/v1/rol/:id", "RolController.update");
Route.delete("api/v1/rol/:id", "RolController.destroy");

//Tipos
Route.get("api/v1/type", "TypeController.index");
Route.post("api/v1/type", "TypeController.store");
Route.put("api/v1/type/:id", "TypeController.update");
Route.delete("api/v1/type/:id", "TypeController.destroy");


//semi_elaborate
Route.get("api/v1/semiElaborate", "SemiElaborateController.index");
Route.get("api/v1/semiElaborate/:id", "SemiElaborateController.show");
Route.post("api/v1/semiElaborate", "SemiElaborateController.store");
Route.put("api/v1/semiElaborate/:id", "SemiElaborateController.update");
Route.delete("api/v1/semiElaborate/:id", "SemiElaborateController.destroy");

//semi_elaborate_materials
Route.get("api/v1/semiMaterials", "SemiElaborateMaterialController.index");
Route.get("api/v1/semiMaterials/:id", "SemiElaborateMaterialController.show");
Route.get("api/v1/semiMaterialsGroup/:id", "SemiElaborateMaterialController.show1");
Route.post("api/v1/semiMaterials", "SemiElaborateMaterialController.store");
Route.put("api/v1/semiMaterials/:id", "SemiElaborateMaterialController.update");

//lots
Route.post("api/v1/lots", "LotController.store");
Route.get("api/v1/lots", "LotController.show");


//Grupos Materials
Route.get("api/v1/groupMaterials" , "GroupMaterialController.index");
Route.get("api/v1/groupMaterials" , "GroupMaterialController.show"); // ruta busco por group_id
Route.post("api/v1/groupMaterials" ,"GroupMaterialController.store");
Route.delete("api/v1/groupMaterials/:id" ,"GroupMaterialController.destroy");

//prueba
Route.get("api/v1/prueba", "PruebaController.index");