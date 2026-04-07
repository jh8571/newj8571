document.addEventListener('DOMContentLoaded', () => {
    let drugData = [];
    let currentCategory = '전체';
    let searchQuery = '';

    const drugListElement = document.getElementById('drug-list');
    const categoryButtons = document.querySelectorAll('.cat-btn');
    const searchInput = document.getElementById('search-input');
    const searchBtn = document.getElementById('search-btn');
    const welcomeMessage = document.getElementById('welcome-message');
    const resultsSection = document.getElementById('results-section');
    const modal = document.getElementById('drug-modal');
    const modalContent = document.getElementById('modal-body');
    const closeModal = document.querySelector('.close');

    if (!drugListElement || !searchBtn || !searchInput) return;

    // Initial Load
    fetch('drugs.json')
        .then(response => {
            if (!response.ok) throw new Error('Network response was not ok');
            return response.json();
        })
        .then(data => {
            drugData = data;
        })
        .catch(error => console.error('Error loading drug data:', error));

    // Search Trigger
    searchBtn.addEventListener('click', performSearch);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') performSearch();
    });

    window.quickSearch = function(query) {
        searchInput.value = query;
        performSearch();
    };

    function performSearch() {
        searchQuery = searchInput.value.trim().toLowerCase();
        if (!searchQuery) {
            alert('검색어를 입력해 주세요.');
            return;
        }
        
        if (welcomeMessage) welcomeMessage.style.display = 'none';
        if (resultsSection) resultsSection.style.display = 'block';
        renderDrugs();
    }

    // Category Filtering
    categoryButtons.forEach(button => {
        button.addEventListener('click', () => {
            categoryButtons.forEach(btn => {
                btn.classList.remove('active');
                btn.style.background = 'white';
                btn.style.color = 'inherit';
            });
            button.classList.add('active');
            button.style.background = '#004e92';
            button.style.color = 'white';
            currentCategory = button.getAttribute('data-category');
            renderDrugs();
        });
    });

    function renderDrugs() {
        const filteredDrugs = drugData.filter(drug => {
            const matchesCategory = currentCategory === '전체' || drug.category === currentCategory;
            const matchesSearch = drug.name.toLowerCase().includes(searchQuery) || 
                                drug.manufacturer.toLowerCase().includes(searchQuery) ||
                                drug.ingredients.toLowerCase().includes(searchQuery) ||
                                drug.efficacy.toLowerCase().includes(searchQuery);
            return matchesCategory && matchesSearch;
        });

        drugListElement.innerHTML = '';
        
        if (filteredDrugs.length === 0) {
            drugListElement.innerHTML = `
                <div class="no-results" style="grid-column: 1/-1; padding: 40px; background: #f8fafc; border-radius: 15px;">
                    <i class="fas fa-search-minus" style="font-size: 3rem; color: #cbd5e1; margin-bottom: 20px; display: block;"></i>
                    <h3 style="color: #1e293b;">검색 결과가 없습니다</h3>
                    <p style="color: #64748b;">다른 검색어나 카테고리를 시도해 보세요.</p>
                </div>`;
            return;
        }

        filteredDrugs.forEach(drug => {
            const card = document.createElement('div');
            card.className = 'drug-card';
            card.innerHTML = `
                <div class="card-category ${drug.category === '전문의약품' ? 'pro' : 'general'}">${drug.category}</div>
                <h3 class="card-name">${drug.name}</h3>
                <p class="card-manufacturer">${drug.manufacturer}</p>
                <div class="card-efficacy">
                    ${drug.efficacy}
                </div>
                <button class="detail-btn">상세정보 보기</button>
            `;
            card.onclick = () => showDetail(drug.id);
            drugListElement.appendChild(card);
        });
    }

    window.showDetail = function(id) {
        const drug = drugData.find(d => d.id === id);
        if (!drug || !modalContent || !modal) return;

        modalContent.innerHTML = `
            <div class="detail-header">
                <span class="detail-category ${drug.category === '전문의약품' ? 'pro' : 'general'}">${drug.category}</span>
                <h2 style="margin-top:15px; font-size: 1.8rem; color: #000428;">${drug.name}</h2>
                <p style="color: #64748b; font-weight: 600;">${drug.manufacturer}</p>
            </div>
            <div class="detail-grid">
                <div class="detail-item">
                    <label><i class="fas fa-flask"></i> 주요 성분</label>
                    <p>${drug.ingredients}</p>
                </div>
                <div class="detail-item">
                    <label><i class="fas fa-barcode"></i> 보험코드</label>
                    <p>${drug.insuranceCode}</p>
                </div>
                <div class="detail-item full-width highlight-box">
                    <label><i class="fas fa-check-circle"></i> 효능 및 효과</label>
                    <p style="font-weight: 500;">${drug.efficacy}</p>
                </div>
                <div class="detail-item full-width">
                    <label><i class="fas fa-directions"></i> 용법 및 용량</label>
                    <p>${drug.usage}</p>
                </div>
                <div class="detail-item full-width">
                    <label><i class="fas fa-box-open"></i> 보관 방법</label>
                    <p>${drug.storage}</p>
                </div>
                <div class="detail-item full-width" style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 10px;">
                    <label><i class="fas fa-info-circle"></i> 상세 설명</label>
                    <p style="color: #475569; font-size: 0.95rem; line-height: 1.7;">${drug.description}</p>
                </div>
            </div>
        `;
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    };

    if (closeModal) {
        closeModal.onclick = () => {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        };
    }

    window.onclick = (event) => {
        if (modal && event.target == modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    };
});