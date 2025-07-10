const appState = {
  statesData: [],
  monumentsData: [],
  currentState: null,
  currentFilter: 'all',
};

async function loadData() {
  try {
    const [
      statesResponse, 
      keralaResponse, 
      westBengalResponse,
      telanganaResponse,
      karnatakaResponse,
      andamanNicobarResponse,
      puducherryResponse,
      andhraPradeshResponse
    ] = await Promise.all([
      fetch('./data/states.json'),
      fetch('./data/kerala.json'),
      fetch('./data/westBengal.json'),
      fetch('./data/telangana.json'),
      fetch('./data/karnataka.json'),
      fetch('./data/andamanNicobar.json'),
      fetch('./data/puducherry.json'),
      fetch('./data/andhraPradesh.json')
    ]);

    const statesData = await statesResponse.json();
    const keralaData = await keralaResponse.json();
    const westBengalMonuments = await westBengalResponse.json();
    const telanganaMonuments = await telanganaResponse.json();
    const karnatakaMonuments = await karnatakaResponse.json();
    const andamanNicobarMonuments = await andamanNicobarResponse.json();
    const puducherryMonuments = await puducherryResponse.json();
    const andhraPradeshMonuments = await andhraPradeshResponse.json();

    // Handle Kerala data structure - check if it's an array or has keralaSites property
    let keralaMonuments = [];
    if (Array.isArray(keralaData)) {
      keralaMonuments = keralaData;
    } else if (keralaData.keralaSites && Array.isArray(keralaData.keralaSites)) {
      keralaMonuments = keralaData.keralaSites;
    } else if (keralaData.sites && Array.isArray(keralaData.sites)) {
      keralaMonuments = keralaData.sites;
    }
    
    console.log('Kerala data structure:', keralaData);
    console.log('Kerala monuments:', keralaMonuments);
    console.log('West Bengal monuments:', westBengalMonuments);
    
    // Ensure all monuments have the correct state ID format
    const processedKeralaMonuments = keralaMonuments.map(monument => ({
      ...monument,
      state: 'kerala' // Ensure consistent state ID
    }));
    
    const processedWestBengalMonuments = westBengalMonuments.map(monument => ({
      ...monument,
      state: 'west-bengal' // Ensure consistent state ID
    }));
    
    const processedTelanganaMonuments = telanganaMonuments.map(monument => ({
      ...monument,
      state: 'telangana'
    }));
    
    const processedKarnatakaMonuments = karnatakaMonuments.map(monument => ({
      ...monument,
      state: 'karnataka'
    }));
    
    const processedAndamanNicobarMonuments = andamanNicobarMonuments.map(monument => ({
      ...monument,
      state: 'andaman-nicobar'
    }));
    
    const processedPuducherryMonuments = puducherryMonuments.map(monument => ({
      ...monument,
      state: 'puducherry'
    }));
    
    const processedAndhraPradeshMonuments = andhraPradeshMonuments.map(monument => ({
      ...monument,
      state: 'andhra-pradesh'
    }));
    
    appState.statesData = statesData;
    appState.monumentsData = [
      ...processedKeralaMonuments,
      ...processedWestBengalMonuments,
      ...processedTelanganaMonuments,
      ...processedKarnatakaMonuments,
      ...processedAndamanNicobarMonuments,
      ...processedPuducherryMonuments,
      ...processedAndhraPradeshMonuments
    ];

    console.log('Total monuments loaded:', appState.monumentsData.length);
    console.log('Sample monuments with states:', appState.monumentsData.slice(0, 5).map(m => ({ name: m.name, state: m.state })));
    renderStates();
  } catch (error) {
    console.error('Error loading data:', error);
  }
}

function renderStates() {
  const statesGrid = document.getElementById('statesGrid');
  statesGrid.innerHTML = '';
  appState.statesData.forEach(state => {
    const card = document.createElement('div');
    card.className = 'state-card';
    card.innerHTML = `
      <div class="state-card-image" style="background-image: url('${state.image}')"></div>
      <div class="state-card-content">
        <h3>${state.name}</h3>
        <p>${state.monumentCount} monuments</p>
      </div>
    `;
    card.addEventListener('click', () => showStateDetail(state.id));
    statesGrid.appendChild(card);
  });
}

