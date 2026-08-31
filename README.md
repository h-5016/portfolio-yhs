# You Hyunjin — Portfolio 2026

원본 자료(`클로드 자료(포트폴리오)`)로 만든 정적 포트폴리오 사이트입니다. 서버 없이 정적 파일만으로 동작합니다.

## 실행

아무 정적 서버로 이 폴더를 서빙하면 됩니다.

```bash
python -m http.server 8734 --directory D:/workspace/portfolio-site
```

브라우저에서 http://localhost:8734 접속.

## 구성

- `index.html` / `css/style.css` / `js/main.js` — 사이트 본체 (원페이지: Design / Photo / Video)
- `js/manifest.js` — 이미지 목록(경로·크기). 갤러리는 이 파일을 읽어 자동 생성됩니다.
- `assets/` — 웹용으로 최적화한 이미지(최대 1600px, JPEG 82) + 영상 원본
- `thumbs/` — 그리드용 저용량 썸네일(최대 640px). 라이트박스에서는 `assets/` 원본을 로드합니다.
- `tools/optimize.ps1` — 원본 폴더 → `assets/` + `manifest.js` 재생성
- `tools/thumbs.ps1` — `assets/` → `thumbs/` 재생성

## 자료를 추가/수정하려면

1. 원본 폴더에 파일을 넣고 `tools/optimize.ps1` 실행 (경로는 스크립트 상단에 정의)
2. `tools/thumbs.ps1` 실행
3. 새 프로젝트 폴더를 추가했다면 `js/main.js`의 `DESIGN_PROJECTS` / `PHOTO_PROJECTS` 배열에 항목 추가

## 참고

- 미포함 파일: `.heic` 현장사진 2장(브라우저 미지원), `.ai` 로고 원본 1개
- `Photo/보정 전_후`의 `N 보정전/보정후` 쌍은 자동으로 비교 슬라이더로 렌더링됩니다.
