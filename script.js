// ==========================================
// PONTO DE ACHADO
// JAVASCRIPT PRINCIPAL
// ==========================================


// ==========================================
// ELEMENTOS
// ==========================================

const form =
    document.getElementById("itemForm");

const itemsContainer =
    document.getElementById("items");

const feedback =
    document.getElementById("feedback");

const searchInput =
    document.getElementById("busca");

const imagemInput =
    document.getElementById("imagem");

const previewContainer =
    document.getElementById(
        "previewContainer"
    );

const ordenacao =
    document.getElementById("ordenacao");


// ==========================================
// ESTADO DA APLICAÇÃO
// ==========================================

let filtroAtual =
    "todos";

let termoBusca =
    "";

let itemEditando =
    null;


// ==========================================
// DADOS
// ==========================================

let itens =
    JSON.parse(
        localStorage.getItem(
            "pontoDeAchado"
        )
    ) || [];


// ==========================================
// INICIALIZAÇÃO
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        carregarItens();

        configurarFiltros();

        configurarBusca();

        configurarUpload();

        configurarOrdenacao();

        atualizarContadores();

    }
);


// ==========================================
// SALVAR DADOS
// ==========================================

function salvarItens() {

    localStorage.setItem(
        "pontoDeAchado",
        JSON.stringify(itens)
    );

}


// ==========================================
// GERAR ID
// ==========================================

function gerarId() {

    return (
        Date.now().toString() +
        Math.random()
            .toString(16)
            .slice(2)
    );

}


// ==========================================
// FEEDBACK
// ==========================================

function mostrarFeedback(
    mensagem,
    tipo = "sucesso"
) {

    feedback.textContent =
        mensagem;

    feedback.style.display =
        "block";


    if (tipo === "erro") {

        feedback.style.background =
            "#fee2e2";

        feedback.style.color =
            "#991b1b";

    } else {

        feedback.style.background =
            "#dcfce7";

        feedback.style.color =
            "#166534";

    }


    clearTimeout(
        window.feedbackTimer
    );


    window.feedbackTimer =
        setTimeout(() => {

            feedback.style.display =
                "none";

        }, 3500);

}


// ==========================================
// VALIDAR FORMULÁRIO
// ==========================================

function validarFormulario() {

    const tipo =
        document
            .getElementById("tipo")
            .value;

    const nome =
        document
            .getElementById("nome")
            .value
            .trim();

    const descricao =
        document
            .getElementById("descricao")
            .value
            .trim();

    const local =
        document
            .getElementById("local")
            .value
            .trim();

    const contato =
        document
            .getElementById("contato")
            .value
            .trim();


    if (!tipo) {

        mostrarFeedback(
            "Selecione o tipo do registro.",
            "erro"
        );

        return false;

    }


    if (nome.length < 2) {

        mostrarFeedback(
            "Informe um nome válido para o item.",
            "erro"
        );

        return false;

    }


    if (descricao.length < 5) {

        mostrarFeedback(
            "A descrição precisa ter pelo menos 5 caracteres.",
            "erro"
        );

        return false;

    }


    if (local.length < 2) {

        mostrarFeedback(
            "Informe o local.",
            "erro"
        );

        return false;

    }


    if (contato.length < 5) {

        mostrarFeedback(
            "Informe uma forma de contato.",
            "erro"
        );

        return false;

    }


    return true;

}


// ==========================================
// CADASTRO
// ==========================================

form.addEventListener(
    "submit",
    event => {

        event.preventDefault();


        if (!validarFormulario()) {

            return;

        }


        if (itemEditando) {

            atualizarItem();

            return;

        }


        const novoItem = {

            id:
                gerarId(),

            tipo:
                document
                    .getElementById("tipo")
                    .value,

            nome:
                document
                    .getElementById("nome")
                    .value
                    .trim(),

            descricao:
                document
                    .getElementById("descricao")
                    .value
                    .trim(),

            local:
                document
                    .getElementById("local")
                    .value
                    .trim(),

            contato:
                document
                    .getElementById("contato")
                    .value
                    .trim(),

            imagem:
                "",

            resolvido:
                false,

            favorito:
                false,

            data:
                new Date().toISOString()

        };


        // Verifica se existe imagem

        if (
            imagemInput.files.length > 0
        ) {

            const arquivo =
                imagemInput.files[0];


            const leitor =
                new FileReader();


            leitor.onload =
                event => {

                    novoItem.imagem =
                        event.target.result;

                    finalizarCadastro(
                        novoItem
                    );

                };


            leitor.readAsDataURL(
                arquivo
            );

        } else {

            finalizarCadastro(
                novoItem
            );

        }

    }
);


// ==========================================
// FINALIZAR CADASTRO
// ==========================================

