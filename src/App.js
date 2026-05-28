import React, { useState, useReducer, useMemo, useEffect } from "react";
import { faker } from "@faker-js/faker";

// FIX 1: reducers fora do componente (evita recriar a cada render)
const reducerUser2 = (state, action) => {
  switch (action.type) {
    case "inc": return { ...state, idade: state.idade + 1 };
    case "dec": return { ...state, idade: state.idade - 1 };
    default: return state;
  }
};
const reducerUsers = (state, action) => {
  switch (action.type) {
    case "add": return [...state, action.payload];
    case "inc": return state.map((u, i) => i === action.index ? { ...u, idade: u.idade + 1 } : u);
    case "dec": return state.map((u, i) => i === action.index ? { ...u, idade: u.idade - 1 } : u);
    case "del": return state.filter((_, i) => i !== action.index);
    default: return state;
  }
};
const reducerTodos = (state, action) => {
  switch (action.type) {
    case "add": return [...state, { text: action.payload, done: false }];
    case "del": return state.filter((_, i) => i !== action.index);
    case "toggle": return state.map((t, i) => i === action.index ? { ...t, done: !t.done } : t);
    default: return state;
  }
};

// FIX 2: nomes fora do componente (não depende de estado, não precisa recriar)
const nomes = Array.from({ length: 100 }, () => ({
  nome: faker.person.fullName(),
  cargo: faker.person.jobTitle()
}));

