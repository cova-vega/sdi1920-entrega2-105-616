
module.exports = function (app, swig, gestorBD) {

    //Lista de Invitaciones

    app.get("/invitaciones", function (req, res) {

        //Compruebo que hay un usuario en sesión

        if (req.session.usuario == null) {
            res.redirect("/identificarse");
            return;
        }

        let criterio = {"email": req.session.usuario};
        gestorBD.obtenerUsuario(criterio, function (usuarios) {

            criterio = {$and: [{"receptor": usuarios[0]},{"aceptado":false}]};

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
                            actual: pg,
                            usuarios:usuarios
                        });
                    res.send(respuesta);
                }
            });
        });
    });


    //Enviar invitación de amistad

    app.get('/invitacion/:id', function (req, res) {

        let id = gestorBD.mongo.ObjectID(req.params.id);

        let criterio = {"_id": id}
        gestorBD.obtenerUsuario(criterio, function (receptor1) {
            criterio = {"email": req.session.usuario}
            gestorBD.obtenerUsuario(criterio, function (emisor1) {

                //Compruebo que no esté enviándose la invitación de amistad a sí mismo

                if (receptor1[0].email != emisor1[0].email) {

                    //Compruebo que la invitación no haya sido ya enviada
                        let criterio2 = {$and: [{"emisor": emisor1[0]}, {"receptor": receptor1[0]}, {"aceptado": false}]};

                        gestorBD.obtenerInvitaciones(criterio2, function (invitaciones) {

                            if (invitaciones == null || invitaciones.length <= 0 ) {

                                let invitacion = {

                                    receptor: receptor1[0],
                                    emisor: emisor1[0],
                                    aceptado: false

                                };
                                gestorBD.enviarInvitacion(invitacion, function (id) {
                                    if (id == null) {
                                        res.redirect("/usuarios"+ "?mensaje=Error al enviar invitacion"+"&tipoMensaje=alert-danger");
                                    }
                                    else {
                                        //Invitacion enviada
                                        res.redirect("/usuarios?mensaje=Peticion enviada correctamente");
                                    }
                                });
                            }
                            else{
                                res.redirect("/usuarios"+ "?mensaje=Invitacion ya enviada o ya es amigo" + "&tipoMensaje=alert-danger");
                            }

                        })

                } else {

                    res.redirect("/usuarios"+ "?mensaje=No puede enviarse una petición a sí mismo"+"&tipoMensaje=alert-danger");


                }
            })
        })
    });

    //Aceptar invitaciones
    app.get("/invitacion/aceptada/:id", function (req, res) {
        let id = gestorBD.mongo.ObjectID(req.params.id);

        let criterio = {"_id": id}
        gestorBD.obtenerInvitaciones(criterio, function (invitacion) {

            //Compruebo que el id de la invitacion no sea el mismo que esta en sesion
            if (invitacion[0].email == req.session.usuario) {
                res.send("No hay ninguna invitacion")
            } else {
                //Compruebo que la invitación no haya sido ya aceptada
                let criterio2 = {"_id": gestorBD.mongo.ObjectID(req.params.id)};
                let peticion = {
                    aceptado: true
                }

                //Actualizo la peticion para que el estado cambie a true
                gestorBD.actualizarPeticion(criterio2, peticion, function (invitaciones) {
                    let amigo1 = { amigo_1: invitacion[0].receptor ,
                                   amigo_2: invitacion[0].emisor }
                    gestorBD.insertarAmigo(amigo1,function () {
                        let amigo2 = { amigo_1: invitacion[0].emisor ,
                                       amigo_2: invitacion[0].receptor }
                        gestorBD.insertarAmigo(amigo2,function () {

                            res.redirect("/invitaciones?mensaje=Peticion aceptada");
                        })
                    })

                })

            }

        })
    });

    //Lista de amigos

    app.get("/amigos", function (req, res) {

        //Compruebo que hay un usuario en sesión
        if (req.session.usuario == null) {
            res.redirect("/identificarse");
            return;
        }

            let pg = parseInt(req.query.pg); // Es String !!!
            if (req.query.pg == null) { // Puede no venir el param
                pg = 1;
            }

            let criterio2 = {"amigo_1.email": req.session.usuario}
            //Obtengo la lista de amigos paginada

            gestorBD.obtenerAmigosPg(criterio2, pg, function (amigos, total) {

                if (amigos == null) {
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
                    let respuesta = swig.renderFile('views/bamigos.html',
                        {
                           amigos: amigos
                        });
                    res.send(respuesta);
                }
            });
        });


}

