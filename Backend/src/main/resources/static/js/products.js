/**
 * 상품관리 JavaScript
 * - 상품 목록 조회 및 렌더링
 * - 상품 등록/수정/삭제 처리
 * - 모달 폼 관리
 */

const API_BASE_URL = "/api/v1/admin";

let currentProductId = null; // 현재 수정 중인 상품 ID

/**
 * 상품 목록 로드
 */
async function loadProducts() {
  try {
    showTableState("loading", { message: "상품 목록을 불러오는 중..." });

    const response = await fetch(`${API_BASE_URL}/products`);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    console.log("API 응답:", result); // 디버깅용

    // RsData 구조에서 실제 데이터 추출
    if (result.resultCode === "200-1" && result.data && result.data.products) {
      renderProducts(result.data.products);
    } else {
      throw new Error(result.msg || "상품 목록을 불러올 수 없습니다.");
    }
  } catch (error) {
    console.error("상품 목록 로드 오류:", error);
    showTableState("error", {
      title: "오류가 발생했습니다",
      message: error.message || "상품 목록을 불러오는 중 오류가 발생했습니다.",
    });
  }
}

/**
 * 상품 목록 렌더링
 * @param {Array} products - 상품 배열
 */
function renderProducts(products) {
  const productsGrid = document.getElementById("productsGrid");
  if (!productsGrid) return;

  // 그리드 초기화
  productsGrid.innerHTML = "";

  if (!products || products.length === 0) {
    showTableState("empty", {
      title: "상품이 없습니다",
      message: "아직 등록된 상품이 없습니다.",
    });
    return;
  }

  // 상품 데이터 렌더링
  products.forEach((product) => {
    const card = createProductCard(product);
    productsGrid.appendChild(card);
  });

  showTableState("data");
}

/**
 * 상품 카드 생성
 * @param {object} product - 상품 데이터
 * @returns {HTMLDivElement} 상품 카드 요소
 */
function createProductCard(product) {
  const card = document.createElement("div");
  card.className = "product-card";

  // 이미지 처리
  const imageHtml =
    product.imageUrl && product.imageUrl.trim()
      ? `<img src="${escapeHtml(product.imageUrl)}" alt="${escapeHtml(
          product.productName
        )}" class="product-image" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
       <div class="product-image-placeholder" style="display: none;">이미지 없음</div>`
      : `<div class="product-image-placeholder">이미지 없음</div>`;

  card.innerHTML = `
    ${imageHtml}
    <div class="product-info">
      <h3 class="product-name">${escapeHtml(product.productName)}</h3>
      <div class="product-price">${formatPrice(product.productPrice)}</div>
      <div class="product-quantity">재고: ${product.quantity || 0}개</div>
      <p class="product-description">${escapeHtml(
        product.description || "설명이 없습니다."
      )}</p>
    </div>
    <div class="product-actions">
      <button class="btn btn-secondary btn-sm" onclick="editProduct('${
        product.productId
      }')">
        수정
      </button>
      <button class="btn btn-danger btn-sm" onclick="deleteProduct('${
        product.productId
      }')">
        삭제
      </button>
    </div>
  `;

  return card;
}

/**
 * 상품 등록/수정 폼 표시
 * @param {string|null} productId - 상품 ID (null이면 등록, 값이 있으면 수정)
 */
function showProductForm(productId = null) {
  currentProductId = productId;
  const modal = document.getElementById("productModal");
  const modalTitle = document.getElementById("modalTitle");
  const submitButton = document.getElementById("submitButton");

  if (!modal) return;

  // 모달 제목 및 버튼 텍스트 설정
  if (productId) {
    modalTitle.textContent = "상품 수정";
    submitButton.textContent = "수정";

    // 기존 데이터로 폼 채우기
    fillFormWithProductData(productId);
  } else {
    modalTitle.textContent = "새로운 상품 등록";
    submitButton.textContent = "등록";

    // 폼 초기화
    resetProductForm();
  }

  modal.style.display = "flex";

  // 첫 번째 입력 필드에 포커스
  setTimeout(() => {
    const firstInput = modal.querySelector("input, textarea");
    if (firstInput) {
      firstInput.focus();
    }
  }, 100);
}

/**
 * 상품 등록/수정 폼 숨기기
 */
function closeProductForm() {
  const modal = document.getElementById("productModal");
  if (modal) {
    modal.style.display = "none";
    currentProductId = null;
    resetProductForm();
  }
}

/**
 * 상품 폼 초기화
 */
function resetProductForm() {
  const form = document.getElementById("productForm");
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
    const response = await fetch(`${API_BASE_URL}/products`);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    console.log("API 응답:", result); // 디버깅용

    // RsData 구조에서 실제 데이터 추출
    if (result.resultCode === "200-1" && result.data && result.data.products) {
      const products = result.data.products;
      console.log("찾는 상품 ID:", productId, "타입:", typeof productId);
      console.log(
        "상품 목록:",
        products.map((p) => ({ id: p.productId, type: typeof p.productId }))
      );

      const product = products.find((p) => p.productId == productId);

      if (!product) {
        console.error("상품을 찾을 수 없습니다. ID:", productId);
        throw new Error("상품을 찾을 수 없습니다.");
      }

      // 폼 필드 채우기
      document.getElementById("productId").value = product.productId;
      document.getElementById("productName").value = product.productName || "";
      document.getElementById("productPrice").value =
        product.productPrice || "";
      document.getElementById("productQuantity").value = product.quantity || "";
      document.getElementById("productDescription").value =
        product.description || "";
      document.getElementById("productImageUrl").value = product.imageUrl || "";
    } else {
      throw new Error(result.msg || "상품 데이터를 불러올 수 없습니다.");
    }
  } catch (error) {
    console.error("상품 데이터 로드 오류:", error);
    notify(
      error.message || "상품 데이터를 불러오는 중 오류가 발생했습니다.",
      "error"
    );
    closeProductForm();
  }
}