function finalizarCadastro(item) {

    itens.unshift(item);

    salvarItens();

    renderizarItens();

    form.reset();

    limparPreview();


    mostrarFeedback(
        "✓ Item cadastrado com sucesso!"
    );

}


// ==========================================
// CARREGAR ITENS
// ==========================================

function carregarItens() {

    renderizarItens();

}


// ==========================================
// RENDERIZAR ITENS
// ==========================================

function renderizarItens() {

    itemsContainer.innerHTML =
        "";


    const itensFiltrados =
        obterItensFiltrados();


    if (
        itensFiltrados.length === 0
    ) {

        mostrarEstadoVazio();

        atualizarContadores();

        return;

    }


    itensFiltrados.forEach(
        item => {

            const card =
                criarCard(item);

            itemsContainer.appendChild(
                card
            );

        }
    );


    atualizarContadores();

}


// ==========================================
// FILTRAR ITENS
// ==========================================

function obterItensFiltrados() {

    return itens.filter(
        item => {

            const correspondeFiltro =
                filtroAtual === "todos" ||
                item.tipo === filtroAtual;


            const texto =
                `
                ${item.nome}
                ${item.descricao}
                ${item.local}
                ${item.contato}
                `.toLowerCase();


            const correspondeBusca =
                texto.includes(
                    termoBusca.toLowerCase()
                );


            return (
                correspondeFiltro &&
                correspondeBusca
            );

        }
    );

}


// ==========================================
// CRIAR CARD
// ==========================================

function criarCard(item) {

    const card =
        document.createElement(
            "article"
        );


    card.className =
        "item-card";


    card.dataset.id =
        item.id;


    const tipoTexto =
        item.tipo === "perdido"
            ? "PERDIDO"
            : "ENCONTRADO";


    const classeTipo =
        item.tipo === "perdido"
            ? "tag-perdido"
            : "tag-encontrado";


    let imagemHTML;


    if (item.imagem) {

        imagemHTML = `
            <img
                class="item-image"
                src="${item.imagem}"
                alt="${escaparHTML(item.nome)}"
            >
        `;

    } else {

        imagemHTML = `
            <div class="no-image">
                📦
            </div>
        `;

    }


    card.innerHTML = `

        ${imagemHTML}

        <div class="item-content">

            <div class="tags">

                <span class="tag ${
                    item.resolvido
                        ? "tag-resolvido"
                        : classeTipo
                }">

                    ${
                        item.resolvido
                            ? "✓ RESOLVIDO"
                            : tipoTexto
                    }

                </span>


                <button
                    class="favorite-btn"
                    data-action="favorito"
                    type="button"
                    title="Favoritar item"
                >

                    ${
                        item.favorito
                            ? "❤️"
                            : "♡"
                    }

                </button>

            </div>


            <h3>
                ${escaparHTML(item.nome)}
            </h3>


            <p class="description">
                ${escaparHTML(item.descricao)}
            </p>


            <div class="item-info">

                <span>
                    📍
                    ${escaparHTML(item.local)}
                </span>

                <span>
                    📞
                    ${escaparHTML(item.contato)}
                </span>

                <span>
                    📅
                    ${formatarData(item.data)}
                </span>

            </div>


            <div class="item-status">

                ${
                    item.resolvido

                        ? `
                            <button
                                class="btn btn-outline resolve-btn"
                                disabled
                            >
                                ✓ Item resolvido
                            </button>
                        `

                        : `
                            <button
                                class="btn btn-success resolve-btn"
                                data-action="resolver"
                                type="button"
                            >

                                ${
                                    item.tipo === "perdido"

                                        ? "Marcar como devolvido"

                                        : "Marcar como resolvido"

                                }

                            </button>
                        `
                }


                <div class="card-actions">

                    <button
                        class="btn btn-outline"
                        data-action="detalhes"
                        type="button"
                    >
                        Detalhes
                    </button>


                    <button
                        class="btn btn-outline"
                        data-action="editar"
                        type="button"
                    >
                        Editar
                    </button>


                    <button
                        class="btn btn-outline"
                        data-action="excluir"
                        type="button"
                    >
                        Excluir
                    </button>

                </div>

            </div>

        </div>
    `;


    configurarAcoes(card);


    return card;

}


// ==========================================
// AÇÕES DOS CARDS
// ==========================================

function configurarAcoes(card) {

    card.addEventListener(
        "click",
        event => {

            const botao =
                event.target.closest(
                    "button"
                );


            if (!botao) {

                return;

            }


            const acao =
                botao.dataset.action;


            const id =
                card.dataset.id;


            if (
                acao === "resolver"
            ) {

                resolverItem(id);

            }


            if (
                acao === "favorito"
            ) {

                alternarFavorito(id);

            }


            if (
                acao === "detalhes"
            ) {

                mostrarDetalhes(id);

            }


            if (
                acao === "editar"
            ) {

                editarItem(id);

            }


            if (
                acao === "excluir"
            ) {

                excluirItem(id);

            }

        }
    );

}


