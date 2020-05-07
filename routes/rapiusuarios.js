module.exports = function(app, gestorBD) {


    /**
     * Identificarse con usuario-token
     *
     * Implementamos Token por Login. A partir del usuario y la contraseña encriptada realizamos
     * una búsqueda en la base de datos, si los datos coinciden retornamos un JSON con el un nuevo
     * token. En caso contrario, retornamos un JSON con un mensaje de  error de inicio de sesión incorrecto.
     *
     *
     */

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
                    error : "Inicio de sesión incorrecto"
                })
            } else {
                var token = app.get('jwt').sign(
                    {usuario: criterio.email , tiempo: Date.now()/1000},
                    "secreto");
                req.session.usuario=req.body.email;
                res.status(200);
                res.json({

                    token : token
                });
            }

        });
    });

    /**
     * Listar todos los amigos de un usuario
     *
     * EL servicio retorna un JSON con una lista de con los identificadores de todos los amigos del usuario identificado. En
     * caso de que la lista esté vacía retornamos un JSON con un mensaje de error. Para permitir listar los amigos el usuario
     * debe de estar identificado en la aplicación, por lo tanto, la petición debe contener un token de seguridad válido.
     *
     *
     */

        app.get("/api/amigos", function(req, res) {

            let criterio = {"amigo_1.email": req.body.email};

            gestorBD.obtenerAmigos( criterio , function(amigos) {
                if (amigos == null) {
                    res.status(500);
                    res.json({
                        error : "Se ha producido un error"
                    })
                } else {

                    obtenerIdentificadores(amigos,function (identificadores) {

                        res.status(200);
                        res.send( JSON.stringify(identificadores) );

                    })

                }
            });
        });

    /**
     *
     * Lista de identificadores
     *
     * Función que, dada una lista de amigos, obtiene el identificador de cada amigo
     * y devuelve una lista con todos los identificadores.
     *
     */


       function obtenerIdentificadores(usuarios,funcionCallback) {

               identificadores = [];

               for(i in usuarios){

                   let id = usuarios[i].amigo_2._id.toString();
                   identificadores.push(id);
               }


               funcionCallback (identificadores);

        }




}