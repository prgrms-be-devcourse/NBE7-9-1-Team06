/**
 * 상품관리 JavaScript
 * - 상품 목록 조회 및 렌더링
 * - 상품 등록/수정/삭제 처리
 * - 모달 폼 관리
 */

const API_BASE_URL = '/api/v1/admin';

let currentProductId = null; // 현재 수정 중인 상품 ID

/**
 * 상품 목록 로드
 */
async function loadProducts() {
    try {
        showTableState('loading', { message: '상품 목록을 불러오는 중...' });
        
        const response = await authenticatedFetch(`${API_BASE_URL}/products`);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const products = await response.json();
        renderProducts(products);
        
    } catch (error) {
        console.error('상품 목록 로드 오류:', error);
        showTableState('error', {
            title: '오류가 발생했습니다',
            message: error.message || '상품 목록을 불러오는 중 오류가 발생했습니다.'
        });
    }
}

/**
 * 상품 목록 렌더링
 * @param {Array} products - 상품 배열
 */
function renderProducts(products) {
    const tableBody = document.getElementById('productsTableBody');
    if (!tableBody) return;
    
    // 테이블 바디 초기화
    tableBody.innerHTML = '';
    
    if (!products || products.length === 0) {
        showTableState('empty', {
            title: '상품이 없습니다',
            message: '아직 등록된 상품이 없습니다.'
        });
        return;
    }
    
    // 상품 데이터 렌더링
    products.forEach(product => {
        const row = createProductRow(product);
        tableBody.appendChild(row);
    });
    
    showTableState('data');
}

/**
 * 상품 행 생성
 * @param {object} product - 상품 데이터
 * @returns {HTMLTableRowElement} 상품 행 요소
 */
function createProductRow(product) {
    const row = document.createElement('tr');
    
    row.innerHTML = `
        <td>${escapeHtml(product.productId)}</td>
        <td>${escapeHtml(product.name)}</td>
        <td>${formatPrice(product.price)}</td>
        <td>${escapeHtml(product.description || '-')}</td>
        <td class="text-right">
            <button class="btn btn-secondary btn-sm" onclick="editProduct('${product.productId}')">
                수정
            </button>
            <button class="btn btn-danger btn-sm" onclick="deleteProduct('${product.productId}')">
                삭제
            </button>
        </td>
    `;
    
    return row;
}

/**
 * 상품 등록/수정 폼 표시
 * @param {string|null} productId - 상품 ID (null이면 등록, 값이 있으면 수정)
 */
function showProductForm(productId = null) {
    currentProductId = productId;
    const modal = document.getElementById('productModal');
    const modalTitle = document.getElementById('modalTitle');
    const submitButton = document.getElementById('submitButton');
    
    if (!modal) return;
    
    // 모달 제목 및 버튼 텍스트 설정
    if (productId) {
        modalTitle.textContent = '상품 수정';
        submitButton.textContent = '수정';
        
        // 기존 데이터로 폼 채우기
        fillFormWithProductData(productId);
    } else {
        modalTitle.textContent = '새로운 상품 등록';
        submitButton.textContent = '등록';
        
        // 폼 초기화
        resetProductForm();
    }
    
    modal.style.display = 'flex';
    
    // 첫 번째 입력 필드에 포커스
    setTimeout(() => {
        const firstInput = modal.querySelector('input, textarea');
        if (firstInput) {
            firstInput.focus();
        }
    }, 100);
}

/**
 * 상품 등록/수정 폼 숨기기
 */
function closeProductForm() {
    const modal = document.getElementById('productModal');
    if (modal) {
        modal.style.display = 'none';
        currentProductId = null;
        resetProductForm();
    }
}

/**
 * 상품 폼 초기화
 */
function resetProductForm() {
    const form = document.getElementById('productForm');
    if (form) {
        form.reset();
        hideFormError();
    }
}

/**
 * 상품 데이터로 폼 채우기
 * @param {string} productId - 상품 ID
 */
async function fillFormWithProductData(productId) {
    try {
        const response = await authenticatedFetch(`${API_BASE_URL}/products`);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const products = await response.json();
        const product = products.find(p => p.productId === productId);
        
        if (!product) {
            throw new Error('상품을 찾을 수 없습니다.');
        }
        
        // 폼 필드 채우기
        document.getElementById('productId').value = product.productId;
        document.getElementById('productName').value = product.name || '';
        document.getElementById('productPrice').value = product.price || '';
        document.getElementById('productDescription').value = product.description || '';
        
    } catch (error) {
        console.error('상품 데이터 로드 오류:', error);
        notify(error.message || '상품 데이터를 불러오는 중 오류가 발생했습니다.', 'error');
        closeProductForm();
    }
}

/**
 * 상품 등록/수정 처리
 */
