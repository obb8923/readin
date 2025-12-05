import { supabase } from '../supabase';
import { Platform } from 'react-native';

export interface UploadImageResult {
  url: string;
  path: string;
}

/**
 * Base64 문자열을 ArrayBuffer로 변환
 * React Native에서 Supabase Storage에 업로드하기 위한 안전한 방법
 */
function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const byteCharacters = atob(base64);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const uint8Array = new Uint8Array(byteNumbers);
  return uint8Array.buffer;
}

/**
 * Supabase Storage의 public URL에서 파일 경로를 추출합니다.
 * 예: https://xxx.supabase.co/storage/v1/object/public/custom_image_url/user_id/file.jpg
 * -> user_id/file.jpg
 */
function extractFilePathFromUrl(url: string, bucketName: string): string | null {
  try {
    // URL에서 버킷 이름 이후의 경로를 추출
    const urlPattern = new RegExp(`/storage/v1/object/public/${bucketName}/(.+)`);
    const match = url.match(urlPattern);
    return match ? match[1] : null;
  } catch (error) {
    return null;
  }
}

/**
 * 커스텀 책 이미지를 Supabase Storage에 업로드합니다.
 * @param imageUri - 선택한 이미지의 로컬 URI
 * @param base64Data - Base64로 인코딩된 이미지 데이터 (선택적)
 * @param userId - 사용자 ID
 * @param bookId - 책 ID
 * @param existingImageUrl - 기존 커스텀 이미지 URL (있으면 삭제 후 업로드)
 * @returns 업로드된 이미지의 public URL과 경로
 */
export async function uploadCustomBookImage(
  imageUri: string,
  base64Data: string | undefined,
  userId: string,
  bookId: string,
  existingImageUrl?: string | null
): Promise<UploadImageResult> {
  if (!userId || !bookId) {
    throw new Error('userId와 bookId는 필수입니다.');
  }

  // 사용자 인증 확인
  const { data: userInfo, error: userError } = await supabase.auth.getUser();
  if (userError || !userInfo?.user) {
    throw new Error('로그인이 필요합니다.');
  }

  // 사용자 ID 검증
  if (userInfo.user.id !== userId) {
    throw new Error('권한이 없습니다.');
  }

  const bucketName = 'custom_image_url';

  // 기존 이미지가 있으면 삭제
  if (existingImageUrl) {
    try {
      const existingFilePath = extractFilePathFromUrl(existingImageUrl, bucketName);
      if (existingFilePath) {
        const { error: deleteError } = await supabase.storage
          .from(bucketName)
          .remove([existingFilePath]);
        
        if (deleteError) {
          // 삭제 실패해도 계속 진행 (파일이 이미 없을 수도 있음)
          console.warn('기존 이미지 삭제 실패 (무시 가능):', deleteError.message);
        }
      }
    } catch (error) {
      // 삭제 실패해도 계속 진행
      console.warn('기존 이미지 삭제 중 오류 (무시 가능):', error);
    }
  }

  // 파일명 생성: {book_id}_{timestamp}.jpg
  const timestamp = Date.now();
  const fileName = `${bookId}_${timestamp}.jpg`;
  // 경로 규칙: custom_image_url/{auth.uid()}/{FileName}.jpg
  const filePath = `${userId}/${fileName}`;

  try {
    let fileBody: ArrayBuffer | Blob;
    let contentType = 'image/jpeg';
    
    // Base64 데이터가 있으면 ArrayBuffer로 변환 (React Native에서 안전한 방법)
    if (base64Data) {
      fileBody = base64ToArrayBuffer(base64Data);
    } else {
      // URI에서 이미지를 가져와서 ArrayBuffer로 변환
      const response = await fetch(imageUri);
      if (!response.ok) {
        throw new Error(`이미지 fetch 실패: ${response.status} ${response.statusText}`);
      }
      
      // ArrayBuffer로 변환 (React Native에서 더 안전)
      fileBody = await response.arrayBuffer();
      if (!fileBody || fileBody.byteLength === 0) {
        throw new Error('No content provided');
      }
      contentType = response.headers.get('content-type') || 'image/jpeg';
    }

    // Supabase Storage에 업로드 (ArrayBuffer 직접 사용)
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(filePath, fileBody, {
        contentType: contentType,
        upsert: false, // 기존 파일이 있으면 에러 발생 (명시적으로 덮어쓰지 않음)
      });

    if (error) {
      // 파일이 이미 존재하는 경우 업데이트
      if (error.message.includes('already exists')) {
        const { data: updateData, error: updateError } = await supabase.storage
          .from(bucketName)
          .update(filePath, fileBody, {
            contentType: contentType,
          });

        if (updateError) {
          throw new Error(`이미지 업데이트 실패: ${updateError.message}`);
        }

        const { data: urlData } = supabase.storage
          .from(bucketName)
          .getPublicUrl(filePath);

        return {
          url: urlData.publicUrl,
          path: filePath,
        };
      }
      throw new Error(`이미지 업로드 실패: ${error.message}`);
    }

    // 업로드된 파일의 public URL 가져오기
    const { data: urlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filePath);

    return {
      url: urlData.publicUrl,
      path: filePath,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
    throw new Error(`이미지 업로드 중 오류: ${errorMessage}`);
  }
}

