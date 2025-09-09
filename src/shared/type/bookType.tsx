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

export type RecordType ={
    createdAt: string;
    updatedAt: string;
    bookId: string;
    userId: string;
    rate: number;
    memo: string;
};