/**
 * 상품 등록/수정 처리
 */
async function handleProductSubmit() {
  try {
    const form = document.getElementById("productForm");
    if (!form) return;

    const formData = new FormData(form);

    // 폼 데이터 검증
    const validation = validateProductForm(formData);
    if (!validation.isValid) {
      showFormError(validation.errors.join("<br>"));
      return;
    }

    hideFormError();

    // 요청 데이터 준비
    const productData = {
      productName: formData.get("name"),
      productPrice: parseInt(formData.get("price")),
      quantity: parseInt(formData.get("quantity")),
      description: formData.get("description") || null,
      imageUrl: formData.get("imageUrl") || null,
    };

    const isEdit = currentProductId !== null;
    const url = isEdit
      ? `${API_BASE_URL}/products/${currentProductId}`
      : `${API_BASE_URL}/products`;
    const method = isEdit ? "PUT" : "POST";

    showTableState("loading", {
      message: isEdit ? "상품을 수정하는 중..." : "상품을 등록하는 중...",
    });

    const response = await fetch(url, {
      method: method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(productData),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    console.log("상품 저장 응답:", result); // 디버깅용

    if (result.resultCode === "200-1") {
      notify(
        isEdit
          ? "상품이 성공적으로 수정되었습니다."
          : "상품이 성공적으로 등록되었습니다.",
        "success"
      );
    } else {
      throw new Error(result.msg || "상품 저장에 실패했습니다.");
    }

    closeProductForm();
    await loadProducts();
  } catch (error) {
    console.error("상품 저장 오류:", error);
    notify(error.message || "상품 저장 중 오류가 발생했습니다.", "error");

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

    showTableState("loading", { message: "상품을 삭제하는 중..." });

    const response = await fetch(`${API_BASE_URL}/products/${productId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    // DELETE 요청은 보통 204 No Content를 반환하므로 응답 본문이 없을 수 있음
    if (response.status === 204) {
      notify("상품이 성공적으로 삭제되었습니다.", "success");
    } else {
      const result = await response.json();
      console.log("상품 삭제 응답:", result); // 디버깅용

      if (result.resultCode === "200-1") {
        notify("상품이 성공적으로 삭제되었습니다.", "success");
      } else {
        throw new Error(result.msg || "상품 삭제에 실패했습니다.");
      }
    }

    // 목록 재조회
    await loadProducts();
  } catch (error) {
    console.error("상품 삭제 오류:", error);
    notify(error.message || "상품 삭제 중 오류가 발생했습니다.", "error");

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

  const productName = formData.get("name")?.trim();
  const productPrice = formData.get("price")?.trim();
  const productQuantity = formData.get("quantity")?.trim();
  const description = formData.get("description")?.trim();
  const imageUrl = formData.get("imageUrl")?.trim();

  if (!productName) {
    errors.push("상품명을 입력해주세요.");
  } else if (productName.length > 100) {
    errors.push("상품명은 100자 이하로 입력해주세요.");
  }

  if (!productPrice) {
    errors.push("가격을 입력해주세요.");
  } else {
    const priceNum = parseInt(productPrice);
    if (isNaN(priceNum) || priceNum < 0) {
      errors.push("가격은 0 이상의 숫자를 입력해주세요.");
    }
  }

  if (!productQuantity) {
    errors.push("재고 수량을 입력해주세요.");
  } else {
    const quantityNum = parseInt(productQuantity);
    if (isNaN(quantityNum) || quantityNum <= 0) {
      errors.push("재고 수량은 1 이상의 숫자를 입력해주세요.");
    }
  }

  if (description && description.length > 500) {
    errors.push("설명은 500자 이하로 입력해주세요.");
  }

  if (imageUrl && imageUrl.length > 0) {
    try {
      new URL(imageUrl);
    } catch (e) {
      errors.push("올바른 이미지 URL을 입력해주세요.");
    }
  }

  return {
    isValid: errors.length === 0,
    errors: errors,
  };
}

/**
 * 폼 에러 메시지 표시
 * @param {string} message - 에러 메시지
 */
function showFormError(message) {
  const errorElement = document.getElementById("formErrorMessage");
  if (errorElement) {
    errorElement.innerHTML = message;
    errorElement.style.display = "block";
  }
}

/**
 * 폼 에러 메시지 숨기기
 */
function hideFormError() {
  const errorElement = document.getElementById("formErrorMessage");
  if (errorElement) {
    errorElement.style.display = "none";
  }
}

/**
 * HTML 이스케이프 처리
 * @param {string} text - 이스케이프할 텍스트
 * @returns {string} 이스케이프된 텍스트
 */
function escapeHtml(text) {
  if (typeof text !== "string") return "";

  const div = document.createElement("div");
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

  const requiredFields = [
    "productId",
    "productName",
    "productPrice",
    "quantity",
  ];
  return requiredFields.every((field) => {
    const value = product[field];
    return value !== null && value !== undefined && value !== "";
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
