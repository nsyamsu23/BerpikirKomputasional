// -------------------------------------------------------------
// DATA CHECKPOINTS PENYELAMAN PALUNG MARIANA (BERPIKIR KOMPUTASIONAL)
// -------------------------------------------------------------
const CHECKPOINTS_DATA = [
    {
        id: "cp1",
        number: 0,
        title: "Pengenalan Berpikir Komputasional",
        description: "Kamu sudah pernah belajar Berpikir Komputasional di kelas 7 dan 8. Apakah kamu masih mengingatnya? Yuk, kita ingat kembali dengan menjawab tiga pertanyaan berikut!",
        x: 500,
        y: 180,
        status: "available", // available, completed
        progress: 0
    },
    {
        id: "cp2",
        number: 1,
        title: "Dekomposisi – Memecah Masalah Menjadi Bagian Kecil",
        description: "Misi Mesopelagik: Pelajari cara membagi tugas rumit perbaikan kapal selam menjadi sub-bagian mandiri agar pengerjaannya terasa ringan dan sistematis.",
        x: 350,
        y: 650,
        status: "available",
        progress: 0
    },
    {
        id: "cp3",
        number: 2,
        title: "Pengenalan Pola – Menemukan Kesamaan dan Keteraturan",
        description: "Misi Batipelagik: Kenali pola warna pancaran bioluminesen gurita laut dalam untuk mendeteksi bahaya sebelum kapal selam didekati oleh mereka.",
        x: 650,
        y: 1150,
        status: "available",
        progress: 0
    },
    {
        id: "cp4",
        number: 3,
        title: "Abstraksi – Memilih Informasi yang Penting",
        description: "Misi Abisopelagik: Saat darurat sensor bocor lambung, buang seluruh data ubur-ubur luar dan fokus hanya pada meteran tekanan agar selamat.",
        x: 300,
        y: 1650,
        status: "available",
        progress: 0
    },
    {
        id: "cp5",
        number: 4,
        title: "Algoritma – Menyusun Langkah-Langkah Penyelesaian",
        description: "Misi Hadalpelagik: Susun instruksi autopilot kapal selam melewati celah retakan sempit berurutan agar kemudi meluncur mulus.",
        x: 680,
        y: 2150,
        status: "available",
        progress: 0
    },
    {
        id: "cp6",
        number: 5,
        title: "Implementasi – Menerapkan Solusi dalam Keseharian",
        description: "Misi Challenger Deep: Selamat! Terapkan seluruh pilar di dasar terdalam untuk memprogram sinyal sonar riset akhir dan raih gelar lulus ekspedisi!",
        x: 500,
        y: 2650,
        status: "available",
        progress: 0
    }
];

// State Manager
let checkpoints = [...CHECKPOINTS_DATA];
let currentActiveCheckpointId = "cp1";

const transform = {
    x: 0,
    y: 0,
    scale: 1
};

// UI Elements
const viewport = document.getElementById('viewport');
const mapContent = document.getElementById('map-content');
const checkpointsOverlay = document.getElementById('checkpoints-overlay');
const playerMarker = document.getElementById('player-marker');
const sheetOverlay = document.getElementById('sheet-overlay');
const bottomSheet = document.getElementById('bottom-sheet');

// HUD Control buttons
const btnZoomReset = document.getElementById('btn-zoom-reset');

// Bottom sheet elements
const stageNum = document.getElementById('stage-num');
const stageTitle = document.getElementById('stage-title');
const btnCloseSheet = document.getElementById('btn-close-sheet');

// -------------------------------------------------------------
// PROGRESS MANAGER (CLEAN INITIALIZATION)
// -------------------------------------------------------------
function initProgress() {
    updateMarkerPosition(true);
}

// -------------------------------------------------------------
// RENDER CHECKPOINTS OVERLAY
// -------------------------------------------------------------
function renderCheckpoints() {
    checkpointsOverlay.innerHTML = '';

    checkpoints.forEach(cp => {
        const btn = document.createElement('button');

        // Determine dynamic visual state: active (submarine is here), completed, or available
        let displayStatus = 'available';
        if (cp.status === 'completed') {
            displayStatus = 'completed';
        }
        if (cp.id === currentActiveCheckpointId) {
            displayStatus = 'active'; // Focus/pulsing ring on the active submarine node
        }

        btn.className = `checkpoint-btn ${displayStatus}`;
        btn.style.left = `${cp.x}px`;
        btn.style.top = `${cp.y}px`;
        btn.id = `btn-${cp.id}`;

        btn.setAttribute('aria-label', `Pos ${cp.number}: ${cp.title}. Status: ${getStatusLabel(displayStatus)}`);

        btn.addEventListener('click', () => {
            openCheckpointDetails(cp.id);
        });

        checkpointsOverlay.appendChild(btn);
    });
}

function getStatusLabel(status) {
    switch (status) {
        case 'locked': return 'Terkunci';
        case 'available': return 'Tersedia';
        case 'active': return 'Aktif';
        case 'completed': return 'Selesai';
        default: return '';
    }
}

function updateMarkerPosition(immediate = false) {
    const activeCp = checkpoints.find(cp => cp.id === currentActiveCheckpointId);
    if (!activeCp) return;

    if (immediate) {
        playerMarker.style.transition = 'none';
        playerMarker.style.left = `${activeCp.x}px`;
        playerMarker.style.top = `${activeCp.y}px`;
        playerMarker.offsetHeight; // Force reflow
        playerMarker.style.transition = '';
    } else {
        playerMarker.style.left = `${activeCp.x}px`;
        playerMarker.style.top = `${activeCp.y}px`;
    }
}

// -------------------------------------------------------------
// GESTURE & VIEWPORT CONTROLS (PAN & PINCH ZOOM)
// -------------------------------------------------------------
const activePointers = new Map();
let isDragging = false;
let startPanX = 0;
let startPanY = 0;
let startPointerX = 0;
let startPointerY = 0;

function applyTransform() {
    mapContent.style.transform = `translate3d(${transform.x}px, ${transform.y}px, 0) scale(${transform.scale})`;
}

function getFitScale() {
    // Zoomed-in detailed scale for immersive close-up view
    const width = viewport ? viewport.clientWidth : window.innerWidth;
    return width < 768 ? 0.95 : 1.15;
}

