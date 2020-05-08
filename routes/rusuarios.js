module.exports = function (app, swig, gestorBD) {

    /**
     *
     * Listar todos los usuarios de la aplicación
     *
     * Muestra en una lista todos los usuarios de la aplicación. Para cada usuario
     * se mostrará su nombre, apellidos y email.
     *
     * La lista incluye un sistema de páginación, mostrando 5 usuarios por páginna.
     *
     * Se incluye una opción en el menú principal, visible para usuarios en sesión,
     * que nos permite acceder a esta lista.
     *
     */

    app.get("/usuarios", function (req, res) {

        //Compruebo que hay un usuario en sesión

        if (req.session.usuario == null) {
            app.get('logger').error("No hay ningun usuario en sesion.");
            res.redirect("/identificarse");
            return;
        }

        //Criterios para la búsqueda según nombre, apellidos o email.

        //La cadena introducida en el campo de búsqueda se usará para buscar
        //coincidencias en el nombre, apellido o email.

        //El resultado es una lista paginada que muestra las coincidencias encontradas

        let criterio = {};
        if( req.query.busqueda != null ){
            criterio = {$or:[{"nombre"  :  {$regex : ".*"+req.query.busqueda+".*"}},{"apellidos" :  {$regex : ".*"+req.query.busqueda+".*"}},
                    {"email" :  {$regex : ".*"+req.query.busqueda+".*"}}]  };
        }
        let pg = parseInt(req.query.pg); // Es String !!!
        if (req.query.pg == null) { // Puede no venir el param
            pg = 1;
        }

       //Obtenemos la lista de usuarios paginada de la base de datos

        gestorBD.obtenerUsuarioPg(criterio, pg, function (usuarios, total) {

            if (usuarios == null) {
                app.get('logger').error("Error al listar.");
                res.redirect("/usuarios" + "?mensaje=Error al listar usuarios" + "&tipoMensaje=alert-danger ");
            } else {
                let ultimaPg = total / 5;
                if (total % 5 > 0) { // Sobran decimales
                    ultimaPg = ultimaPg + 1;
                }
                let paginas = []; // paginas mostrar
                for (let i = pg - 2; i <= pg + 2; i++) {
                    if (i > 0 && i <= ultimaPg) {
                        paginas.push(i);
                    }
                }
                let respuesta = swig.renderFile('views/busuarios.html',
                    {
                       usuarios: usuarios,
                        paginas: paginas,
                        actual: pg
                    });
                app.get("logger").info("Listando usuarios corréctamente por "
                    + req.session.usuario);
                res.send(respuesta);
            }
        });
    });


    /**
     *
     * Método que nos dirige a la página de registro
     *
     */

    app.get("/registrarse", function (req, res) {
        let respuesta = swig.renderFile('views/bregistro.html', {});
        res.send(respuesta);

    });

    /**
     *
     * Pagina home que nos redirige a la página de identificación del usuario.
     *
     */

    app.get("/", function (req, res) {

        var respuesta = swig.renderFile('views/index.html', {});
        res.send(respuesta);

    });


    /**
     *
     * Método que nos dirige a la página de identificación
     *
     */
    app.get("/identificarse", function (req, res) {

        var respuesta = swig.renderFile('views/bidentificacion.html', {});
        res.send(respuesta);

    });

    /**
     * Fin de sesión
     *
     * Método que nos permite cerrar la sesión y que redirige al usuario a la página
     * de inicio de sesión.
     *
     * Solo se mostrará esta opción si el usuario está autenticado
     *
     */

    app.get('/desconectarse', function (req, res) {
        req.session.usuario = null;
        res.redirect('/identificarse' + "?message=Desconectado correctamente");
    });

    /**
     * Registrar Usuario
     *
     * Los usuarios podrán registrarse en la aplicación aportando un email, nombre, apellidos
     * y una contraseña que deberá repetirse y coincidir.
     *
     */
    app.post('/usuario', function (req, res) {
        //Comprobamos si hay algún campo vacío
        comprobarCamposVacios(req,function (vacio) {
            if(vacio == true) {

                if (req.body.password == req.body.passwordConfirm) {
                    let seguro = app.get("crypto").createHmac('sha256', app.get('clave'))
                        .update(req.body.password).digest('hex');
                    let usuario = {
                        email: req.body.email,
                        nombre: req.body.nombre,
                        apellidos: req.body.apellidos,
                        password: seguro
                    };
                    let criterio = {email: req.body.email};
                    gestorBD.obtenerUsuario(criterio, function (usuarios) {

                        if (usuarios.length == 0 || usuarios == null) {
                            gestorBD.insertarUsuario(usuario, function (id) {
                                console.log(id);
                                if (id == null) {
                                    app.get('logger').error("Intento de registro inválido.");
                                    res.redirect("/registrarse" + "?mensaje=Error al registrar usuario" +
                                        "&tipoMensaje=alert-danger ");
                                } else {

                                    req.session.usuario = req.body.email;
                                    app.get('logger').info("Nuevo usuario con ID " + id + " registrado.");
                                    res.redirect("/usuarios?mensaje=Registro realizado correctamente");
                                }
                            });
                        } else {
                            app.get('logger').error("Error al registro mismo email ya registrado");
                            res.redirect("/registrarse?mensaje=Ya existe un usuario con este email." + "&tipoMensaje=alert-danger ");
                        }

                    })

                } else {
                    app.get('logger').error("Intento de registro inválido contraseñas no coinciden.");
                    res.redirect("/registrarse" + "?mensaje=Contraseñas no coinciden" +
                        "&tipoMensaje=alert-danger ");
                }

            }else{
                app.get('logger').error("Intento de registro inválido campos vacios.");
                res.redirect("/registrarse?mensaje=Campos vacios" +  "&tipoMensaje=alert-danger ");
        }

    });
    });
    /**
     *  Identificarse
     *
     * Suministrando su email y contraseña, un usuario podrá autenticarse ante el sistema
     * Sólo los usuarios que proporcionen correctamente su email y su contraseña podrán iniciar
     * sesión.
     *
     * En caso de que el inicio de sesión sea correcto, se dirige al usuario a la vista de
     * listar todos los usuarios de la aplicación.
     *
     *
     */

    app.post('/identificarse', function (req, res) {
            let seguro = app.get("crypto").createHmac('sha256', app.get('clave'))
                .update(req.body.password).digest('hex');
            let criterio = {
                email: req.body.email,
                password: seguro
            };

            gestorBD.obtenerUsuario(criterio, function (usuarios) {
                if (usuarios == null || usuarios.length == 0) {
                    req.session.usuario = null;
                    app.get('logger').error("Intento de identificación fallido");
                    res.redirect("/identificarse" +"?mensaje=Email o password incorrecto"+
                        "&tipoMensaje=alert-danger ");
                } else {
                    req.session.usuario =  usuarios[0].email;
                    app.get('logger').info("Usuario " + usuarios[0].email + " se ha identificado con éxito.");
                    res.redirect("/usuarios?mensaje=Usuario identificado");
                }
            });


    });

    function comprobarCamposVacios(req,funcionCallBack){

        if( req.body.email !="" && req.body.nombre!="" && req.body.apellidos !="" &&
            req.body.password !="" && req.body.passwordConfirm !=""){
            Informatica
            funcionCallBack(true);
        }
        else{
            
            funcionCallBack(false);
        }
    }

}