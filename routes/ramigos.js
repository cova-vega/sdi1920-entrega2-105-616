
module.exports = function (app, swig, gestorBD) {


/**
 * Se visualizará en una lista todos los usuarios amigos del usuario en sesión.
 * Para cada usuario se mostrará su nombre, apellidos y email.
 *
 * La lista estará paginada y mostrará 5 usuarios por página.
 *
 * Habrá una opción de menú principal, solo visible para usuarios en sesión, que
 * permita acceder a la lista de amigos del usuario en sesión
 *
 */

app.get("/amigos", function (req, res) {

    //Comprobamos que hay un usuario en sesión
    if (req.session.usuario == null) {
        app.get('logger').error("No hay ningun usuario en sesion.");
        res.redirect("/identificarse");
        return;
    }
    //Obtenemos el usuario en sesión

    let criterio = {"email": req.session.usuario};
    gestorBD.obtenerUsuario(criterio, function (usuarios) {

        criterio = {$and: [{"receptor": usuarios[0]}, {"aceptado": false}]};

        let pg = parseInt(req.query.pg); // Es String !!!
        if (req.query.pg == null) { // Puede no venir el param
            pg = 1;
        }

        let criterio2 = {"amigo_1.email": req.session.usuario}
        //Obtenemos la lista de amigos paginada de la base de datos

        gestorBD.obtenerAmigosPg(criterio2, pg, function (amigos, total) {

            if (amigos == null) {
                app.get('logger').error("Error al listar.");
                res.redirect("/amigos" + "?mensaje=Error al listar amigos" + "&tipoMensaje=alert-danger ");
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
                        amigos: amigos,
                        paginas: paginas,
                        actual: pg,
                        usuarios: usuarios

                    });
                app.get("logger").info("Listando lista de amigos para "
                    + req.session.usuario);
                res.send(respuesta);
            }
        });
    });
});
}