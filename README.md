# Move to Learn AI — 몸으로 배우는 인공지능

웹캠만으로 실행되는 체화형(embodied) AI 개념 학습 게임 모음입니다.
설치 없이 브라우저에서 열면 됩니다: https://nakongssam.github.io/move-to-learn-ai/

| 게임 | 다루는 개념 | 주소 |
|---|---|---|
| 🍎 과일 베기: 내가 퍼셉트론! | 결정 경계, 퍼셉트론 학습, 선형 분리 한계(XOR), 다층 신경망 | `/fruit-slice/` |
| 🖐 이웃에게 물어봐: k-NN | 거리 기반 분류, 다수결, 하이퍼파라미터 k, 과적합, 시험 데이터 평가 | `/knn-neighbors/` |

- 입력 방식: 손(웹캠, Google MediaPipe Hand Landmarker) 또는 마우스·터치
- 과일 베기: 엄지·검지를 붙인 채 끌었다 떼면 베기 / k-NN: 손바닥 위치 = 새 데이터, 펼친 손가락 수 = k — 기록에 `condition`으로 저장되어 비교 연구에 사용 가능
- 기록: 게임 화면의 '기록 CSV 저장' 버튼, 또는 `fruit-slice/index.html` 상단의 `SUPABASE_*` 설정으로 자동 수집
- 웹캠 영상은 사용자 컴퓨터 안에서만 처리되며 서버로 전송되지 않습니다.

제작: 김한나 (AI융합교육대학원 박사과정)
