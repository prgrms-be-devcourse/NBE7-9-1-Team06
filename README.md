# ☕️ Grids & Circles 

작은 로컬 카페 'Grids & Circles'를 위한 커피 원두 주문 / 배송 서비스

---

## 📓 프로젝트 개요 

SpringBoot와 Thymeleaf 기반의 커피 원두 주문 및 상품 관리 시스템입니다. 
사용자는 이메일을 통해 주문을 생성·조회·수정·취소할 수 있고, 관리자는 상품을 관리하며 전날 오후 2시부터 당일 오후 2시까지의 주문을 모아 배송 처리합니다.

---

## 팀 소개 및 역할
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
  </tbody>
</table>


--- 

## 기술 스택
![java](https://img.shields.io/badge/Java-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)
![springboot](https://img.shields.io/badge/SpringBoot-6DB33F?style=for-the-badge&logo=SpringBoot&logoColor=white)
![springsecurity](https://img.shields.io/badge/Spring_Security-6DB33F?style=for-the-badge&logo=Spring-Security&logoColor=white)
![nextjs](https://img.shields.io/badge/Next.js-000?logo=nextdotjs&logoColor=fff&style=for-the-badge)
<br>
![mysql](https://img.shields.io/badge/MySQL-00000F?style=for-the-badge&logo=mysql&logoColor=white)
![docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white)
![github](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)
![thymeleaf](https://img.shields.io/badge/thymeleaf-005F0F?style=for-the-badge&logo=thymeleaf&logoColor=white)

---

## 핵심 기능

---

## 파일 구조 
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