function clampCoordinates(x, y, scale) {
    const vWidth = viewport ? viewport.clientWidth : window.innerWidth;
    const vHeight = viewport ? viewport.clientHeight : window.innerHeight;

    const minX = vWidth - 1000 * scale;
    const minY = vHeight - 2800 * scale;

    let clampedX = x;
    let clampedY = y;

    // Clamp Y (Vertical) - Prevent showing background top/bottom
    if (2800 * scale >= vHeight) {
        clampedY = Math.min(Math.max(y, minY), 0);
    } else {
        clampedY = (vHeight - 2800 * scale) / 2;
    }

    // Clamp X (Horizontal) - Allow dragging left/right if wider than container, else center
    if (1000 * scale >= vWidth) {
        clampedX = Math.min(Math.max(x, minX), 0);
    } else {
        clampedX = (vWidth - 1000 * scale) / 2;
    }

    return { x: clampedX, y: clampedY };
}

function clampAndApply(keepScale = true) {
    if (!keepScale) transform.scale = getFitScale();

    const clamped = clampCoordinates(transform.x, transform.y, transform.scale);
    transform.x = clamped.x;
    transform.y = clamped.y;

    applyTransform();
}

// Pointer Events Hook
viewport.addEventListener('pointerdown', (e) => {
    if (e.target.closest('.checkpoint-btn') || e.target.closest('.hud-btn') || e.target.closest('.bottom-sheet') || e.target.closest('#welcome-panel')) {
        return;
    }

    viewport.setPointerCapture(e.pointerId);
    activePointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

    // Dragging only (no pinch zoom)
    if (activePointers.size === 1) {
        isDragging = true;
        startPanX = transform.x;
        startPanY = transform.y;
        startPointerX = e.clientX;
        startPointerY = e.clientY;
    }
});

viewport.addEventListener('pointermove', (e) => {
    if (!activePointers.has(e.pointerId)) return;

    activePointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (isDragging && activePointers.size === 1) {
        const dx = e.clientX - startPointerX;
        const dy = e.clientY - startPointerY;
        transform.x = startPanX + dx;
        transform.y = startPanY + dy;
        clampAndApply();
    }
});

function releasePointer(e) {
    if (activePointers.has(e.pointerId)) {
        activePointers.delete(e.pointerId);
        viewport.releasePointerCapture(e.pointerId);
    }

    if (activePointers.size === 0) {
        isDragging = false;
    }
}

viewport.addEventListener('pointerup', releasePointer);
viewport.addEventListener('pointercancel', releasePointer);

// Mouse Wheel maps vertical scrolling
viewport.addEventListener('wheel', (e) => {
    e.preventDefault();
    transform.y -= e.deltaY * 0.9;
    clampAndApply();
}, { passive: false });

// -------------------------------------------------------------
// CAMERA TRANSITIONS (SMOOTH EASING ALIGNMENT)
// -------------------------------------------------------------
let cameraTween = null;

function centerOn(cx, cy, immediate = false) {
    const vWidth = viewport ? viewport.clientWidth : window.innerWidth;
    const vHeight = viewport ? viewport.clientHeight : window.innerHeight;

    // Choose optimal scale based on device orientation/screen width
    const targetScale = getFitScale();

    let rawX = (vWidth / 2) - cx * targetScale;
    let rawY = (vHeight / 2) - cy * targetScale;

    // Apply strict coordinate boundary clamping to camera focus target
    const clamped = clampCoordinates(rawX, rawY, targetScale);
    const targetX = clamped.x;
    const targetY = clamped.y;

    if (immediate || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        if (cameraTween) cameraTween.kill();
        transform.scale = targetScale;
        transform.x = targetX;
        transform.y = targetY;
        applyTransform();
    } else {
        smoothAnimateCamera(targetX, targetY, targetScale);
    }
}

function smoothAnimateCamera(tx, ty, ts) {
    if (cameraTween) cameraTween.kill();

    // Smooth camera viewport transition using GSAP
    cameraTween = gsap.to(transform, {
        x: tx,
        y: ty,
        scale: ts,
        duration: 0.8,
        ease: "power2.out",
        onUpdate: applyTransform,
        onComplete: () => {
            clampAndApply();
        }
    });
}

// -------------------------------------------------------------
// DETAILED BOTTOM SHEET / SIDE PANEL CONTROL
// -------------------------------------------------------------
let selectedCheckpointId = null;
let cp1QuizSlideIndex = 0;
let cp1UserAnswers = [null, null, null];
let hasTriggeredCp1Confetti = false;

const CP1_QUESTIONS = [
    {
        question: "Apa yang dimaksud dengan dekomposisi?",
        options: [
            { key: "A", text: "Memecah masalah besar menjadi bagian-bagian kecil" },
            { key: "B", text: "Menghapus semua informasi" },
            { key: "C", text: "Menebak jawaban tanpa langkah-langkah" }
        ],
        correct: "A"
    },
    {
        question: "Kegiatan mencari kesamaan atau keteraturan dalam suatu masalah disebut ....",
        options: [
            { key: "A", text: "Algoritma" },
            { key: "B", text: "Pengenalan pola" },
            { key: "C", text: "Debugging" }
        ],
        correct: "B"
    },
    {
        question: "Urutan langkah-langkah yang disusun untuk menyelesaikan suatu masalah disebut ....",
        options: [
            { key: "A", text: "Abstraksi" },
            { key: "B", text: "Dekomposisi" },
            { key: "C", text: "Algoritma" }
        ],
        correct: "C"
    }
];

