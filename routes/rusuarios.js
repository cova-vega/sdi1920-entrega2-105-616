
module.exports = function (app, swig, gestorBD) {


    //Lista de Invitaciones

    app.get("/invitaciones", function (req, res) {

        //Compruebo que hay un usuario en sesión

        if (req.session.usuario == null) {
            res.redirect("/identificarse");
            return;
        }

        let criterio = {"email":req.session.usuario};
        gestorBD.obtenerUsuario(criterio,function (usuarios) {

         criterio ={"receptor":usuarios[0]};

        let pg = parseInt(req.query.pg); // Es String !!!
        if (req.query.pg == null) { // Puede no venir el param
            pg = 1;
        }

        //Obtengo la lista de Invitaciones paginada

        gestorBD.obtenerInvitacionesPg(criterio, pg, function (invitaciones, total) {

            if (invitaciones == null) {
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
                let respuesta = swig.renderFile('views/binvitaciones.html',
                    {
                        invitaciones: invitaciones,
                        paginas: paginas,
                        actual: pg
                    });
                res.send(respuesta);
            }
        });
        });
    });


    //Enviar invitación de amistad

    app.get('/invitacion/:id', function (req, res) {


        let id = gestorBD.mongo.ObjectID(req.params.id);

        let criterio ={"_id" : id}
        gestorBD.obtenerUsuario(criterio,function (receptor1) {
            criterio ={"email" : req.session.usuario}
            gestorBD.obtenerUsuario(criterio,function (emisor1) {

            //Compruebo que no esté enviándose la invitación de amistad a sí mismo

                if(receptor1[0].email != emisor1[0].email){

                //Compruebo que la invitación no haya sido ya enviada

                 let criterio2= {$and:[{"emisor":emisor1[0]},{"receptor":receptor1[0]}]};

                gestorBD.obtenerInvitaciones(criterio2,function (invitaciones) {

                if(invitaciones == null || invitaciones.length <=0){
                    let invitacion = {

                        receptor: receptor1[0],
                        emisor : emisor1[0]

                    };
                    gestorBD.enviarInvitacion(invitacion, function (id) {
                        if (id == null) {
                            res.send("Error al enviar invitacion ");
                        } else {
                            res.send('Invitación enviada ' + id);
                        }
                    });
                }else{

                    res.send("Invitación de amistad ya enviada")
                }

            })}else{
                    res.send("No puede enviarse una petición a sí mismo");
                }
        })
        })
    });


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
        var respuesta = swig.renderFile('views/bregistro.html', {});
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
        res.send("Usuario desconectado");
    });

    //Insertar Usuario
    app.post('/usuario', function (req, res) {
        let seguro = app.get("crypto").createHmac('sha256', app.get('clave'))
            .update(req.body.password).digest('hex');
        let usuario = {
            email: req.body.email,
            nombre : req.body.nombre,
            apellidos : req.body.apellidos,
            password: seguro
        };

        gestorBD.insertarUsuario(usuario, function (id) {
            if (id == null) {
                res.send("Error al insertar ");
            } else {
                res.send('Usuario Insertado ' + id);
            }
        });

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
                res.send("Error al loguarse ");
            } else {
                req.session.usuario =  usuarios[0].email;
                res.redirect("/usuarios");
            }
        });

    });

}