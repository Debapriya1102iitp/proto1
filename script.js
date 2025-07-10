const appState = {
  statesData: [],
  monumentsData: [],
  currentState: null,
  currentFilter: 'all',
  allMonuments: [], // Store all monuments for global search
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

    // Secure data loading with error handling
    const statesData = await statesResponse.json();
    const keralaData = await keralaResponse.json();
    const westBengalMonuments = await westBengalResponse.json();
    const telanganaMonuments = await telanganaResponse.json();
    const karnatakaMonuments = await karnatakaResponse.json();
    const andamanNicobarMonuments = await andamanNicobarResponse.json();
    const puducherryMonuments = await puducherryResponse.json();
    const andhraPradeshMonuments = await andhraPradeshResponse.json();

    // Handle Kerala data structure securely
    let keralaMonuments = [];
    if (Array.isArray(keralaData)) {
      keralaMonuments = keralaData;
    } else if (keralaData.keralaSites && Array.isArray(keralaData.keralaSites)) {
      keralaMonuments = keralaData.keralaSites;
    } else if (keralaData.sites && Array.isArray(keralaData.sites)) {
      keralaMonuments = keralaData.sites;
    }
    
    console.log('Data loaded securely - Kerala monuments:', keralaMonuments.length);
    console.log('Data loaded securely - West Bengal monuments:', westBengalMonuments.length);
    
    // Securely process monuments with state mapping
    const processedKeralaMonuments = keralaMonuments.map(monument => ({
      ...monument,
      state: 'kerala'
    }));
    
    const processedWestBengalMonuments = westBengalMonuments.map(monument => ({
      ...monument,
      state: 'west-bengal'
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
    
    // Securely store data in app state
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
    appState.allMonuments = [...appState.monumentsData]; // Backup for global operations

    console.log('Total monuments loaded securely:', appState.monumentsData.length);
    renderStates();
  } catch (error) {
    console.error('Secure data loading failed:', error);
    // Fallback to prevent data exposure
    appState.statesData = [];
    appState.monumentsData = [];
    appState.allMonuments = [];
  }
}

function renderStates() {
  const statesGrid = document.getElementById('statesGrid');
  statesGrid.innerHTML = '';
  appState.statesData.forEach(state => {
    const monumentCount = appState.monumentsData.filter(m => m.state === state.id).length;
    const card = document.createElement('div');
    card.className = 'state-card';
    card.innerHTML = `
      <div class="state-card-image" style="background-image: url('${state.image}')"></div>
      <div class="state-card-content">
        <h3>${state.name}</h3>
        <p>${monumentCount} monuments</p>
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

  // Reset filter to 'all' when entering state detail
  appState.currentFilter = 'all';
  document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
  document.querySelector('.filter-btn[data-filter="all"]').classList.add('active');

  document.getElementById('heroSection').classList.add('hidden');
  document.getElementById('statesSection').classList.add('hidden');
  document.getElementById('stateDetailSection').classList.remove('hidden');
  document.getElementById('monumentDetailSection').classList.add('hidden');

  renderMonuments();
}

function renderMonuments() {
  const monumentsGrid = document.getElementById('monumentsGrid');
  monumentsGrid.innerHTML = '';
  
  let filteredMonuments;
  
  if (appState.currentState) {
    // Filter by current state and type
    filteredMonuments = appState.monumentsData.filter(monument => 
      monument.state === appState.currentState &&
      (appState.currentFilter === 'all' || monument.type.toLowerCase() === appState.currentFilter)
    );
  } else {
    // Global filter (when searching from home)
    filteredMonuments = appState.monumentsData.filter(monument =>
      appState.currentFilter === 'all' || monument.type.toLowerCase() === appState.currentFilter
    );
  }

  console.log('Rendering monuments - Current state:', appState.currentState);
  console.log('Current filter:', appState.currentFilter);
  console.log('Filtered monuments:', filteredMonuments.length);

  filteredMonuments.forEach(monument => {
    const card = document.createElement('div');
    card.className = 'monument-card';
    
    // Secure type color mapping
    let typeColorClass = monument.typeColor || '';
    if (!typeColorClass) {
      switch(monument.type.toLowerCase()) {
        case 'temple':
          typeColorClass = 'bg-orange-100 text-orange-800';
          break;
        case 'mosque':
          typeColorClass = 'bg-green-100 text-green-800';
          break;
        case 'church':
          typeColorClass = 'bg-purple-100 text-purple-800';
          break;
        case 'gurudwara':
          typeColorClass = 'bg-blue-100 text-blue-800';
          break;
        default:
          typeColorClass = 'bg-gray-100 text-gray-800';
      }
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

  const monumentInfo = document.getElementById('monumentInfo');
  const monumentLocation = document.getElementById('monumentLocation');
  
  // Secure type color mapping
  let typeColorClass = monument.typeColor || '';
  if (!typeColorClass) {
    switch(monument.type.toLowerCase()) {
      case 'temple':
        typeColorClass = 'bg-orange-100 text-orange-800';
        break;
      case 'mosque':
        typeColorClass = 'bg-green-100 text-green-800';
        break;
      case 'church':
        typeColorClass = 'bg-purple-100 text-purple-800';
        break;
      case 'gurudwara':
        typeColorClass = 'bg-blue-100 text-blue-800';
        break;
      default:
        typeColorClass = 'bg-gray-100 text-gray-800';
    }
  }
  
  monumentInfo.innerHTML = `
    <div class="monument-header">
      <div class="monument-image" style="background-image: url('${monument.image}'); width: 100%; height: 250px; background-size: cover; background-position: center; border-radius: 12px; margin-bottom: 1.5rem;"></div>
      <div class="monument-type ${typeColorClass}" style="display: inline-block; padding: 0.5rem 1rem; border-radius: 20px; font-size: 0.9rem; font-weight: 600; margin-bottom: 1rem;">${monument.type}</div>
      <h2 style="font-family: 'Playfair Display', serif; font-size: 2rem; color: #7c2d12; margin-bottom: 1rem;">${monument.name}</h2>
      <p style="color: #666; line-height: 1.6; margin-bottom: 2rem;">${monument.description}</p>
    </div>
    
    <div class="info-grid" style="display: grid; gap: 1.5rem;">
      ${monument.timings ? `
        <div class="info-item">
          <h4>Timings</h4>
          <p>${monument.timings}</p>
        </div>
      ` : ''}
      
      ${monument.entryFee ? `
        <div class="info-item">
          <h4>Entry Fee</h4>
          <p>${monument.entryFee}</p>
        </div>
      ` : ''}
      
      ${monument.bestTime ? `
        <div class="info-item">
          <h4>Best Time to Visit</h4>
          <p>${monument.bestTime}</p>
        </div>
      ` : ''}
      
      ${monument.festivals && monument.festivals.length > 0 ? `
        <div class="info-item">
          <h4>Festivals</h4>
          <ul>${monument.festivals.map(festival => `<li>${festival}</li>`).join('')}</ul>
        </div>
      ` : ''}
      
      ${monument.amenities && monument.amenities.length > 0 ? `
        <div class="info-item">
          <h4>Amenities</h4>
          <ul>${monument.amenities.map(amenity => `<li>${amenity}</li>`).join('')}</ul>
        </div>
      ` : ''}
      
      ${monument.specialFeatures && monument.specialFeatures.length > 0 ? `
        <div class="info-item">
          <h4>Special Features</h4>
          <ul>${monument.specialFeatures.map(feature => `<li>${feature}</li>`).join('')}</ul>
        </div>
      ` : ''}
    </div>
  `;
  
  monumentLocation.innerHTML = `
    <h3>Location & Travel Info</h3>
    
    <div class="info-item">
      <h4>Address</h4>
      <p>${monument.location}</p>
    </div>
    
    ${monument.nearestTransport ? `
      <div class="info-item">
        <h4>Nearest Transport</h4>
        <ul>
          ${monument.nearestTransport.railway ? `<li><strong>Railway:</strong> ${monument.nearestTransport.railway}</li>` : ''}
          ${monument.nearestTransport.airport ? `<li><strong>Airport:</strong> ${monument.nearestTransport.airport}</li>` : ''}
          ${monument.nearestTransport.bus ? `<li><strong>Bus:</strong> ${monument.nearestTransport.bus}</li>` : ''}
        </ul>
      </div>
    ` : ''}
    
    ${monument.nearbyAttractions && monument.nearbyAttractions.length > 0 ? `
      <div class="info-item">
        <h4>Nearby Attractions</h4>
        <ul>${monument.nearbyAttractions.map(attraction => `<li>${attraction}</li>`).join('')}</ul>
      </div>
    ` : ''}
    
    ${monument.nearbyHotels && monument.nearbyHotels.length > 0 ? `
      <div class="info-item">
        <h4>Nearby Hotels</h4>
        <ul>${monument.nearbyHotels.map(hotel => `<li>${hotel}</li>`).join('')}</ul>
      </div>
    ` : ''}
    
    ${monument.nearbyRestaurants && monument.nearbyRestaurants.length > 0 ? `
      <div class="info-item">
        <h4>Nearby Restaurants</h4>
        <ul>${monument.nearbyRestaurants.map(restaurant => `<li>${restaurant}</li>`).join('')}</ul>
      </div>
    ` : ''}
    
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
  // Navigation category buttons (top navigation)
  document.querySelectorAll('.nav-btn').forEach(button => {
    button.addEventListener('click', () => {
      document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');
      appState.currentFilter = button.dataset.category;
      
      if (appState.currentState) {
        // Update state detail filter tabs to match
        document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
        const matchingFilterBtn = document.querySelector(`.filter-btn[data-filter="${appState.currentFilter}"]`);
        if (matchingFilterBtn) {
          matchingFilterBtn.classList.add('active');
        }
        renderMonuments();
      } else {
        // Show filtered monuments from all states
        showGlobalFilteredMonuments();
      }
    });
  });

  // Filter tabs (state detail page)
  document.querySelectorAll('.filter-btn').forEach(button => {
    button.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');
      appState.currentFilter = button.dataset.filter;
      
      // Update navigation buttons to match
      document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
      const matchingNavBtn = document.querySelector(`.nav-btn[data-category="${appState.currentFilter}"]`);
      if (matchingNavBtn) {
        matchingNavBtn.classList.add('active');
      }
      
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
    
    // Reset all filters
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelector('.nav-btn[data-category="all"]').classList.add('active');
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelector('.filter-btn[data-filter="all"]').classList.add('active');
  });

  document.getElementById('backToMonuments').addEventListener('click', () => {
    document.getElementById('stateDetailSection').classList.remove('hidden');
    document.getElementById('monumentDetailSection').classList.add('hidden');
  });

  // Search functionality
  document.getElementById('searchInput').addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase().trim();
    
    if (searchTerm === '') {
      if (appState.currentState) {
        renderMonuments();
      }
      return;
    }
    
    const filteredMonuments = appState.allMonuments.filter(monument =>
      monument.name.toLowerCase().includes(searchTerm) ||
      monument.description.toLowerCase().includes(searchTerm) ||
      monument.location.toLowerCase().includes(searchTerm) ||
      monument.type.toLowerCase().includes(searchTerm)
    );
    
    if (appState.currentState) {
      // Filter within current state
      const stateFilteredMonuments = filteredMonuments.filter(m => m.state === appState.currentState);
      renderSearchResults(stateFilteredMonuments);
    } else {
      // Global search - show results from all states
      showGlobalSearchResults(filteredMonuments);
    }
  });
}

function showGlobalFilteredMonuments() {
  const filteredMonuments = appState.allMonuments.filter(monument =>
    appState.currentFilter === 'all' || monument.type.toLowerCase() === appState.currentFilter
  );
  
  showGlobalSearchResults(filteredMonuments, `${appState.currentFilter === 'all' ? 'All' : appState.currentFilter.charAt(0).toUpperCase() + appState.currentFilter.slice(1)} Monuments`);
}

function showGlobalSearchResults(monuments, title = 'Search Results') {
  // Show state detail section with global results
  document.getElementById('heroSection').classList.add('hidden');
  document.getElementById('statesSection').classList.add('hidden');
  document.getElementById('stateDetailSection').classList.remove('hidden');
  document.getElementById('monumentDetailSection').classList.add('hidden');
  
  document.getElementById('stateTitle').textContent = title;
  document.getElementById('stateDescription').textContent = `Found ${monuments.length} monuments across all states`;
  
  renderSearchResults(monuments);
}

function renderSearchResults(monuments) {
  const monumentsGrid = document.getElementById('monumentsGrid');
  monumentsGrid.innerHTML = '';
  
  monuments.forEach(monument => {
    const card = document.createElement('div');
    card.className = 'monument-card';
    
    let typeColorClass = monument.typeColor || '';
    if (!typeColorClass) {
      switch(monument.type.toLowerCase()) {
        case 'temple':
          typeColorClass = 'bg-orange-100 text-orange-800';
          break;
        case 'mosque':
          typeColorClass = 'bg-green-100 text-green-800';
          break;
        case 'church':
          typeColorClass = 'bg-purple-100 text-purple-800';
          break;
        case 'gurudwara':
          typeColorClass = 'bg-blue-100 text-blue-800';
          break;
        default:
          typeColorClass = 'bg-gray-100 text-gray-800';
      }
    }
    
    // Get state name for display
    const stateName = appState.statesData.find(s => s.id === monument.state)?.name || monument.state;
    
    card.innerHTML = `
      <div class="monument-card-image" style="background-image: url('${monument.image}')"></div>
      <div class="monument-card-content">
        <div class="monument-type ${typeColorClass}">${monument.type}</div>
        <h4>${monument.name}</h4>
        <div class="monument-location">${monument.location}</div>
        <div class="monument-state" style="color: #ea580c; font-size: 0.8rem; font-weight: 500; margin-bottom: 0.5rem;">${stateName}</div>
        <p>${monument.description.substring(0, 100)}...</p>
      </div>
    `;
    card.addEventListener('click', () => showMonumentDetail(monument.id));
    monumentsGrid.appendChild(card);
  });
  
  if (monuments.length === 0) {
    monumentsGrid.innerHTML = '<p style="text-align: center; color: #666; font-size: 1.1rem; padding: 2rem;">No monuments found matching your criteria.</p>';
  }
}

// Initialize the app securely
loadData();
setupEventListeners();