function showStateDetail(stateId) {
  const state = appState.statesData.find(s => s.id === stateId);
  if (!state) return;

  appState.currentState = stateId;
  document.getElementById('stateTitle').textContent = state.name;
  document.getElementById('stateDescription').textContent = state.description;

  document.getElementById('heroSection').classList.add('hidden');
  document.getElementById('statesSection').classList.add('hidden');
  document.getElementById('stateDetailSection').classList.remove('hidden');
  document.getElementById('monumentDetailSection').classList.add('hidden');

  renderMonuments();
}

function renderMonuments() {
  const monumentsGrid = document.getElementById('monumentsGrid');
  monumentsGrid.innerHTML = '';
  const filteredMonuments = appState.monumentsData.filter(monument => 
    monument.state === appState.currentState &&
    (appState.currentFilter === 'all' || monument.type.toLowerCase() === appState.currentFilter)
  );

  console.log('Current state:', appState.currentState);
  console.log('Available monuments:', appState.monumentsData.length);
  console.log('Filtered monuments:', filteredMonuments.length);
  console.log('Sample monument state values:', appState.monumentsData.slice(0, 3).map(m => m.state));

  filteredMonuments.forEach(monument => {
    const card = document.createElement('div');
    card.className = 'monument-card';
    
    // Add type color class based on monument type
    let typeColorClass = '';
    switch(monument.type.toLowerCase()) {
      case 'temple':
        typeColorClass = 'bg-orange-100 text-orange-800';
        break;
      case 'mosque':
        typeColorClass = 'bg-green-100 text-green-800';
        break;
      case 'church':
        typeColorClass = 'bg-blue-100 text-blue-800';
        break;
      case 'gurudwara':
        typeColorClass = 'bg-purple-100 text-purple-800';
        break;
      default:
        typeColorClass = 'bg-gray-100 text-gray-800';
    }
    
    card.innerHTML = `
      <div class="monument-card-image" style="background-image: url('${monument.image}')"></div>
      <div class="monument-card-content">
        <div class="monument-type ${typeColorClass}">${monument.type}</div>
        <h4>${monument.name}</h4>
        <div class="monument-location">${monument.location}</div>
        <p>${monument.description.substring(0, 100)}...</p>
      </div>
    `;
    card.addEventListener('click', () => showMonumentDetail(monument.id));
    monumentsGrid.appendChild(card);
  });
  
  if (filteredMonuments.length === 0) {
    monumentsGrid.innerHTML = '<p style="text-align: center; color: #666; font-size: 1.1rem; padding: 2rem;">No monuments found for the selected filters.</p>';
  }
}

function showMonumentDetail(monumentId) {
  const monument = appState.monumentsData.find(m => m.id === monumentId);
  if (!monument) return;

  // Create monument detail content dynamically
  const monumentInfo = document.getElementById('monumentInfo');
  const monumentLocation = document.getElementById('monumentLocation');
  
  // Add type color class
  let typeColorClass = '';
  switch(monument.type.toLowerCase()) {
    case 'temple':
      typeColorClass = 'bg-orange-100 text-orange-800';
      break;
    case 'mosque':
      typeColorClass = 'bg-green-100 text-green-800';
      break;
    case 'church':
      typeColorClass = 'bg-blue-100 text-blue-800';
      break;
    case 'gurudwara':
      typeColorClass = 'bg-purple-100 text-purple-800';
      break;
    default:
      typeColorClass = 'bg-gray-100 text-gray-800';
  }
  
  monumentInfo.innerHTML = `
    <div class="monument-header">
      <div class="monument-image" style="background-image: url('${monument.image}'); width: 100%; height: 250px; background-size: cover; background-position: center; border-radius: 12px; margin-bottom: 1.5rem;"></div>
      <div class="monument-type ${typeColorClass}" style="display: inline-block; padding: 0.5rem 1rem; border-radius: 20px; font-size: 0.9rem; font-weight: 600; margin-bottom: 1rem;">${monument.type}</div>
      <h2 style="font-family: 'Playfair Display', serif; font-size: 2rem; color: #7c2d12; margin-bottom: 1rem;">${monument.name}</h2>
      <p style="color: #666; line-height: 1.6; margin-bottom: 2rem;">${monument.description}</p>
    </div>
    
    <div class="info-grid" style="display: grid; gap: 1.5rem;">
      <div class="info-item">
        <h4>Timings</h4>
        <p>${monument.timings}</p>
      </div>
      
      <div class="info-item">
        <h4>Entry Fee</h4>
        <p>${monument.entryFee}</p>
      </div>
      
      <div class="info-item">
        <h4>Best Time to Visit</h4>
        <p>${monument.bestTime}</p>
      </div>
      
      <div class="info-item">
        <h4>Festivals</h4>
        <p>${monument.festivals}</p>
      </div>
      
      <div class="info-item">
        <h4>Photography</h4>
        <p>${monument.photography}</p>
      </div>
      
      <div class="info-item">
        <h4>Facilities</h4>
        <ul>${(monument.facilities || []).map(item => `<li>${item}</li>`).join('')}</ul>
      </div>
    </div>
  `;
  
  monumentLocation.innerHTML = `
    <h3>Location & Travel Info</h3>
    
    <div class="info-item">
      <h4>Address</h4>
      <p>${monument.address}</p>
    </div>
    
    <div class="info-item">
      <h4>How to Reach</h4>
      <p>${monument.howToReach}</p>
    </div>
    
    <div class="info-item">
      <h4>Nearby Hotels</h4>
      <ul>${(monument.nearbyHotels || []).map(item => `<li>${item}</li>`).join('')}</ul>
    </div>
    
    ${monument.contact ? `
      <div class="info-item">
        <h4>Contact</h4>
        <p>${monument.contact}</p>
      </div>
    ` : ''}
    
    ${monument.website ? `
      <div class="info-item">
        <h4>Website</h4>
        <p><a href="${monument.website}" target="_blank" style="color: #ea580c;">${monument.website}</a></p>
      </div>
    ` : ''}
  `;

  document.getElementById('heroSection').classList.add('hidden');
  document.getElementById('statesSection').classList.add('hidden');
  document.getElementById('stateDetailSection').classList.add('hidden');
  document.getElementById('monumentDetailSection').classList.remove('hidden');
}

