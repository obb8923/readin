import { BookType } from "../type/bookType";

export const defaultBooks: BookType[] = [
  {
    id: "bk_0001",
    title: "소년이 온다 (양장 특별판)",
    author: ["한강"],
    publisher: "창비",
    category: ["소설", "한국소설"],
    isbn: "9788936434120",
    description:
      "1980년 광주를 배경으로 한 인간의 상처와 기억을 응시하는 장편소설. 출간 10주년을 맞아 양장 특별판으로 재구성되어 꾸준히 읽히는 스테디셀러.",
    // 교보문고 대표 이미지 URL 예시 (썸네일/대표 이미지 경로는 상품 페이지에서 복사해 사용)
    imageUrl:
      "https://contents.kyobobook.co.kr/sih/fit-in/400x0/pdt/9788936434120.jpg",
    // 보급판/양장판 제원 차이가 있어 평균적 수치로 기입
    height: 210,
    width: 140,
    thickness: 22,
    pages: 256,
  },
  {
    id: "bk_0002",
    title: "채식주의자(개정판)",
    author: ["한강"],
    publisher: "창비",
    category: ["소설", "한국소설"],
    isbn: "9788936433598",
    description:
      "인터내셔널 부커상 수상작가 한강의 대표작. 가족과 사회 규범에 저항하는 존재의 몸과 욕망을 통해 인간성과 폭력의 문제를 질문하는 장편소설.",
    imageUrl:
      "https://contents.kyobobook.co.kr/sih/fit-in/400x0/pdt/9788936433598.jpg",
    height: 210,
    width: 140,
    thickness: 20,
    pages: 264,
  },
  {
    id: "bk_0003",
    title: "코스모스",
    author: ["칼 세이건"],
    publisher: "사이언스북스",
    category: ["과학", "교양과학", "천문학"],
    isbn: "9788983711892",
    description:
      "우주의 탄생부터 생명의 진화, 과학의 역사와 방법을 서사적으로 풀어낸 과학 교양서의 고전. 세대를 넘어 읽히는 스테디셀러.",
    imageUrl:
      "https://contents.kyobobook.co.kr/sih/fit-in/400x0/pdt/9788983711892.jpg",
    // 보급/양장/개정판에 따라 약간의 차이가 존재
    height: 225,
    width: 152,
    thickness: 35,
    pages: 654,
  },
  {
    id: "bk_0004",
    title: "모순 (개정판)",
    author: ["양귀자"],
    publisher: "쓰다",
    category: ["소설", "한국소설"],
    isbn: "9788998441012",
    description:
      "삶의 아이러니와 상처, 사랑을 담담한 문체와 입체적 인물들로 그려낸 한국 소설 스테디셀러. 세대를 거쳐 꾸준히 회자되는 작품.",
    imageUrl:
      "https://contents.kyobobook.co.kr/sih/fit-in/400x0/pdt/9788998441012.jpg",
    height: 210,
    width: 140,
    thickness: 22,
    pages: 320,
  },
  {
    id: "bk_0005",
    title: "초역 부처의 말",
    author: ["코이케 류노스케"],
    publisher: "유노북스",
    category: ["인문", "종교/불교", "명상"],
    isbn: "9791186805886",
    description:
      "부처의 가르침을 현대적 언어로 풀어 실천적 지혜를 전하는 인문/종교 스테디셀러. 일상에서 적용 가능한 통찰을 간결히 수록.",
    imageUrl:
      "https://contents.kyobobook.co.kr/sih/fit-in/400x0/pdt/9791186805886.jpg",
    height: 210,
    width: 140,
    thickness: 22,
    pages: 352,
  },
  {
    id: "bk_0006",
    title: "작별하지 않는다",
    author: ["한강"],
    publisher: "문학동네",
    category: ["소설", "한국소설"],
    isbn: "9788954685863",
    description:
      "제주 4·3의 비극을 기억과 애도의 서사로 엮어낸 장편. 해외 주요 문학상 수상으로 국내외에서 꾸준히 읽히는 화제작.",
    imageUrl:
      "https://contents.kyobobook.co.kr/sih/fit-in/400x0/pdt/9788954685863.jpg",
    height: 210,
    width: 140,
    thickness: 28,
    pages: 340,
  },
];
