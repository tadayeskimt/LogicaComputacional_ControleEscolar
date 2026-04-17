const listaTarefas = document.getElementById('listaTarefas');
const listaUsuarios = document.getElementById('listaUsuarios');

const loading = document.getElementById('loading');
const loadingUsuarios = document.getElementById('loadingUsuarios');

const emptyState = document.getElementById('emptyState');
const emptyUsuarios = document.getElementById('emptyUsuarios');

const modal = document.getElementById('modalTarefa');
const modalConfirm = document.getElementById('modalConfirm');
const modalEntregas = document.getElementById('modalEntregas');

const listaEntregas = document.getElementById('listaEntregas');

const btnNovaTarefa = document.getElementById('btnNovaTarefa');
const fecharModal = document.getElementById('fecharModal');
const logout = document.getElementById('logout');
const confirmDelete = document.getElementById('confirmDelete');
const cancelDelete = document.getElementById('cancelDelete');
const fecharEntregas = document.getElementById('fecharEntregas');

let tarefaParaExcluir = null;
let usuarioParaExcluir = null;
let carregandoEntregas = false;

const user = JSON.parse(localStorage.getItem("user"));
if (!user || user.role !== "admin") {
    window.location.href = "login.html";
}

function formatarData(d) {
    return new Date(d).toLocaleDateString('pt-BR');
}

function gerarCodigo() {
    return 'EVT-' + Math.random().toString(36).substr(2, 8).toUpperCase();
}

btnNovaTarefa.onclick = () => modal.classList.add('show');
fecharModal.onclick = () => modal.classList.remove('show');
fecharEntregas.onclick = () => modalEntregas.classList.remove('show');

document.getElementById('tarefaForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    await supabase.from("tarefas").insert({
        professor: professor.value,
        disciplina: disciplina.value,
        data: data.value,
        hora: hora.value,
        localizacao: localizacao.value,
        descricao: descricao.value,
        codigo: gerarCodigo()
    });

    modal.classList.remove('show');
    e.target.reset();
    carregarTarefas();
});

async function carregarTarefas() {
    loading.style.display = 'flex';
    listaTarefas.innerHTML = "";
    emptyState.classList.add('hidden');

    const { data } = await supabase
        .from("tarefas")
        .select("*")
        .order("created_at", { ascending: false });

    const { data: entregas } = await supabase
        .from("entregas")
        .select("tarefa_id");

    loading.style.display = 'none';

    if (!data || !data.length) {
        emptyState.classList.remove('hidden');
        return;
    }

    data.forEach(t => {
        const temEntrega = entregas.some(e => e.tarefa_id === t.id);

        const div = document.createElement('div');
        div.className = 'tarefa-card';

        div.innerHTML = `
            <div class="tarefa-header">
                <h3>${t.disciplina}</h3>
                <span class="codigo">${t.codigo}</span>
            </div>

            <div class="tarefa-desc">${t.descricao}</div>

            <div class="tarefa-footer">
                ${temEntrega ? `<span class="tarefa-badge">Com entregas</span>` : `<span></span>`}
                <div>
                    <button class="btn-ver" onclick="verEntregas('${t.id}')">Ver entregas</button>
                    <button class="btn-delete" onclick="abrirConfirmTarefa('${t.id}')">Excluir</button>
                </div>
            </div>
        `;

        listaTarefas.appendChild(div);
    });
}

async function carregarUsuarios() {
    loadingUsuarios.style.display = 'flex';
    listaUsuarios.innerHTML = "";
    emptyUsuarios.classList.add('hidden');

    const { data } = await supabase
        .from("users")
        .select("id, name, email, role")
        .order("name");

    loadingUsuarios.style.display = 'none';

    const usuariosFiltrados = data?.filter(u => u.role !== "admin") || [];

    if (!usuariosFiltrados.length) {
        emptyUsuarios.classList.remove('hidden');
        return;
    }

    usuariosFiltrados.forEach(u => {
        const li = document.createElement('li');

        li.innerHTML = `
            <div class="user-id">${u.id}</div>
            <div><strong>${u.name}</strong></div>
            <div class="user-email">${u.email}</div>
            <button class="btn-delete-user" onclick="abrirConfirmUser('${u.id}')">Excluir</button>
        `;

        listaUsuarios.appendChild(li);
    });
}

async function verEntregas(tarefaId) {
    if (carregandoEntregas) return;

    carregandoEntregas = true;
    listaEntregas.innerHTML = "";

    const { data } = await supabase
        .from("entregas")
        .select("*, users(name,email)")
        .eq("tarefa_id", tarefaId);

    listaEntregas.innerHTML = "";

    data.forEach(e => {
        const div = document.createElement('div');
        div.className = 'entrega-item';

        div.innerHTML = `
            <strong>${e.users?.name || "Usuário"}</strong><br>
            ${e.users?.email || ""}<br>
            <p>${e.descricao}</p>
            <a href="${e.arquivo_url}" target="_blank">Baixar arquivo</a>
        `;

        listaEntregas.appendChild(div);
    });

    modalEntregas.classList.add('show');

    carregandoEntregas = false;
}

window.verEntregas = verEntregas;

window.abrirConfirmTarefa = (id) => {
    tarefaParaExcluir = id;
    modalConfirm.classList.add('show');
};

window.abrirConfirmUser = (id) => {
    usuarioParaExcluir = id;
    modalConfirm.classList.add('show');
};

confirmDelete.onclick = async () => {

    if (tarefaParaExcluir) {
        await supabase.from("tarefas").delete().eq("id", tarefaParaExcluir);
        tarefaParaExcluir = null;
        carregarTarefas();
    }

    if (usuarioParaExcluir) {
        await supabase.from("users").delete().eq("id", usuarioParaExcluir);
        usuarioParaExcluir = null;
        carregarUsuarios();
    }

    modalConfirm.classList.remove('show');
};

cancelDelete.onclick = () => {
    modalConfirm.classList.remove('show');
    tarefaParaExcluir = null;
    usuarioParaExcluir = null;
};

logout.onclick = () => {
    localStorage.removeItem("user");
    window.location.href = "login.html";
};

carregarTarefas();
carregarUsuarios();