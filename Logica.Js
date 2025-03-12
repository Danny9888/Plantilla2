document.addEventListener("DOMContentLoaded", function () {
    // Funciones de la tabla dinámica
    let stepCounter = 1;

    window.addStep = function() {
        const tbody = document.getElementById('steps-body');
        const newRow = document.createElement('tr');
        
        newRow.innerHTML = `
            <td>${stepCounter}</td>
            <td><input type="text" placeholder="Descripción del paso"></td>
            <td><textarea placeholder="Detalles adicionales"></textarea></td>
            <td><button type="button" onclick="deleteStep(this)">Eliminar</button></td>
        `;
        
        tbody.appendChild(newRow);
        stepCounter++;
    };

    window.deleteStep = function(button) {
        const row = button.closest('tr');
        row.remove();
        updateStepNumbers();
    };

    function updateStepNumbers() {
        const rows = document.querySelectorAll('#steps-body tr');
        rows.forEach((row, index) => {
            row.cells[0].textContent = index + 1;
        });
        stepCounter = rows.length + 1;
    }

    // Manejo del formulario
    document.querySelector(".btn-save").addEventListener("click", function (event) {
        event.preventDefault();

        // Validar formulario
        if (!document.querySelector('form').checkValidity()) {
            alert("Por favor completa todos los campos requeridos");
            return;
        }

        // Recopilar datos
        const getValue = selector => document.querySelector(selector)?.value || '';
        const getChecked = name => Array.from(document.querySelectorAll(`input[name="${name}"]:checked`))
                                   .map(cb => cb.value);

        const formData = {
            nombreCaso: getValue('input[placeholder="Ej: Registro de usuario"]'),
            area: getValue('input[placeholder="Ej: Autenticación"]'),
            idUnico: getValue('input[placeholder="Ej: UC-001"]'),
            actores: getValue('input[placeholder="Listar actores principales"]'),
            interesados: getValue('input[placeholder="Listar partes interesadas"]'),
            nivel: getValue('select:nth-of-type(1)'),
            descripcion: getValue('textarea[placeholder="Descripción detallada del caso de uso..."]'),
            evento: getValue('textarea[placeholder="Evento que inicia el caso de uso..."]'),
            prioridad: getValue('select:nth-of-type(2)'),
            riesgo: getValue('select:nth-of-type(3)'),
            pasos: Array.from(document.querySelectorAll('#steps-body tr')).map(row => ({
                paso: row.cells[0].textContent,
                descripcion: row.cells[1].querySelector('input').value,
                detalles: row.cells[2].querySelector('textarea').value
            }))
        };

        // Generar PDF
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        // Configuración inicial
        doc.setFont("helvetica", "bold");
        doc.setFontSize(16);
        doc.text("Documentación de Caso de Uso", 105, 20, { align: 'center' });
        
        let y = 30;
        const addSection = (title, content) => {
            doc.setFontSize(12);
            doc.setFont("helvetica", "bold");
            doc.text(title + ":", 15, y);
            doc.setFont("helvetica", "normal");
            const splitText = doc.splitTextToSize(content, 180);
            splitText.forEach(line => {
                if (y > 280) {
                    doc.addPage();
                    y = 20;
                }
                doc.text(line, 20, y + 5);
                y += 10;
            });
            y += 10;
        };

        // Contenido del PDF
        const fields = [
            ['Nombre del Caso', formData.nombreCaso],
            ['Área', formData.area],
            ['ID Único', formData.idUnico],
            ['Actores', formData.actores],
            ['Interesados', formData.interesados],
            ['Nivel', formData.nivel],
            ['Descripción', formData.descripcion],
            ['Evento Desencadenador', formData.evento],
            ['Prioridad', formData.prioridad],
            ['Riesgo', formData.riesgo]
        ];

        fields.forEach(([title, content]) => {
            addSection(title, content);
        });

        // Tabla de pasos
        doc.setFont("helvetica", "bold");
        doc.text("Pasos Realizados:", 15, y);
        y += 10;
        
        formData.pasos.forEach((paso, index) => {
            if (y > 280) {
                doc.addPage();
                y = 20;
            }
            doc.setFontSize(10);
            doc.text(`${index + 1}. ${paso.descripcion}`, 20, y);
            doc.text(`   Detalles: ${paso.detalles}`, 25, y + 5);
            y += 15;
        });

        // Guardar PDF
        doc.save(`${formData.nombreCaso.replace(/ /g, '_')}_Caso_Uso.pdf`);
    });
});