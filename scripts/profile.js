// Retrieve broker data from localStorage
const brokerData = JSON.parse(localStorage.getItem('selectedBroker'));

if (brokerData) {
    // Populate broker details in the profile page
    document.getElementById('broker-name').textContent = brokerData.name;
    document.getElementById('broker-name-heading').textContent = brokerData.name;
    document.getElementById('broker-name-info').textContent = brokerData.name;
    document.getElementById('broker-address').textContent = brokerData.address;
    document.getElementById('broker-region').textContent = brokerData.region;
    document.getElementById('broker-phone').textContent = brokerData.phone;
    document.getElementById('broker-email').textContent = brokerData.email; // Display actual email
    document.getElementById('broker-email').href = `mailto:${brokerData.email}`;
    document.getElementById('broker-website').textContent = brokerData.website; // Display actual website URL
    document.getElementById('broker-website').href = brokerData.website;

    document.getElementById('broker-specialties').textContent = brokerData.specialties;
    document.getElementById('broker-experience').textContent = `${brokerData.experience}`;

    // Profile Image in "Acerca de" Section
    const profileDetailsContainer = document.querySelector('.profile-details');

    // Maps embed link
    //document.getElementById('broker-gmaps').textContent = `${brokerData.gmapembed}`;

    // Create the image element
    const imageContainer = document.createElement('div');
    imageContainer.className = 'broker-image-container'; // Add a class for styling
    imageContainer.innerHTML = `<img src="${brokerData.image}" alt="${brokerData.name} Logo">`;

    // Append the image container to the profile details
    profileDetailsContainer.appendChild(imageContainer);

    // Additional information
    document.getElementById('google-reviews').textContent = brokerData.googleReviews;
    document.getElementById('google-rating').textContent = brokerData.googleRating;
    document.getElementById('instagram-link').textContent = brokerData.instagram;
    document.getElementById('instagram-link').href = brokerData.instagram;

    // Display badges if broker is verified or sponsored
    if (brokerData.verified) {
        document.getElementById('verified-badge').style.display = 'inline-block';
    } else {
        document.getElementById('verified-badge').style.display = 'none'; // Hide if not verified
    }

    if (brokerData.sponsored) {
        document.getElementById('sponsored-badge').style.display = 'inline-block';
    } else {
        document.getElementById('sponsored-badge').style.display = 'none'; // Hide if not sponsored
    }

    // Set up "Llamar" and "Visitar Sitio Web" buttons
    document.getElementById('phone-button').href = `tel:${brokerData.phone}`;
    document.getElementById('phone-button').innerHTML = `<i class="fas fa-phone-alt"></i> ${brokerData.phone}`; // Set phone number as button text
    document.getElementById('website-button').href = brokerData.website;
} else {
    console.error('No broker data found.');
}


// Check if the current broker is sponsored
if (!brokerData.sponsored) {
    // Show the sponsored agents section only if the current broker is not sponsored
    document.querySelector('.featured-agents').style.display = 'block';
    fetchSponsoredAgents();
} else {
    // Hide the sponsored agents section if the current broker is sponsored
    document.querySelector('.featured-agents').style.display = 'none';
}

const apiUrl = 'https://rebrok044.directoriospro.workers.dev/';

// Function to fetch data from Cloudflare Worker
async function fetchSponsoredAgents() {
    try {
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error(`Network response was not ok: ${response.statusText}`);

        const data = await response.json();
        console.log("Fetched data:", data); // Log fetched data to confirm

        // Filter sponsored agents starting from row 8, ensuring they match the broker's region
        const sponsoredAgents = data.values.slice(6).filter(row => {
            return String(row[18]).toUpperCase() === "TRUE" && row[4] === brokerData.region;
        });

        if (sponsoredAgents.length === 0) {
            console.warn("No sponsored agents found for this region.");
        }

        // Get random sponsored agents from the filtered list
        const randomSponsoredAgents = getRandomAgents(sponsoredAgents, 3);
        displaySponsoredAgents(randomSponsoredAgents);
    } catch (error) {
        console.error('Error fetching sponsored agents:', error);
    }
}


// Helper function to select random agents
function getRandomAgents(agents, count) {
    const shuffled = agents.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}

// Function to display sponsored agents
function displaySponsoredAgents(sponsoredAgents) {
    const sponsoredContainer = document.getElementById('sponsored-agents');
    sponsoredContainer.innerHTML = ''; // Clear any existing content

    sponsoredAgents.forEach(agent => {
        const agentName = agent[1]; // Broker name
        const agentDescription = agent[5] || "Descripción no disponible";
        const agentImage = agent[20] ? `/assets/images/corredores/${agent[20]}` : '/assets/images/corredores/default.jpg';
        const agentId = agent[0]; // Broker ID

        const agentCard = document.createElement('div');
        agentCard.classList.add('agent-card');

        // Set up the agent card HTML
        agentCard.innerHTML = `
            <div class="agent-image" style="background-image: url('${agentImage}');"></div>
            <h3>${agentName}</h3>
            <p>${agentDescription}</p>
            <a href="featured.html?id=${agentId}" class="agent-cta" onclick='saveBrokerToLocalStorage(${JSON.stringify(agent)})'>Ver Perfil</a>
        `;

        sponsoredContainer.appendChild(agentCard);
    });
}

// Save broker data to localStorage and navigate to featured.html
function saveBrokerToLocalStorage(brokerData) {
    console.log('Saving broker data:', brokerData); // Log broker data before saving
localStorage.setItem('selectedBroker', JSON.stringify(brokerData));
window.location.href = 'featured.html'; // Redirect to featured.html

}



// Call the function to fetch and display sponsored agents
fetchSponsoredAgents();


