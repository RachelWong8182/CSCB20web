const searchInput = document.getElementById('searchbox');
const restaurantCards = Array.from(document.querySelectorAll('.restaurant-card'));
const filterButtons = document.querySelectorAll('.filter-btn');
const restaurantList = document.getElementById('restaurantList');

searchInput.addEventListener('input', () => {
    const keyword = searchInput.value.trim().toLowerCase();

    restaurantCards.forEach(card => {
        const name = card.dataset.name.toLowerCase();
        const visible = name.includes(keyword);
        card.style.display = visible ? 'flex' : 'none';
    });
});

restaurantCards.forEach(card => {
    card.addEventListener('click', () => {
        restaurantCards.forEach(item => item.classList.remove('active'));
        card.classList.add('active');
    });
});

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
    const match = priceText.match(/\d+/);
    return match ? Number(match[0]) : 0;
}

function login_popup(){
    fetch('pop_up.html')
        .then(rawfile => rawfile.text())
        .then(html => {
        document.getElementById('modal-container').innerHTML = html;
        document.getElementById('login-popup').style.display = 'flex';
        });
}
