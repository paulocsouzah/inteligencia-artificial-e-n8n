import { test } from "node:test";
import assert from "node:assert/strict";
import { newId } from "../components/chat/newId";

// O id é usado como sessionId (o servidor exige /^[\w-]{8,64}$/) e como chave das mensagens.

test("newId gera 32 caracteres hexadecimais, aceitos pela validação do servidor", () => {
  const id = newId();
  assert.match(id, /^[0-9a-f]{32}$/);
  assert.match(id, /^[\w-]{8,64}$/);
});

test("newId não repete", () => {
  assert.equal(new Set(Array.from({ length: 1000 }, newId)).size, 1000);
});
