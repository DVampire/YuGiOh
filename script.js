// 全局变量
let allCards = [];
let filteredCards = [];
let currentPage = 1;
const cardsPerPage = 20;

// DOM 元素
const searchInput = document.getElementById('searchInput');
const clearSearchBtn = document.getElementById('clearSearch');
const typeFilter = document.getElementById('typeFilter');
const raceFilter = document.getElementById('raceFilter');
const archetypeFilter = document.getElementById('archetypeFilter');
const cardsContainer = document.getElementById('cardsContainer');
const loading = document.getElementById('loading');
const noResults = document.getElementById('noResults');
const totalCardsSpan = document.getElementById('totalCards');
const filteredCardsSpan = document.getElementById('filteredCards');
const currentPageSpan = document.getElementById('currentPage');
const totalPagesSpan = document.getElementById('totalPages');
const prevPageBtn = document.getElementById('prevPage');
const nextPageBtn = document.getElementById('nextPage');
const cardModal = document.getElementById('cardModal');
const closeModal = document.querySelector('.close');

// 初始化应用
document.addEventListener('DOMContentLoaded', function() {
    loadCards();
    setupEventListeners();
});

// 加载卡片数据
async function loadCards() {
    try {
        const response = await fetch('card.json');
        const data = await response.json();
        allCards = data.data || [];
        
        // 更新统计信息
        totalCardsSpan.textContent = allCards.length;
        
        // 填充筛选器选项
        populateFilters();
        
        // 应用初始筛选
        applyFilters();
        
        // 隐藏加载动画
        loading.style.display = 'none';
        
    } catch (error) {
        console.error('加载卡片数据失败:', error);
        loading.innerHTML = '<p>加载失败，请刷新页面重试</p>';
    }
}

// 填充筛选器选项
function populateFilters() {
    const races = new Set();
    const archetypes = new Set();
    
    allCards.forEach(card => {
        if (card.race) races.add(card.race);
        if (card.archetype) archetypes.add(card.archetype);
    });
    
    // 填充种族筛选器
    races.forEach(race => {
        const option = document.createElement('option');
        option.value = race;
        option.textContent = race;
        raceFilter.appendChild(option);
    });
    
    // 填充系列筛选器
    archetypes.forEach(archetype => {
        const option = document.createElement('option');
        option.value = archetype;
        option.textContent = archetype;
        archetypeFilter.appendChild(option);
    });
}

// 设置事件监听器
function setupEventListeners() {
    // 搜索功能
    searchInput.addEventListener('input', debounce(applyFilters, 300));
    clearSearchBtn.addEventListener('click', clearSearch);
    
    // 筛选器
    typeFilter.addEventListener('change', applyFilters);
    raceFilter.addEventListener('change', applyFilters);
    archetypeFilter.addEventListener('change', applyFilters);
    
    // 分页
    prevPageBtn.addEventListener('click', () => changePage(-1));
    nextPageBtn.addEventListener('click', () => changePage(1));
    
    // 模态框
    closeModal.addEventListener('click', closeCardModal);
    window.addEventListener('click', (e) => {
        if (e.target === cardModal) {
            closeCardModal();
        }
    });
    
    // ESC键关闭模态框
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeCardModal();
        }
    });
}

// 防抖函数
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// 应用筛选器
function applyFilters() {
    const searchTerm = searchInput.value.toLowerCase().trim();
    const selectedType = typeFilter.value;
    const selectedRace = raceFilter.value;
    const selectedArchetype = archetypeFilter.value;
    
    // 显示/隐藏清除搜索按钮
    clearSearchBtn.style.display = searchTerm ? 'block' : 'none';
    
    // 筛选卡片
    filteredCards = allCards.filter(card => {
        const matchesSearch = !searchTerm || 
            card.name.toLowerCase().includes(searchTerm) ||
            (card.desc && card.desc.toLowerCase().includes(searchTerm));
        
        const matchesType = !selectedType || card.type === selectedType;
        const matchesRace = !selectedRace || card.race === selectedRace;
        const matchesArchetype = !selectedArchetype || card.archetype === selectedArchetype;
        
        return matchesSearch && matchesType && matchesRace && matchesArchetype;
    });
    
    // 更新统计信息
    filteredCardsSpan.textContent = filteredCards.length;
    
    // 重置到第一页
    currentPage = 1;
    
    // 显示结果
    displayCards();
    updatePagination();
}

// 清除搜索
function clearSearch() {
    searchInput.value = '';
    clearSearchBtn.style.display = 'none';
    applyFilters();
}

// 显示卡片
function displayCards() {
    if (filteredCards.length === 0) {
        cardsContainer.innerHTML = '';
        noResults.style.display = 'block';
        return;
    }
    
    noResults.style.display = 'none';
    
    const startIndex = (currentPage - 1) * cardsPerPage;
    const endIndex = startIndex + cardsPerPage;
    const cardsToShow = filteredCards.slice(startIndex, endIndex);
    
    cardsContainer.innerHTML = cardsToShow.map(card => createCardHTML(card)).join('');
    
    // 为卡片添加点击事件
    cardsContainer.querySelectorAll('.card').forEach((cardElement, index) => {
        cardElement.addEventListener('click', () => {
            showCardModal(cardsToShow[index]);
        });
    });
}

