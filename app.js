//Modulos
let express = require('express');
let app = express();
let mongo = require('mongodb');

let crypto = require('crypto');
let swig = require('swig');
let bodyParser = require('body-parser');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static('public'));

let gestorBD = require("./modules/gestorBD.js");
gestorBD.init(app, mongo);
//Variables
app.set('port', 8081);
app.set('db', 'mongodb://admin:sdi@socialnetwork-shard-00-00-fld0u.mongodb.net:27017,socialnetwork-shard-00-01-fld0u.mongodb.net:27017,socialnetwork-shard-00-02-fld0u.mongodb.net:27017/test?ssl=true&replicaSet=SocialNetwork-shard-0&authSource=admin&retryWrites=true&w=majority');
app.set('clave', 'sdi123456789');
app.set('crypto', crypto);
//Rutas/controladores por lógica
require("./routes/rusuarios.js")(app, swig, gestorBD);

//Server
app.listen(app.get('port'), function () {
    console.log("Servidor activo");
});