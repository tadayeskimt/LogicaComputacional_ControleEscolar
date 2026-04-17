const listaTarefas = document.getElementById("listaTarefas");
const searchInput = document.getElementById("searchInput");
const modal = document.getElementById("modalUpload");
const taskInfo = document.getElementById("taskInfo");
const userName = document.getElementById("userName");

let tarefas = [];
let entregasUsuario = [];
let tarefaSelecionada = null;
let enviando = false;

const user = JSON.parse(localStorage.getItem("user"));
if (!user) window.location.href = "login.html";

userName.innerText = user.name;

function formatarData(d) {
    return new Date(d).toLocaleDateString('pt-BR');
}

function showToast(msg) {
    const t = document.getElementById("toast");
    t.innerText = msg;
    t.classList.add("show");
    setTimeout(() => t.classList.remove("show"), 3000);
}

async function carregarDados() {
    const { data: tarefasData } = await supabase
        .from("tarefas")
        .select("*")
        .order("created_at", { ascending: false });

    const { data: entregasData } = await supabase
        .from("entregas")
        .select("*")
        .eq("user_id", user.id);

    tarefas = tarefasData || [];
    entregasUsuario = entregasData || [];

    renderTarefas(tarefas);
}

function jaEnviou(tarefaId) {
    return entregasUsuario.some(e => e.tarefa_id === tarefaId);
}

function renderTarefas(lista) {
    listaTarefas.innerHTML = "";

    lista.forEach(t => {

        const enviado = jaEnviou(t.id);

        const card = document.createElement("div");
        card.className = "task-card";

        if (enviado) card.classList.add("enviado");

        card.innerHTML = `
            <div class="task-header">
                <h2>${t.disciplina}</h2>
                <span class="code">${t.codigo}</span>
            </div>

            <div class="task-info-box">
                <p><strong>Professor:</strong> ${t.professor}</p>
                <p><strong>Data:</strong> ${formatarData(t.data)} às ${t.hora}</p>
                <p><strong>Criado em:</strong> ${formatarData(t.created_at)}</p>
            </div>

            <div class="task-desc">${t.descricao}</div>

            ${enviado ? `<div class="status">✔ Enviado</div>` : ""}
        `;

        card.onclick = () => {
            if (enviado) {
                showToast("Você já enviou essa tarefa");
                return;
            }

            tarefaSelecionada = t;
            taskInfo.innerHTML = `${t.disciplina} - ${t.codigo}`;
            modal.classList.add("show");
        };

        listaTarefas.appendChild(card);
    });
}

searchInput.addEventListener("input", function () {
    const v = this.value.toLowerCase();

    renderTarefas(
        tarefas.filter(t =>
            t.disciplina.toLowerCase().includes(v) ||
            t.codigo.toLowerCase().includes(v)
        )
    );
});

fecharModal.onclick = () => modal.classList.remove("show");
cancelarBtn.onclick = () => modal.classList.remove("show");

uploadForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (enviando) return;
    enviando = true;

    const file = arquivo.files[0];
    if (!file) {
        enviando = false;
        return showToast("Selecione um arquivo");
    }

    const fileName = `${Date.now()}-${file.name.replace(/\s/g, "_")}`;

    const { error } = await supabase
        .storage
        .from("Escola")
        .upload(fileName, file);

    if (error) {
        enviando = false;
        return showToast("Erro ao enviar arquivo");
    }

    const url = supabase
        .storage
        .from("Escola")
        .getPublicUrl(fileName).data.publicUrl;

    await supabase.from("entregas").insert({
        tarefa_id: tarefaSelecionada.id,
        user_id: user.id,
        descricao: descricaoEntrega.value,
        arquivo_url: url
    });

    showToast("Enviado com sucesso!");

    modal.classList.remove("show");
    uploadForm.reset();

    await carregarDados();

    enviando = false;
});

logout.onclick = () => {
    localStorage.removeItem("user");
    window.location.href = "login.html";
};

carregarDados();