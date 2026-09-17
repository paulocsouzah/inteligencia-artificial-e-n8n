// Os mesmos fixtures da demonstração guiada e dos exercícios em terminal
// — o "sistema em produção" fictício que o AI Software Engineer investiga.
// A tabela "documentos" (RDS + pgvector) substitui a busca em memória de
// `documentacao` só para essa fonte; código, logs e banco continuam em
// memória, dentro do próprio processo — ver a nota no README sobre por
// que nem tudo virou uma tabela nesta aula.

export const codigoFonte = {
  "src/routes/pedidos.js": `router.post("/pedidos", async (req, res) => {
  const pedido = await criarPedido(req.body);
  console.log(\`Novo pedido de \${pedido.cliente.nome}\`);
  res.status(201).json(pedido);
});`,

  "src/db/queries.js": `function buscarPedidosPorCliente(nomeCliente) {
  const sql = \`SELECT * FROM pedidos WHERE cliente_nome = '\${nomeCliente}'\`;
  return db.query(sql);
}`,

  "src/services/pagamento.js": `async function calcularTotalComDesconto(pedidos) {
  const resultados = [];
  for (const pedido of pedidos) {
    const cupom = await db.query("SELECT * FROM cupons WHERE pedido_id = ?", [pedido.id]);
    resultados.push(aplicarDesconto(pedido, cupom));
  }
  return resultados;
}`
};

export const logs = [
  { timestamp: "2026-09-17T03:12:01Z", nivel: "info", servico: "pedidos-api", mensagem: "POST /pedidos 201 - 45ms" },
  { timestamp: "2026-09-17T03:14:22Z", nivel: "error", servico: "pedidos-api", mensagem: "POST /pedidos 500 - TypeError: Cannot read properties of undefined (reading 'nome') at src/routes/pedidos.js:4" },
  { timestamp: "2026-09-17T03:14:23Z", nivel: "info", servico: "pedidos-api", mensagem: "Pedido recebido sem campo 'cliente' (checkout convidado)" },
  { timestamp: "2026-09-17T03:15:40Z", nivel: "error", servico: "pedidos-api", mensagem: "POST /pedidos 500 - TypeError: Cannot read properties of undefined (reading 'nome') at src/routes/pedidos.js:4" },
  { timestamp: "2026-09-17T09:02:11Z", nivel: "warn", servico: "pagamento-service", mensagem: "Lentidão no serviço de pagamento: calcularTotalComDesconto levou 8400ms para 120 pedidos (consulta ao banco dentro do loop)" }
];

export const bancoPedidos = [
  { id: 4501, status: "Entregue", total: 259.90, entregue_em: "2026-09-10" },
  { id: 4502, status: "Entregue", total: 89.90, entregue_em: null },
  { id: 4503, status: "Cancelado", total: -50.00, entregue_em: null }
];

// A documentação em si vive no RDS (tabela "documentos", populada pelo
// seed.js) — este texto aqui é só o que o seed.js usa para popular.
export const documentacao = `RUNBOOK: Estrutura de um Pedido
Todo pedido tem os campos id, itens, total e status. O campo "cliente" é OPCIONAL: pedidos feitos em modo convidado (checkout sem login) não possuem esse campo. Qualquer código que acesse pedido.cliente.* precisa checar antes se pedido.cliente existe.

RUNBOOK: Desempenho do Pagamento
Consultas ao banco dentro de um loop (uma consulta por pedido, em vez de uma consulta só pra todos) são um padrão conhecido de lentidão neste sistema.

RUNBOOK: Segurança de Consultas
Toda consulta ao banco deste sistema deve usar parâmetros (o símbolo ?), nunca concatenação de string dentro do SQL — concatenar entrada do usuário direto na query é uma vulnerabilidade de SQL injection.`;
