# 침조한 블로그: 
[PWA와 Next.js를 사용해서 모바일 앱 만들기](https://velog.io/@youngeui_hong/PWA%EC%99%80-Next.js%EB%A5%BC-%EC%82%AC%EC%9A%A9%ED%95%B4%EC%84%9C-%EB%AA%A8%EB%B0%94%EC%9D%BC-%EC%95%B1-%EB%A7%8C%EB%93%A4%EA%B8%B0)

# getPushSubscription 함수 알고리즘

## VAPID Public Key 검증
1. 환경 변수 `NEXT_PUBLIC_VAPID_PUBLIC_KEY`가 존재하는지 확인합니다.
2. 존재하지 않으면 오류 메시지를 출력하고 `null`을 반환합니다.

## Service Worker 등록 확인
1. `navigator.serviceWorker.getRegistration()`을 호출하여 서비스 워커 등록 정보를 가져옵니다.
2. 등록 정보가 없으면 오류 메시지를 출력하고 `null`을 반환합니다.

## 기존 구독 확인
1. `registration.pushManager.getSubscription()`을 호출하여 기존 푸시 구독 정보를 가져옵니다.
2. 구독 정보가 있으면 다음 단계를 진행합니다.

## 구독 키 비교
1. 기존 구독의 `applicationServerKey`와 새로운 VAPID Public Key를 비교합니다.
2. 키가 다르면 기존 구독을 해지하고 `subscription`을 `null`로 설정합니다.
3. 키가 같으면 서버에 구독 정보를 갱신합니다.

## 새로운 구독 생성
1. 구독 정보가 없으면 `registration.pushManager.subscribe()`를 호출하여 새로운 구독을 생성합니다.
2. 새로운 구독 정보를 서버에 저장합니다.

## 구독 정보 반환
1. 구독 정보를 콘솔에 출력하고 반환합니다.
2. 오류가 발생하면 오류 메시지를 출력하고 `null`을 반환합니다.