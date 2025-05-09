import { useState } from 'react';

interface IsOpenState {
  terms: boolean;
  privacy: boolean;
}

const ServiceAgreement = () => {
  const [isOpen, setIsOpen] = useState<IsOpenState>({
    terms: false,
    privacy: false,
  });

  const toggleOpen = (type: keyof IsOpenState) => {
    setIsOpen(prevState => ({
      terms: type === 'terms' ? !prevState.terms : false,
      privacy: type === 'privacy' ? !prevState.privacy : false,
    }));
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">서비스 약관 및 개인정보 처리방침</h2>

      <div className="mb-4">
        <button
          onClick={() => toggleOpen('terms')}
          className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          이용약관 {isOpen.terms ? '닫기' : '보기'}
        </button>
        <div
          className={`mt-2 overflow-hidden transition-all duration-500 ease-in-out ${
            isOpen.terms ? 'max-h-screen flex-1' : 'max-h-0'
          }`}
        >
          <div className="p-4 border rounded bg-gray-50">
            <h3 className="text-lg font-semibold mb-2">이용약관</h3>
            <p>
              이용약관 내용입니다. Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
              Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. 
              Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
              Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. 
              Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
            </p>
          </div>
        </div>
      </div>

      <div>
        <button
          onClick={() => toggleOpen('privacy')}
          className="w-full bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          개인정보처리방침 {isOpen.privacy ? '닫기' : '보기'}
        </button>
        <div
          className={`mt-2 overflow-hidden transition-all duration-500 ease-in-out ${
            isOpen.privacy ? 'max-h-screen flex-1' : 'max-h-0'
          }`}
        >
          <div className="p-4 border rounded bg-gray-50">
            <h3 className="text-lg font-semibold mb-2">개인정보처리방침</h3>
            <p>
              개인정보처리방침 내용입니다. Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
              Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. 
              Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
              Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. 
              Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceAgreement; 