async function handleProductSubmit() {
    try {
        const form = document.getElementById('productForm');
        if (!form) return;
        
        const formData = new FormData(form);
        
        // 폼 데이터 검증
        const validation = validateProductForm(formData);
        if (!validation.isValid) {
            showFormError(validation.errors.join('<br>'));
            return;
        }
        
        hideFormError();
        
        // 요청 데이터 준비
        const productData = {
            name: formData.get('name'),
            price: parseInt(formData.get('price')),
            description: formData.get('description') || null
        };
        
        const isEdit = currentProductId !== null;
        const url = isEdit 
            ? `${API_BASE_URL}/products/${currentProductId}`
            : `${API_BASE_URL}/products`;
        const method = isEdit ? 'PUT' : 'POST';
        
        showTableState('loading', { 
            message: isEdit ? '상품을 수정하는 중...' : '상품을 등록하는 중...' 
        });
        
        const response = await authenticatedFetch(url, {
            method: method,
            body: JSON.stringify(productData)
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        notify(
            isEdit ? '상품이 성공적으로 수정되었습니다.' : '상품이 성공적으로 등록되었습니다.',
            'success'
        );
        
        closeProductForm();
        await loadProducts();
        
    } catch (error) {
        console.error('상품 저장 오류:', error);
        notify(
            error.message || '상품 저장 중 오류가 발생했습니다.',
            'error'
        );
        
        // 에러 발생 시에도 목록 재조회
        await loadProducts();
    }
}

/**
 * 상품 수정
 * @param {string} productId - 상품 ID
 */
function editProduct(productId) {
    showProductForm(productId);
}

/**
 * 상품 삭제
 * @param {string} productId - 상품 ID
 */
async function deleteProduct(productId) {
    try {
        const confirmed = await confirm(
            `상품 ID ${productId}를 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.`
        );
        
        if (!confirmed) return;
        
        showTableState('loading', { message: '상품을 삭제하는 중...' });
        
        const response = await authenticatedFetch(`${API_BASE_URL}/products/${productId}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        notify('상품이 성공적으로 삭제되었습니다.', 'success');
        
        // 목록 재조회
        await loadProducts();
        
    } catch (error) {
        console.error('상품 삭제 오류:', error);
        notify(
            error.message || '상품 삭제 중 오류가 발생했습니다.',
            'error'
        );
        
        // 에러 발생 시에도 목록 재조회
        await loadProducts();
    }
}

/**
 * 상품 폼 유효성 검사
 * @param {FormData} formData - 폼 데이터
 * @returns {object} 검사 결과
 */
function validateProductForm(formData) {
    const errors = [];
    
    const name = formData.get('name')?.trim();
    const price = formData.get('price')?.trim();
    const description = formData.get('description')?.trim();
    
    if (!name) {
        errors.push('상품명을 입력해주세요.');
    } else if (name.length > 100) {
        errors.push('상품명은 100자 이하로 입력해주세요.');
    }
    
    if (!price) {
        errors.push('가격을 입력해주세요.');
    } else {
        const priceNum = parseInt(price);
        if (isNaN(priceNum) || priceNum < 0) {
            errors.push('가격은 0 이상의 숫자를 입력해주세요.');
        }
    }
    
    if (description && description.length > 500) {
        errors.push('설명은 500자 이하로 입력해주세요.');
    }
    
    return {
        isValid: errors.length === 0,
        errors: errors
    };
}

/**
 * 폼 에러 메시지 표시
 * @param {string} message - 에러 메시지
 */
function showFormError(message) {
    const errorElement = document.getElementById('formErrorMessage');
    if (errorElement) {
        errorElement.innerHTML = message;
        errorElement.style.display = 'block';
    }
}

/**
 * 폼 에러 메시지 숨기기
 */
function hideFormError() {
    const errorElement = document.getElementById('formErrorMessage');
    if (errorElement) {
        errorElement.style.display = 'none';
    }
}

/**
 * HTML 이스케이프 처리
 * @param {string} text - 이스케이프할 텍스트
 * @returns {string} 이스케이프된 텍스트
 */
function escapeHtml(text) {
    if (typeof text !== 'string') return '';
    
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * 상품 데이터 유효성 검사
 * @param {object} product - 상품 데이터
 * @returns {boolean} 유효성 여부
 */
function validateProduct(product) {
    if (!product) return false;
    
    const requiredFields = ['productId', 'name', 'price'];
    return requiredFields.every(field => {
        const value = product[field];
        return value !== null && value !== undefined && value !== '';
    });
}

/**
 * 상품 목록 새로고침
 */
function refreshProducts() {
    loadProducts();
}

// 전역 함수로 등록
window.loadProducts = loadProducts;
window.showProductForm = showProductForm;
window.closeProductForm = closeProductForm;
window.editProduct = editProduct;
window.deleteProduct = deleteProduct;
window.handleProductSubmit = handleProductSubmit;
window.refreshProducts = refreshProducts;
