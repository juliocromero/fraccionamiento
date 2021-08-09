// @ts-nocheck
'use strict'
const User = use("App/Models/User");
const Query = require("../../Utils/Query");
const Response = use('App/Models/Response');
const Hash = use('Hash');
const { validate } = use('Validator');
const Database = use("Database");
class UserController {

    //devuelvo todo los usuario 
    async index({ request, response, auth }) {
        try {

            const user = await auth.getUser()
            var query = User.query();
            var {
                page,
                perPage,
            } = request.all()
            // Seteo valores por defectos
            page = page || 1
            perPage = perPage || 10


            const users = await User.query().paginate(page, perPage);
            response.status(200).json({ menssage: 'Listado de Usuarios', data: users })
        } catch (error) {
            console.log(error)
            if (error.name == 'InvalidJwtToken') {
                return response.status(400).json({ menssage: 'Usuario no Valido' })
            }
            response.status(404).json({ menssage: 'Hubo un error al realizar la operación', error });
        }
    }


    //servicio para crear un usuario 
    async store({ request, response }) {
        try {
            let { username, lastname, docket, rol_id, password, confirm_password, email } = request.all();

            const rules = {
                username: 'required',
                lastname: 'required',
                docket: 'required',
                rol_id: 'required',
                password: 'required',
            }
            let validation = await validate({ username, lastname, docket, rol_id, password }, rules)
            if (validation.fails()) {
                response.status(403).json({ message: "Datos Insuficiente" })
                return;
            }
            if (password != confirm_password) {
                response.status(403).json({ message: "las contraseñas no coinciden" })
                return;
            } else {
                const user = await User.create({
                    username,
                    lastname,
                    password: confirm_password,
                    docket,
                    rol_id,
                    enable: true,
                    email,

                })
                response.status(200).json({ message: 'Usuario creado con exito!', data: user })
                return;
            }
        } catch (error) {
            console.log(error.message)
            if (error.message.includes('duplicate key value violates unique constraint')) {
                return response.status(403).json({ message: "El N° de legajo se encuentra registrado" });
            } else {
                return response.status(404).json(error)
            }
        }



    }
    // devuelvo el token y para poder logearse el usuario
    async login({ request, response, auth, session }) {
        try {
            const { docket, password } = request.all();
            // session.put('db' , 'fraccionamiento1')
           
            const validationUser = await User.findBy('docket', docket)
            console.log(validationUser.rol_id)
            const token = await auth.attempt(docket, password)

            const resCustom = new Response(true, 'Logueado con exito', token.token )

            response.status(200).json({resCustom , rol: validationUser.rol_id , username: validationUser.username});
        } catch (error) {
            console.log(error.message)
            var resCustom = ''
            if (error.message.includes('Cannot verify user password')) {
                resCustom = new Response(false, 'Contraseña incorrecta');
            } else if (error.message.includes('Cannot find user')) {
                resCustom = new Response(false, 'Usuario no encontrado');
            } else {
                resCustom = new Response(false, 'Hubo un error al procesar la solicitud');
            }
            return response.status(401).json(resCustom);
        }
    }

    //deslogueo de usuario
    async logout({ request, response, auth }) {
        try {
            const { docket } = request.all();
            const user = await User.find(docket)
            const data = await auth.authenticator('jwt').revokeTokensForUser(user)

            const resCustom = new Response(true, 'Deslogueo con exito')
            response.status(200).json(resCustom)
        } catch (error) {
            console.log(error)
            const resCustom = new Response(false, 'Hubo un problema al desloguearse');
            response.status(401).json(resCustom);
        }
    }

    //actualizo la contraseña del usuario logueado en el momento
    async update({ request, response, auth }) {
        try {
            const user = await auth.getUser();
            const { actual_password, new_password, confirm_password } = request.all()

            const validationpassw = await Hash.verify(actual_password, user.password)
            if (validationpassw == false) {
                return response.status(400).json({ menssage: 'Constraseña actual Incorrecta' })
            }
            if (new_password !== confirm_password) {
                return response.status(400).json({ menssage: 'Las contraseña no coinciden' })
            }
            user.password = new_password
            await user.save()
            return response.status(200).json({ menssage: 'Cambio de contraseña con exito!' })
        } catch (error) {
            console.log(error)
            return response.status(400).json({ menssage: 'Hubo un error al intentar cambiar la contraseña!' })
        }
    }

