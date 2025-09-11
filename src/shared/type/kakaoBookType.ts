export type KakaoBookType = {
  title: string;
  contents: string;
  url: string;
  isbn: string;
  datetime: string;
  authors: string[];
  publisher: string;
  translators: string[];
  price: number;
  sale_price: number;
  thumbnail: string;
  status: string;
};

export type KakaoBookSearchMeta = {
  is_end: boolean;
  pageable_count: number;
  total_count: number;
};

export type KakaoBookSearchResult = {
  documents: KakaoBookType[];
  meta: KakaoBookSearchMeta;
};

