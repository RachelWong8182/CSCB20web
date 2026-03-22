// ===== Preview photo when user picks a file =====
function previewPhoto(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        const preview = document.getElementById('store-photo-preview');
        const placeholder = document.getElementById('photo-placeholder');
        preview.src = e.target.result;
        preview.style.display = 'block';
        placeholder.style.display = 'none';
    };
    reader.readAsDataURL(file);
}


// ===== Save photo to server =====
function savePhoto() {
    const fileInput = document.getElementById('photo-input');
    const file = fileInput.files[0];

    if (!file) {
        alert('Please select a photo first.');
        return;
    }

    const formData = new FormData();
    formData.append('photo', file);

    fetch('/api/store/photo', {
        method: 'POST',
        body: formData
    })
    .then(r => r.json())
    .then(data => {
        if (data.success) {
            alert('Photo saved!');
        } else {
            alert('Failed to save photo: ' + data.message);
        }
    });
}


// ===== Save store info to server =====
function saveStoreInfo() {
    const name        = document.getElementById('store-name').value.trim();
    const cuisine     = document.getElementById('store-cuisine').value.trim();
    const address     = document.getElementById('store-address').value.trim();
    const price       = document.getElementById('store-price').value.trim();
    const hours       = document.getElementById('store-hours').value.trim();
    const description = document.getElementById('store-description').value.trim();

    const saveMsg  = document.getElementById('store-save-msg');
    const errorMsg = document.getElementById('store-error-msg');
    saveMsg.style.display  = 'none';
    errorMsg.style.display = 'none';

    if (!name) {
        errorMsg.textContent = 'Restaurant name is required.';
        errorMsg.style.display = 'block';
        return;
    }

    fetch('/api/store/info', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, cuisine, address, price, hours, description })
    })
    .then(r => r.json())
    .then(data => {
        if (data.success) {
            saveMsg.style.display = 'block';
        } else {
            errorMsg.textContent = data.message;
            errorMsg.style.display = 'block';
        }
    });
}


// ===== Load existing store info on page load =====
document.addEventListener('DOMContentLoaded', () => {

    // ===== Cuisine tag click handler =====
    const tags = document.querySelectorAll('.cuisine-tag');
    const cuisineInput = document.getElementById('store-cuisine');

    tags.forEach(tag => {
        tag.addEventListener('click', () => {
            // Deselect all, select clicked
            tags.forEach(t => t.classList.remove('selected'));
            tag.classList.add('selected');
            cuisineInput.value = tag.dataset.value;
        });
    });

    fetch('/api/store/info')
        .then(r => r.json())
        .then(data => {
            if (data.success && data.store) {
                document.getElementById('store-name').value        = data.store.name        || '';
                document.getElementById('store-address').value     = data.store.address     || '';
                document.getElementById('store-price').value       = data.store.price       || '';
                document.getElementById('store-hours').value       = data.store.hours       || '';
                document.getElementById('store-description').value = data.store.description || '';

                // Restore selected cuisine tag
                if (data.store.cuisine) {
                    cuisineInput.value = data.store.cuisine;
                    tags.forEach(tag => {
                        if (tag.dataset.value === data.store.cuisine) {
                            tag.classList.add('selected');
                        }
                    });
                }

                // Load existing photo if any
                if (data.store.photo_url) {
                    const preview = document.getElementById('store-photo-preview');
                    const placeholder = document.getElementById('photo-placeholder');
                    preview.src = data.store.photo_url;
                    preview.style.display = 'block';
                    placeholder.style.display = 'none';
                }
            }
        });
});