const ZONES_QUIZ_DATA = {
    cp2: {
        title: "Dekomposisi – Memecah Masalah",
        videoUrl: "https://www.youtube-nocookie.com/embed/KtiQnt7fWOY",
        introText: "Halo guys! Dekomposisi itu gampangnya adalah cara kita memecah masalah yang gede dan ribet jadi bagian-bagian kecil yang lebih gampang diselesaikan. Contohnya: Bayangin kamu disuruh benerin sepeda yang rusak. Pusing kan? Tapi kalau kamu bagi-bagi tugasnya: cek ban, cek rantai, cek rem... nah, jadi lebih gampang kan? Itulah dekomposisi! 🛠️",
        videoText: "Keren! Dengan memisahkan mesin, oksigen, dan radar, kita bisa langsung cek bagian mana yang rusak tanpa pusing mikirin seluruh kapal selam sekaligus! Biar makin mantap paham dekomposisi, yuk tonton video seru berikut!"
    },
    cp3: {
        title: "Pengenalan Pola – Menemukan Kesamaan",
        videoUrl: "https://www.youtube-nocookie.com/embed/t06aGAwnxvE",
        introText: "Hai kawan! Pengenalan Pola itu adalah cara kita melihat kesamaan, keteraturan, atau kemiripan dari masalah-masalah yang pernah kita hadapi sebelumnya. Kalau kita udah tahu polanya, kita bisa nebak atau nyari solusi dengan lebih cepat. Contohnya: Kamu tahu kalau mendung gelap dan ada petir, sebentar lagi pasti hujan. Nah, itu karena kamu udah hafal polanya! 🌧️",
        videoText: "Cerdas sekali! Kamu berhasil mengenali pola agresif berdasarkan warna mata dan cara mereka berenang. Kapal selam aman! Yuk, simak video berikut untuk memperdalam pemahamanmu tentang pengenalan pola!"
    },
    cp4: {
        title: "Abstraksi – Memilih Informasi Penting",
        introText: "Nah, sekarang kita belajar Abstraksi. Abstraksi itu intinya adalah fokus pada info-info yang penting aja dan cuekin/abaikan detail yang gak penting. Contohnya: Kalau kamu gambar peta rumah untuk temenmu, kamu cuma gambar jalan utama dan belokannya aja kan? Kamu gak bakal gambar setiap pohon atau kucing yang ada di pinggir jalan. Itulah abstraksi! 🗺️",
        resultText: "Tepat sekali! Saat darurat lambung kapal bocor, informasi tentang ubur-ubur atau warna terumbu karang sama sekali gak penting dan harus diabaikan (di-abstraksi). Yang vital hanyalah tekanan lambung dan suplai oksigen kita. Selamat, kamu berhasil menerapkan pilar abstraksi!"
    },
    cp5: {
        title: "Algoritma – Menyusun Langkah-Langkah",
        introText: "Halo guys! Algoritma itu intinya adalah menyusun langkah-langkah terperinci dan berurutan untuk menyelesaikan suatu masalah. Contohnya: Bayangin kamu mau bikin mi instan. Langkahnya harus urut kan? Rebus air dulu, masukin mi, tirisin, baru campur bumbu. Kalau kamu campur bumbu ke air mentah sebelum direbus, rasanya pasti kacau kan? Nah, langkah berurutan itulah algoritma! 🍜",
        resultText: "Hebat! Urutan langkahmu presisi dan berurutan. Kapal selam berhasil melewati celah sempit dengan selamat tanpa menabrak dinding batu tektonik! Itulah penerapan dari algoritma!"
    }
};

const zoneQuizStates = {
    cp2: { slideIndex: 0, userAnswer: [], errorMessage: "" },  // Selected part IDs
    cp3: { slideIndex: 0, userAnswer: {}, errorMessage: "" },  // Creature classifications (index -> choice)
    cp4: { slideIndex: 0, userAnswer: [], errorMessage: "" },  // Hidden detail indexes
    cp5: { slideIndex: 0, userAnswer: [], errorMessage: "" }   // Step click order sequence
};

function openCheckpointDetails(id) {
    const cp = checkpoints.find(c => c.id === id);
    if (!cp) return; // All checkpoints are unlocked and available to open

    selectedCheckpointId = id;
    centerOn(cp.x, cp.y, false);

    // Fill text content
    stageNum.innerHTML = `<i class="bx bx-compass"></i> ZONA ${cp.number}`;
    stageTitle.innerText = cp.title;

    // Load content dynamically
    if (id === 'cp1') {
        // If already completed, go straight to result slide (4), else start at intro (0)
        cp1QuizSlideIndex = cp.status === 'completed' ? 4 : 0;
        if (cp1QuizSlideIndex === 4) {
            bottomSheet.classList.add('large-format');
        } else {
            bottomSheet.classList.remove('large-format');
        }
        renderCp1Quiz();
    } else if (id === 'cp6') {
        // ZONA 5: Implementasi - Tampilan Judul, Deskripsi, dan tombol Kerjakan Soal (link Google Form)
        bottomSheet.classList.remove('large-format');
        renderCp6Content(cp);
    } else if (ZONES_QUIZ_DATA[id]) {
        const state = zoneQuizStates[id];
        // If already completed, go straight to final slide (2), else start at intro (0)
        state.slideIndex = cp.status === 'completed' ? 2 : 0;

        if (state.slideIndex === 2 && (id === 'cp2' || id === 'cp3')) {
            bottomSheet.classList.add('large-format');
        } else {
            bottomSheet.classList.remove('large-format');
        }
        renderZoneQuiz(id);
    } else {
        bottomSheet.classList.remove('large-format');
        renderStandardCheckpointContent(cp);
    }

    sheetOverlay.classList.add('open');
}

function renderStandardCheckpointContent(cp) {
    const sheetContentArea = document.getElementById('sheet-content-area');
    if (!sheetContentArea) return;

    const isCompleted = cp.status === 'completed';
    sheetContentArea.innerHTML = `
        <p class="stage-desc">${cp.description}</p>
        
        <div class="stage-status-box">
            <span class="status-dot ${cp.status}"></span>
            <span id="stage-status-text">${getStatusLabel(cp.status)}</span>
        </div>
        
        <div class="sheet-actions">
            <button class="btn-action primary" id="btn-toggle-checkpoint">
                ${isCompleted ? '<i class="bx bx-undo"></i> Tandai Belum Selesai' : '<i class="bx bx-check-circle"></i> Selesaikan Pos'}
            </button>
        </div>
    `;

    const btnToggle = document.getElementById('btn-toggle-checkpoint');
    if (btnToggle) {
        btnToggle.addEventListener('click', () => {
            toggleCheckpointCompletion(cp.id);
        });
        btnToggle.focus();
    }
}

// -------------------------------------------------------------
// RENDER ZONA 5 (IMPLEMENTASI) - JUDUL, DESKRIPSI, TOMBOL KERJAKAN SOAL
// -------------------------------------------------------------
function renderCp6Content(cp) {
    const sheetContentArea = document.getElementById('sheet-content-area');
    if (!sheetContentArea) return;

    const isCompleted = cp.status === 'completed';
    const formUrl = "https://forms.gle/nPrmAeEEczkVDav87";

    sheetContentArea.innerHTML = `
        <div class="cp6-content">
            <div class="cp6-icon-wrap">
                <i class="bx bx-trophy"></i>
            </div>
            <h3 class="cp6-title">${cp.title}</h3>
            <p class="cp6-desc">${cp.description}</p>

            <div class="stage-status-box">
                <span class="status-dot ${cp.status}"></span>
                <span id="stage-status-text">${getStatusLabel(cp.status)}</span>
            </div>

            <div class="sheet-actions cp6-actions">
                <a href="${formUrl}" target="_blank" rel="noopener noreferrer" class="btn-action primary btn-kerjakan-soal" id="btn-kerjakan-soal">
                    <i class="bx bx-edit"></i> Kerjakan Soal
                </a>
            </div>

            <div class="sheet-actions">
                <button class="btn-action ${isCompleted ? 'btn-toggle-off' : 'btn-toggle-on'}" id="btn-cp6-toggle">
                    ${isCompleted ? '<i class="bx bx-undo"></i> Belum Selesai' : '<i class="bx bx-check-double"></i> Tandai Selesai'}
                </button>
            </div>
        </div>
    `;

    const btnToggle = document.getElementById('btn-cp6-toggle');
    if (btnToggle) {
        btnToggle.addEventListener('click', () => {
            toggleCheckpointCompletion(cp.id);
        });
    }
}

