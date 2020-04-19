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


}

