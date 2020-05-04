module.exports = function(app, gestorBD) {


    //Implementamos Token por Login. A partir del usuario y la contraseña encriptada realizamos
    //una búsqueda en la base de datos, si los datos coinciden retornamos un JSON con el
    //parámetro autenticado a true y un nuevo token. En caso contrario, retornamos un JSON con
    //el parámetro autenticado a false y sin token.

    app.post("/api/autenticar/", function(req, res) {
        var seguro = app.get("crypto").createHmac('sha256', app.get('clave'))
            .update(req.body.password).digest('hex');

              var criterio = {
            email : req.body.email,
            password : seguro
        }

        gestorBD.obtenerUsuario(criterio, function(usuarios) {
            if (usuarios == null || usuarios.length == 0) {
                res.status(401);
                res.json({
                    autenticado : false
                })
            } else {
                var token = app.get('jwt').sign(
                    {usuario: criterio.email , tiempo: Date.now()/1000},
                    "secreto");
                req.session.usuario=req.body.email;
                res.status(200);
                res.json({
                    autenticado: true,
                    token : token
                });
            }

        });
    });

        //EL servicio retorna una lista de con los identificadores de todos los amigos del usuario identificado.
        //Para permitir listar los amigos el usuario debe de estar identificado en la aplicación, por lo tanto, la petición
        // debe contener un token de seguridad válido

        app.get("/api/amigos", function(req, res) {

            let criterio = {"amigo_1.email": req.body.email};

            gestorBD.obtenerAmigos( criterio , function(amigos) {
                if (amigos == null) {
                    res.status(500);
                    res.json({
                        error : "se ha producido un error"
                    })
                } else {

                    obtenerIdentificadores(amigos,function (identificadores) {

                        res.status(200);
                        res.send( JSON.stringify(identificadores) );

                    })

                }
            });
        });

        //Función que, dada una lista de amigos, obtiene el identificador de cada amigo
       // y devuelve una lista con todos los identificadores.

       function obtenerIdentificadores(usuarios,funcionCallback) {

               identificadores = [];

               for(i in usuarios){

                   let id = usuarios[i].amigo_2._id.toString();
                   identificadores.push(id);
               }


               funcionCallback (identificadores);

        }




}