function renderZoneQuiz(id) {
    const sheetContentArea = document.getElementById('sheet-content-area');
    if (!sheetContentArea) return;

    const cp = checkpoints.find(c => c.id === id);
    const quizData = ZONES_QUIZ_DATA[id];
    const state = zoneQuizStates[id];
    const totalSlides = 3; // Slide 0: Intro, Slide 1: Interactive Mission, Slide 2: Video/Result

    // Ensure large-format is set on video slide (slide index 2 for cp2 and cp3), reset on others
    if (state.slideIndex === 2 && (id === 'cp2' || id === 'cp3')) {
        bottomSheet.classList.add('large-format');
    } else {
        bottomSheet.classList.remove('large-format');
    }

    let html = '';

    if (state.slideIndex === 0) {
        html = `
            <div class="slide-container">
                <div class="slide-content">
                    <p class="slide-text slide-text-left">
                        ${quizData.introText}
                    </p>
                </div>
                <div class="slide-actions">
                    <button class="btn-action primary" id="btn-zone-start">
                        Mulai Misi <i class="bx bx-right-arrow-alt"></i>
                    </button>
                </div>
            </div>
        `;
    } else if (state.slideIndex === 1) {
        html = `<div class="slide-container"><div class="slide-content">`;

        if (id === 'cp2') {
            // DEKOMPOSISI PUZZLE: Multi-select parts
            const parts = [
                { id: "propulsion", text: "Mesin Propulsi ⚙️" },
                { id: "oxygen", text: "Tabung Oksigen 💨" },
                { id: "sonar", text: "Radar Sonar 📡" },
                { id: "paint", text: "Warna Cat Kapal 🎨" },
                { id: "jellyfish", text: "Ubur-ubur Lucu 🪼" },
                { id: "coral", text: "Terumbu Karang 🪸" }
            ];

            html += `
                <h3 class="quiz-question-title">Misi: Dekomposisi Kapal Selam</h3>
                <p class="slide-text slide-text-left slide-text-sm">
                    Kapal selam mogok! Klik untuk memilih **3 komponen utama** yang harus diperiksa secara terpisah:
                </p>
                <div class="interactive-grid">
                    ${parts.map(part => {
                const isSelected = state.userAnswer.includes(part.id);
                return `
                            <button class="interactive-card-btn ${isSelected ? 'selected' : ''}" data-part="${part.id}">
                                <i class="bx ${part.id === 'propulsion' ? 'bx-cog' : (part.id === 'oxygen' ? 'bx-wind' : (part.id === 'sonar' ? 'bx-broadcast' : (part.id === 'paint' ? 'bx-paint' : (part.id === 'jellyfish' ? 'bx-ghost' : 'bx-leaf'))))}"></i>
                                <span class="card-label">${part.text}</span>
                            </button>
                        `;
            }).join('')}
                </div>
            `;
        } else if (id === 'cp3') {
            // PENGENALAN POLA PUZZLE: Categorizing creatures
            const creatures = [
                { idx: 0, text: "Gurita Merah (Mata merah & berkelompok)" },
                { idx: 1, text: "Gurita Biru (Mata biru & sendirian)" },
                { idx: 2, text: "Gurita Kuning (Mata merah & berkelompok)" }
            ];

            html += `
                <h3 class="quiz-question-title">Misi: Pengenalan Pola Bahaya</h3>
                <p class="slide-text slide-text-left slide-text-sm slide-text-mb-sm">
                    Kelompokkan gurita berikut berdasarkan polanya (Mata Merah + Rombongan = Agresif, Mata Biru + Sendiri = Aman):
                </p>
                <div class="vertical-stack">
                    ${creatures.map(c => {
                const ans = state.userAnswer[c.idx];
                return `
                            <div class="pattern-sort-card">
                                <div class="pattern-sort-header">
                                    <i class="bx bx-jellyfish icon-accent"></i>
                                    <span>${c.text}</span>
                                </div>
                                <div class="pattern-sort-actions">
                                    <button class="pattern-sort-btn ${ans === 'agresif' ? 'selected-agresif' : ''}" data-idx="${c.idx}" data-val="agresif">🔴 Agresif</button>
                                    <button class="pattern-sort-btn ${ans === 'aman' ? 'selected-bersahabat' : ''}" data-idx="${c.idx}" data-val="aman">🔵 Aman</button>
                                </div>
                            </div>
                        `;
            }).join('')}
                </div>
            `;
        } else if (id === 'cp4') {
            // ABSTRAKSI PUZZLE: Filter unimportant info
            const panels = [
                { idx: 0, text: "Tekanan Lambung Kapal (Vital)" },
                { idx: 1, text: "Suhu Air Di Luar Kapal (Detail)" },
                { idx: 2, text: "Spesies Gurita Melintas (Detail)" },
                { idx: 3, text: "Sisa Kadar Oksigen (Vital)" },
                { idx: 4, text: "Jumlah Pasir di Bawah (Detail)" }
            ];

            html += `
                <h3 class="quiz-question-title">Misi: Menyaring Informasi (Abstraksi)</h3>
                <p class="slide-text slide-text-left slide-text-sm">
                    Kebocoran terdeteksi! **Klik 3 informasi DETAIL TIDAK PENTING** untuk dibuang dari layar agar tersisa data vital saja:
                </p>
                <div class="vertical-stack">
                    ${panels.map(p => {
                const isHidden = state.userAnswer.includes(p.idx);
                return `
                            <div class="abstraction-panel ${isHidden ? 'hidden-detail' : ''}" data-idx="${p.idx}">
                                <span class="abstraction-panel-title">${p.text}</span>
                                <span class="panel-status">${isHidden ? '❌ Terbuang' : '👁️ Tampil'}</span>
                            </div>
                        `;
            }).join('')}
                </div>
            `;
        } else if (id === 'cp5') {
            // ALGORITMA PUZZLE: Sequence order
            const steps = [
                { idx: 0, text: "Belokkan kemudi melewati celah" },
                { idx: 1, text: "Aktifkan radar sonar pencari jalan" },
                { idx: 2, text: "Pelankan kecepatan kapal selam" }
            ];

            html += `
                <h3 class="quiz-question-title">Misi: Menyusun Navigasi (Algoritma)</h3>
                <p class="slide-text slide-text-left slide-text-sm">
                    Klik langkah-langkah navigasi autopilot di bawah secara berurutan (1, 2, 3) agar lolos celah batuan:
                </p>
                <div class="algorithm-scrambled-list">
                    ${steps.map(s => {
                const orderIdx = state.userAnswer.indexOf(s.idx);
                const isOrdered = orderIdx !== -1;
                return `
                            <button class="algorithm-step-btn ${isOrdered ? 'ordered' : ''}" data-idx="${s.idx}">
                                ${isOrdered ? `<span class="order-num">${orderIdx + 1}</span>` : '<span class="order-num order-num-empty">?</span>'}
                                <span>${s.text}</span>
                            </button>
                        `;
            }).join('')}
                </div>
            `;
        }

        // Render the warning status message placeholder for failed attempts
        html += `
            <p class="mission-status-msg" id="mission-status-msg">
                ${state.errorMessage || ""}
            </p>
        `;

        html += `</div>`; // Close slide-content

        html += `
            <div class="slide-actions">
                <button class="btn-action btn-ghost btn-ghost-narrow" id="btn-zone-prev">
                    <i class="bx bx-left-arrow-alt"></i>
                </button>
                <button class="btn-action primary" id="btn-zone-submit">
                    Periksa Misi <i class="bx bx-check-circle"></i>
                </button>
            </div>
        `;

        html += `</div>`; // Close slide-container
    } else if (state.slideIndex === 2) {
        const isCompleted = cp.status === 'completed';
        const hasVideo = id === 'cp2' || id === 'cp3';

        html = `
            <div class="slide-container">
                <div class="slide-content slide-content-top">
                    <p class="slide-text slide-text-left slide-text-result">
                        ${hasVideo ? quizData.videoText : quizData.resultText}
                    </p>
                    ${hasVideo ? `
                        <div class="video-container">
                            <iframe src="${quizData.videoUrl}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
                        </div>
                    ` : ''}
                </div>
                <div class="slide-actions">
                    <button class="btn-action btn-ghost btn-ghost-wide" id="btn-zone-replay">
                        <i class="bx bx-refresh"></i> Ulangi Misi
                    </button>
                    <button class="btn-action primary ${isCompleted ? 'btn-toggle-off' : 'btn-toggle-on'}" id="btn-zone-complete">
                        ${isCompleted ? '<i class="bx bx-undo"></i> Belum Selesai' : '<i class="bx bx-check-double"></i> Tandai Selesai'}
                    </button>
                </div>
            </div>
        `;
    }

    // Pagination Indicators
    html += `
        <div class="slide-indicators">
            ${Array.from({ length: totalSlides }).map((_, idx) => `
                <div class="slide-indicator-dot ${state.slideIndex === idx ? 'active' : ''} ${idx < state.slideIndex ? 'completed' : ''}"></div>
            `).join('')}
        </div>
    `;

    sheetContentArea.innerHTML = html;

    // Trigger shake animation immediately if there's an error message
    if (state.slideIndex === 1 && state.errorMessage) {
        const msgEl = document.getElementById('mission-status-msg');
        if (msgEl) {
            msgEl.style.animation = 'none';
            msgEl.offsetHeight; // trigger reflow
            msgEl.style.animation = 'optionShake 0.4s ease';
        }
    }

    // Helper to clear error when user interacts
    const clearError = () => {
        state.errorMessage = "";
        const msgEl = document.getElementById('mission-status-msg');
        if (msgEl) msgEl.innerText = "";
    };

    // Bind Event Listeners
    const btnStart = document.getElementById('btn-zone-start');
    if (btnStart) {
        btnStart.addEventListener('click', () => {
            state.slideIndex = 1;
            state.errorMessage = "";
            renderZoneQuiz(id);
        });
    }

    const btnPrev = document.getElementById('btn-zone-prev');
    if (btnPrev) {
        btnPrev.addEventListener('click', () => {
            if (state.slideIndex > 0) state.slideIndex--;
            state.errorMessage = "";
            renderZoneQuiz(id);
        });
    }

    const btnReplay = document.getElementById('btn-zone-replay');
    if (btnReplay) {
        btnReplay.addEventListener('click', () => {
            state.slideIndex = 0;
            state.errorMessage = "";
            // Clear inputs based on zone type
            if (id === 'cp3') state.userAnswer = {};
            else state.userAnswer = [];
            renderZoneQuiz(id);
        });
    }

    const btnComplete = document.getElementById('btn-zone-complete');
    if (btnComplete) {
        btnComplete.addEventListener('click', () => {
            toggleCheckpointCompletion(id);
        });
    }

    // Slide 1 Custom Event Listeners
    if (state.slideIndex === 1) {
        if (id === 'cp2') {
            const cardBtns = document.querySelectorAll('.interactive-card-btn');
            cardBtns.forEach(btn => {
                btn.addEventListener('click', () => {
                    clearError();
                    const pId = btn.getAttribute('data-part');
                    if (state.userAnswer.includes(pId)) {
                        state.userAnswer = state.userAnswer.filter(item => item !== pId);
                    } else {
                        // Max 3 selections
                        if (state.userAnswer.length < 3) {
                            state.userAnswer.push(pId);
                        }
                    }
                    renderZoneQuiz(id);
                });
            });
        } else if (id === 'cp3') {
            const sortBtns = document.querySelectorAll('.pattern-sort-btn');
            sortBtns.forEach(btn => {
                btn.addEventListener('click', () => {
                    clearError();
                    const idx = parseInt(btn.getAttribute('data-idx'));
                    const val = btn.getAttribute('data-val');
                    state.userAnswer[idx] = val;
                    renderZoneQuiz(id);
                });
            });
        } else if (id === 'cp4') {
            const pnlBtns = document.querySelectorAll('.abstraction-panel');
            pnlBtns.forEach(btn => {
                btn.addEventListener('click', () => {
                    clearError();
                    const idx = parseInt(btn.getAttribute('data-idx'));
                    const isImportant = idx === 0 || idx === 3;

                    if (isImportant) {
                        // Clicked important vital telemetry info -> trigger red warning flash
                        btn.style.borderColor = '#ff3333';
                        btn.style.boxShadow = '0 0 10px rgba(255, 51, 51, 0.4)';
                        setTimeout(() => {
                            btn.style.borderColor = '';
                            btn.style.boxShadow = '';
                        }, 800);
                    } else {
                        if (state.userAnswer.includes(idx)) {
                            state.userAnswer = state.userAnswer.filter(item => item !== idx);
                        } else {
                            state.userAnswer.push(idx);
                        }
                        renderZoneQuiz(id);
                    }
                });
            });
        } else if (id === 'cp5') {
            const stepBtns = document.querySelectorAll('.algorithm-step-btn');
            stepBtns.forEach(btn => {
                btn.addEventListener('click', () => {
                    clearError();
                    const idx = parseInt(btn.getAttribute('data-idx'));
                    const existPos = state.userAnswer.indexOf(idx);

                    if (existPos !== -1) {
                        state.userAnswer = state.userAnswer.filter(item => item !== idx);
                    } else {
                        state.userAnswer.push(idx);
                    }
                    renderZoneQuiz(id);
                });
            });
        }

        // Validation check on submit
        const btnSubmit = document.getElementById('btn-zone-submit');
        if (btnSubmit) {
            btnSubmit.addEventListener('click', () => {
                let correct = false;

                if (id === 'cp2') {
                    const correctParts = ['propulsion', 'oxygen', 'sonar'];
                    const answers = state.userAnswer;
                    correct = answers.length === 3 && correctParts.every(p => answers.includes(p));

                    const btns = document.querySelectorAll('.interactive-card-btn');
                    btns.forEach(btn => {
                        const pId = btn.getAttribute('data-part');
                        if (answers.includes(pId)) {
                            if (answers.length !== 3) {
                                btn.classList.add('incorrect');
                            } else {
                                btn.classList.add(correctParts.includes(pId) ? 'correct' : 'incorrect');
                            }
                            btn.disabled = true;
                        }
                    });

                    if (correct) {
                        state.errorMessage = "";
                        setTimeout(() => {
                            state.slideIndex = 2;
                            renderZoneQuiz(id);
                        }, 1200);
                    } else {
                        state.errorMessage = answers.length !== 3
                            ? "Pilih tepat 3 komponen penting kapal selam! Kurang atau kelebihan nih. 🛠️"
                            : "Aduh, masih belum tepat nih! Beberapa komponen yang kamu pilih salah. 🛠️";

                        // Render message immediately
                        const msgEl = document.getElementById('mission-status-msg');
                        if (msgEl) {
                            msgEl.innerText = state.errorMessage;
                            msgEl.style.animation = 'none';
                            msgEl.offsetHeight;
                            msgEl.style.animation = 'optionShake 0.4s ease';
                        }

                        // Shake the grid immediately
                        const grid = document.querySelector('.interactive-grid');
                        if (grid) {
                            grid.style.animation = 'none';
                            grid.offsetHeight;
                            grid.style.animation = 'optionShake 0.4s ease';
                        }

                        setTimeout(() => {
                            state.userAnswer = [];
                            renderZoneQuiz(id);
                        }, 1300);
                    }
                } else if (id === 'cp3') {
                    const answers = state.userAnswer;
                    const answersCount = Object.keys(answers).length;
                    correct = answersCount === 3 && answers[0] === 'agresif' && answers[1] === 'aman' && answers[2] === 'agresif';

                    const cards = document.querySelectorAll('.pattern-sort-card');
                    cards.forEach((card, idx) => {
                        const chosen = answers[idx];
                        const rightVal = idx === 1 ? 'aman' : 'agresif';
                        const btns = card.querySelectorAll('.pattern-sort-btn');
                        btns.forEach(btn => {
                            const val = btn.getAttribute('data-val');
                            if (val === chosen) {
                                if (answersCount !== 3) {
                                    btn.classList.add('incorrect');
                                } else {
                                    btn.classList.add(val === rightVal ? 'correct' : 'incorrect');
                                }
                                btn.disabled = true;
                            }
                        });
                    });

                    if (correct) {
                        state.errorMessage = "";
                        setTimeout(() => {
                            state.slideIndex = 2;
                            renderZoneQuiz(id);
                        }, 1200);
                    } else {
                        state.errorMessage = answersCount !== 3
                            ? "Klasifikasikan dulu semua gurita yang ada di layar! 🐙"
                            : "Ups, klasifikasi polanya masih keliru! Coba periksa kesamaan matanya... 🐙";

                        // Render message immediately
                        const msgEl = document.getElementById('mission-status-msg');
                        if (msgEl) {
                            msgEl.innerText = state.errorMessage;
                            msgEl.style.animation = 'none';
                            msgEl.offsetHeight;
                            msgEl.style.animation = 'optionShake 0.4s ease';
                        }

                        // Shake the cards
                        cards.forEach(c => {
                            c.style.animation = 'none';
                            c.offsetHeight;
                            c.style.animation = 'optionShake 0.4s ease';
                        });

                        setTimeout(() => {
                            state.userAnswer = {};
                            renderZoneQuiz(id);
                        }, 1350);
                    }
                } else if (id === 'cp4') {
                    const answers = state.userAnswer;
                    const correctHides = [1, 2, 4];
                    correct = answers.length === 3 && correctHides.every(idx => answers.includes(idx));

                    // Mark each panel correct/incorrect and disable it during validation
                    const pnls = document.querySelectorAll('.abstraction-panel');
                    pnls.forEach(p => {
                        const idx = parseInt(p.getAttribute('data-idx'));
                        if (answers.includes(idx)) {
                            if (answers.length !== 3) {
                                p.classList.add('incorrect');
                            } else {
                                p.classList.add(correctHides.includes(idx) ? 'correct' : 'incorrect');
                            }
                            p.style.pointerEvents = 'none';
                        }
                    });

                    if (correct) {
                        state.errorMessage = "";
                        setTimeout(() => {
                            state.slideIndex = 2;
                            renderZoneQuiz(id);
                        }, 1200);
                    } else {
                        state.errorMessage = answers.length !== 3
                            ? "Buang tepat 3 detail tidak penting dari layar monitor! 🚨"
                            : "Bahaya! Data vital terancam terbuang atau detail tidak penting masih tersisa! 🚨";

                        // Render message immediately
                        const msgEl = document.getElementById('mission-status-msg');
                        if (msgEl) {
                            msgEl.innerText = state.errorMessage;
                            msgEl.style.animation = 'none';
                            msgEl.offsetHeight;
                            msgEl.style.animation = 'optionShake 0.4s ease';
                        }

                        pnls.forEach(p => {
                            p.style.animation = 'none';
                            p.offsetHeight;
                            p.style.animation = 'optionShake 0.4s ease';
                        });

                        setTimeout(() => {
                            state.userAnswer = [];
                            renderZoneQuiz(id);
                        }, 1300);
                    }
                } else if (id === 'cp5') {
                    const answers = state.userAnswer;
                    correct = answers.length === 3 && answers[0] === 1 && answers[1] === 2 && answers[2] === 0;

                    const btns = document.querySelectorAll('.algorithm-step-btn');
                    btns.forEach(btn => {
                        const idx = parseInt(btn.getAttribute('data-idx'));
                        if (answers.includes(idx)) {
                            if (answers.length !== 3) {
                                btn.classList.add('incorrect');
                            } else {
                                btn.classList.add(correct ? 'correct' : 'incorrect');
                            }
                            btn.disabled = true;
                        }
                    });

                    if (correct) {
                        state.errorMessage = "";
                        setTimeout(() => {
                            state.slideIndex = 2;
                            renderZoneQuiz(id);
                        }, 1200);
                    } else {
                        state.errorMessage = answers.length !== 3
                            ? "Urutkan dulu seluruh langkah navigasi autopilot kapal selam! 🧭"
                            : "Autopilot gagal! Langkah navigasi tidak urut. Silakan susun ulang... 🧭";

                        // Render message immediately
                        const msgEl = document.getElementById('mission-status-msg');
                        if (msgEl) {
                            msgEl.innerText = state.errorMessage;
                            msgEl.style.animation = 'none';
                            msgEl.offsetHeight;
                            msgEl.style.animation = 'optionShake 0.4s ease';
                        }

                        const list = document.querySelector('.algorithm-scrambled-list');
                        if (list) {
                            list.style.animation = 'none';
                            list.offsetHeight;
                            list.style.animation = 'optionShake 0.4s ease';
                        }

                        setTimeout(() => {
                            state.userAnswer = [];
                            renderZoneQuiz(id);
                        }, 1300);
                    }
                }
            });
        }
    }
}

