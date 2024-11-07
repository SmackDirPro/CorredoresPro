const apiurlfeat = 'https://rebrok044.directoriospro.workers.dev/';


// Fetch broker data from Cloudflare Worker
async function fetchBrokerData(brokerId) {
    try {
        const response = await fetch(`${apiurlfeat}?id=${brokerId}`);
        if (!response.ok) throw new Error(`Network response was not ok: ${response.statusText}`);

        const brokerData = await response.json();
        console.log("Fetched broker data:", brokerData);

        // Check if data is in expected format
        if (brokerData.values) {
            const parsedData = parseBrokerData(brokerData.values, brokerId);
            if (parsedData) {
                displayBrokerData(parsedData); // Display broker data on the page
                initMap(parsedData.latitude, parsedData.longitude); // Initialize map with broker location
            } else {
                console.error("Broker data could not be parsed.");
            }
        } else {
            console.error("Unexpected data format:", brokerData);
        }
    } catch (error) {
        console.error('Error fetching broker data:', error);
    }
}

// Parse data into a broker object with expected properties
function parseBrokerData(dataRows, brokerId) {
   
    // Find the row with the specific broker ID
    const brokerRow = dataRows.find(row => row[0] === brokerId);
    if (!brokerRow) return null;

    return {
        id: brokerRow[0],
        name: brokerRow[1],
        address: brokerRow[2],
        city: brokerRow[3],
        region: brokerRow[4],
        description: brokerRow[5],
        website: brokerRow[6],
        instagram: brokerRow[7],
        email: brokerRow[8],
        phone: brokerRow[9],
        specialties: brokerRow[10],
        latitude: parseFloat(brokerRow[12]),
        longitude: parseFloat(brokerRow[13]),
        googleReviews: brokerRow[14],
        googleRating: brokerRow[15],
        verified: brokerRow[16].toLowerCase() === 'true', // Convert to lowercase
        sponsored: brokerRow[18].toLowerCase() === 'true', // Convert to lowercase
        experience: `${brokerRow[19]} años`, //`${row[19]} años de experiencia`
        image: brokerRow[20] ? `/assets/images/corredores/${brokerRow[20]}` : '/assets/images/corredores/default.jpg',
        gmapembed: brokerRow[21]
    };  
}

// Display broker data on the page
function displayBrokerData(brokerData) {
    // Populate broker details in the profile page
    const nameElements = [
        document.getElementById('broker-name'),
        document.getElementById('broker-name-heading'),
        document.getElementById('broker-name-info')
    ];

    nameElements.forEach(element => {
        if (element) element.textContent = brokerData.name;
    });

    // Populate other broker details with null checks
    if (document.getElementById('broker-address')) {
        document.getElementById('broker-address').textContent = brokerData.address + brokerData.city;
    }
    if (document.getElementById('broker-region')) {
        document.getElementById('broker-region').textContent = brokerData.region;
    }
    if (document.getElementById('broker-phone')) {
        document.getElementById('broker-phone').textContent = brokerData.phone;
    }
    if (document.getElementById('broker-website')) {
        document.getElementById('broker-website').textContent = brokerData.website;
        document.getElementById('broker-website').href = brokerData.website;
    }
    if (document.getElementById('broker-specialties')) {
        document.getElementById('broker-specialties').textContent = brokerData.specialties;
    }
    if (document.getElementById('broker-experience')) {
        document.getElementById('broker-experience').textContent = `${brokerData.experience}`;
    }

    // Profile Image
    const profileDetailsContainer = document.querySelector('.profile-details');
    if (profileDetailsContainer) {
        const imageContainer = document.createElement('div');
        imageContainer.className = 'broker-image-container';
        imageContainer.innerHTML = `<img src="${brokerData.image}" alt="${brokerData.name} Logo">`;
        profileDetailsContainer.appendChild(imageContainer);
    }

    // Additional information
    if (document.getElementById('google-reviews')) {
        document.getElementById('google-reviews').textContent = brokerData.googleReviews || 'N/A';
    }
    if (document.getElementById('google-rating')) {
        document.getElementById('google-rating').textContent = brokerData.googleRating || 'N/A';
    }
    if (document.getElementById('instagram-link')) {
        document.getElementById('instagram-link').textContent = brokerData.instagram;
        document.getElementById('instagram-link').href = brokerData.instagram || '#';
    }
    if (document.getElementById('broker-email')) {
        document.getElementById('broker-email').textContent = brokerData.email;
        document.getElementById('broker-email').href = `mailto:${brokerData.email}`;
    }

    // Display badges
    if (document.getElementById('verified-badge')) {
        console.log("Verified status:", brokerData.verified); // Debugging line
        document.getElementById('verified-badge').style.display = brokerData.verified ? 'inline-block' : 'none';
    }
    if (document.getElementById('sponsored-badge')) {
        console.log("Sponsored status:", brokerData.sponsored); // Debugging line
        document.getElementById('sponsored-badge').style.display = brokerData.sponsored ? 'inline-block' : 'none';
    }

    // "Llamar" and "Visitar Sitio Web" buttons
    const phoneButton = document.getElementById('phone-button');
    if (phoneButton) {
        phoneButton.href = `tel:${brokerData.phone}`;
        phoneButton.innerHTML = `<i class="fas fa-phone-alt"></i> ${brokerData.phone}`;
    }
    if (document.getElementById('website-button')) {
        document.getElementById('website-button').href = brokerData.website;
    }

    // Maps embed link
    if (brokerData && brokerData.gmapembed) {
        console.log('Google Maps embed link:', brokerData.gmapembed); // For debugging
        const mapIframe = document.getElementById('broker-gmaps');
        if (mapIframe) {
            mapIframe.src = brokerData.gmapembed;  // Set the iframe src to the gmapembed link
        }
    } else {
        console.warn('Google Maps embed link not available for this broker.');
        if (document.getElementById('broker-gmaps')) {
            document.getElementById('broker-gmaps').style.display = 'none';
        }
    }

}



// Fetch broker data on page load based on broker ID from URL
document.addEventListener('DOMContentLoaded', () => {
    const brokerId = new URLSearchParams(window.location.search).get('id');
    if (brokerId) {
        fetchBrokerData(brokerId);
    } else {
        console.error('No broker ID found in URL.');
    }

    // Load Google Maps API

});
