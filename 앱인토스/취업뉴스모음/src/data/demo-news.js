// 실제 기사로 오인되지 않도록 모든 항목을 화면에서 예시로 표시합니다.
window.careerNewsData = {
  industries: ['반도체', '로봇', '의료·바이오', 'AI', '금융', '모빌리티'],
  roles: ['개발', '연구개발', '회계·재무', '영업', '마케팅'],
  articles: [
    { id: 'demo-1', industry: '반도체', roles: ['연구개발', '영업'], title: 'AI 반도체의 성장, 메모리 다음으로 살펴볼 분야는?', description: '첨단 패키징과 공급망을 함께 살펴보는 연습용 뉴스입니다.', point: '지원 기업이 반도체 가치사슬의 어디에 있는지 정리해 보세요.', mark: 'CHIP', color: 'blue' },
    { id: 'demo-2', industry: '로봇', roles: ['개발', '연구개발'], title: '공장 밖으로 나온 로봇, 서비스 현장에 필요한 기술', description: '로봇의 활용 환경과 소프트웨어 역량을 연결해 보는 예시입니다.', point: '로봇이 실제 현장에서 해결할 문제를 한 가지 골라보세요.', mark: 'BOT', color: 'purple' },
    { id: 'demo-3', industry: '의료·바이오', roles: ['연구개발', '영업'], title: '디지털 헬스케어를 이해하는 세 가지 관점', description: '기술, 사용자 경험, 도입 과정을 함께 생각해 보는 예시입니다.', point: '제품의 사용자와 구매 결정자가 같은지 살펴보세요.', mark: 'BIO', color: 'green' },
    { id: 'demo-4', industry: 'AI', roles: ['개발', '마케팅'], title: 'AI 서비스의 경쟁력, 모델에서 사용자 경험으로', description: 'AI 제품의 활용 사례와 성과 측정을 공부하기 위한 예시입니다.', point: 'AI를 적용했을 때 개선할 수 있는 지표를 제안해 보세요.', mark: 'AI', color: 'blue' },
    { id: 'demo-5', industry: '금융', roles: ['회계·재무'], title: '기업의 숫자를 읽는 법, 현금흐름에서 출발하기', description: '손익과 현금흐름의 차이를 뉴스와 연결하는 학습 예시입니다.', point: '관심 기업의 공개 보고서에서 영업현금흐름을 찾아보세요.', mark: 'FIN', color: 'orange' },
    { id: 'demo-6', industry: '모빌리티', roles: ['영업', '마케팅'], title: '제품 판매 이후까지 이어지는 모빌리티 서비스', description: '구독과 유지관리 등 고객 접점의 변화를 생각해 보는 예시입니다.', point: '고객이 구매 후에도 서비스를 이용하는 이유를 적어보세요.', mark: 'MOVE', color: 'purple' },
  ],
};