function renderCp1Quiz() {
    const sheetContentArea = document.getElementById('sheet-content-area');
    if (!sheetContentArea) return;

    const totalSlides = 5;
    let html = '';

    if (cp1QuizSlideIndex === 0) {
        // Slide 0: Intro
        html = `
            <div class="slide-container">
                <div class="slide-content">
                    <p class="slide-text">
                        Kamu sudah pernah belajar Berpikir Komputasional di kelas 7 dan 8. Apakah kamu masih mengingatnya? Yuk, kita ingat kembali dengan menjawab tiga pertanyaan berikut!
                    </p>
                </div>
                <div class="slide-actions">
                    <button class="btn-action primary" id="btn-start-quiz">
                        Mulai Kuis <i class="bx bx-right-arrow-alt"></i>
                    </button>
                </div>
            </div>
        `;
    } else if (cp1QuizSlideIndex >= 1 && cp1QuizSlideIndex <= 3) {
        // Slide 1, 2, 3: Questions
        const qIndex = cp1QuizSlideIndex - 1;
        const qData = CP1_QUESTIONS[qIndex];
        const selected = cp1UserAnswers[qIndex];

        html = `
            <div class="slide-container">
                <div class="slide-content">
                    <h3 class="quiz-question-title">Pertanyaan ${cp1QuizSlideIndex}/3</h3>
                    <p class="slide-text slide-text-left slide-text-question">
                        ${qData.question}
                    </p>
                    <div class="quiz-options ${selected ? 'disabled' : ''}">
                        ${qData.options.map(opt => {
            let feedbackClass = '';
            if (selected) {
                if (opt.key === qData.correct) {
                    feedbackClass = 'correct';
                } else if (opt.key === selected) {
                    feedbackClass = 'incorrect';
                }
            }
            return `
                                <button class="quiz-option-btn ${feedbackClass} ${selected === opt.key ? 'selected' : ''}" data-key="${opt.key}" ${selected ? 'disabled' : ''}>
                                    <span class="badge">${opt.key}</span>
                                    <span>${opt.text}</span>
                                </button>
                            `;
        }).join('')}
                    </div>
                </div>
                <div class="slide-actions">
                    <button class="btn-action btn-ghost btn-ghost-narrow" id="btn-quiz-prev">
                        <i class="bx bx-left-arrow-alt"></i>
                    </button>
                    <button class="btn-action primary" id="btn-quiz-next" ${selected ? '' : 'disabled class="btn-disabled"'}>
                        Lanjut <i class="bx bx-right-arrow-alt"></i>
                    </button>
                </div>
            </div>
        `;
    } else if (cp1QuizSlideIndex === 4) {
        // Slide 4: Results & Video - Expand card size
        bottomSheet.classList.add('large-format');

        const isAllCorrect = cp1UserAnswers[0] === 'A' && cp1UserAnswers[1] === 'B' && cp1UserAnswers[2] === 'C';
        const resultMsg = isAllCorrect
            ? "Wah, kamu hebat! Ternyata kamu masih mengingat materi Berpikir Komputasional. Biar makin mantap, yuk simak video berikut ini!"
            : "Tidak apa-apa, kamu sudah berusaha dengan baik! Agar kamu dapat mengingat dan memahami kembali materi Berpikir Komputasional, yuk simak video berikut ini!";

        // Fire celebratory confetti from the bottom so it doesn't block the YouTube player
        if (isAllCorrect && !hasTriggeredCp1Confetti) {
            hasTriggeredCp1Confetti = true;
            triggerTempConfetti(0.95, 60);
        }

        const cp = checkpoints.find(c => c.id === 'cp1');
        const isCompleted = cp.status === 'completed';

        html = `
            <div class="slide-container">
                <div class="slide-content slide-content-top">
                    <p class="slide-text slide-text-left slide-text-result-title">
                        ${isAllCorrect ? '🎉 Semua Benar!' : '✍️ Kuis Selesai'}
                    </p>
                    <p class="slide-text slide-text-left slide-text-result-body">
                        ${resultMsg}
                    </p>
                    <div class="video-container">
                        <iframe src="https://www.youtube-nocookie.com/embed/jCb9fpPrxLc" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
                    </div>
                </div>
                <div class="slide-actions">
                    <button class="btn-action btn-ghost btn-ghost-wide" id="btn-quiz-replay">
                        <i class="bx bx-refresh"></i> Ulangi Kuis
                    </button>
                    <button class="btn-action primary ${isCompleted ? 'btn-toggle-off' : 'btn-toggle-on'}" id="btn-quiz-complete">
                        ${isCompleted ? '<i class="bx bx-undo"></i> Belum Selesai' : '<i class="bx bx-check-double"></i> Tandai Selesai'}
                    </button>
                </div>
            </div>
        `;
    }

    // Pagination Indicators
    html += `
        <div class="slide-indicators">
            ${Array.from({ length: totalSlides }).map((_, idx) => `
                <div class="slide-indicator-dot ${cp1QuizSlideIndex === idx ? 'active' : ''} ${idx < cp1QuizSlideIndex ? 'completed' : ''}"></div>
            `).join('')}
        </div>
    `;

    sheetContentArea.innerHTML = html;

    // Event listeners
    const btnStart = document.getElementById('btn-start-quiz');
    if (btnStart) {
        btnStart.addEventListener('click', () => {
            cp1QuizSlideIndex = 1;
            renderCp1Quiz();
        });
    }

    const btnPrev = document.getElementById('btn-quiz-prev');
    if (btnPrev) {
        btnPrev.addEventListener('click', () => {
            if (cp1QuizSlideIndex > 0) cp1QuizSlideIndex--;
            renderCp1Quiz();
        });
    }

    const btnNext = document.getElementById('btn-quiz-next');
    if (btnNext) {
        btnNext.addEventListener('click', () => {
            if (cp1QuizSlideIndex < 4) {
                cp1QuizSlideIndex++;
                renderCp1Quiz();
            }
        });
    }

    const btnReplay = document.getElementById('btn-quiz-replay');
    if (btnReplay) {
        btnReplay.addEventListener('click', () => {
            cp1QuizSlideIndex = 0;
            cp1UserAnswers = [null, null, null];
            hasTriggeredCp1Confetti = false;
            renderCp1Quiz();
        });
    }

    const btnComplete = document.getElementById('btn-quiz-complete');
    if (btnComplete) {
        btnComplete.addEventListener('click', () => {
            toggleCheckpointCompletion('cp1');
        });
    }

    // Options
    const optionBtns = document.querySelectorAll('.quiz-option-btn');
    optionBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const key = btn.getAttribute('data-key');
            const qIndex = cp1QuizSlideIndex - 1;

            // Only allow answering once
            if (cp1UserAnswers[qIndex] !== null) return;

            cp1UserAnswers[qIndex] = key;
            renderCp1Quiz();

            // Auto transition with standard delay to show correctness feedback first
            setTimeout(() => {
                if (cp1QuizSlideIndex === qIndex + 1) {
                    cp1QuizSlideIndex++;
                    renderCp1Quiz();
                }
            }, 1400);
        });
    });
}

