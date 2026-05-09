/* 
    ==================================================
    PUREWAVE AUDIO RESTORATION - MAIN JS
    ==================================================
*/

document.addEventListener('DOMContentLoaded', () => {
    // 1. Navbar Scroll Effect
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 20) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });
    }

    // 2. Theme Toggle (Dark/Light)
    const themeToggle = document.getElementById('theme-toggle');
    const html = document.documentElement;
    
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const currentTheme = html.getAttribute('data-theme');
            const newTheme = currentTheme === 'light' ? 'dark' : 'light';
            html.setAttribute('data-theme', newTheme);
            html.setAttribute('data-bs-theme', newTheme); // Bootstrap 5 compatibility
            
            // Update icon
            const icon = themeToggle.querySelector('i');
            if (newTheme === 'light') {
                icon.classList.replace('bi-sun-fill', 'bi-moon-stars-fill');
            } else {
                icon.classList.replace('bi-moon-stars-fill', 'bi-sun-fill');
            }
            
            localStorage.setItem('theme', newTheme);
        });
    }


    // 3. RTL Toggle
    const rtlToggle = document.getElementById('rtl-toggle');
    if (rtlToggle) {
        rtlToggle.addEventListener('click', () => {
            const currentDir = html.getAttribute('dir');
            const newDir = currentDir === 'rtl' ? 'ltr' : 'rtl';
            html.setAttribute('dir', newDir);
            localStorage.setItem('dir', newDir);
        });
    }

    // 4. Smooth Scrolling for Anchor Links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    // 5. Initialize Theme from LocalStorage
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        html.setAttribute('data-theme', savedTheme);
        html.setAttribute('data-bs-theme', savedTheme);
        if (savedTheme === 'light' && themeToggle) {
            themeToggle.querySelector('i').classList.replace('bi-sun-fill', 'bi-moon-stars-fill');
        }
    }


    const savedDir = localStorage.getItem('dir');
    if (savedDir) {
        html.setAttribute('dir', savedDir);
    }

    // 6. Form Validation (Bootstrap style)
    const forms = document.querySelectorAll('.needs-validation');
    Array.from(forms).forEach(form => {
        form.addEventListener('submit', event => {
            if (!form.checkValidity()) {
                event.preventDefault();
                event.stopPropagation();
            }
            form.classList.add('was-validated');
        }, false);
    });
});
