var express = require('express')
  , app = express()
  , http = require('http')
  , server = http.createServer(app);
var fs= require('fs');
var bodyParser = require('body-parser');
//Path de los CSS que utilizarán para el estilo de la página
app.use("/css", express.static(__dirname + '/css'));

//Path de funciones en Javascript que podrían utilizar
app.use("/function", express.static(__dirname + '/function'));

//Routing
app.get('/', function (req, res) {
  res.sendfile(__dirname + '/view/index.html');
});
app.use(bodyParser.urlencoded({ extended: true })); 
var contador=0;
var servidor=0;
var host = [];
var user = [];
var pass = [];
var port = [];
var database = [];
var parametro='';
var resinsert='';
var continsert=0;
var resultado='';
var file = fs.readFileSync('basesdedatos.txt', 'utf8');
for (i = 0; i < file.length+1; i += 1) {
        if(file[i]!='\n' && i!=file.length && file[i]!='\r' ){
        	parametro=parametro+file[i];
        }
        else if(file[i]=='\n' || i==file.length){
		if(contador==0){
                host[servidor]=parametro;
		}
		else if(contador==1){
                user[servidor]=parametro;
		}
		else if(contador==2){
                pass[servidor]=parametro;
		}
		else if(contador==3){
                database[servidor]=parametro;
		}
		else if(contador==4){
                port[servidor]=parametro;
		}
		parametro='';
		contador++;
		if(contador==5){
			contador=0;
			servidor++;
		}
        }
}
var consulta = [];
parametro = '';
contcons=0;
var fileconsulta = fs.readFileSync('consulta.txt', 'utf8');
for (i = 0; i < fileconsulta.length+1; i += 1) {
        if(fileconsulta[i]!='\n' && i!=fileconsulta.length){
        	parametro=parametro+fileconsulta[i];
        }
        else if(fileconsulta[i]=='\n' || i==fileconsulta.length){
		consulta[contcons]=parametro
		parametro='';
		contcons++;
        }
}
var clientes = [];
var pg = require('pg');
var dbparams = [];
for(i=0;i<servidor;i++){
dbparams[i] = {
    host : host[i],
    user : user[i],
    password : pass[i],
    database : database[i],
    port : port[i]
	};
}
console.log(dbparams);
for (j = 0; j < contcons; j += 1) {
for (i = 0; i < servidor; i += 1) {
	clientes[i]=new pg.Client(dbparams[i]);
	clientes[i].connect(function(err) {
  		if(err) {
    			return console.error('could not connect to postgres', err);
  		}
	});
     clientes[i].query(consulta[j], function(err, result) {
    if(err) {
      return console.error('error running query', err);
    }
    console.log(result.rows);
  });
}
}
var sha1 = require('sha1');
var nombre = '';
var rut = '';
var nivel = '';
var edad = '';
parametro='';
contador=0;
var strinsertar='';
var insertar = fs.readFileSync('insertar.txt', 'utf8');
for (i = 0; i < insertar.length; i += 1) {
        if(insertar[i]!=' ' && insertar[i]!='\n'){
        	parametro=parametro+insertar[i];
        }
        else{
		if(contador==0){
                nombre=parametro;
		}
		else if(contador==1){
                rut=parametro;
		}
		else if(contador==2){
                nivel=parametro;
		}
		else if(contador==3){
                edad=parametro;
		}
		parametro='';
		contador++;
		if(contador==4){
			contador=0;
			strinsertar=nombre+rut+nivel+edad;
			var hash = sha1(rut);
			dec = parseInt(hash, 16);
mod=dec%servidor;
var client = new pg.Client(dbparams[mod]);
client.connect(function(err) {
  if(err) {
    return console.error('could not connect to postgres', err);
  }
});
client.query('INSERT into alumnos (nombre, rut, nivel, edad) VALUES($1,$2,$3,$4)', [nombre, rut, nivel,edad], function(err, result) {
	continsert++;
	if (err) {
     		console.log(err);
		  resinsert=resinsert+'No se pudo realizar el insert '+continsert+' correctamente. ';
      } else {
  resinsert=resinsert+'Se realiza el insert '+continsert+' correctamente. ';
                }
 });
		}
        }
}
app.post('/insert', function(req, res) {
	res.send(resinsert);
});
server.listen(8080);

