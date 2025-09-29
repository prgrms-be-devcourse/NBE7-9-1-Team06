# ☕️ Grids & Circles 

작은 로컬 카페 'Grids & Circles'를 위한 카페 원두 메뉴 관리 및 주문 서비스

---

## 📓 프로젝트 개요 

SpringBoot 기반의 온라인 원두 메뉴 관리 및 주문 시스템입니다. 
사용자는 이메일을 통해 주문을 생성·조회·수정·취소할 수 있고, 관리자는 상품을 관리하며 전날 오후 2시부터 당일 오후 2시까지의 주문을 모아 배송 처리합니다.

---

## 🧑‍🧑‍🧒‍🧒 팀 소개 및 역할
<table>
  <tbody>
    <tr>
      <td align="center">박준석</td><td align="center">정혜연</td><td align="center">이현</td><td align="center">김나현</td><td align="center">조영주</td>
    </tr>
    <tr>
      <td align="center"><a href="https://github.com/junseokPP"><img src="https://avatars.githubusercontent.com/u/167407603?v=4" width="100px;" alt=""/><br /></a></td>
      <td align="center"><a href="https://github.com/hznnoy"><img src="https://avatars.githubusercontent.com/u/152006906?v=4" width="100px;" alt=""/><br /></td>
      <td align="center"><a href="https://github.com/lh922"><img src="https://avatars.githubusercontent.com/u/136810467?v=4" width="100px;" alt=""/><br /></td>
      <td align="center"><a href="https://github.com/BE9-KNH"><img src="https://avatars.githubusercontent.com/u/223629862?v=4" width="100px;" alt=""/></td>
      <td align="center"><a href="https://github.com/ascal34"><img src="https://avatars.githubusercontent.com/u/224690621?v=4" width="100px;" alt=""/><br /></td>
    </tr>
    <tr>
      <td align="center">팀장</td><td align="center">팀원</td><td align="center">팀원</td><td align="center">팀원</td><td align="center">팀원</td>
    </tr>
    <tr>
      <td align="center">프론트엔드 전반적 구현 <br> 백엔드 연동</td>
      <td align="center"> [사용자] <br>주문 생성<br>주문 목록 및 상세 조회<br>주문 수정<br>주문 삭제 <br> 주문 상태 스케줄링 </td>
      <td align="center">[관리자] <br> SpringSecurity/JWT <br>
관리자 로그인 <br> 주문 조회 <br> 주문 취소 <br> 합배송 처리 </td>
      <td align="center">[사용자]<br> 상품 목록 및 상세 조회</td>
      <td align="center">[관리자]<br>상품 등록 <br> 상품 수정 <br> 상품 삭제 </td>
    </tr>
  </tbody>
</table>


--- 

## 🛠️ 기술 스택
![java](https://img.shields.io/badge/Java-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)
![springboot](https://img.shields.io/badge/SpringBoot-6DB33F?style=for-the-badge&logo=SpringBoot&logoColor=white)
![springsecurity](https://img.shields.io/badge/Spring_Security-6DB33F?style=for-the-badge&logo=Spring-Security&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![thymeleaf](https://img.shields.io/badge/thymeleaf-005F0F?style=for-the-badge&logo=thymeleaf&logoColor=white)
![mysql](https://img.shields.io/badge/MySQL-00000F?style=for-the-badge&logo=mysql&logoColor=white)
![docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white)
![github](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)

---

## 📌 핵심 기능
👤 **사용자**
- 이메일을 통한 비회원 주문
- 상품 조회
- 주문 생성·조회·수정·취소
- 주문 수정과 취소는 오후 2시 이전에만 가능

👨‍💻 **관리자**

- Spring Security + JWT
- 상품 등록·조회·수정·삭제
- 주문 조회
- 주문 상태 변경(Confirmed/Preparing/Shipped/Delivered)
- 오후 2시를 기준으로 주문 상태 `PENDING` → `CONFIRMED` 자동 전환
  
---

## 📁 프로젝트 구조 
```
backend/
├── src/main/java/com/backend
│   ├── domain
│   │   ├── admin
│   │   │   ├── controller
│   │   │   ├── dto
│   │   │   ├── entity
│   │   │   ├── repository
│   │   │   └── service
│   │   │── order
│   │   │   ├── controller
│   │   │   ├── dto
│   │   │   ├── entity
│   │   │   ├── repository
│   │   │   ├── scheduler
│   │   │   └── service
│   │   └── product
│   │       ├── controller
│   │       ├── dto
│   │       ├── entity
│   │       ├── repository
│   │       └── service
│   └── global
│       ├── config
│       ├── exception
│       ├── initData
│       ├── rsData
│       └── util
└── src/main/resources

frontend/ (수정 필요)
├── app
│   ├── page.tsx
│   ├── orders
│   └── search
└── components
    └── ui
```

---
## ERD

---
## 시스템 아키텍처 
---

## 📃 커밋 컨벤션 & 협업 규칙
### GitHub Flow(main/feature + develop)
> 이슈 생성 → 브랜치 생성 → 구현 → Commit & Push → PR 생성 → 코드 리뷰 → develop에 Merge

- `main`: 배포용 안정 브랜치
- `develop`: 기능 통합 브랜치
- `feat/backend-{작업자}-{user/admin}-{domain}`: 기능 단위 작업 브랜치

### 커밋 컨벤션

|유형 | 설명|
|---|---|
|feat| 새로운 기능|
|fix| 버그 수정|
|docs|문서 변경(README 등)|
|style| 포맷/스타일(기능 변경 없음)|
|refactor| 리팩토링(동작 변경 없음)|
|test| 테스트|
|chore| 빌드/설정/의존성|
|remove| 파일/폴더 삭제|
|rename| 파일/폴더명 변경|