    //Restablezco la contraseña solo pasandole en docket del usuario
    async restore({ auth, request, response }) {
        try {
            const user = await auth.getUser();
            const { docket, new_password } = request.all();
            var userDocket = await User.findByOrFail('docket', docket)
            // console.log(userDocket)
            if (user.rol_id == 1) {
                // userDocket = userDocket.toJSON()
                console.log(userDocket)
                userDocket.password = new_password
                console.log(userDocket.password)
                userDocket.save()
                return response.status(200).json({ menssage: 'Constraseña reestablecida con exito!' })
            } else {
                return response.status(400).json({ menssage: 'Usuario sin permisos suficiente para realizar la operación' })
            }
        } catch (error) {
            console.log(error)
            if (error.name == 'InvalidJwtToken') {
                return response.status(400).json({ menssage: 'Usuario no Valido' })
            }
            if (error.name == 'ModelNotFoundException') {
                return response.status(400).json({ menssage: 'El Mail ingresado no existe!' })
            }
            return response.status(400).json({ menssage: 'Hubo un error al intentar reestablecer la contraseña' })
        }
    }


    //cambio el estado general del usuario lo deshabilito o lo habilito
    async status({ auth, request, response }) {
        try {
            const user = await auth.getUser();
            //console.log(user)
            const { docket, enable } = request.all()
            var validationDocket = await User.findByOrFail('docket', docket)
            if (user.rol_id == 1) {
                validationDocket.enable = enable
                validationDocket.save()
                return response.status(200).json({ menssage: 'Cambio de estado realizado con exito!' })
            } else {
                return response.status(400).json({ menssage: 'Usuario sin permisos suficientes para realizar la operación' , error })
            }

        } catch (error) {
            console.log(error)
            if (error.name == 'ModelNotFoundException') {
                return response.status(400).json({ menssage: 'El usuario no existe!' })
            }
            return response.status(400).json({ menssage: 'Hubo un error al intentar realizar la operación' })
        }
    }
    //modifico los usuario por su legajo
    async docket({ auth, request, response, params: { docket } }) {
        try {
            const user = await auth.getUser();
            const data = request.only(["username", "lastname", "password", "rol_id", "email", "enable"]);
            // console.log(data)
            if (user.rol_id == 1) {
                const px = await User.findByOrFail( 'docket',docket);
                //console.log(px)
                px.username = data.username || px.username;
                px.lastname = data.lastname || px.lastname;
                px.password = data.password || px.password;
                px.rol_id = data.rol_id || px.rol_id;
                px.email = data.email || px.email;
                px.enable = data.enable || px.enable;
                await px.save();
                response.status(200).json({ menssage: 'Usuario modificado con exito', data: px })
            } else {
                response.status(400).json({ menssage: "Usuario sin permisos para realizar la operacion" })
            }
        } catch (error) {
            console.log(error)
            if (error.name == 'InvalidJwtToken') {
                return response.status(400).json({ menssage: 'Usuario no Valido' })
            }
            response.status(400).json({
                menssage: "Hubo un error al modificar el Usuario",
                docket
            })
        }

    }

    async destroy({ auth, params, response}){

        const id = params.id

        const user = await auth.getUser();
        if (user.rol_id == 1) {
            try {
                const user = await User.findOrFail(id);
                await user.delete();
                response.status(200).json({menssage: 'usuario borrado con exito!'});
                return;
            } catch (error) {
                response.status(404).json({
                    message: "Usuario a eliminar no encontrado",
                    id
                });
                return;
            }
        } else {
            response.status(403).json({ message: "Usuario sin permisos suficientes" });
            return;
        }
    }
     

}

module.exports = UserController
