
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
        gestorBD.obtenerInvitaciones(criterio, function (idinvitacion) {

            //Compruebo que el id de la invitacion no sea el mismo que esta en sesion
            if (idinvitacion[0].email == req.session.usuario) {
                res.send("No hay ninguna invitacion")
            } else {
                //Compruebo que la invitación no haya sido ya enviada
                let criterio2 = {"_id": gestorBD.mongo.ObjectID(req.params.id)};
                let peticion = {
                    aceptado: true
                }
                //Actualizo la peticion para que el estado cambie a true
                gestorBD.actualizarPeticion(criterio2, peticion, function (invitaciones) {
                    res.redirect("/invitaciones?mensaje=Peticion ya aceptada");
                })
            }

        })
    });

    //Lista de amigos

    app.get("/amigos", function (req, res) {

        //Compruebo que hay un usuario en sesión
        let listaAmigos=[];
        if (req.session.usuario == null) {
            res.redirect("/identificarse");
            return;
        }

        let criterio = {"email": req.session.usuario};
        gestorBD.obtenerUsuario(criterio, function (usuarios) {

            criterio ={$and: [{$or: [{"emisor": usuarios[0]},{"receptor": usuarios[0]}]},{"aceptado":true}]};
            gestorBD.obtenerInvitaciones(criterio,function (invitaciones) {
                let amigo;
                //Busco en cada invitacion el emisor o receptor y lo comparo con usuario en sesion para sacar el amigp
                invitaciones.forEach(invitacion=>{
                        if(invitacion.emisor.email==req.session.usuario){
                            amigo=invitacion.receptor;
                            listaAmigos.push(amigo);
                        }else if(invitacion.receptor.email==req.session.usuario){
                            amigo=invitacion.emisor;
                            listaAmigos.push(amigo);
                        }
                });
                console.log(listaAmigos);


            })

            let pg = parseInt(req.query.pg); // Es String !!!
            if (req.query.pg == null) { // Puede no venir el param
                pg = 1;
            }

            //Obtengo la lista de amigos paginada

            gestorBD.obtenerAmigosPg(criterio, pg, function (invitaciones, total) {

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
                    let respuesta = swig.renderFile('views/bamigos.html',
                        {
                            invitaciones: invitaciones,
                            paginas: paginas,
                            actual: pg,
                            amigos:listaAmigos,
                            usuarios:usuarios
                        });
                    res.send(respuesta);
                }
            });
        });
    });

}

