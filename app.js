//Modulos
let express = require('express');
let app = express();
let expressSession = require('express-session');
app.use(expressSession({
    secret: 'abcdefg',
    resave: true,
    saveUninitialized: true
}));
log4js = require('log4js');
log4js.configure({
    appenders: { sdi2: { type: 'file', filename: 'redSocialNode.log' } },
    categories: { default: { appenders: ['sdi2'], level: 'trace' } }
});
let logger = log4js.getLogger('sdi2');

let mongo = require('mongodb');

let crypto = require('crypto');
let swig = require('swig');
let bodyParser = require('body-parser');

//Declaramos el require del módulo jsonwebtoken
var jwt = require('jsonwebtoken');
app.set('jwt',jwt);

//Declaramos los módulos fs y https para la implementación https
let fs = require('fs');
let https = require('https');


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static('public'));



let gestorBD = require("./modules/gestorBD.js");
gestorBD.init(app, mongo);
//Variables
app.set('port', 8081);
app.set('db', 'mongodb://admin:sdi@socialnetwork-shard-00-00-fld0u.mongodb.net:27017,socialnetwork-shard-00-01-fld0u.mongodb.net:27017,socialnetwork-shard-00-02-fld0u.mongodb.net:27017/test?ssl=true&replicaSet=SocialNetwork-shard-0&authSource=admin&retryWrites=true&w=majority');
app.set('clave', '123345678RO');
app.set('crypto', crypto);
//Rutas/controladores por lógica
require("./routes/rusuarios.js")(app, swig, gestorBD);
require("./routes/rinvitaciones.js")(app, swig, gestorBD);
require("./routes/rapiamigos.js")(app, gestorBD);
require("./routes/rapimensajes.js")(app, gestorBD);


//Router Usuario Token
//Obtenemos el parámetro token
//Si han pasado más de 240 segundos desde que se creó el token retornamos el mensaje de error: "Token inválido o caducado"
//Si no obtenemos token, enviamos el mensaje de error: "No hay token"
// routerUsuarioToken
var routerUsuarioToken = express.Router();
routerUsuarioToken.use(function(req, res, next) {
    // obtener el token, vía headers (opcionalmente GET y/o POST).
    var token = req.headers['token'] || req.body.token || req.query.token;
    if (token != null) {
        // verificar el token
        jwt.verify(token, 'secreto', function(err, infoToken) {
            if (err || (Date.now()/1000 - infoToken.tiempo) > 240 ){
                res.status(403); // Forbidden
                res.json({
                    acceso : false,
                    error: 'Token invalido o caducado'
                });
                // También podríamos comprobar que intoToken.usuario existe
                return;

            } else {
                // dejamos correr la petición
                res.usuario = infoToken.usuario;
                next();
            }
        });

    } else {
        res.status(403); // Forbidden
        res.json({
            acceso : false,
            mensaje: 'No hay Token'
        });
    }
});

// Aplicamos routerUsuarioToken a la lista de identificadores de los amigos del usuario en sesión
//para comprobar si la petición contiene un token de seguridad válido

app.use('/api/amigos', routerUsuarioToken);
app.use('api/mensajes', routerUsuarioToken);




//Server
//app.listen(app.get('port'), function () {
//    console.log("Servidor activo");
//});

//Modificamos la creación del servidor para utilizar https, indicándole donde está la clave y el certificado

https.createServer({
    key: fs.readFileSync('certificates/alice.key'),
    cert: fs.readFileSync('certificates/alice.crt')
}, app).listen(app.get('port'), function() {
    console.log("Servidor activo");
});