function closeCheckpointDetails() {
    sheetOverlay.classList.remove('open');
    bottomSheet.classList.remove('large-format');
    selectedCheckpointId = null;
}

sheetOverlay.addEventListener('click', (e) => {
    if (e.target === sheetOverlay) {
        closeCheckpointDetails();
    }
});

btnCloseSheet.addEventListener('click', closeCheckpointDetails);

// Helper: create a full-screen, non-interactive confetti canvas
function createConfettiCanvas() {
    const tempCanvas = document.createElement('canvas');
    Object.assign(tempCanvas.style, {
        position: 'fixed',
        top: '0',
        left: '0',
        width: '100vw',
        height: '100vh',
        zIndex: '9999',
        pointerEvents: 'none'
    });
    document.body.appendChild(tempCanvas);
    return tempCanvas;
}

// Self-cleaning temporary confetti canvas to prevent blocking pointer-events on the YouTube iframe
function triggerTempConfetti(originY = 0.75, count = 50) {
    if (typeof confetti !== 'function') return;

    const tempCanvas = createConfettiCanvas();

    const myConfetti = confetti.create(tempCanvas, { resize: true, useWorker: true });
    myConfetti({
        particleCount: count,
        spread: 50,
        origin: { y: originY },
        colors: ['#00d2ff', '#00f6ff', '#ffd700', '#ffffff']
    });

    setTimeout(() => {
        tempCanvas.remove();
    }, 3200);
}

