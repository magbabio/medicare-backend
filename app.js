const express = require('express');
const routes = require('./routes');
const cors = require('cors');
require('dotenv').config();

const app = express();

const corsOptions = {
  origin: 'http://localhost:8081', // Permitir el origen de tu frontend
  methods: 'GET, POST, PUT, DELETE', // Métodos permitidos
  allowedHeaders: ['Content-Type', 'Authorization'], // Cabeceras permitidas
  credentials: true // Permite el uso de cookies
};

app.use(cors(corsOptions));

app.use(cors(corsOptions));
app.use(express.json());
app.use("/api", routes);

app.get("/api", (_, res) =>
  res.send(`Connected!`)
)

app.options('*', cors(corsOptions)); // habilitar preflight para todas las rutas


const port = 4000;

// exec('npx sequelize-cli db:migrate && npx sequelize-cli db:seed:all', (error, stdout, stderr) => {
//   if (error) {
//     console.error('Error al ejecutar migraciones y seeders:', error);
//     return;
//   }
//   console.log('Migraciones y seeders ejecutados correctamente');
  
  // Iniciar el servidor
  app.listen(port, () => {
    console.log(`Servidor iniciado en el puerto ${port}`);
  });
