module.exports = function (app, gestorBD) {

    //Crear nuevo mensaje
    app.post('/api/mensajes', function (req, res) {

        let mensaje = {
            emisor: req.body.email,
            destino: req.body.destino,
            texto: req.body.texto,
            leido: false
        };
        //Comprobamos si el amigo_1 es el emisor o el amigo_2 el destino o viceversa
        let criterio = {
            $or: [{$and: [{"amigo_1.email": mensaje.emisor}, {"amigo_2.email": mensaje.destino}]},
                {$and: [{"amigo_1.email": mensaje.destino}, {"amigo_2.email":  mensaje.emisor}]}]
        };


        gestorBD.obtenerAmigos(criterio, function (amigos) {
            if (amigos == null || amigos.length == 0) {
                res.status(200);
                res.json({error: " Mensaje no insertado, los usuarios no son amigos. "})
            } else {
                gestorBD.insertarMensaje(mensaje, function (id) {
                    if (id == null) {
                        res.status(500);
                        res.json({error: "Se ha producido un error"})
                    } else {
                        res.status(201);
                        res.json({error: "Mensaje creado correctamente"})
                    }
                });
            }

        });
    });


    //Obtener los mensajes
    app.get("/api/mensajes/:email", function (req, res) {

        let criterio = {
            $or: [{$and: [{"amigo_2": res.usuario}, {"amigo_2": req.params.email}]},
                {$and: [{"amigo_1":req.params.email}, {"amigo_2": res.usuario}]}]
        };

        gestorBD.obtenerAmigos(criterio, function (amigos) {
            if (amigos == null) {
                res.status(500);
                res.json({error: "No son amigos"});
            } else {
                //Miramos si el emisor es el usuario en sesion y el destino es el email correcto y vicebersar
                let criterio2 = {
                    $or: [{$and: [{"emisor": req.body.email}, {"destino": req.params.email}]},
                        {$and: [{"emisor": req.params.email}, {"destino": req.body.email}]}]
                };

                gestorBD.obtenerMensajes(criterio2, function (mensajes) {
                    if (mensajes == null) {
                        res.status(500);
                        res.json({
                            error: "se ha producido un error"
                        });
                    } else {
                        res.status(200);
                        res.send(JSON.stringify(mensajes));
                    }
                });
            }
        });
    });
}
