let drugData = [];
let currentCategory = '전체';
let searchQuery = '';

const drugListElement = document.getElementById('drug-list');
const categoryButtons = document.querySelectorAll('.cat-btn');
const searchInput = document.getElementById('search-input');
const modal = document.getElementById('drug-modal');
const modalContent = document.getElementById('modal-body');
const closeModal = document.querySelector('.close');

// Fetch large mock dataset
fetch('drugs.json')
    .then(response => response.json())
    .then(data => {
        drugData = data;
        renderDrugs();
    })
    .catch(error => {
        console.error('Error fetching drugs:', error);
        drugListElement.innerHTML = '<div class="no-results">데이터를 불러오는 데 실패했습니다.</div>';
    });

// Category Filtering
categoryButtons.forEach(button => {
    button.addEventListener('click', () => {
        categoryButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        currentCategory = button.getAttribute('data-category');
        renderDrugs();
    });
});

// Search functionality
searchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value.toLowerCase();
    renderDrugs();
});

function renderDrugs() {
    const filteredDrugs = drugData.filter(drug => {
        const matchesCategory = currentCategory === '전체' || drug.category === currentCategory;
        const matchesSearch = drug.name.toLowerCase().includes(searchQuery) || 
                            drug.manufacturer.toLowerCase().includes(searchQuery) ||
                            drug.ingredients.toLowerCase().includes(searchQuery);
        return matchesCategory && matchesSearch;
    });

    drugListElement.innerHTML = '';
    
    if (filteredDrugs.length === 0) {
        drugListElement.innerHTML = '<div class="no-results">검색 결과가 없습니다.</div>';
        return;
    }

    filteredDrugs.forEach(drug => {
        const card = document.createElement('div');
        card.className = 'drug-card';
        card.innerHTML = `
            <div class="card-category">${drug.category}</div>
            <h3 class="card-name">${drug.name}</h3>
            <p class="card-manufacturer">${drug.manufacturer}</p>
            <button class="detail-btn" onclick="showDetail(${drug.id})">상세보기</button>
        `;
        drugListElement.appendChild(card);
    });
}

window.showDetail = function(id) {
    const drug = drugData.find(d => d.id === id);
    if (!drug) return;

    modalContent.innerHTML = `
        <div class="detail-header">
            <span class="detail-category">${drug.category}</span>
            <h2>${drug.name}</h2>
            <p class="manufacturer-large">${drug.manufacturer}</p>
        </div>
        <div class="detail-grid">
            <div class="detail-item">
                <label>주요 성분</label>
                <p>${drug.ingredients}</p>
            </div>
            <div class="detail-item">
                <label>보험코드</label>
                <p>${drug.insuranceCode}</p>
            </div>
            <div class="detail-item full-width">
                <label>효능/효과</label>
                <p>${drug.efficacy}</p>
            </div>
            <div class="detail-item full-width">
                <label>용법/용량</label>
                <p>${drug.usage}</p>
            </div>
            <div class="detail-item full-width">
                <label>보관방법</label>
                <p>${drug.storage}</p>
            </div>
            <div class="detail-item full-width">
                <label>상세 설명</label>
                <p>${drug.description}</p>
            </div>
        </div>
    `;
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden'; // Prevent scroll
};

closeModal.onclick = function() {
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
};

window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
};