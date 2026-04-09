# Allegy-Project - FrontEnd

# * 현재 ios 시뮬레이터에서만 작동 -0409

외국인 유학생들을 위한 대학 식단 알러지 필터링 서비스의 프론트엔드 레포지토리입니다.

##  기술 스택
- **Framework:** React Native (Expo Router)
- **Language:** TypeScript
- **State Management:** Zustand
- **Styling:** Tailwind CSS (NativeWind)
- **Authentication:** Google Social Login (Expo Dev Client)
---

##  실행 가이드 
### 0. env 값 요청하기
### 1.  프로그램 설치
Xcode 시뮬레이터 또는 Android Studio 에뮬레이터 

### 2. 패키지 설치
터미널을 열고 아래 명령어를 순서대로 실행하세요.
```bash
npm install
```

```bash
# 해당 명령어로 .env.example파일 생성
# .env로 변경 후 나머지 코드 부분에 실제 값 넣기 
npm run setup
```

```bash
# iOS 시뮬레이터용 빌드 및 실행
npx expo run:ios
```
```bash
# 안드로이드 에뮬레이터용 빌드 및 실행
npx expo run:android
```