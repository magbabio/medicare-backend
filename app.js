const express = require('express');
const routes = require('./routes');
const cors = require('cors'); // Importa cors aquí
require('dotenv').config();

const app = express(); // Declara app aquí

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  next();
});
app.use(express.json());
app.use("/api", routes);

app.get("/api", (_, res) =>
  res.send(`Connected!`)
)

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