function setupEventListeners() {
  // Navigation category buttons
  document.querySelectorAll('.nav-btn').forEach(button => {
    button.addEventListener('click', () => {
      document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');
      appState.currentFilter = button.dataset.category;
      if (appState.currentState) {
        renderMonuments();
      } else {
        // Filter across all monuments if on home page (optional)
      }
    });
  });

  // Filter tabs
  document.querySelectorAll('.filter-btn').forEach(button => {
    button.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');
      appState.currentFilter = button.dataset.filter;
      renderMonuments();
    });
  });

  // Back buttons
  document.getElementById('backToStates').addEventListener('click', () => {
    document.getElementById('heroSection').classList.remove('hidden');
    document.getElementById('statesSection').classList.remove('hidden');
    document.getElementById('stateDetailSection').classList.add('hidden');
    document.getElementById('monumentDetailSection').classList.add('hidden');
    appState.currentState = null;
    appState.currentFilter = 'all';
    document.querySelector('.filter-btn[data-filter="all"]').classList.add('active');
    document.querySelectorAll('.filter-btn').forEach(btn => {
      if (btn.dataset.filter !== 'all') btn.classList.remove('active');
    });
  });

  document.getElementById('backToMonuments').addEventListener('click', () => {
    document.getElementById('stateDetailSection').classList.remove('hidden');
    document.getElementById('monumentDetailSection').classList.add('hidden');
  });

  // Search functionality
  document.getElementById('searchInput').addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const filteredMonuments = appState.monumentsData.filter(monument =>
      monument.name.toLowerCase().includes(searchTerm) ||
      monument.description.toLowerCase().includes(searchTerm) ||
      monument.location.toLowerCase().includes(searchTerm)
    );
    if (appState.currentState) {
      renderMonuments();
    } else {
      // Optionally show filtered monuments across all states
      const monumentsGrid = document.getElementById('monumentsGrid');
      monumentsGrid.innerHTML = '';
      filteredMonuments.forEach(monument => {
        const card = document.createElement('div');
        card.className = 'monument-card';
        card.innerHTML = `
          <div class="monument-card-image" style="background-image: url('${monument.image}')"></div>
          <div class="monument-card-content">
            <div class="monument-type ${monument.typeColor}">${monument.type}</div>
            <h4>${monument.name}</h4>
            <div class="monument-location">${monument.location}</div>
            <p>${monument.description.substring(0, 100)}...</p>
          </div>
        `;
        card.addEventListener('click', () => showMonumentDetail(monument.id));
        monumentsGrid.appendChild(card);
      });
      document.getElementById('heroSection').classList.add('hidden');
      document.getElementById('statesSection').classList.add('hidden');
      document.getElementById('stateDetailSection').classList.remove('hidden');
    }
  });
}

// Initialize the app
loadData();
setupEventListeners();