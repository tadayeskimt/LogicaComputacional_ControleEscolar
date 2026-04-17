function showToast(msg) {
    const t = document.getElementById("toast");
    t.innerText = msg;
    t.classList.add("show");
    setTimeout(() => t.classList.remove("show"), 3000);
}

window.register = async function (event) {
    event.preventDefault();

    const btn = document.getElementById("registerBtn");
    btn.classList.add("loading");

    const name = document.getElementById("registerName").value;
    const email = document.getElementById("registerEmail").value;
    const password = document.getElementById("registerPassword").value;

    const { data: existente } = await window.supabase
        .from("users")
        .select("id")
        .ilike("email", email)
        .maybeSingle();

    if (existente) {
        btn.classList.remove("loading");
        return showToast("Email já cadastrado");
    }

    const { data, error } = await window.supabase
        .from("users")
        .insert({
            email,
            password,
            name,
            role: "user"
        })
        .select("id, email, name, role")
        .single();

    btn.classList.remove("loading");

    if (error) {
        return showToast("Erro ao cadastrar");
    }

    showToast("Conta criada com sucesso");

    localStorage.setItem("user", JSON.stringify({
        id: data.id,
        email: data.email,
        name: data.name,
        role: data.role
    }));

    window.location.href = "user.html";
};

window.login = async function (event) {
    event.preventDefault();

    const btn = document.getElementById("loginBtn");
    btn.classList.add("loading");

    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;

    const { data, error } = await window.supabase
        .from("users")
        .select("id, email, name, role")
        .eq("email", email)
        .eq("password", password)
        .maybeSingle();

    btn.classList.remove("loading");

    if (error || !data) {
        return showToast("Email ou senha inválidos");
    }

    showToast("Login realizado com sucesso");

    localStorage.setItem("user", JSON.stringify({
        id: data.id,
        email: data.email,
        name: data.name,
        role: data.role
    }));

    setTimeout(() => {
        if (data.role === "admin") {
            window.location.href = "admin.html";
        } else {
            window.location.href = "user.html";
        }
    }, 800);
};

window.logout = function () {
    localStorage.removeItem("user");
    window.location.href = "login.html";
};