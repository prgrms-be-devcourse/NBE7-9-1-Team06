/**
 * 공통 UI 유틸리티 JavaScript
 * - 알림 메시지
 * - 확인 대화상자
 * - 가격 포맷팅
 * - 로딩 인디케이터
 */

/**
 * 알림 메시지 표시
 * @param {string} message - 표시할 메시지
 * @param {string} type - 메시지 타입 ('success', 'error', 'info')
 * @param {number} duration - 표시 시간 (밀리초, 기본값: 3000)
 */
function notify(message, type = 'info', duration = 3000) {
    // 기존 알림 제거
    removeExistingNotification();
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // 스타일 적용
    Object.assign(notification.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        padding: '16px 24px',
        borderRadius: '6px',
        fontSize: '0.95rem',
        fontWeight: '500',
        zIndex: '9999',
        maxWidth: '400px',
        wordWrap: 'break-word',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
        transition: 'all 0.3s ease'
    });
    
    // 타입별 스타일
    switch (type) {
        case 'success':
            notification.style.backgroundColor = '#FFFFFF';
            notification.style.border = '2px solid #000000';
            notification.style.color = '#000000';
            break;
        case 'error':
            notification.style.backgroundColor = '#F2F2F2';
            notification.style.border = '2px solid #000000';
            notification.style.color = '#000000';
            break;
        case 'info':
        default:
            notification.style.backgroundColor = '#F7F7F7';
            notification.style.border = '2px solid #000000';
            notification.style.color = '#000000';
            break;
    }
    
    document.body.appendChild(notification);
    
    // 애니메이션 효과
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateX(0)';
    }, 10);
    
    // 자동 제거
    if (duration > 0) {
        setTimeout(() => {
            removeNotification(notification);
        }, duration);
    }
    
    return notification;
}

/**
 * 확인 대화상자 표시
 * @param {string} message - 확인 메시지
 * @returns {Promise<boolean>} 확인 여부
 */
