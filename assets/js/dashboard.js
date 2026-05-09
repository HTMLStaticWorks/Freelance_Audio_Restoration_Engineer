/* 
    ==================================================
    PUREWAVE DASHBOARD - JS LOGIC
    ==================================================
*/

document.addEventListener('DOMContentLoaded', () => {
    const sidebar = document.querySelector('.dashboard-sidebar');
    const toggleBtn = document.getElementById('sidebar-toggle');
    const content = document.querySelector('.dashboard-content');

    if (toggleBtn && sidebar) {
        toggleBtn.addEventListener('click', () => {
            sidebar.classList.toggle('active');
            // On mobile, the CSS handles the transform
            if (window.innerWidth > 991) {
                // Large screen logic if needed
            }
        });
    }

    // Simulated Stat Animations
    const counters = document.querySelectorAll('.stat-counter');
    counters.forEach(counter => {
        const target = +counter.getAttribute('data-target');
        const count = +counter.innerText;
        const speed = 200;
        
        const updateCount = () => {
            const inc = target / speed;
            if (count < target) {
                counter.innerText = Math.ceil(count + inc);
                setTimeout(updateCount, 1);
            } else {
                counter.innerText = target;
            }
        };
        // Triggered by Intersection Observer or immediately for dashboard
        updateCount();
    });

    // Upload interactions
    const dropzone = document.getElementById('dropzone');
    if (dropzone) {
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            dropzone.addEventListener(eventName, e => {
                e.preventDefault();
                e.stopPropagation();
            }, false);
        });

        dropzone.addEventListener('dragover', () => dropzone.classList.add('dragover'));
        dropzone.addEventListener('dragleave', () => dropzone.classList.remove('dragover'));
        dropzone.addEventListener('drop', (e) => {
            dropzone.classList.remove('dragover');
            const files = e.dataTransfer.files;
            handleFiles(files);
        });
    }

    function handleFiles(files) {
        console.log('Files received:', files);
        // UI feedback for upload progress
        const progressBar = document.querySelector('.progress-bar');
        if (progressBar) {
            let progress = 0;
            const interval = setInterval(() => {
                progress += 5;
                progressBar.style.width = progress + '%';
                if (progress >= 100) clearInterval(interval);
            }, 100);
        }
    }
});
