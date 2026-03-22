const searchInput   = document.getElementById('searchbox');
const filterButtons = document.querySelectorAll('.filter-btn');
const restaurantList = document.getElementById('restaurantList');

// All loaded cards (replaces the old hardcoded array)
let restaurantCards = [];


// ===== Detect which cuisine page we're on =====
// Maps filename → cuisine string that must match what manager typed
const cuisineMap = {
    'restaurant_italian.html':  'Italian',
    'restaurant_chinese.html':  'Chinese',
    'restaurant_japanese.html': 'Japanese',
    'restaurant_korean.html':   'Korean',
    'restaurant_french.html':   'French',
    'restaurant_thai.html':     'Thai',
    'restaurant_indian.html':   'Indian',
    'restaurant_others.html':   'Others',
};

const currentPage = window.location.pathname.split('/').pop();
const cuisine     = cuisineMap[currentPage] || '';


// ===== Build a card element from a store object =====
function createCard(store) {
    const card = document.createElement('button');
    card.className = 'restaurant-card';
    card.dataset.name     = store.name     || '';
    card.dataset.rating   = store.rating   || '0';
    card.dataset.price    = store.price    || '$0';
    card.dataset.distance = store.distance || '0';

    card.innerHTML = `
        <div class="restaurant-info">
            <div class="restaurant-name">${store.name || 'Unnamed Restaurant'}</div>
            <div class="restaurant-meta">📍 ${store.address || 'Address not provided'}</div>
            <div class="restaurant-meta">💰 ${store.price || 'N/A'} / person</div>
            <div class="restaurant-meta">🕐 ${store.hours || 'Hours not provided'}</div>
            ${store.description ? `<div class="restaurant-meta">${store.description}</div>` : ''}
        </div>
        ${store.photo_url ? `<img src="${store.photo_url}" style="width:80px;height:80px;object-fit:cover;border-radius:10px;margin-left:auto;">` : ''}
    `;

    card.addEventListener('click', () => {
        restaurantCards.forEach(c => c.classList.remove('active'));
        card.classList.add('active');
    });

    return card;
}


// ===== Load restaurants for this cuisine from API =====
function loadRestaurants() {
    if (!cuisine) return;

    fetch(`/api/restaurants/${encodeURIComponent(cuisine)}`)
        .then(r => r.json())
        .then(data => {
            restaurantList.innerHTML = '';
            restaurantCards = [];

            if (!data.restaurants || data.restaurants.length === 0) {
                restaurantList.innerHTML = '<p style="color:#aaa; padding:20px;">No restaurants listed yet for this cuisine.</p>';
                return;
            }

            data.restaurants.forEach(store => {
                const card = createCard(store);
                restaurantList.appendChild(card);
                restaurantCards.push(card);
            });

            // Re-attach search listener after cards are loaded
            attachSearch();
        });
}


// ===== Search =====
function attachSearch() {
    searchInput.addEventListener('input', () => {
        const keyword = searchInput.value.trim().toLowerCase();
        restaurantCards.forEach(card => {
            const name = card.dataset.name.toLowerCase();
            card.style.display = name.includes(keyword) ? 'flex' : 'none';
        });
    });
}


// ===== Filter/Sort =====
filterButtons.forEach(button => {
    button.addEventListener('click', () => {
        const type = button.dataset.filter;
        const visibleCards = restaurantCards.filter(card => card.style.display !== 'none');

        visibleCards.sort((a, b) => {
            if (type === 'rating') {
                return Number(b.dataset.rating) - Number(a.dataset.rating);
            }
            if (type === 'price') {
                return extractPrice(a.dataset.price) - extractPrice(b.dataset.price);
            }
            if (type === 'distance') {
                return Number(a.dataset.distance) - Number(b.dataset.distance);
            }
            return a.dataset.name.localeCompare(b.dataset.name, undefined, { numeric: true });
        });

        visibleCards.forEach(card => restaurantList.appendChild(card));
    });
});

function extractPrice(priceText) {
    const match = priceText ? priceText.match(/\d+/) : null;
    return match ? Number(match[0]) : 0;
}


// ===== Run on page load =====
document.addEventListener('DOMContentLoaded', () => {
    loadRestaurants();
});