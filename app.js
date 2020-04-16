//Modulos
var express = require('express');
var app = express();

var swig = require('swig');
var bodyParser = require('body-parser');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));


//Server
app.set('port', 8081);
app.listen(app.get('port'), function() {
    console.log("Servidor activo");
});