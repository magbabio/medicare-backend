const express = require('express');
const routes = require('./routes');
const cors = require('cors'); // Importa cors aquí

// require('dotenv').config();

const app = express(); // Declara app aquí

app.use(cors({ origin: 'http://localhost:8001' }));
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