function toggleCheckpointCompletion(id) {
    const cp = checkpoints.find(c => c.id === id);
    if (!cp) return;

    // Toggle completion status!
    if (cp.status === 'completed') {
        cp.status = 'available';
    } else {
        cp.status = 'completed';

        // Trigger celebratory deep-sea bubble confetti explosion
        triggerTempConfetti(0.85, 80);

        // Check if all checkpoints are now completed
        const allCompleted = checkpoints.every(c => c.status === 'completed');
        if (allCompleted) {
            // Massive Challenger Deep success explosion
            if (typeof confetti === 'function') {
                setTimeout(() => {
                    const tempCanvas = createConfettiCanvas();

                    const myConfetti = confetti.create(tempCanvas, { resize: true, useWorker: true });

                    const end = Date.now() + (3.5 * 1000);
                    (function frame() {
                        myConfetti({
                            particleCount: 4,
                            angle: 60,
                            spread: 55,
                            origin: { x: 0, y: 0.8 },
                            colors: ['#00d2ff', '#ffd700']
                        });
                        myConfetti({
                            particleCount: 4,
                            angle: 120,
                            spread: 55,
                            origin: { x: 1, y: 0.8 },
                            colors: ['#00f6ff', '#ffffff']
                        });
                        if (Date.now() < end) {
                            requestAnimationFrame(frame);
                        } else {
                            setTimeout(() => { tempCanvas.remove(); }, 2000);
                        }
                    }());
                }, 500);
            }
            setTimeout(() => {
                alert("Luar Biasa! Kapal selammu berhasil menguasai seluruh pilar Berpikir Komputasional dan menyelesaikan ekspedisi Palung Mariana secara lengkap!");
            }, 800);
        }
    }

    // Set this clicked checkpoint as the active focused position (submarine moves here!)
    currentActiveCheckpointId = id;

    renderCheckpoints();
    updateMarkerPosition(false);
    closeCheckpointDetails();
}