// 创建卡片HTML
function createCardHTML(card) {
    const imageUrl = card.card_images && card.card_images[0] ? card.card_images[0].image_url : '';
    const placeholderColor = getPlaceholderColor(card.type);
    
    return `
        <div class="card" data-card-id="${card.id}">
            <div class="card-image" style="background: ${placeholderColor}">
                ${imageUrl ? `<img src="${imageUrl}" alt="${card.name}" onerror="this.style.display='none'">` : ''}
            </div>
            <div class="card-content">
                <h3 class="card-name">${card.name}</h3>
                <div class="card-meta">
                    ${card.type ? `<span class="card-type">${card.type}</span>` : ''}
                    ${card.race ? `<span class="card-race">${card.race}</span>` : ''}
                    ${card.archetype ? `<span class="card-archetype">${card.archetype}</span>` : ''}
                </div>
                <div class="card-stats">
                    ${card.atk ? `<div class="stat"><span class="stat-label">ATK:</span> ${card.atk}</div>` : ''}
                    ${card.def ? `<div class="stat"><span class="stat-label">DEF:</span> ${card.def}</div>` : ''}
                    ${card.level ? `<div class="stat"><span class="stat-label">等级:</span> ${card.level}</div>` : ''}
                    ${card.linkval ? `<div class="stat"><span class="stat-label">连接值:</span> ${card.linkval}</div>` : ''}
                </div>
            </div>
        </div>
    `;
}

// 获取占位符颜色
function getPlaceholderColor(cardType) {
    const colors = {
        'Normal Monster': 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
        'Effect Monster': 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
        'Spell Card': 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
        'Trap Card': 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
        'Fusion Monster': 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
        'Synchro Monster': 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
        'XYZ Monster': 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
        'Link Monster': 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)'
    };
    return colors[cardType] || 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)';
}

// 更新分页
function updatePagination() {
    const totalPages = Math.ceil(filteredCards.length / cardsPerPage);
    
    currentPageSpan.textContent = currentPage;
    totalPagesSpan.textContent = totalPages;
    
    prevPageBtn.disabled = currentPage <= 1;
    nextPageBtn.disabled = currentPage >= totalPages;
    
    // 隐藏分页如果只有一页
    document.getElementById('pagination').style.display = totalPages <= 1 ? 'none' : 'flex';
}

// 切换页面
function changePage(direction) {
    const totalPages = Math.ceil(filteredCards.length / cardsPerPage);
    const newPage = currentPage + direction;
    
    if (newPage >= 1 && newPage <= totalPages) {
        currentPage = newPage;
        displayCards();
        updatePagination();
        
        // 滚动到顶部
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

// 显示卡片详情模态框
function showCardModal(card) {
    const modalCardImage = document.getElementById('modalCardImage');
    const modalCardName = document.getElementById('modalCardName');
    const modalCardType = document.getElementById('modalCardType');
    const modalCardRace = document.getElementById('modalCardRace');
    const modalCardArchetype = document.getElementById('modalCardArchetype');
    const modalCardStats = document.getElementById('modalCardStats');
    const modalCardDesc = document.getElementById('modalCardDesc');
    const modalCardSets = document.getElementById('modalCardSets');
    
    // 设置卡片图片
    const imageUrl = card.card_images && card.card_images[0] ? card.card_images[0].image_url : '';
    if (imageUrl) {
        modalCardImage.src = imageUrl;
        modalCardImage.style.display = 'block';
    } else {
        modalCardImage.style.display = 'none';
    }
    
    // 设置基本信息
    modalCardName.textContent = card.name;
    modalCardType.textContent = card.type || '未知类型';
    modalCardRace.textContent = card.race || '无种族';
    modalCardArchetype.textContent = card.archetype || '无系列';
    
    // 设置卡片属性
    let statsHTML = '<h3>卡片属性</h3>';
    if (card.atk || card.def || card.level || card.linkval) {
        if (card.atk) statsHTML += `<div class="stat-row"><span>攻击力:</span> <span>${card.atk}</span></div>`;
        if (card.def) statsHTML += `<div class="stat-row"><span>防御力:</span> <span>${card.def}</span></div>`;
        if (card.level) statsHTML += `<div class="stat-row"><span>等级:</span> <span>${card.level}</span></div>`;
        if (card.linkval) statsHTML += `<div class="stat-row"><span>连接值:</span> <span>${card.linkval}</span></div>`;
    } else {
        statsHTML += '<div class="stat-row"><span>无属性数据</span></div>';
    }
    modalCardStats.innerHTML = statsHTML;
    
    // 设置卡片描述
    modalCardDesc.textContent = card.desc || '无描述';
    
    // 设置卡片系列信息
    if (card.card_sets && card.card_sets.length > 0) {
        let setsHTML = '<h3>卡片系列</h3>';
        card.card_sets.forEach(set => {
            setsHTML += `
                <div class="set-item">
                    <div class="set-name">${set.set_name}</div>
                    <div class="set-details">
                        编号: ${set.set_code} | 稀有度: ${set.set_rarity} ${set.set_rarity_code}
                        ${set.set_price && set.set_price !== '0' ? ` | 价格: $${set.set_price}` : ''}
                    </div>
                </div>
            `;
        });
        modalCardSets.innerHTML = setsHTML;
    } else {
        modalCardSets.innerHTML = '<h3>卡片系列</h3><div class="set-item">无系列信息</div>';
    }
    
    // 显示模态框
    cardModal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

// 关闭卡片详情模态框
function closeCardModal() {
    cardModal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

// 键盘导航支持
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft' && !prevPageBtn.disabled) {
        changePage(-1);
    } else if (e.key === 'ArrowRight' && !nextPageBtn.disabled) {
        changePage(1);
    }
});

// 错误处理
window.addEventListener('error', (e) => {
    console.error('页面错误:', e.error);
});

// 图片加载错误处理
document.addEventListener('error', (e) => {
    if (e.target.tagName === 'IMG') {
        e.target.style.display = 'none';
    }
}, true); 