function App() {
  const [user1, setUser1] = useState({ nome: "Lucas", idade: 20 });
  const [user2, dispatchUser2] = useReducer(reducerUser2, { nome: "Maria", idade: 25 });
  const [users, dispatchUsers] = useReducer(reducerUsers, []);
  const [nomeInput, setNomeInput] = useState("");
  const [idadeInput, setIdadeInput] = useState("");
  const [todos, dispatchTodos] = useReducer(reducerTodos, []);
  const [todoInput, setTodoInput] = useState("");
  const [num, setNum] = useState(5);
  const [filtro, setFiltro] = useState("");
  const [ufs, setUfs] = useState([]);
  const [ufSel, setUfSel] = useState("");
  const [mun, setMun] = useState([]);
  const [filtroMun, setFiltroMun] = useState("");
  const [decada, setDecada] = useState("");
  const [ranking, setRanking] = useState([]);

  // FIX 3: useMemo no fatorial
  const fatorial = useMemo(() => {
    const calc = (n) => n <= 1 ? 1 : n * calc(n - 1);
    return num >= 0 ? calc(num) : "inválido"; // FIX 4: guard para negativos
  }, [num]);

  // FIX 5: filtros memoizados
  const filtrados8  = useMemo(() => nomes.filter(n => n.nome.toLowerCase().startsWith(filtro.toLowerCase())), [filtro]);
  const filtrados9  = useMemo(() => nomes.filter(n => n.nome.toLowerCase().includes(filtro.toLowerCase())), [filtro]);
  const filtrados10 = useMemo(() => nomes.filter(n => n.nome.toLowerCase().startsWith(filtro.toLowerCase()) || n.cargo.toLowerCase().startsWith(filtro.toLowerCase())), [filtro]);
  const filtrados11 = useMemo(() => nomes.filter(n => n.nome.toLowerCase().includes(filtro.toLowerCase()) || n.cargo.toLowerCase().includes(filtro.toLowerCase())), [filtro]);
  const munFiltrados14 = useMemo(() => mun.filter(m => m.nome.toLowerCase().startsWith(filtroMun.toLowerCase())), [mun, filtroMun]);
  const munFiltrados15 = useMemo(() => mun.filter(m => m.nome.toLowerCase().includes(filtroMun.toLowerCase())), [mun, filtroMun]);

  useEffect(() => {
    fetch("https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome")
      .then(r => r.json()).then(d => setUfs(d));
  }, []);

  useEffect(() => {
    if (ufSel) {
      fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${ufSel}/municipios`)
        .then(r => r.json()).then(d => setMun(d));
    }
  }, [ufSel]);

  // FIX 6: optional chaining para evitar crash se API retornar vazio
  const buscarRanking = () => {
    fetch(`https://servicodados.ibge.gov.br/api/v2/censos/nomes/ranking/?decada=${decada}`)
      .then(r => r.json()).then(d => setRanking(d[0]?.res ?? []));
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Exercício 1</h2>
      <p>{user1.nome} - {user1.idade}</p>
      <button onClick={() => setUser1({ ...user1, idade: user1.idade + 1 })}>+</button>
      <button onClick={() => setUser1({ ...user1, idade: user1.idade - 1 })}>-</button>

      <h2>Exercício 2</h2>
      <p>{user2.nome} - {user2.idade}</p>
      <button onClick={() => dispatchUser2({ type: "inc" })}>+</button>
      <button onClick={() => dispatchUser2({ type: "dec" })}>-</button>

      <h2>Exercício 3 e 4</h2>
      <input placeholder="Nome" value={nomeInput} onChange={e => setNomeInput(e.target.value)} />
      <input placeholder="Idade" value={idadeInput} onChange={e => setIdadeInput(e.target.value)} />
      <button onClick={() => dispatchUsers({ type: "add", payload: { nome: nomeInput, idade: Number(idadeInput) } })}>Inserir</button>
      {users.map((u, i) => (
        <div key={i}>{u.nome} - {u.idade}
          <button onClick={() => dispatchUsers({ type: "inc", index: i })}>+</button>
          <button onClick={() => dispatchUsers({ type: "dec", index: i })}>-</button>
          <button onClick={() => dispatchUsers({ type: "del", index: i })}>Excluir</button>
        </div>
      ))}

      <h2>Exercício 5 e 6</h2>
      <input value={todoInput} onChange={e => setTodoInput(e.target.value)} />
      <button onClick={() => dispatchTodos({ type: "add", payload: todoInput })}>Adicionar</button>
      {todos.map((t, i) => (
        <div key={i} style={{ textDecoration: t.done ? "line-through" : "none" }}>
          {t.text}
          <button onClick={() => dispatchTodos({ type: "toggle", index: i })}>✔</button>
          <button onClick={() => dispatchTodos({ type: "del", index: i })}>Excluir</button>
        </div>
      ))}

      <h2>Exercício 7</h2>
      <input type="number" value={num} onChange={e => setNum(Number(e.target.value))} />
      <p>Fatorial: {fatorial}</p>

      <h2>Exercício 8 a 11</h2>
      <input value={filtro} onChange={e => setFiltro(e.target.value)} />
      <h3>Ex8 (startsWith nome)</h3>
      {filtrados8.map((n, i) => <div key={i}>{n.nome}</div>)}
      <h3>Ex9 (includes nome)</h3>
      {filtrados9.map((n, i) => <div key={i}>{n.nome}</div>)}
      <h3>Ex10 (startsWith nome ou cargo)</h3>
      {filtrados10.map((n, i) => <div key={i}>{n.nome} - {n.cargo}</div>)}
      <h3>Ex11 (includes nome ou cargo)</h3>
      {filtrados11.map((n, i) => <div key={i}>{n.nome} - {n.cargo}</div>)}

      <h2>Exercício 12 a 15</h2>
      <select onChange={e => setUfSel(e.target.value)}>
        <option>Selecione UF</option>
        {ufs.map(u => <option key={u.id} value={u.id}>{u.nome}</option>)}
      </select>
      <input placeholder="Filtro município" value={filtroMun} onChange={e => setFiltroMun(e.target.value)} />
      <h3>Ex12/13 - Municípios da UF</h3>
      {mun.map((m, i) => <div key={i}>{m.nome}</div>)}
      <h3>Ex14 - Filtro startsWith</h3>
      {munFiltrados14.map((m, i) => <div key={i}>{m.nome}</div>)}
      <h3>Ex15 - Filtro includes</h3>
      {munFiltrados15.map((m, i) => <div key={i}>{m.nome}</div>)}

      <h2>Exercício 16</h2>
      <input placeholder="Década (ex: 1990)" value={decada} onChange={e => setDecada(e.target.value)} />
      <button onClick={buscarRanking}>Buscar</button>
      {ranking.map((r, i) => <div key={i}>{i + 1}. {r.nome} - {r.frequencia}</div>)}
    </div>
  );
}

export default App;