// -------------------------------------------------------------
// ZOOM CONTROL HUD BUTTONS
// -------------------------------------------------------------
btnZoomReset.addEventListener('click', () => {
    const activeCp = checkpoints.find(c => c.id === currentActiveCheckpointId);
    if (activeCp) {
        centerOn(activeCp.x, activeCp.y, false);
    } else {
        centerOn(500, 180, false);
    }
});

// Handle window resizing
window.addEventListener('resize', () => {
    clampAndApply(false);
});

// -------------------------------------------------------------
// INITIALIZATION
// -------------------------------------------------------------
function init() {
    initProgress();
    renderCheckpoints();

    // Position camera so the welcome panel and first checkpoint are fully visible initially
    centerOn(500, 220, true);

    // Welcome panel event handler
    const welcomePanel = document.getElementById('welcome-panel');
    const btnStartExpedition = document.getElementById('btn-start-expedition');

    if (btnStartExpedition && welcomePanel) {
        btnStartExpedition.addEventListener('click', () => {
            // Bubble confetti blast!
            triggerTempConfetti(0.6, 50);

            // Smoothly fade out the welcome panel card
            gsap.to(welcomePanel, {
                opacity: 0,
                scale: 0.95,
                duration: 0.4,
                ease: "power2.out",
                onComplete: () => {
                    welcomePanel.style.display = 'none';
                }
            });

            // Glide camera smoothly down to active submarine checkpoint immediately
            const activeCp = checkpoints.find(c => c.id === currentActiveCheckpointId);
            if (activeCp) {
                centerOn(activeCp.x, activeCp.y, false);
            }
        });
    } else {
        // Fallback center if welcome panel is missing
        setTimeout(() => {
            const activeCp = checkpoints.find(c => c.id === currentActiveCheckpointId);
            if (activeCp) {
                centerOn(activeCp.x, activeCp.y, false);
            }
        }, 100);
    }
}

init();