// ==========================================
// RESOLVER ITEM
// ==========================================

function resolverItem(id) {

    const item =
        itens.find(
            item => item.id === id
        );


    if (!item) {

        return;

    }


    item.resolvido =
        true;


    salvarItens();

    renderizarItens();


    mostrarFeedback(
        "✓ Item marcado como resolvido!"
    );

}


// ==========================================
// FAVORITAR
// ==========================================

function alternarFavorito(id) {

    const item =
        itens.find(
            item => item.id === id
        );


    if (!item) {

        return;

    }


    item.favorito =
        !item.favorito;


    salvarItens();

    renderizarItens();


    mostrarFeedback(
        item.favorito
            ? "❤️ Item adicionado aos favoritos!"
            : "Item removido dos favoritos."
    );

}


// ==========================================
// EXCLUIR ITEM
// ==========================================

function excluirItem(id) {

    const item =
        itens.find(
            item => item.id === id
        );


    if (!item) {

        return;

    }


    const confirmar =
        confirm(
            `Deseja realmente excluir "${item.nome}"?`
        );


    if (!confirmar) {

        return;

    }


    itens =
        itens.filter(
            item => item.id !== id
        );


    salvarItens();

    renderizarItens();


    mostrarFeedback(
        "Item excluído com sucesso."
    );

}


// ==========================================
// EDITAR ITEM
// ==========================================

function editarItem(id) {

    const item =
        itens.find(
            item => item.id === id
        );


    if (!item) {

        return;

    }


    document.getElementById(
        "tipo"
    ).value =
        item.tipo;


    document.getElementById(
        "nome"
    ).value =
        item.nome;


    document.getElementById(
        "descricao"
    ).value =
        item.descricao;


    document.getElementById(
        "local"
    ).value =
        item.local;


    document.getElementById(
        "contato"
    ).value =
        item.contato;


    itemEditando =
        item.id;


    const botao =
        form.querySelector(
            'button[type="submit"]'
        );


    botao.textContent =
        "Salvar alterações";


    form.scrollIntoView({
        behavior: "smooth"
    });


    mostrarFeedback(
        "Edite as informações e clique em salvar."
    );

}


// ==========================================
// ATUALIZAR ITEM
// ==========================================

function atualizarItem() {

    const item =
        itens.find(
            item =>
                item.id === itemEditando
        );


    if (!item) {

        return;

    }


    item.tipo =
        document.getElementById(
            "tipo"
        ).value;


    item.nome =
        document.getElementById(
            "nome"
        ).value.trim();


    item.descricao =
        document.getElementById(
            "descricao"
        ).value.trim();


    item.local =
        document.getElementById(
            "local"
        ).value.trim();


    item.contato =
        document.getElementById(
            "contato"
        ).value.trim();


    itemEditando =
        null;


    salvarItens();

    renderizarItens();

    form.reset();

    limparPreview();


    form.querySelector(
        'button[type="submit"]'
    ).textContent =
        "+ Cadastrar item";


    mostrarFeedback(
        "✓ Item atualizado com sucesso!"
    );

}


// ==========================================
// DETALHES
// ==========================================

function mostrarDetalhes(id) {

    const item =
        itens.find(
            item => item.id === id
        );


    if (!item) {

        return;

    }


    const tipo =
        item.tipo === "perdido"
            ? "Perdido"
            : "Encontrado";


    const status =
        item.resolvido
            ? "Resolvido"
            : "Pendente";


    alert(
        `
PONTO DE ACHADO

ITEM:
${item.nome}

TIPO:
${tipo}

DESCRIÇÃO:
${item.descricao}

LOCAL:
${item.local}

CONTATO:
${item.contato}

STATUS:
${status}

CADASTRADO EM:
${formatarData(item.data)}
        `
    );

}


// ==========================================
// FILTROS
// ==========================================

function configurarFiltros() {

    document
        .querySelectorAll(
            ".filter-btn"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        document
                            .querySelectorAll(
                                ".filter-btn"
                            )
                            .forEach(
                                btn => {

                                    btn.classList.remove(
                                        "active"
                                    );

                                }
                            );


                        button.classList.add(
                            "active"
                        );


                        filtroAtual =
                            button.dataset.filter;


                        renderizarItens();

                    }
                );

            }
        );

}


// ==========================================
// BUSCA
// ==========================================

function configurarBusca() {

    searchInput.addEventListener(
        "input",
        event => {

            termoBusca =
                event.target.value
                    .trim();


            renderizarItens();

        }
    );

}


// ==========================================
// ORDENAÇÃO
// ==========================================

