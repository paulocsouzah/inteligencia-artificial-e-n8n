// =============================================================================
// API + frontend estático da "loja" — usada pelas Aulas 04, 05 e 06 de n8n
// como o sistema real que o n8n consulta, em vez de dados inventados num
// Code node. Mesmo padrão de conexão com retry do curso de DevOps (Aula 03).
// =============================================================================

const express = require('express');
const path = require('path');
const mysql = require('mysql2/promise');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const PORT = process.env.PORT || 4000;

const dbConfig = {
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

let pool;

async function conectarComRetry(tentativas = 20, esperaMs = 5000) {
  for (let i = 1; i <= tentativas; i++) {
    try {
      const conexao = mysql.createPool(dbConfig);
      await conexao.query('SELECT 1');
      console.log('Conectado ao banco de dados em', dbConfig.host);
      return conexao;
    } catch (erro) {
      console.error(`Tentativa ${i}/${tentativas} de conexao com o banco falhou: ${erro.message}`);
      if (i === tentativas) throw erro;
      await new Promise((resolve) => setTimeout(resolve, esperaMs));
    }
  }
}

const POLITICAS_SEED = [
  ['Trocas', 'O cliente pode solicitar troca em ate 7 dias corridos apos o recebimento do produto, desde que o item esteja sem uso e na embalagem original.'],
  ['Frete', 'Pedidos acima de R$ 199 tem frete gratis para todo o Brasil. Abaixo desse valor, o frete e calculado no carrinho.'],
  ['Prazo de entrega', 'O prazo informado no checkout conta a partir da confirmacao do pagamento e pode variar conforme a regiao.'],
  ['Reembolso', 'Estornos no cartao de credito sao feitos em ate 2 faturas; no Pix, em ate 5 dias uteis.'],
  ['Atendimento', 'O chat funciona de segunda a sexta, das 9h as 18h, e aos sabados das 9h as 13h.'],
];

const PRODUTOS_SEED = [
  ['Tenis Runner Pro', 349.9, 40],
  ['Camiseta Basic', 69.9, 120],
  ['Bone Aba Curva', 59.9, 80],
  ['Mochila Urbana', 199.9, 25],
  ['Garrafa Termica 1L', 89.9, 60],
];

async function iniciar() {
  pool = await conectarComRetry();

  await pool.query(`
    CREATE TABLE IF NOT EXISTS produtos (
      id INT AUTO_INCREMENT PRIMARY KEY,
      nome VARCHAR(255) NOT NULL,
      preco DECIMAL(10,2) NOT NULL,
      estoque INT NOT NULL DEFAULT 0
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS pedidos (
      id INT AUTO_INCREMENT PRIMARY KEY,
      protocolo VARCHAR(40) NOT NULL,
      produto_id INT NOT NULL,
      produto_nome VARCHAR(255) NOT NULL,
      cliente_nome VARCHAR(255) NOT NULL,
      cliente_email VARCHAR(255) NOT NULL,
      quantidade INT NOT NULL,
      valor_total DECIMAL(10,2) NOT NULL,
      status VARCHAR(40) NOT NULL DEFAULT 'confirmado',
      criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS reclamacoes (
      id INT AUTO_INCREMENT PRIMARY KEY,
      protocolo VARCHAR(40) NOT NULL,
      pedido_id INT NULL,
      cliente_nome VARCHAR(255) NOT NULL,
      cliente_email VARCHAR(255) NOT NULL,
      mensagem TEXT NOT NULL,
      status VARCHAR(40) NOT NULL DEFAULT 'nova',
      intencao VARCHAR(40) NULL,
      resposta TEXT NULL,
      criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS politicas (
      id INT AUTO_INCREMENT PRIMARY KEY,
      titulo VARCHAR(255) NOT NULL,
      texto TEXT NOT NULL
    )
  `);

  const [[{ total_produtos }]] = await pool.query('SELECT COUNT(*) AS total_produtos FROM produtos');
  if (total_produtos === 0) {
    for (const [nome, preco, estoque] of PRODUTOS_SEED) {
      await pool.query('INSERT INTO produtos (nome, preco, estoque) VALUES (?, ?, ?)', [nome, preco, estoque]);
    }
    console.log('Produtos de exemplo inseridos.');
  }

  const [[{ total_politicas }]] = await pool.query('SELECT COUNT(*) AS total_politicas FROM politicas');
  if (total_politicas === 0) {
    for (const [titulo, texto] of POLITICAS_SEED) {
      await pool.query('INSERT INTO politicas (titulo, texto) VALUES (?, ?)', [titulo, texto]);
    }
    console.log('Politicas de exemplo inseridas.');
  }

  app.listen(PORT, () => {
    console.log(`Loja rodando na porta ${PORT}`);
  });
}

function protocolo(prefixo, id) {
  const agora = new Date();
  const data = agora.toISOString().slice(0, 10).replace(/-/g, '');
  return `${prefixo}-${data}-${id}`;
}

// ---------------------------------------------------------------- health ---
app.get('/api/status', (req, res) => {
  res.json({ mensagem: 'Loja rodando', banco: dbConfig.host });
});

// ------------------------------------------------------------- produtos ---
app.get('/api/produtos', async (req, res) => {
  try {
    const [linhas] = await pool.query('SELECT id, nome, preco, estoque FROM produtos ORDER BY id');
    res.json(linhas);
  } catch (erro) {
    res.status(500).json({ erro: 'Erro ao consultar produtos' });
  }
});

// -------------------------------------------------------------- pedidos ---
app.post('/api/pedidos', async (req, res) => {
  const { produto_id, cliente_nome, cliente_email, quantidade } = req.body || {};
  if (!produto_id || !cliente_nome || !cliente_email || !quantidade) {
    return res.status(400).json({ erro: 'produto_id, cliente_nome, cliente_email e quantidade sao obrigatorios' });
  }
  try {
    const [[produto]] = await pool.query('SELECT * FROM produtos WHERE id = ?', [produto_id]);
    if (!produto) return res.status(404).json({ erro: 'Produto nao encontrado' });
    if (produto.estoque < quantidade) return res.status(409).json({ erro: 'Estoque insuficiente' });

    const valorTotal = Number(produto.preco) * Number(quantidade);
    const [resultado] = await pool.query(
      'INSERT INTO pedidos (protocolo, produto_id, produto_nome, cliente_nome, cliente_email, quantidade, valor_total) VALUES (?, ?, ?, ?, ?, ?, ?)',
      ['TEMP', produto_id, produto.nome, cliente_nome, cliente_email, quantidade, valorTotal],
    );
    const prot = protocolo('PED', resultado.insertId);
    await pool.query('UPDATE pedidos SET protocolo = ? WHERE id = ?', [prot, resultado.insertId]);
    await pool.query('UPDATE produtos SET estoque = estoque - ? WHERE id = ?', [quantidade, produto_id]);

    res.status(201).json({ id: resultado.insertId, protocolo: prot, produto: produto.nome, valor_total: valorTotal, status: 'confirmado' });
  } catch (erro) {
    console.error('Erro ao criar pedido:', erro.message);
    res.status(500).json({ erro: 'Erro ao criar pedido' });
  }
});

app.get('/api/pedidos', async (req, res) => {
  try {
    const [linhas] = await pool.query('SELECT * FROM pedidos ORDER BY id DESC LIMIT 200');
    res.json(linhas);
  } catch (erro) {
    res.status(500).json({ erro: 'Erro ao consultar pedidos' });
  }
});

app.get('/api/pedidos/:id', async (req, res) => {
  try {
    const [[pedido]] = await pool.query('SELECT * FROM pedidos WHERE id = ? OR protocolo = ?', [req.params.id, req.params.id]);
    if (!pedido) return res.status(404).json({ erro: 'Pedido nao encontrado' });
    res.json(pedido);
  } catch (erro) {
    res.status(500).json({ erro: 'Erro ao consultar pedido' });
  }
});

// ---------------------------------------------------------- reclamacoes ---
app.post('/api/reclamacoes', async (req, res) => {
  const { pedido_id, cliente_nome, cliente_email, mensagem } = req.body || {};
  if (!cliente_nome || !cliente_email || !mensagem) {
    return res.status(400).json({ erro: 'cliente_nome, cliente_email e mensagem sao obrigatorios' });
  }
  try {
    const [resultado] = await pool.query(
      'INSERT INTO reclamacoes (protocolo, pedido_id, cliente_nome, cliente_email, mensagem) VALUES (?, ?, ?, ?, ?)',
      ['TEMP', pedido_id || null, cliente_nome, cliente_email, mensagem],
    );
    const prot = protocolo('REC', resultado.insertId);
    await pool.query('UPDATE reclamacoes SET protocolo = ? WHERE id = ?', [prot, resultado.insertId]);
    res.status(201).json({ id: resultado.insertId, protocolo: prot, status: 'nova' });
  } catch (erro) {
    console.error('Erro ao criar reclamacao:', erro.message);
    res.status(500).json({ erro: 'Erro ao criar reclamacao' });
  }
});

app.get('/api/reclamacoes', async (req, res) => {
  try {
    const { status } = req.query;
    const sql = status
      ? 'SELECT * FROM reclamacoes WHERE status = ? ORDER BY id'
      : 'SELECT * FROM reclamacoes ORDER BY id DESC LIMIT 200';
    const [linhas] = await pool.query(sql, status ? [status] : []);
    res.json(linhas);
  } catch (erro) {
    res.status(500).json({ erro: 'Erro ao consultar reclamacoes' });
  }
});

app.patch('/api/reclamacoes/:id', async (req, res) => {
  const { status, intencao, resposta } = req.body || {};
  try {
    await pool.query(
      'UPDATE reclamacoes SET status = COALESCE(?, status), intencao = COALESCE(?, intencao), resposta = COALESCE(?, resposta) WHERE id = ?',
      [status || null, intencao || null, resposta || null, req.params.id],
    );
    const [[linha]] = await pool.query('SELECT * FROM reclamacoes WHERE id = ?', [req.params.id]);
    res.json(linha);
  } catch (erro) {
    res.status(500).json({ erro: 'Erro ao atualizar reclamacao' });
  }
});

// -------------------------------------------------------------politicas ---
app.get('/api/politicas', async (req, res) => {
  try {
    const [linhas] = await pool.query('SELECT id, titulo, texto FROM politicas ORDER BY id');
    res.json(linhas);
  } catch (erro) {
    res.status(500).json({ erro: 'Erro ao consultar politicas' });
  }
});

iniciar().catch((erro) => {
  console.error('Falha ao iniciar a loja:', erro.message);
  process.exit(1);
});
