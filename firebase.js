var express         = require('express')
var bodyParser      = require("body-parser")
var app             = express()

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

var admin           = require("firebase-admin")
var serviceAccount  = require("./includes/firebase-various-0692fa6e83ce.json")

// Initialize the app with a service account, granting admin privileges
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://REEPLACE_DB_NAME.firebaseio.com/"
})

// As an admin, the app has access to read and write all data, regardless of Security Rules
var db = admin.database()

//Routing
app.get('/', function(req, res) {
  res.redirect('/home')
})

app.get('/home', (req, res) => res.send('<form method="post" action="/save"><fieldset><legend>Complete el siguiente formulario para guardar los datos</legend><p><input name="firstName" placeholder="Ingrese su nombre" value="" /></p><p><input name="lastName" placeholder="Ingrese su apellido" value="" /></p><p><input name="email" placeholder="Ingrese un email" value="" /></p><input type="submit" name="send" value="Enviar" /></fieldset></form>'))
app.post('/save', function(req, res) {
  
  var message   = 'Ha ocurrido un error y no se ha podido ingresar el registro!.<br/>Por favor, intente nuevamente.'
  var query     = db.ref("usuarios").orderByKey()
  var userFound = 0
  
  query.once("value").then(function(snapshot) {
    snapshot.forEach(function(childSnapshot) {

        var newUser = {}
        var email   = childSnapshot.val().email
        
        if( email === req.body.email )
          userFound++;
        
        if( userFound > 0 ) {
          message = 'El usuario ya existe en la base de datos!.'
        }
      }
    )
  })
  if(userFound < 1) {
    newUser = {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email  
    }
    
    db.ref("usuarios").push(newUser)
    message = 'Se ha insertado el nuevo usuario en la base de datos!.'
  }
  res.send(message)  
})
app.listen(3000, () => console.log('Litening port 3000'))