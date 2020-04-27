module.exports = function (app, swig, gestorBD) {

    //Lista de Usuarios

    app.get("/usuarios", function (req, res) {

        //Compruebo que hay un usuario en sesión

        if (req.session.usuario == null) {
            res.redirect("/identificarse");
            return;
        }

        //Criterios para la búsqueda según nombre, apellidos o email.

        let criterio = {};
        if( req.query.busqueda != null ){
            criterio = {$or:[{"nombre"  :  {$regex : ".*"+req.query.busqueda+".*"}},{"apellidos" :  {$regex : ".*"+req.query.busqueda+".*"}},
                    {"email" :  {$regex : ".*"+req.query.busqueda+".*"}}]  };
        }
        let pg = parseInt(req.query.pg); // Es String !!!
        if (req.query.pg == null) { // Puede no venir el param
            pg = 1;
        }

        //Obtengo la lista de Usuarios paginada

        gestorBD.obtenerUsuarioPg(criterio, pg, function (usuarios, total) {

            if (usuarios == null) {
                res.send("Error al listar ");
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
                res.send(respuesta);
            }
        });
    });


    //Registro

    app.get("/registrarse", function (req, res) {
        let respuesta = swig.renderFile('views/bregistro.html', {});
        res.send(respuesta);

    });

    //Pagina home
    //Identificar
    app.get("/", function (req, res) {

        var respuesta = swig.renderFile('views/index.html', {});
        res.send(respuesta);

    });


    //Identificar
    app.get("/identificarse", function (req, res) {

        var respuesta = swig.renderFile('views/bidentificacion.html', {});
        res.send(respuesta);

    });

    //Desconectar
    app.get('/desconectarse', function (req, res) {
        req.session.usuario = null;
        res.redirect('/identificarse' + "?message=Desconectado correctamente");
    });

    //Registrar Usuario
    app.post('/usuario', function (req, res) {
        if( req.body.email !="" && req.body.nombre!="" && req.body.apellidos !="" &&
            req.body.password !="" && req.body.passwordConfirm !=""){
            if(req.body.password == req.body.passwordConfirm){
                let seguro = app.get("crypto").createHmac('sha256', app.get('clave'))
                    .update(req.body.password).digest('hex');
                let usuario = {
                    email: req.body.email,
                    nombre : req.body.nombre,
                    apellidos : req.body.apellidos,
                    password: seguro
                };
                let criterio = {email: req.body.email};
                gestorBD.obtenerUsuario(criterio, function (usuarios) {
                    console.log(usuarios);
                    console.log(usuarios.length);
                    if (usuarios.length==0) {
                            gestorBD.insertarUsuario(usuario, function (id) {

                                if (id == null) {
                                    res.redirect("/registrarse" + "?mensaje=Error al registrar usuario"+
                                        "&tipoMensaje=alert-danger ");
                                }
                                else {
                                    req.session.email = req.body.email;
                                    res.redirect("/usuarios?mensaje=Registro realizado correctamente");
                                }
                            });
                        }else{
                            res.redirect("/registrarse?mensaje=Ya existe un usuario con este email." +  "&tipoMensaje=alert-danger ");
                        }

                })

            }
            else{
                res.redirect("/registrarse" + "?mensaje=Contraseñas no coinciden" +
                    "&tipoMensaje=alert-danger ");
            }

        }else{
            res.redirect("/registrarse?mensaje=Campos vacios" +  "&tipoMensaje=alert-danger ");
        }
    });

    //Identificarse

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
                    res.redirect("/identificarse" +"?mensaje=Email o password incorrecto"+
                        "&tipoMensaje=alert-danger ");
                } else {
                    req.session.usuario =  usuarios[0].email;
                    res.redirect("/usuarios?mensaje=Usuario identificado");
                }
            });


    });

}