function configurarOrdenacao() {

    ordenacao.addEventListener(
        "change",
        () => {

            ordenarItens(
                ordenacao.value
            );

        }
    );

}


function ordenarItens(tipo) {

    if (
        tipo === "recentes"
    ) {

        itens.sort(
            (a, b) =>
                new Date(b.data) -
                new Date(a.data)
        );

    }


    if (
        tipo === "antigos"
    ) {

        itens.sort(
            (a, b) =>
                new Date(a.data) -
                new Date(b.data)
        );

    }


    if (
        tipo === "nome"
    ) {

        itens.sort(
            (a, b) =>
                a.nome.localeCompare(
                    b.nome,
                    "pt-BR"
                )
        );

    }


    if (
        tipo === "favoritos"
    ) {

        itens.sort(
            (a, b) =>
                Number(b.favorito) -
                Number(a.favorito)
        );

    }


    salvarItens();

    renderizarItens();

}


// ==========================================
// UPLOAD DA IMAGEM
// ==========================================

function configurarUpload() {

    imagemInput.addEventListener(
        "change",
        () => {

            const arquivo =
                imagemInput.files[0];


            if (!arquivo) {

                limparPreview();

                return;

            }


            if (
                !arquivo.type.startsWith(
                    "image/"
                )
            ) {

                mostrarFeedback(
                    "Selecione uma imagem válida.",
                    "erro"
                );


                imagemInput.value =
                    "";


                limparPreview();

                return;

            }


            const leitor =
                new FileReader();


            leitor.onload =
                event => {

                    previewContainer.innerHTML =
                        `
                            <img
                                src="${event.target.result}"
                                class="preview-image"
                                alt="Pré-visualização do item"
                            >
                        `;

                };


            leitor.readAsDataURL(
                arquivo
            );

        }
    );

}


// ==========================================
// LIMPAR PREVIEW
// ==========================================

function limparPreview() {

    previewContainer.innerHTML =
        "";

}


// ==========================================
// CONTADORES
// ==========================================

function atualizarContadores() {

    const total =
        itens.length;


    const perdidos =
        itens.filter(
            item =>
                item.tipo === "perdido"
        ).length;


    const encontrados =
        itens.filter(
            item =>
                item.tipo === "encontrado"
        ).length;


    const resolvidos =
        itens.filter(
            item =>
                item.resolvido
        ).length;


    atualizarElemento(
        "contadorTotal",
        total
    );


    atualizarElemento(
        "contadorPerdidos",
        perdidos
    );


    atualizarElemento(
        "contadorEncontrados",
        encontrados
    );


    atualizarElemento(
        "contadorResolvidos",
        resolvidos
    );

}


// ==========================================
// ATUALIZAR ELEMENTO
// ==========================================

function atualizarElemento(
    id,
    valor
) {

    const elemento =
        document.getElementById(id);


    if (elemento) {

        elemento.textContent =
            valor;

    }

}


// ==========================================
// ESTADO VAZIO
// ==========================================

function mostrarEstadoVazio() {

    const vazio =
        document.createElement(
            "div"
        );


    vazio.className =
        "empty";


    vazio.innerHTML = `

        <div class="empty-icon">
            🔎
        </div>

        <h3>
            Nenhum item encontrado
        </h3>

        <p>
            Tente mudar o filtro ou
            realizar outra pesquisa.
        </p>

    `;


    itemsContainer.appendChild(
        vazio
    );

}


// ==========================================
// FORMATAR DATA
// ==========================================

function formatarData(data) {

    return new Date(data)
        .toLocaleDateString(
            "pt-BR",
            {
                day: "2-digit",
                month: "2-digit",
                year: "numeric"
            }
        );

}


// ==========================================
// PROTEGER HTML
// ==========================================

function escaparHTML(texto) {

    const div =
        document.createElement(
            "div"
        );


    div.textContent =
        texto;


    return div.innerHTML;

}


// ==========================================
// ATALHOS DE TECLADO
// ==========================================

// Ctrl + K → abrir busca

document.addEventListener(
    "keydown",
    event => {

        if (
            event.ctrlKey &&
            event.key.toLowerCase() === "k"
        ) {

            event.preventDefault();

            searchInput.focus();

        }


        // ESC → limpar pesquisa

        if (
            event.key === "Escape"
        ) {

            searchInput.value =
                "";

            termoBusca =
                "";

            renderizarItens();

        }

    }
);


// ==========================================
// DUPLO CLIQUE NO CARD
// ==========================================

itemsContainer.addEventListener(
    "dblclick",
    event => {

        const card =
            event.target.closest(
                ".item-card"
            );


        if (!card) {

            return;

        }


        mostrarDetalhes(
            card.dataset.id
        );

    }
);
