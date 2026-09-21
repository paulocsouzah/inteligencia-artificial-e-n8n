// Gera um id aleatório de 32 caracteres hexadecimais (128 bits).
//
// Por que não usar crypto.randomUUID()? Os navegadores só liberam essa função em
// "contexto seguro" (HTTPS ou localhost). Numa EC2 servida por http://<IP>, ela NÃO
// existe e a tela travava. crypto.getRandomValues funciona em qualquer contexto.
// (O servidor, em Node, pode usar randomUUID à vontade.)
export function newId(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}
