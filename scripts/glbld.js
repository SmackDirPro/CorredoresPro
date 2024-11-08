// Versioned Global CSS Loader
const cssVersion = "1.1"; // Update only here
const link = document.createElement("link");
link.rel = "stylesheet";
link.href = `/styles/mystyles.css?v=${cssVersion}`;
document.head.appendChild(link);

// Load Header and Footer with Event Listeners for Dynamic Content
document.addEventListener("DOMContentLoaded", function() {
    // Load the header
    fetch('/assets/header.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('header-placeholder').innerHTML = data;

            // Attach the event listener for the hamburger menu toggle
            const toggleButton = document.querySelector('.nav-toggle');
            const navList = document.querySelector('nav ul.nav-list');

            if (toggleButton) {
                toggleButton.addEventListener('click', function() {
                    navList.classList.toggle('active');
                });
            }
        })
        .catch(error => console.error("Error loading header:", error));

    // Load the footer
    fetch('/assets/footer.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('footer-placeholder').innerHTML = data;
        })
        .catch(error => console.error("Error loading footer:", error));
});
