/**
 * 관리자 인증 관련 JavaScript
 * - 로그인/로그아웃 처리
 * - 토큰 관리
 * - 인증 확인 및 리다이렉트
 */

const AUTH_TOKEN_KEY = 'admin_token';
const FAKE_TOKEN = 'fake-admin-token';

/**
 * 로그인 처리 (프론트엔드 검증)
 * @param {string} username - 사용자명
 * @param {string} password - 비밀번호
 * @returns {boolean} 로그인 성공 여부
 */
function login(username, password) {
    // 임시 로그인 검증: admin / 1234
    if (username === 'admin' && password === '1234') {
        localStorage.setItem(AUTH_TOKEN_KEY, FAKE_TOKEN);
        return true;
    }
    return false;
}

/**
 * 로그아웃 처리
 */
function logout() {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    window.location.href = '/login';
}

/**
 * 로그인 상태 확인
 * @returns {boolean} 로그인 여부
 */
function isLoggedIn() {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    return token === FAKE_TOKEN;
}

/**
 * 저장된 토큰 가져오기
 * @returns {string|null} 토큰 또는 null
 */
function getToken() {
    return localStorage.getItem(AUTH_TOKEN_KEY);
}

/**
 * 인증이 필요한 페이지에서 호출
 * 토큰이 없으면 로그인 페이지로 리다이렉트
 */
function requireAuth() {
    if (!isLoggedIn()) {
        window.location.href = '/login';
        return false;
    }
    return true;
}

/**
 * API 호출용 Authorization 헤더 생성
 * @returns {object} Authorization 헤더가 포함된 객체
 */
function getAuthHeaders() {
    const token = getToken();
    if (!token) {
        throw new Error('인증 토큰이 없습니다.');
    }
    
    return {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    };
}

/**
 * API 호출용 fetch 함수 (인증 헤더 자동 추가)
 * @param {string} url - API URL
 * @param {object} options - fetch 옵션
 * @returns {Promise<Response>} fetch 응답
 */
async function authenticatedFetch(url, options = {}) {
    try {
        const headers = {
            ...getAuthHeaders(),
            ...options.headers
        };
        
        const response = await fetch(url, {
            ...options,
            headers
        });
        
        // 401 Unauthorized인 경우 로그아웃 처리
        if (response.status === 401) {
            logout();
            throw new Error('인증이 만료되었습니다. 다시 로그인해주세요.');
        }
        
        return response;
    } catch (error) {
        console.error('API 호출 오류:', error);
        throw error;
    }
}

// 전역 함수로 등록 (HTML에서 직접 호출 가능)
window.login = login;
window.logout = logout;
window.isLoggedIn = isLoggedIn;
window.getToken = getToken;
window.requireAuth = requireAuth;
window.getAuthHeaders = getAuthHeaders;
window.authenticatedFetch = authenticatedFetch;