function confirm(message) {
    return new Promise((resolve) => {
        // 기존 확인 대화상자 제거
        removeExistingConfirm();
        
        const overlay = document.createElement('div');
        overlay.className = 'confirm-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
        `;
        
        const dialog = document.createElement('div');
        dialog.className = 'confirm-dialog';
        dialog.style.cssText = `
            background-color: #FFFFFF;
            border: 1px solid #E5E5E5;
            border-radius: 12px;
            padding: 24px;
            max-width: 400px;
            width: 90%;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
        `;
        
        const messageEl = document.createElement('p');
        messageEl.textContent = message;
        messageEl.style.cssText = `
            margin: 0 0 24px 0;
            font-size: 1rem;
            line-height: 1.5;
            color: #111111;
        `;
        
        const buttonContainer = document.createElement('div');
        buttonContainer.style.cssText = `
            display: flex;
            justify-content: flex-end;
            gap: 12px;
        `;
        
        const cancelBtn = document.createElement('button');
        cancelBtn.textContent = '취소';
        cancelBtn.className = 'btn btn-secondary';
        cancelBtn.style.cssText = `
            padding: 8px 16px;
            font-size: 0.95rem;
        `;
        cancelBtn.onclick = () => {
            removeConfirm(overlay);
            resolve(false);
        };
        
        const confirmBtn = document.createElement('button');
        confirmBtn.textContent = '확인';
        confirmBtn.className = 'btn btn-primary';
        confirmBtn.style.cssText = `
            padding: 8px 16px;
            font-size: 0.95rem;
        `;
        confirmBtn.onclick = () => {
            removeConfirm(overlay);
            resolve(true);
        };
        
        buttonContainer.appendChild(cancelBtn);
        buttonContainer.appendChild(confirmBtn);
        
        dialog.appendChild(messageEl);
        dialog.appendChild(buttonContainer);
        overlay.appendChild(dialog);
        
        document.body.appendChild(overlay);
        
        // ESC 키로 취소
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                removeConfirm(overlay);
                resolve(false);
                document.removeEventListener('keydown', handleKeyDown);
            }
        };
        document.addEventListener('keydown', handleKeyDown);
    });
}

/**
 * 가격 포맷팅 (천단위 콤마 + 원)
 * @param {number} price - 가격
 * @returns {string} 포맷된 가격 문자열
 */
function formatPrice(price) {
    if (typeof price !== 'number' || isNaN(price)) {
        return '0원';
    }
    
    return new Intl.NumberFormat('ko-KR').format(price) + '원';
}

/**
 * 로딩 인디케이터 표시/숨김
 * @param {boolean} show - 표시 여부
 * @param {string} message - 로딩 메시지 (기본값: '로딩 중...')
 */
function toggleLoading(show, message = '로딩 중...') {
    const indicator = document.getElementById('loadingIndicator');
    if (!indicator) return;
    
    if (show) {
        const messageEl = indicator.querySelector('span');
        if (messageEl) {
            messageEl.textContent = message;
        }
        indicator.style.display = 'flex';
    } else {
        indicator.style.display = 'none';
    }
}

/**
 * 테이블 상태 표시 (로딩/빈 상태/에러 상태)
 * @param {string} state - 상태 ('loading', 'empty', 'error', 'data')
 * @param {object} options - 옵션
 */
function showTableState(state, options = {}) {
    const table = document.querySelector('.data-table');
    const loadingIndicator = document.getElementById('loadingIndicator');
    const emptyMessage = document.getElementById('emptyMessage');
    const errorMessage = document.getElementById('errorMessage');
    
    // 모든 상태 숨기기
    if (table) table.style.display = 'none';
    if (loadingIndicator) loadingIndicator.style.display = 'none';
    if (emptyMessage) emptyMessage.style.display = 'none';
    if (errorMessage) errorMessage.style.display = 'none';
    
    switch (state) {
        case 'loading':
            if (loadingIndicator) {
                const messageEl = loadingIndicator.querySelector('span');
                if (messageEl && options.message) {
                    messageEl.textContent = options.message;
                }
                loadingIndicator.style.display = 'flex';
            }
            break;
            
        case 'empty':
            if (emptyMessage) {
                if (options.title) {
                    const titleEl = emptyMessage.querySelector('h3');
                    if (titleEl) titleEl.textContent = options.title;
                }
                if (options.message) {
                    const messageEl = emptyMessage.querySelector('p');
                    if (messageEl) messageEl.textContent = options.message;
                }
                emptyMessage.style.display = 'block';
            }
            break;
            
        case 'error':
            if (errorMessage) {
                if (options.title) {
                    const titleEl = errorMessage.querySelector('h3');
                    if (titleEl) titleEl.textContent = options.title;
                }
                if (options.message) {
                    const messageEl = errorMessage.querySelector('p');
                    if (messageEl) messageEl.textContent = options.message;
                }
                errorMessage.style.display = 'block';
            }
            break;
            
        case 'data':
            if (table) table.style.display = 'table';
            break;
    }
}

/**
 * 기존 알림 제거
 */
function removeExistingNotification() {
    const existing = document.querySelector('.notification');
    if (existing) {
        removeNotification(existing);
    }
}

/**
 * 알림 제거
 */
function removeNotification(notification) {
    if (notification && notification.parentNode) {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }
}

/**
 * 기존 확인 대화상자 제거
 */
function removeExistingConfirm() {
    const existing = document.querySelector('.confirm-overlay');
    if (existing) {
        removeConfirm(existing);
    }
}

/**
 * 확인 대화상자 제거
 */
function removeConfirm(overlay) {
    if (overlay && overlay.parentNode) {
        overlay.parentNode.removeChild(overlay);
    }
}

/**
 * 입력 필드 유효성 검사
 * @param {HTMLInputElement|HTMLTextAreaElement} input - 입력 요소
 * @param {object} rules - 검사 규칙
 * @returns {object} 검사 결과
 */
function validateInput(input, rules = {}) {
    const value = input.value.trim();
    const errors = [];
    
    if (rules.required && !value) {
        errors.push('필수 입력 항목입니다.');
    }
    
    if (rules.minLength && value.length < rules.minLength) {
        errors.push(`최소 ${rules.minLength}자 이상 입력해주세요.`);
    }
    
    if (rules.maxLength && value.length > rules.maxLength) {
        errors.push(`최대 ${rules.maxLength}자까지 입력 가능합니다.`);
    }
    
    if (rules.pattern && value && !rules.pattern.test(value)) {
        errors.push('올바른 형식이 아닙니다.');
    }
    
    if (rules.min && typeof value === 'number' && value < rules.min) {
        errors.push(`최소값은 ${rules.min}입니다.`);
    }
    
    if (rules.max && typeof value === 'number' && value > rules.max) {
        errors.push(`최대값은 ${rules.max}입니다.`);
    }
    
    return {
        isValid: errors.length === 0,
        errors: errors
    };
}

// 전역 함수로 등록
window.notify = notify;
window.confirm = confirm;
window.formatPrice = formatPrice;
window.toggleLoading = toggleLoading;
window.showTableState = showTableState;
window.validateInput = validateInput;
