// JavaScript for city-specific directory page
document.addEventListener('DOMContentLoaded', function () {
    const dataContainer = document.getElementById('data-container');
    const sheetName = dataContainer.getAttribute('data-sheet-name') || 'DefaultSheetName';
    const city = dataContainer.getAttribute('data-city') || '';
    
    const workerUrl = `https://noisy-queen-12e4.directoriospro.workers.dev/?sheetName=${sheetName}`;
    
    let currentPage = 1;
    const resultsPerPage = 10;
    let totalPages = 1;

    const listingsContainer = document.querySelector('.listings-container');
    const paginationContainer = document.querySelector('.pagination');

    if (!listingsContainer) {
        console.error("Error: listingsContainer element not found.");
        return;
    }

    // Function to navigate to the profile page
    function viewBrokerProfile(broker) {
        const brokerData = {
            id: broker.id,
            name: broker.name,
            address: broker.address,
            city: broker.city,
            region: broker.region,
            description: broker.description,
            website: broker.website,
            instagram: broker.instagram,
            email: broker.email,
            phone: broker.phone,
            specialties: broker.specialties,
            latitude: broker.latitude,
            longitud: broker.longitud,
            googleReviews: broker.googleReviews,
            googleRating: broker.googleRating,
            verified: broker.verified,
            sponsored: broker.sponsored,
            experience: broker.experience,
            image: broker.image,
            gmapembed: broker.gmapembed
        };
        localStorage.setItem('selectedBroker', JSON.stringify(brokerData));
        window.location.href = `/profile.html?id=${brokerData.id}`;
    }

    window.viewBrokerProfile = viewBrokerProfile;

    // Function to create a listing card
    function createListingCard(listing) {
        const card = document.createElement('div');
        card.className = 'listing-card';

        if (listing.sponsored) {
            const sponsoredLabel = document.createElement('div');
            sponsoredLabel.className = 'listing-sponsored';
            sponsoredLabel.textContent = 'DESTACADO';
            card.appendChild(sponsoredLabel);
        }

        card.innerHTML += `
            <div class="listing-content">
                <div class="listing-image">
                    <img src="${listing.image}" alt="${listing.name}">
                </div>
                <div class="listing-details">
                    <h3 class="listing-title">${listing.name}</h3>
                    ${listing.verified ? '<span class="listing-verified">Verificado</span>' : ''}
                    <div class="listing-info">
                        <p>${listing.phone}</p>
                        <p>${listing.address}</p>
                        <p><strong>Especialidades:</strong> ${listing.specialties}</p>
                        <p><strong>Experiencia:</strong> ${listing.experience}</p>
                        <button class="more-info-button" onclick='viewBrokerProfile(${JSON.stringify(listing)})'>Más Info</button>
                    </div>
                </div>
            </div>
        `;
        return card;
    }

    // Render listings with pagination
    function renderListings(listings, page) {
        listingsContainer.innerHTML = '';
        const start = (page - 1) * resultsPerPage;
        const end = start + resultsPerPage;
        const paginatedListings = listings.slice(start, end);

        paginatedListings.forEach(listing => {
            listingsContainer.appendChild(createListingCard(listing));
        });

        updatePaginationControls();
    }

    // Pagination controls
    function updatePaginationControls() {
        paginationContainer.innerHTML = `
            <button ${currentPage === 1 ? 'disabled' : ''} onclick="prevPage()">Prev.</button>
            <span>Página ${currentPage} de ${totalPages}</span>
            <button ${currentPage === totalPages ? 'disabled' : ''} onclick="nextPage()">Sig.</button>
        `;
    }

    // Next and previous page functions
    window.nextPage = function () {
        if (currentPage < totalPages) {
            currentPage++;
            fetchListings().then(listings => {
                renderListings(listings, currentPage);
                window.scrollTo(0, 0); // Scroll to top after rendering
            });
        }
    };

    window.prevPage = function () {
        if (currentPage > 1) {
            currentPage--;
            fetchListings().then(listings => {
                renderListings(listings, currentPage);
                window.scrollTo(0, 0); // Scroll to top after rendering
            });
        }
    };

    // Fetch data from Google Sheets
    async function fetchListings() {
        try {
            const response = await fetch(workerUrl);
            const data = await response.json();

            if (data.error) {
                console.error('Google Sheets API Error:', data.error.message);
                return [];
            }

            const rows = data.values;
            
            // Find indices for Verified, Sponsored, and Google Review Rating
            const headers = rows[2];
            const verifiedIndex = headers.findIndex(header => header.includes("Verificado"));
            const sponsoredIndex = headers.findIndex(header => header.includes("Sponsored"));
            const ratingIndex = headers.findIndex(header => header.includes("Google Rating"));

            const cityIndex = headers.findIndex(header => header.includes("Ciudad"));

            // Filter rows by city and map to listings
            const listings = rows.slice(3)
                .filter(row => row[cityIndex]?.trim() === city)
                .map(row => {
                const verified = String(row[verifiedIndex]).toLowerCase() === 'true';
                const sponsored = String(row[sponsoredIndex]).toLowerCase() === 'true';
                const rating = parseFloat(row[ratingIndex]) || "---";

                return {
                    id: row[0],
                    name: row[1],
                    address: row[2] + row[3],
                    city: row[3],
                    region: row[4],
                    description: row[5],
                    website: row[6],
                    instagram: row[7],
                    email: row[8],
                    phone: row[9],
                    specialties: row[10],
                    latitude: row[12],
                    longitud: row[13],
                    verified: verified,                    
                    sponsored: sponsored,                  
                    googleReviews: row[14] || "N/A",       // Google Reviews
                    googleRating: rating,                  // Google Rating
                    experience: `${row[19]} años`,
                    image: row[20] ? `/assets/images/corredores/${row[20]}` : '/assets/images/corredores/default.jpg',
                    gmapembed: row[21]
                    };
                });

            // Sort listings: Sponsored > Verified > Rating
            listings.sort((a, b) => {
                if (a.sponsored !== b.sponsored) return b.sponsored - a.sponsored; // Sponsored first
                if (a.verified !== b.verified) return b.verified - a.verified;     // Then verified
                // Parse ratings to float numbers to ensure numeric sorting
                const ratingA = parseFloat(a.googleRating) || 0;  // default to 0 if rating is missing or invalid
                const ratingB = parseFloat(b.googleRating) || 0;

                return ratingB - ratingA;  // Then sort by rating
            });

            const count = listings.length;
            document.querySelector('.dirherocont h3').textContent = `Hay ${count} corredoras en esta ciudad.`;

            // Calculate total pages and render the first page
            totalPages = Math.ceil(count / resultsPerPage);
            renderListings(listings, currentPage);

            return listings;
        } catch (error) {
            console.error('Error fetching data from Google Sheets:', error);
            return [];
        }
    }

    fetchListings();
});


// Mobile navigation toggle
document.addEventListener('DOMContentLoaded', function () {
    const toggleButton = document.querySelector('.nav-toggle');
    const navList = document.querySelector('nav ul.nav-list');

    if (toggleButton) {
        toggleButton.addEventListener('click', function() {
            navList.classList.toggle('active');
        });
    }
});