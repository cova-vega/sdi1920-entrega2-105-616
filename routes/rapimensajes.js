module.exports = function (app, gestorBD) {


    /**
     * Crear un mensaje
     *
     * El mensaje tiene las siguientes propiedades emisor,destino,texto y leido
     * primero obtenemos los usuario que son amigos porque son los que se pueden mandar mensajes
     * entonces hacemos un filtrado si es emisor o destino y si coinciden son amigos entonces se inserta el mensaje
     * Metodo POST
     *
     *
     */
    //Crear nuevo mensaje
    app.post('/api/mensajes', function (req, res) {

        let mensaje = {
            emisor:  app.get('jwt').decode(req.headers['token'],'secreto').usuario,
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
                        res.json({mensaje: "Mensaje creado correctamente"})
                    }
                });
            }

        });
    });
    /**
     * Obtener mensaje
     *
     * Primero se obtienen los usuarios que son amigos, hacemos otro criterio que miramos si el
     * emisor es el que esta en sesion y el destino es el que recibe el mensaje o al reves
     *
     * Metodo GET
     *
     *
     */

    app.get("/api/mensajes/:email", function (req, res) {

        let criterio = {
            $or: [{$and: [{"amigo_1.email": req.session.usuario}, {"amigo_2.email": req.params.email}]},
                {$and: [{"amigo_1.email":req.params.email}, {"amigo_2.email": req.session.usuario}]}]
        };

        gestorBD.obtenerAmigos(criterio, function (amigos) {
            if (amigos == null) {
                res.status(500);
                res.json({error: "No son amigos"});
            } else {
                //Miramos si el emisor es el usuario en sesion y el destino es el email correcto y vicebersar
                let criterio2 = {
                    $or: [{$and: [{"emisor": req.session.usuario}, {"destino": req.params.email}]},
                        {$and: [{"emisor": req.params.email}, {"destino": req.session.usuario}]}]
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
