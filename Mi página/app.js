/* ============================
   OPINIONES DEL USUARIO
   ============================ */

const formOpinion = document.getElementById('formOpinion');
const opinionesContainer = document.getElementById('opinionesContainer');

// Función que crea el elemento de opinión (Definida antes de su uso)
function agregarOpinion(texto) {
    if (!opinionesContainer) return;
    const li = document.createElement('li');
    li.className = "list-group-item";
    // Usamos el color de acento de los Patriots
    li.style.borderColor = "#C60C30"; 
    li.textContent = texto;
    opinionesContainer.appendChild(li);
}

if (formOpinion) {
    document.addEventListener('DOMContentLoaded', () => {
        const guardadas = JSON.parse(localStorage.getItem("opinionesRM")) || [];
        guardadas.forEach(op => agregarOpinion(op));
    });

    formOpinion.addEventListener('submit', e => {
        e.preventDefault();
        const texto = document.getElementById('opinionTexto').value.trim();
        if (!texto) return;

        agregarOpinion(texto);

        const guardadas = JSON.parse(localStorage.getItem("opinionesRM")) || [];
        guardadas.push(texto);
        localStorage.setItem("opinionesRM", JSON.stringify(guardadas));

        formOpinion.reset();
    });
}


/* ============================
   MODO OSCURO
   ============================ */
const body = document.body;
const toggleModeBtn = document.getElementById('toggleMode');
const modeIcon = document.getElementById('modeIcon');

function setMode(isDark) {
    if (isDark) {
        body.classList.add("dark");
        modeIcon.className = "fa-solid fa-sun";
        localStorage.setItem("rm_mode", "dark");
    } else {
        body.classList.remove("dark");
        modeIcon.className = "fa-regular fa-moon";
        localStorage.setItem("rm_mode", "light");
    }
}

if (toggleModeBtn) {
    toggleModeBtn.addEventListener("click", () => {
        setMode(!body.classList.contains("dark"));
    });
}

// Se ejecuta al cargar el script para inicializar el modo
setMode(localStorage.getItem("rm_mode") === "dark");

/* ============================
   CALENDARIO
   ============================ */
const calendarGrid = document.getElementById('calendarGrid');
const monthYear = document.getElementById('monthYear');
const prevMonth = document.getElementById('prevMonth');
const nextMonth = document.getElementById('nextMonth');

let today = new Date();
let viewMonth = today.getMonth();
let viewYear = today.getFullYear();

function loadEvents() {
    try {
        // Se mantiene la clave rm_events en localStorage para no perder datos si el usuario ya tenía eventos
        return JSON.parse(localStorage.getItem('rm_events') || '{}');
    } catch(e) { return {}; }
}
function saveEvents(events) {
    localStorage.setItem('rm_events', JSON.stringify(events));
}

