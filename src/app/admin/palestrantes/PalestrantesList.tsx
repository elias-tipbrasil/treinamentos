"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface U { id: string; email: string; nome: string; role: string; ativo: boolean }

export default function PalestrantesList({ usuarios }: { usuarios: U[] }) {
  const router = useRouter();
  const [show, setShow] = useState(false);
  const [form, setForm] = useState({ nome: "", email: "", senha: "", role: "palestrante" });
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);

  const criar = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setErro("");
    const res = await fetch("/api/admin/palestrantes", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form),
    });
    const j = await res.json();
    if (res.ok) {
      setForm({ nome: "", email: "", senha: "", role: "palestrante" }); setShow(false); router.refresh();
    } else { setErro(j.erro || "Erro"); }
    setLoading(false);
  };

  const toggleAtivo = async (id: string, ativo: boolean) => {
    await fetch(`/api/admin/palestrantes/${id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ativo: !ativo }),
    });
    router.refresh();
  };

  const resetSenha = async (id: string) => {
    const nova = prompt("Nova senha (mínimo 6 caracteres):");
    if (!nova || nova.length < 6) return;
    await fetch(`/api/admin/palestrantes/${id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ senha: nova }),
    });
    alert("Senha redefinida.");
  };

  return (
    <>
      <div className="mb-6">
        {!show ? (
          <button onClick={() => setShow(true)}
            className="bg-[var(--tip-red)] hover:bg-[var(--tip-red-dark)] text-white px-5 py-3 font-condensed text-sm font-bold tracking-[1.3px] uppercase rounded-lg">
            + Novo Usuário
          </button>
        ) : (
          <form onSubmit={criar} className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-2xl p-5 space-y-3">
            <input required type="text" placeholder="Nome" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} autoFocus
              className="w-full bg-[var(--bg-input)] border border-[var(--border-strong)] text-white px-4 py-3 rounded-lg outline-none focus:border-[var(--tip-red)]" />
            <input required type="email" placeholder="E-mail" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full bg-[var(--bg-input)] border border-[var(--border-strong)] text-white px-4 py-3 rounded-lg outline-none focus:border-[var(--tip-red)]" />
            <input required type="text" placeholder="Senha inicial (mín. 6 caracteres)" minLength={6} value={form.senha} onChange={(e) => setForm({ ...form, senha: e.target.value })}
              className="w-full bg-[var(--bg-input)] border border-[var(--border-strong)] text-white px-4 py-3 rounded-lg outline-none focus:border-[var(--tip-red)]" />
            <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}
              className="w-full bg-[var(--bg-input)] border border-[var(--border-strong)] text-white px-4 py-3 rounded-lg outline-none focus:border-[var(--tip-red)]">
              <option value="palestrante">Palestrante</option>
              <option value="admin">Admin</option>
            </select>
            {erro && <p className="text-red-400 text-sm">{erro}</p>}
            <div className="flex gap-2">
              <button type="submit" disabled={loading}
                className="bg-[var(--tip-red)] hover:bg-[var(--tip-red-dark)] disabled:opacity-50 text-white px-5 py-2.5 font-condensed text-sm font-bold tracking-[1.3px] uppercase rounded-lg">
                {loading ? "Criando..." : "Criar"}
              </button>
              <button type="button" onClick={() => setShow(false)} className="bg-[var(--bg-surface-2)] border border-[var(--border-strong)] text-white px-5 py-2.5 font-condensed text-sm tracking-[1.3px] uppercase rounded-lg">Cancelar</button>
            </div>
          </form>
        )}
      </div>

      <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[var(--border)] bg-[var(--bg-surface-2)]">
              <th className="text-left px-6 py-3 font-condensed text-[10px] tracking-[2.5px] uppercase text-[var(--text-muted)]">Nome</th>
              <th className="text-left px-6 py-3 font-condensed text-[10px] tracking-[2.5px] uppercase text-[var(--text-muted)]">E-mail</th>
              <th className="text-left px-6 py-3 font-condensed text-[10px] tracking-[2.5px] uppercase text-[var(--text-muted)]">Tipo</th>
              <th className="text-left px-6 py-3 font-condensed text-[10px] tracking-[2.5px] uppercase text-[var(--text-muted)]">Status</th>
              <th className="px-6 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((u) => (
              <tr key={u.id} className="border-b border-[var(--border)] hover:bg-[var(--bg-surface-2)]">
                <td className="px-6 py-4 text-sm font-medium">{u.nome}</td>
                <td className="px-6 py-4 text-sm text-[var(--text-muted)]">{u.email}</td>
                <td className="px-6 py-4 text-xs font-condensed tracking-[1.5px] uppercase">{u.role}</td>
                <td className="px-6 py-4">
                  <span className={`text-xs font-condensed tracking-[1.5px] uppercase ${u.ativo ? "text-green-400" : "text-red-400"}`}>
                    {u.ativo ? "Ativo" : "Inativo"}
                  </span>
                </td>
                <td className="px-6 py-4 text-right space-x-3">
                  <button onClick={() => resetSenha(u.id)} className="font-condensed text-xs tracking-[1.5px] uppercase text-[var(--text-muted)] hover:text-white">Reset senha</button>
                  <button onClick={() => toggleAtivo(u.id, u.ativo)} className="font-condensed text-xs tracking-[1.5px] uppercase text-[var(--tip-red)] hover:underline">
                    {u.ativo ? "Desativar" : "Ativar"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
