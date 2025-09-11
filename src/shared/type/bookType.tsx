export type BookType = {
  id: string;
  title: string;
  author: string[]; // 저자
  publisher: string; // 출판사
  category: string[]; // 카테고리
  isbn: string; // ISBN
  description: string; // 설명
  imageUrl: string; // 이미지url
  height: number; //세로
  width: number; //가로
  thickness: number; //두께
  pages: number; //페이지수
};


// 저장 단위
export type SavedBook = {
  book: BookType; // 검색으로 받은 원본
  record: {
    rate: number;          // 0~100
    memo: string;          // 최대 200자
    startedAt?: string;    // ISO (YYYY-MM-DD)
    finishedAt?: string;   // ISO
  };
  createdAt: string;       // ISO
  updatedAt: string;       // ISO
  bookId: string;          // book.id 또는 isbn
};