function renderCalendar(month = viewMonth, year = viewYear) {
    if (!calendarGrid || !monthYear) return;

    monthYear.textContent = new Date(year, month).toLocaleString("es-ES", { month: "long", year: "numeric" });
    calendarGrid.innerHTML = "";

    // Días de la semana
    const days = ["Dom","Lun","Mar","Mie","Jue","Vie","Sab"];
    days.forEach(d => {
        const div = document.createElement("div");
        div.className = "col-12 col-sm border-0 muted";
        div.style.fontWeight='700';
        div.style.padding='.35rem';
        div.textContent = d;
        calendarGrid.appendChild(div);
    });

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const events = loadEvents();

    // Relleno inicial
    for (let i = 0; i < firstDay; i++) {
        const blank = document.createElement("div");
        blank.className = "col-12 col-sm day";
        calendarGrid.appendChild(blank);
    }

    // Días del mes
    for (let d = 1; d <= daysInMonth; d++) {
        const cell = document.createElement("div");
        cell.className = "col-12 col-sm day";
        // *** CORRECCIÓN FATAL 1: Se agregaron backticks ***
        const dateKey = `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;

        const num = document.createElement("div");
        num.className = "date-num";
        num.textContent = d;
        cell.appendChild(num);

        if (events[dateKey]) {
            events[dateKey].forEach(ev => {
                const tag = document.createElement("span");
                tag.className = "event-badge";
                tag.title = ev.desc || '';
                tag.textContent = ev.title;
                cell.appendChild(tag);
            });
        }

        cell.addEventListener("click", () => {
            const dateInput = document.getElementById("eventDate");
            if (dateInput) dateInput.value = dateKey;
            new bootstrap.Modal(document.getElementById("modalAddEvent")).show();
        });

        calendarGrid.appendChild(cell);
    }
}

if (prevMonth && nextMonth) {
    prevMonth.addEventListener("click", () => {
        if (--viewMonth < 0) { viewMonth = 11; viewYear--; }
        renderCalendar();
    });
    nextMonth.addEventListener("click", () => {
        if (++viewMonth > 11) { viewMonth = 0; viewYear++; }
        renderCalendar();
    });
}

const eventForm = document.getElementById("eventForm");

if (eventForm) {
    eventForm.addEventListener("submit", e => {
        e.preventDefault();
        const title = document.getElementById("eventTitle").value.trim();
        const date = document.getElementById("eventDate").value.trim();
        const desc = document.getElementById("eventDesc").value.trim();

        if (!title || !date) return alert("Completa los datos.");

        const events = loadEvents();
        events[date] = events[date] || [];
        events[date].push({ title, desc });

        saveEvents(events);

        // Ocultar modal correctamente con Bootstrap JS
        const modalEl = document.getElementById("modalAddEvent");
        const modalInstance = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
        modalInstance.hide();
        renderCalendar();
        alert('Evento guardado.');
    });
}

// Inicia el renderizado del calendario
if (calendarGrid) renderCalendar();

/* ============================
   UTILIDADES (escapeHtml)
   ============================ */
function escapeHtml(text) {
    return text.replace(/[&<>"']/g, function(m) {
      return {'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'}[m];
    });
}

/* ============================
   NOTAS
   ============================ */
const notesContainer = document.getElementById('notesContainer');
const btnAddNote = document.getElementById('btnAddNote');
const btnClearNotes = document.getElementById('btnClearNotes');

function loadNotes() {
    try {
        return JSON.parse(localStorage.getItem("rm_notes") || "[]");
    } catch(e) { return []; }
}
function saveNotes(notas) {
    localStorage.setItem("rm_notes", JSON.stringify(notas));
}


function renderNotes() {
    if (!notesContainer) return;

    const notes = loadNotes();
    notesContainer.innerHTML = "";

    if (notes.length === 0) {
        // *** CORRECCIÓN FATAL 2: Se agregaron comillas al string ***
        notesContainer.innerHTML = '<div class="col-12"><p class="muted">Aún no hay notas. Crea una nueva.</p></div>';
        return;
    }

    notes.forEach((note, index) => {
        const col = document.createElement("div");
        col.className = "col-md-4";
        col.innerHTML = `
            <div class="note p-3">
                <div>
                    <strong contenteditable="false" class="note-title">${escapeHtml(note.title)}</strong>
                </div>
                <div class="mt-2 note-body" contenteditable="false">${escapeHtml(note.text)}</div>
                <div class="note-actions mt-3">
                    <button class="btn btn-sm btn-outline-gold btnEdit">Editar</button>
                    <button class="btn btn-sm btn-primary btnSave d-none">Guardar</button>
                    <button class="btn btn-sm btn-danger btnDelete">Eliminar</button>
                </div>
            </div>
        `;

        const btnDelete = col.querySelector(".btnDelete");
        const btnEdit = col.querySelector(".btnEdit");
        const btnSave = col.querySelector(".btnSave");
        const titleEl = col.querySelector(".note-title");
        const bodyEl = col.querySelector(".note-body");

        // Lógica de eliminación
        btnDelete.addEventListener("click", () => {
            if (confirm('Eliminar nota?')) {
                const arr = loadNotes();
                arr.splice(index, 1);
                saveNotes(arr);
                renderNotes();
            }
        });

        // Lógica de edición
        btnEdit.addEventListener('click', ()=>{
          titleEl.contentEditable = true;
          bodyEl.contentEditable = true;
          titleEl.focus();
          btnEdit.classList.add('d-none');
          btnSave.classList.remove('d-none');
        });

        // Lógica de guardado
        btnSave.addEventListener('click', ()=>{
          titleEl.contentEditable = false;
          bodyEl.contentEditable = false;
          btnEdit.classList.remove('d-none');
          btnSave.classList.add('d-none');
          const notesNow = loadNotes();
          notesNow[index] = { title: titleEl.innerText.trim(), text: bodyEl.innerText.trim(), updated: new Date().toISOString() };
          saveNotes(notesNow);
          renderNotes();
        });

        notesContainer.appendChild(col);
    });
}

if (btnAddNote) {
    btnAddNote.addEventListener("click", () => {
        const arr = loadNotes();
        arr.unshift({ title:"Nueva nota", text:"Escribe aquí..." });
        saveNotes(arr);
        renderNotes();
    });
}

if (btnClearNotes) {
    btnClearNotes.addEventListener("click", () => {
        if (confirm("¿Eliminar todas las notas?")) {
            saveNotes([]);
            renderNotes();
        }
    });
}

if (notesContainer) renderNotes();

/* ============================
   FORMULARIO DE REGISTRO
   ============================ */
const formRegistro = document.getElementById("registroForm");

if (formRegistro) {
    formRegistro.addEventListener("submit", e => {
        e.preventDefault();
        alert("¡Registro completado!");
        formRegistro.reset();
    });
}

/* ============================
   NOTICIAS
   ============================ */
const btnRefreshNews = document.getElementById("refreshNews");

if (btnRefreshNews) {
    btnRefreshNews.addEventListener("click", () => {
        alert("Noticias actualizadas.");
    });
}

/* ============================
   CARRITO DE COMPRAS
   ============================ */
function loadCart() {
    try {
        return JSON.parse(localStorage.getItem("rm_cart") || "[]");
    } catch(e) { return []; }
}
function saveCart(cart) {
    localStorage.setItem("rm_cart", JSON.stringify(cart));
}

function renderCart() {
    const cart = loadCart();
    const cartList = document.getElementById("cartList");
    const cartTotal = document.getElementById("cartTotal");

    if (!cartList || !cartTotal) return;

    cartList.innerHTML = "";
    let total = 0;

    cart.forEach((item, index) => {
        total += Number(item.price);

        const li = document.createElement("li");
        li.className = "list-group-item d-flex justify-content-between align-items-center";
        li.innerHTML = `
            ${item.name} - ${item.price} €
            <button class="btn btn-danger btn-sm deleteCartItem" data-index="${index}">
              <i class="fa-solid fa-trash"></i>
            </button>
        `;
        cartList.appendChild(li);
    });

    cartTotal.textContent = total;

    document.querySelectorAll(".deleteCartItem").forEach(btn => {
        btn.addEventListener("click", e => {
            const targetBtn = e.target.closest("button");
            if (!targetBtn) return;

            const idx = targetBtn.dataset.index;
            const cart = loadCart();
            cart.splice(idx, 1);
            saveCart(cart);
            renderCart();
        });
    });
}

document.querySelectorAll(".addToCart").forEach(btn => {
    btn.addEventListener("click", () => {
        const name = btn.dataset.name;
        const price = Number(btn.dataset.price);

        const cart = loadCart();
        cart.push({ name, price });

        saveCart(cart);
        renderCart();
        alert("Producto añadido al carrito.");
    });
});

const clearCart = document.getElementById("clearCart");
if (clearCart) {
    clearCart.addEventListener("click", () => {
        saveCart([]);
        renderCart();
    });
}

renderCart();

/* ============================
   LISTA DE TAREAS (Consolidada desde index.html)
   ============================ */
const listaTareas = document.getElementById("listaTareas");
const inputNuevaTarea = document.getElementById("inputNuevaTarea");
const btnAgregar = document.getElementById("btnAgregarTarea");
const btnEliminarPrimero = document.getElementById("btnEliminarPrimero");

if (btnAgregar) {
  btnAgregar.addEventListener("click", () => {
    const texto = inputNuevaTarea.value.trim();
    if (texto !== "") {
      const li = document.createElement("li");
      li.className = "list-group-item";
      li.textContent = texto;
      listaTareas.appendChild(li);
      inputNuevaTarea.value = "";
    }
  });
}

if (btnEliminarPrimero) {
  btnEliminarPrimero.addEventListener("click", () => {
    if (listaTareas && listaTareas.firstElementChild) {
      listaTareas.removeChild(listaTareas.firstElementChild);
    }
  });
}

/* ============================
   GALERÍA DE IMÁGENES (Consolidada desde index.html)
   ============================ */
const inputImagen = document.getElementById("inputImagen");
const btnAgregarImagen = document.getElementById("btnAgregarImagen");
const galeria = document.getElementById("galeria");

if (btnAgregarImagen) {
  btnAgregarImagen.addEventListener("click", () => {
    const url = inputImagen.value.trim();
    if (url === "") {
      alert("Por favor ingresa una URL de imagen válida.");
      return;
    }
    const col = document.createElement("div");
    col.classList.add("col-12", "col-md-4");
    const img = document.createElement("img");
    img.src = url;
    img.alt = "Imagen agregada";
    img.classList.add("img-fluid", "rounded", "shadow");
    img.onerror = () => {
      alert("La URL no contiene una imagen válida.");
      col.remove();
    };
    col.appendChild(img);
    galeria.appendChild(col);
    inputImagen.value = "";
  });
}


/* ============================================
   API DE CAMPEONATOS – BUSCADOR (PATRIOTS)
   ============================================ */

document.addEventListener("DOMContentLoaded", () => {

  // * DATOS DE CAMPEONATOS DE LOS NEW ENGLAND PATRIOTS *
  const CAMPEONATOS_PATRIOTS = {
      "super bowl": [
          "2002 (XXXVI)", "2004 (XXXVIII)", "2005 (XXXIX)",
          "2015 (XLIX)", "2017 (LI)", "2019 (LIII)"
      ],
      "afc": [
          "1985", "1996",
          "2001", "2003", "2004", "2007",
          "2011", "2014", "2016", "2017", "2018"
      ],
      "division": [
          "1978", "1986", "1996", "1997",
          "2001", "2003", "2004", "2005", "2006", "2007",
          "2009", "2010", "2011", "2012", "2013", "2014",
          "2015", "2016", "2017", "2018", "2019", "2020"
      ]
  };

  const btnBuscarTrofeo = document.getElementById("btnBuscarTrofeo");
  const inputTrofeo = document.getElementById("searchTrofeo");
  const trofeosResultado = document.getElementById("trofeosResultado");

  function buscarTrofeo() {

      const query = inputTrofeo.value.trim().toLowerCase();
      if (trofeosResultado) trofeosResultado.innerHTML = "";

      if (!query) return;

      // Se usa el nuevo objeto de datos
      const resultados = CAMPEONATOS_PATRIOTS[query];

      if (!resultados) {
          if (trofeosResultado) {
              // *** CORRECCIÓN FATAL 3: Se agregaron comillas al string ***
              trofeosResultado.innerHTML =
                  '<li class="list-group-item text-danger">No se encontró ese campeonato. Intenta con: super bowl, afc, o division.</li>';
          }
          return;
      }

      if (trofeosResultado) {
        resultados.forEach(t => {
            const li = document.createElement("li");
            li.className = "list-group-item";
            // *** CORRECCIÓN FATAL 4: Se agregaron backticks ***
            li.textContent = `${query.toUpperCase()} – ${t}`;
            trofeosResultado.appendChild(li);
        });
      }
  }

  // Se mantienen los listeners corregidos
  if (btnBuscarTrofeo) {
      btnBuscarTrofeo.addEventListener("click", buscarTrofeo);
  }
  if (inputTrofeo) {
      inputTrofeo.addEventListener("keypress", e => {
          if (e.key === "Enter") {
            e.preventDefault();
            buscarTrofeo();
          }
      });
  }
});