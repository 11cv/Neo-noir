document.addEventListener("DOMContentLoaded", function () {
    // Переключение вкладок
    showTab("upload");

    // Назначаем обработчики
    document.getElementById("loadFileButton").addEventListener("click", handleFileLoad);
    document.getElementById("addToJournalButton").addEventListener("click", addToJournal);
    document.getElementById("journalForm").addEventListener("submit", function (e) {
        e.preventDefault();
        addManualEntry();
    });
});

document.getElementById("downloadTableButton").addEventListener("click", downloadTableAsCSV);
function downloadTableAsCSV() {
    const table = document.getElementById("journalTable");
    const rows = Array.from(table.querySelectorAll("tr"));

    let csvContent = "";

    // Получаем заголовки
    const headers = rows[0].querySelectorAll("th");
    const headerText = Array.from(headers).map(header => header.textContent).join(",") + "\n";
    csvContent += headerText;

    // Получаем данные строк таблицы
    const dataRows = rows.slice(1);
    dataRows.forEach(row => {
        const cells = row.querySelectorAll("td");
        const rowText = Array.from(cells).map(cell => cell.textContent).join(",") + "\n";
        csvContent += rowText;
    });

    // Создаем ссылку для скачивания
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    if (link.download !== undefined) {  // Для большинства современных браузеров
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", "журнал_оценок.csv");
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}

function showTab(tabId) {
    const tabs = document.querySelectorAll(".tab");
    tabs.forEach(tab => tab.classList.remove("active"));

    const targetTab = document.getElementById(tabId);
    if (targetTab) {
        targetTab.classList.add("active");
    }
}

function handleFileLoad() {
    const fileInput = document.getElementById("fileInput");
    const file = fileInput.files[0];
    if (!file) {
        alert("Выберите файл");
        return;
    }

    document.getElementById("fileName").textContent = file.name;

    const reader = new FileReader();

    reader.onload = function (e) {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        const tbody = document.querySelector("#file-preview tbody");
        tbody.innerHTML = "";

        for (let i = 1; i < jsonData.length; i++) {
            const row = jsonData[i];
            if (row.length >= 6) {
                const tr = document.createElement("tr");
                tr.innerHTML = `<td>${row[0]}</td><td>${row[1]}</td><td>${row[2]}</td><td>${row[3]}</td><td>${row[4]}</td><td>${row[5]}</td>`;
                tbody.appendChild(tr);
            }
        }
    };

    reader.readAsArrayBuffer(file);
}

function addToJournal() {
    const previewRows = document.querySelectorAll("#file-preview tbody tr");
    const journalTbody = document.querySelector("#journalTable tbody");

    previewRows.forEach(row => {
        const cells = row.querySelectorAll("td");
        const fio = cells[0].textContent;
        const klass = cells[1].textContent;
        const russianGrade = cells[2].textContent;
        const mathGrade = cells[3].textContent;
        const physicsGrade = cells[4].textContent;
        const peGrade = cells[5].textContent;

        addJournalRow(fio, klass, russianGrade, mathGrade, physicsGrade, peGrade);
    });

    updateStats();
}

function addManualEntry() {
    const fioInput = document.getElementById("fio");
    const klassInput = document.getElementById("klass");
    const russianGradeInput = document.getElementById("russianGrade");
    const mathGradeInput = document.getElementById("mathGrade");
    const physicsGradeInput = document.getElementById("physicsGrade");
    const peGradeInput = document.getElementById("peGrade");

    const fio = fioInput.value.trim();
    const klass = klassInput.value.trim();
    const russianGrade = russianGradeInput.value.trim();
    const mathGrade = mathGradeInput.value.trim();
    const physicsGrade = physicsGradeInput.value.trim();
    const peGrade = peGradeInput.value.trim();

    // Валидация данных
    if (!validateFio(fio) || !validateClass(klass) || !validateGrade(russianGrade) || !validateGrade(mathGrade) || !validateGrade(physicsGrade) || !validateGrade(peGrade)) {
        alert("Введите корректные данные");
        return;
    }

    addJournalRow(fio, klass, russianGrade, mathGrade, physicsGrade, peGrade);

    fioInput.value = "";
    klassInput.value = "";
    russianGradeInput.value = "";
    mathGradeInput.value = "";
    physicsGradeInput.value = "";
    peGradeInput.value = "";
}

function validateFio(fio) {
    const regex = /^[a-zA-Zа-яА-ЯёЁ\s]+$/;
    return regex.test(fio);
}

function validateClass(klass) {
    const regex = /^[a-zA-Zа-яА-Я0-9]+$/;
    return regex.test(klass);
}

function validateGrade(grade) {
    const regex = /^[1-5]$/;
    return regex.test(grade);
}

function addJournalRow(fio, klass, russianGrade, mathGrade, physicsGrade, peGrade) {
    const table = document.querySelector("#journalTable tbody");
    const row = table.insertRow();

    row.insertCell(0).textContent = fio;
    row.insertCell(1).textContent = klass;
    row.insertCell(2).textContent = russianGrade;
    row.insertCell(3).textContent = mathGrade;
    row.insertCell(4).textContent = physicsGrade;
    row.insertCell(5).textContent = peGrade;

    const editCell = row.insertCell(6);
    const deleteCell = row.insertCell(7);

    const editBtn = document.createElement("button");
    editBtn.textContent = "Редактировать";
    editBtn.onclick = () => {
        const newFio = prompt("Введите новое ФИО:", row.cells[0].textContent);
        const newKlass = prompt("Введите новый класс:", row.cells[1].textContent);
        const newRussianGrade = prompt("Новая оценка по Русскому языку:", row.cells[2].textContent);
        const newMathGrade = prompt("Новая оценка по Математике:", row.cells[3].textContent);
        const newPhysicsGrade = prompt("Новая оценка по Физике:", row.cells[4].textContent);
        const newPeGrade = prompt("Новая оценка по Физкультуре:", row.cells[5].textContent);

        const nameRegex = /^[А-Яа-яЁё\s\-]+$/;
        const classRegex = /^[0-9]{1,2}[А-Яа-яЁё]{0,2}$/;
        const gradeRegex = /^[1-5]$/;

        if (
            nameRegex.test(newFio) &&
            classRegex.test(newKlass) &&
            gradeRegex.test(newRussianGrade) &&
            gradeRegex.test(newMathGrade) &&
            gradeRegex.test(newPhysicsGrade) &&
            gradeRegex.test(newPeGrade)
        ) {
            row.cells[0].textContent = newFio;
            row.cells[1].textContent = newKlass;
            row.cells[2].textContent = newRussianGrade;
            row.cells[3].textContent = newMathGrade;
            row.cells[4].textContent = newPhysicsGrade;
            row.cells[5].textContent = newPeGrade;

            updateStats();         // Обновляем график
            // updateStatsTable();    // Обновляем таблицу статистики
        } else {
            alert("Неверный формат данных.");
        }
    };

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Удалить";
    deleteBtn.onclick = () => {
        table.deleteRow(row.rowIndex - 1);
        updateStats();         // Обновить график
        // updateStatsTable();    // Обновить таблицу статистики
    };

    editCell.appendChild(editBtn);
    deleteCell.appendChild(deleteBtn);
}


function updateStats() {
    const rows = document.querySelectorAll("#journalTable tbody tr");
    // собирают
    const classes = {};  // По классам
    const allGrades = { "Русский язык": [], "Математика": [], "Физика": [], "Физкультура": [] };  // Все классы
    //Добавляются оценки в массивы
    rows.forEach(row => {
        const klass = row.cells[1].textContent;
        const russian = parseInt(row.cells[2].textContent);
        const math = parseInt(row.cells[3].textContent);
        const physics = parseInt(row.cells[4].textContent);
        const pe = parseInt(row.cells[5].textContent);

        if (!classes[klass]) {
            classes[klass] = {
                "Русский язык": [],
                "Математика": [],
                "Физика": [],
                "Физкультура": []
            };
        }

        classes[klass]["Русский язык"].push(russian);
        classes[klass]["Математика"].push(math);
        classes[klass]["Физика"].push(physics);
        classes[klass]["Физкультура"].push(pe);

        allGrades["Русский язык"].push(russian);
        allGrades["Математика"].push(math);
        allGrades["Физика"].push(physics);
        allGrades["Физкультура"].push(pe);
    });
    //расчеты
    function calcStats(grades) {
        const count = grades.length;
        const freq = [0, 0, 0, 0, 0];
        grades.forEach(g => { if (g >= 1 && g <= 5) freq[g - 1]++; });
        const mean = grades.reduce((a, b) => a + b, 0) / count;
        const sorted = [...grades].sort((a, b) => a - b);
        const median = count % 2 ? sorted[Math.floor(count / 2)] : (sorted[count / 2 - 1] + sorted[count / 2]) / 2;
        return { mean, median, counts: freq };
    }

    const container = document.getElementById("tableStats");
    let html = "";
    //таблицы
    for (const klass in classes) {
        html += `<h3>Класс ${klass}</h3>`;
        html += `<table><tr><th>Предмет</th><th>Средняя оценка</th><th>Медиана</th><th>Оценка 1</th><th>Оценка 2</th><th>Оценка 3</th><th>Оценка 4</th><th>Оценка 5</th></tr>`;

        for (const subject in classes[klass]) {
            const stats = calcStats(classes[klass][subject]);
            html += `<tr><td>${subject}</td><td>${stats.mean.toFixed(2)}</td><td>${stats.median}</td>` +
                stats.counts.map(c => `<td>${c}</td>`).join("") + "</tr>";
        }

        html += "</table><br>";
    }

    html += `<h3>Все классы</h3>`;
    html += `<table><tr><th>Предмет</th><th>Средняя оценка</th><th>Медиана</th><th>Оценка 1</th><th>Оценка 2</th><th>Оценка 3</th><th>Оценка 4</th><th>Оценка 5</th></tr>`;

    for (const subject in allGrades) {
        const stats = calcStats(allGrades[subject]);
        html += `<tr><td>${subject}</td><td>${stats.mean.toFixed(2)}</td><td>${stats.median}</td>` +
            stats.counts.map(c => `<td>${c}</td>`).join("") + "</tr>";
    }

    html += "</table>";
    container.innerHTML = html;

    // === Главный график (все классы): средняя оценка + количество оценок ===
    const canvas = document.getElementById("statsChart");
    const ctx = canvas.getContext("2d");
    if (window.statsChartInstance) {
        window.statsChartInstance.destroy();
    }

    const labels = Object.keys(allGrades);
    const averageData = labels.map(subject => calcStats(allGrades[subject]).mean);
    const countsPerSubject = labels.map(subject => calcStats(allGrades[subject]).counts.reduce((a, b) => a + b, 0));

    window.statsChartInstance = new Chart(ctx, {
        type: "bar",
        data: {
            labels: labels,
            datasets: [
                {
                    label: "Средняя оценка",
                    data: averageData,
                    backgroundColor: "#66c0f4", 
                    yAxisID: "y",
                },
                {
                    label: "Количество оценок",
                    data: countsPerSubject,
                    backgroundColor: "#4CAF50", 
                    yAxisID: "y1",
                }
            ]
        },
        options: {
            responsive: true,
            interaction: {
                mode: 'index',
                intersect: false
            },
            plugins: {
                title: {
                    display: true,
                    text: "График по предметам (все классы)"
                }
            },
            scales: {
                y: {
                    type: "linear",
                    position: "left",
                    beginAtZero: true,
                    title: { display: true, text: "Средняя оценка" }
                },
                y1: {
                    type: "linear",
                    position: "right",
                    beginAtZero: true,
                    title: { display: true, text: "Количество оценок" },
                    grid: { drawOnChartArea: false }
                }
            }
        }
    });


    // === Готовим контейнеры ===
    const graphContainer = document.getElementById("graphContainer");
    graphContainer.innerHTML = "";

    // Средняя по предметам (по классам)
    Object.keys(classes).forEach(klass => {
        const canvas = document.createElement("canvas");
        canvas.id = `classAverageChart-${klass}`;
        canvas.width = 400;
        canvas.height = 200;
        graphContainer.appendChild(canvas);
    });

    // Частота каждой оценки (по классам)
    Object.keys(classes).forEach(klass => {
        const canvas = document.createElement("canvas");
        canvas.id = `gradeDistributionChart-${klass}`;
        canvas.width = 400;
        canvas.height = 200;
        graphContainer.appendChild(canvas);
    });

    // Количество оценок по предметам (всего)
    Object.keys(allGrades).forEach(subject => {
        const canvas = document.createElement("canvas");
        canvas.id = `subjectGradeCountChart-${subject}`;
        canvas.width = 400;
        canvas.height = 200;
        graphContainer.appendChild(canvas);
    });

    // === Рендер всех остальных графиков ===
    function renderClassAverageChart() {
        Object.keys(classes).forEach(klass => {
            const canvas = document.getElementById(`classAverageChart-${klass}`);
            const ctx = canvas.getContext("2d");
            const data = labels.map(subject => calcStats(classes[klass][subject]).mean);

            new Chart(ctx, {
                type: "bar",
                data: {
                    labels: labels,
                    datasets: [{
                        label: `Класс ${klass} - Средняя`,
                        data: data,
                        backgroundColor: "#8d99ae"
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        title: {
                            display: true,
                            text: `Класс ${klass} - Средняя оценка по предметам`
                        }
                    }
                }
            });
        });
    }

    function renderGradeDistributionChart() {
        Object.keys(classes).forEach(klass => {
            const canvas = document.getElementById(`gradeDistributionChart-${klass}`);
            const ctx = canvas.getContext("2d");

            const datasets = [1, 2, 3, 4, 5].map(gradeValue => ({
                label: `Оценка ${gradeValue}`,
                data: labels.map(subject => calcStats(classes[klass][subject]).counts[gradeValue - 1]),
                backgroundColor: `hsl(${gradeValue * 60}, 70%, 60%)`
            }));

            new Chart(ctx, {
                type: "bar",
                data: {
                    labels: labels,
                    datasets: datasets
                },
                options: {
                    responsive: true,
                    plugins: {
                        title: {
                            display: true,
                            text: `Класс ${klass} - Частота каждой оценки по предметам`
                        }
                    }
                }
            });
        });
    }

    function renderSubjectGradeCountChart() {
        labels.forEach(subject => {
            const canvas = document.getElementById(`subjectGradeCountChart-${subject}`);
            const ctx = canvas.getContext("2d");

            const data = calcStats(allGrades[subject]).counts;

            new Chart(ctx, {
                type: "bar",
                data: {
                    labels: ["1", "2", "3", "4", "5"],
                    datasets: [{
                        label: `${subject} - Количество`,
                        data: data,
                        backgroundColor: "#48c9b0"
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        title: {
                            display: true,
                            text: `${subject} - Количество оценок`
                        }
                    }
                }
            });
        });
    }

    // Вызываем отрисовку всех графиков
    renderClassAverageChart();
    renderGradeDistributionChart();
    renderSubjectGradeCountChart();
}



//Медиана оценок по предметам
function renderMedianChart(canvas) {
    const ctx = canvas.getContext("2d");
    new Chart(ctx, {
        type: "bar",
        data: {
            labels: labels,
            datasets: [{
                label: "Медиана",
                data: medianData,
                backgroundColor: "#60a5fa",
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: "Медианы по предметам"
                }
            }
        }
    });
}

// оценки по предмкту 
function renderFrequencyChart(canvas) {
    const ctx = canvas.getContext("2d");

    const frequencyData = labels.map(subject => {
        const stats = calcStats(allGrades[subject]);
        return stats.counts;  // возвращаем частотное распределение
    });

    new Chart(ctx, {
        type: "bar",
        data: {
            labels: labels,
            datasets: frequencyData.map((freq, index) => ({
                label: `${labels[index]} - Частоты`,
                data: freq,
                backgroundColor: "#fdba74",
            }))
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: "Частотное распределение оценок"
                }
            }
        }
    });
    renderMedianChart();
    renderFrequencyChart();
}



// Добавляем обновление статистики после ручного добавления/редактирования/удаления:
const originalAddJournalRow = addJournalRow;
addJournalRow = function (...args) {
    originalAddJournalRow(...args);
    updateStats();
};

// Переопределяем удаление строк, чтобы тоже обновляло статистику
function overrideDeleteButton(button, table, row) {
    button.onclick = () => {
        table.deleteRow(row.rowIndex - 1);
        updateStats();
    };
}

// Вызов этой функции при создании кнопки удаления
function overrideEditButton(button, row) {
    button.onclick = () => {
        const newFio = prompt("Введите новое ФИО:", row.cells[0].textContent);
        const newKlass = prompt("Введите новый класс:", row.cells[1].textContent);
        const newRussian = prompt("Новая оценка по Русскому языку:", row.cells[2].textContent);
        const newMath = prompt("Новая оценка по Математике:", row.cells[3].textContent);
        const newPhysics = prompt("Новая оценка по Физике:", row.cells[4].textContent);
        const newPe = prompt("Новая оценка по Физкультуре:", row.cells[5].textContent);

        if (validateFIO(newFio) && validateKlass(newKlass) && validateGrade(newRussian) && validateGrade(newMath) && validateGrade(newPhysics) && validateGrade(newPe)) {
            row.cells[0].textContent = newFio;
            row.cells[1].textContent = newKlass;
            row.cells[2].textContent = newRussian;
            row.cells[3].textContent = newMath;
            row.cells[4].textContent = newPhysics;
            row.cells[5].textContent = newPe;
            updateStats();
        } else {
            alert("Неверные данные");
        }
    };
}
