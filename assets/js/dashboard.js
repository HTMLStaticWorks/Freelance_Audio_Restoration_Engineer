/* 
    WaveRestore Audio Lab - Dashboard JavaScript
*/

document.addEventListener('DOMContentLoaded', () => {
    // Sidebar Toggle for Mobile
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebar = document.querySelector('.dashboard-sidebar');
    
    if (sidebarToggle && sidebar) {
        sidebarToggle.addEventListener('click', () => {
            sidebar.classList.toggle('active');
        });
    }

    // Drag and Drop Upload
    const dropZone = document.getElementById('dropZone');
    if (dropZone) {
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            dropZone.addEventListener(eventName, (e) => {
                e.preventDefault();
                e.stopPropagation();
            }, false);
        });

        dropZone.addEventListener('dragover', () => dropZone.classList.add('highlight'));
        dropZone.addEventListener('dragleave', () => dropZone.classList.remove('highlight'));
        dropZone.addEventListener('drop', (e) => {
            dropZone.classList.remove('highlight');
            const files = e.dataTransfer.files;
            handleFiles(files);
        });
    }

    function handleFiles(files) {
        alert(`${files.length} file(s) added for restoration.`);
        // Add dummy logic for progress
    }

    // Dummy Progress Updates
    const progressBars = document.querySelectorAll('.progress-bar');
    progressBars.forEach(bar => {
        const target = bar.getAttribute('aria-valuenow');
        bar.style.width = target + '%';
    });
});
