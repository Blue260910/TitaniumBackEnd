const oracledb = require('oracledb');
const express = require('express');
const app = express();
const port = 3000;

// Configuração para conectar ao banco de dados
const config = {
  user: 'RM99667',
  password: '260903',
  connectionString: 'oracle.fiap.com.br:1521/ORCL'
};

// SQL statement a ser executado
const sql = `
INSERT INTO RM99210.DASH_PONTUACAO (
  TEMPO,
  NOME
) VALUES (
  INTERVAL '0 00:00:00.000' DAY TO SECOND + NUMTODSINTERVAL(:minutos, 'MINUTE') + NUMTODSINTERVAL(:segundos, 'SECOND') + NUMTODSINTERVAL(:milissegundos / 1000, 'SECOND'),
  :nome
)
`;

async function inserir(nome, minutos, segundos, milissegundos) {
  let connection;

  try {
    // Obter uma conexão standalone
    connection = await oracledb.getConnection(config);

    // Execução do SQL
    const result = await connection.execute(sql, { nome, minutos, segundos, milissegundos }, { autoCommit: true });
    console.log('Rows inserted:', result.rowsAffected);
  } catch (err) {
    console.error('Error executing query:', err);
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error('Error closing connection:', err);
      }
    }
  }
}

// Configurar o servidor Express
app.get('/', (req, res) => {
  // Receber parâmetros da query string como uma única string
  const { params } = req.query;

  // Validar parâmetros
  if (!params) {
    res.status(400).send('Parâmetros inválidos');
    return;
  }

  // Dividir a string para obter os valores individuais
  const [nome, minutos, segundos, milissegundos] = params.split(',');

  // Inserir dados no banco de dados
  inserir(nome, minutos, segundos, milissegundos);

  // Responder com "Hello World"
  res.send('Hello World');
});

// Iniciar o servidor
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
  console.log('Pressione Ctrl+C para encerrar...');
});