import { useAppStore } from '@/store/useAppStore';

// 지원 언어 (서버 옵션과 동일)
type LangCode = 'en' | 'ko';

type TranslationDict = Record<string, string>;

// ─── 영어 ───
const en: TranslationDict = {
    // 공통
    'common.back': 'Back',
    'common.next': 'Next',
    'common.cancel': 'Cancel',
    'common.close': 'Close',
    'common.loading': 'Loading...',
    'common.comingSoon': 'Coming soon',
    'common.comingSoonMessage': '{label} is in preparation.',
    'common.tryAgain': 'Please try again.',
    'common.none': 'None',

    // 로그인
    'login.brand': 'Allergy Safe',
    'login.tagline': 'A personalized meal menu for international students',
    'login.continueWithGoogle': 'Continue with Google',
    'login.devEnter': 'Enter without sign-in (dev)',
    'login.devSkipOnboarding': 'Skip onboarding',
    'login.failedTitle': 'Sign-in failed',
    'login.failedMessage': 'An error occurred while processing the request.',

    // 온보딩
    'onboarding.welcome': 'Welcome!',
    'onboarding.languageSubtitle': 'Select the language you want to use.',
    'onboarding.countryTitle': 'Country',
    'onboarding.countrySubtitle': 'Select the country you are from.',
    'onboarding.schoolTitle': 'School',
    'onboarding.schoolSubtitle': 'Select your school.',
    'onboarding.finish': 'Finish Onboarding',
    'onboarding.finishing': 'Saving...',
    'onboarding.schoolMissing': 'School missing',
    'onboarding.schoolMissingMessage': 'Please select your school before finishing onboarding.',
    'onboarding.failed': 'Onboarding failed',

    // 탭
    'tab.menu': 'Menu',
    'tab.translate': 'Translate',
    'tab.camera': 'Scan',
    'tab.settings': 'Settings',

    // 카메라 (음식 스캔)
    'camera.title': 'Scan Food',
    'camera.subtitle': 'AI detects ingredients from your food photo',
    'camera.permission.title': 'Camera permission required',
    'camera.permission.message':
        'Allow camera access to scan food and detect ingredients.',
    'camera.permission.grant': 'Grant permission',
    'camera.permission.openSettings': 'Open Settings',
    'camera.capture': 'Capture',
    'camera.retake': 'Retake',
    'camera.analyze': 'Analyze',
    'camera.flipCamera': 'Flip camera',
    'camera.comingSoon': 'AI analysis coming soon',

    // 메인
    'main.title': "Today's Campus Menu 🍽️",
    'main.currentFilter': 'Current filter',
    'main.cafeteriaClosed': 'Cafeteria Closed',
    'main.noMealsScheduled': 'No meals scheduled',

    // 끼니
    'meal.breakfast': 'Breakfast',
    'meal.lunch': 'Lunch',
    'meal.dinner': 'Dinner',

    // 상세 페이지
    'detail.aiAnalyzed': 'AI Analyzed',
    'detail.like': 'Like',
    'detail.reviews': 'Reviews',
    'detail.notFound': 'Could not find this menu',
    'detail.likeFailed': 'Like failed',

    // 설정
    'settings.title': 'Settings',
    'settings.country': 'Country Settings',
    'settings.school': 'School Settings',
    'settings.allergy': 'Allergy Settings',
    'settings.language': 'Language Settings',
    'settings.logOut': 'Log Out',

    // 위험도 (RiskIndicator)
    'risk.danger': 'Danger',
    'risk.high': 'High',
    'risk.medium': 'Medium',
    'risk.low': 'Low',

    // 번역 탭
    'translate.title': 'Translate',
    'translate.description':
        'Type your question in {language}, then show the Korean result to staff.',
    'translate.selectedCountry': 'Selected country',
    'translate.noCountrySelected': 'No country selected yet.',
    'translate.countryHint': 'Choose one in Settings to improve the translation hint.',
    'translate.selectCountry': 'Select country',
    'translate.question': 'Question',
    'translate.placeholder': 'Type your question in {language}',
    'translate.button': 'Translate to Korean',
    'translate.koreanResult': 'Korean result',
    'translate.translatedPlaceholder': 'Your translated message will appear here.',
    'translate.yourLanguage': 'your language',

    // 알러지 / 종교 설정
    'allergy.title': 'Allergy Categories',
    'allergy.subtitle': 'Tap every ingredient category you need to avoid.',
    'allergy.selectedRestrictions': 'selected restrictions',
    'allergy.religious': 'Religious',
    'allergy.religiousChoose': 'Choose one dietary restriction if needed.',
    'allergy.noReligiousSelected': 'No religious restriction selected.',
    'allergy.allergies': 'Allergies',
    'allergy.noAllergiesSelected': 'No allergies selected yet.',
    'allergy.selected': '{count} selected',
    'allergy.noRestriction': 'No restriction',
    'allergy.updateFailed': 'Allergy update failed',
    'allergy.religionUpdateFailed': 'Religion update failed',

    // 국가 설정
    'country.title': 'Country / Region',
    'country.subtitle': 'Choose your country or region.',
    'country.label': 'Country / Region',
    'country.placeholder': 'Select a country',
    'country.searchPlaceholder': 'Search countries',
    'country.noMatch': 'No countries match your search.',
    'country.selectModalTitle': 'Select country',
    'country.updateFailed': 'Country update failed',

    // 학교 설정
    'school.title': 'School',
    'school.subtitle': 'Select your school.',
    'school.selectedHeader': 'selected school',
    'school.noneSelected': 'No school selected yet.',
    'school.schoolNumber': 'School #{id}',
    'school.updateFailed': 'School update failed',

    // 언어 설정
    'language.title': 'Language',
    'language.subtitle': 'Select the language you want to use.',
    'language.updateFailed': 'Language update failed',

    // 리뷰
    'review.title': 'Reviews',
    'review.placeholder': 'Share your thoughts about this menu...',
    'review.send': 'Send',
    'review.edit': 'Edit',
    'review.delete': 'Delete',
    'review.save': 'Save',
    'review.cancel': 'Cancel',
    'review.edited': 'edited',
    'review.empty': 'No reviews yet. Be the first to write one!',
    'review.deleteConfirm': 'Delete review?',
    'review.deleteConfirmMessage': 'This action cannot be undone.',
    'review.createFailed': 'Failed to post review',
    'review.updateFailed': 'Failed to update review',
    'review.deleteFailed': 'Failed to delete review',
    'review.likeFailed': 'Failed to update like',
    'review.mineSuffix': '(you)',

    // 접근성
    'a11y.goBack': 'Go back',
};

// ─── 한국어 ───
const ko: TranslationDict = {
    'common.back': '뒤로',
    'common.next': '다음',
    'common.cancel': '취소',
    'common.close': '닫기',
    'common.loading': '불러오는 중...',
    'common.comingSoon': '준비 중',
    'common.comingSoonMessage': '{label}는 준비 중입니다.',
    'common.tryAgain': '다시 시도해 주세요.',
    'common.none': '없음',

    'login.brand': 'Allergy Safe',
    'login.tagline': '외국인 유학생을 위한 맞춤형 식단 메뉴',
    'login.continueWithGoogle': '구글로 계속하기',
    'login.devEnter': '로그인 없이 입장 (dev)',
    'login.devSkipOnboarding': '온보딩 건너뛰기',
    'login.failedTitle': '로그인 실패',
    'login.failedMessage': '요청 처리 중 오류가 발생했습니다.',

    'onboarding.welcome': '환영합니다!',
    'onboarding.languageSubtitle': '사용할 언어를 선택하세요.',
    'onboarding.countryTitle': '국가',
    'onboarding.countrySubtitle': '출신 국가를 선택하세요.',
    'onboarding.schoolTitle': '학교',
    'onboarding.schoolSubtitle': '학교를 선택하세요.',
    'onboarding.finish': '온보딩 완료',
    'onboarding.finishing': '저장 중...',
    'onboarding.schoolMissing': '학교 미선택',
    'onboarding.schoolMissingMessage': '온보딩을 완료하기 전에 학교를 선택해 주세요.',
    'onboarding.failed': '온보딩 실패',

    'tab.menu': '메뉴',
    'tab.translate': '번역',
    'tab.camera': '스캔',
    'tab.settings': '설정',

    // 카메라 (음식 스캔)
    'camera.title': '음식 스캔',
    'camera.subtitle': '음식을 스캔하면 ai가 식재료를 분석합니다',
    'camera.permission.title': '카메라 권한이 필요합니다',
    'camera.permission.message':
        '음식 스캔과 재료 인식을 위해 카메라 접근을 허용해 주세요.',
    'camera.permission.grant': '권한 허용',
    'camera.permission.openSettings': '설정 열기',
    'camera.capture': '촬영',
    'camera.retake': '다시 찍기',
    'camera.analyze': '분석하기',
    'camera.flipCamera': '카메라 전환',
    'camera.comingSoon': 'AI 분석은 곧 제공됩니다',

    'main.title': '오늘의 캠퍼스 메뉴 🍽️',
    'main.currentFilter': '현재 필터',
    'main.cafeteriaClosed': '식당 미운영',
    'main.noMealsScheduled': '이 날짜에는 등록된 식사가 없습니다',

    'meal.breakfast': '아침',
    'meal.lunch': '점심',
    'meal.dinner': '저녁',

    'detail.aiAnalyzed': 'AI 분석됨',
    'detail.like': '좋아요',
    'detail.reviews': '리뷰',
    'detail.notFound': '메뉴 정보를 찾을 수 없습니다',
    'detail.likeFailed': '좋아요 실패',

    'settings.title': '설정',
    'settings.country': '국가 설정',
    'settings.school': '학교 설정',
    'settings.allergy': '알러지 설정',
    'settings.language': '언어 설정',
    'settings.logOut': '로그아웃',

    'risk.danger': '위험',
    'risk.high': '높음',
    'risk.medium': '중간',
    'risk.low': '낮음',

    'translate.title': '번역',
    'translate.description':
        '{language}로 질문을 입력하면, 한국어 결과를 직원에게 보여줄 수 있어요.',
    'translate.selectedCountry': '선택된 국가',
    'translate.noCountrySelected': '아직 선택된 국가가 없습니다.',
    'translate.countryHint': '설정에서 국가를 선택하면 번역 힌트가 더 정확해집니다.',
    'translate.selectCountry': '국가 선택',
    'translate.question': '질문',
    'translate.placeholder': '{language}로 질문을 입력하세요',
    'translate.button': '한국어로 번역',
    'translate.koreanResult': '한국어 결과',
    'translate.translatedPlaceholder': '번역된 메시지가 여기에 표시됩니다.',
    'translate.yourLanguage': '본인 언어',

    'allergy.title': '알러지 카테고리',
    'allergy.subtitle': '피해야 할 식재료 카테고리를 모두 탭하세요.',
    'allergy.selectedRestrictions': '선택된 제한',
    'allergy.religious': '종교',
    'allergy.religiousChoose': '필요하다면 하나의 식이 제한을 선택하세요.',
    'allergy.noReligiousSelected': '종교 제한이 선택되지 않았습니다.',
    'allergy.allergies': '알러지',
    'allergy.noAllergiesSelected': '아직 선택된 알러지가 없습니다.',
    'allergy.selected': '{count}개 선택됨',
    'allergy.noRestriction': '제한 없음',
    'allergy.updateFailed': '알러지 업데이트 실패',
    'allergy.religionUpdateFailed': '종교 업데이트 실패',

    'country.title': '국가 / 지역',
    'country.subtitle': '국가 또는 지역을 선택하세요.',
    'country.label': '국가 / 지역',
    'country.placeholder': '국가 선택',
    'country.searchPlaceholder': '국가 검색',
    'country.noMatch': '검색 결과가 없습니다.',
    'country.selectModalTitle': '국가 선택',
    'country.updateFailed': '국가 업데이트 실패',

    'school.title': '학교',
    'school.subtitle': '학교를 선택하세요.',
    'school.selectedHeader': '선택된 학교',
    'school.noneSelected': '아직 선택된 학교가 없습니다.',
    'school.schoolNumber': '학교 #{id}',
    'school.updateFailed': '학교 업데이트 실패',

    'language.title': '언어',
    'language.subtitle': '사용할 언어를 선택하세요.',
    'language.updateFailed': '언어 업데이트 실패',

    'review.title': '리뷰',
    'review.placeholder': '이 메뉴에 대한 생각을 공유해 주세요...',
    'review.send': '등록',
    'review.edit': '수정',
    'review.delete': '삭제',
    'review.save': '저장',
    'review.cancel': '취소',
    'review.edited': '수정됨',
    'review.empty': '아직 리뷰가 없습니다. 첫 리뷰를 작성해 보세요!',
    'review.deleteConfirm': '리뷰를 삭제하시겠습니까?',
    'review.deleteConfirmMessage': '이 작업은 되돌릴 수 없습니다.',
    'review.createFailed': '리뷰 작성 실패',
    'review.updateFailed': '리뷰 수정 실패',
    'review.deleteFailed': '리뷰 삭제 실패',
    'review.likeFailed': '좋아요 실패',
    'review.mineSuffix': '(나)',

    'a11y.goBack': '뒤로 가기',
};

const dicts: Record<LangCode, TranslationDict> = { en, ko };

function resolveLang(code?: string): LangCode {
    return code === 'ko' ? 'ko' : 'en';
}

// {key} placeholder를 params로 치환
function interpolate(template: string, params?: Record<string, string | number>): string {
    if (!params) return template;
    let out = template;
    for (const [k, v] of Object.entries(params)) {
        out = out.split(`{${k}}`).join(String(v));
    }
    return out;
}

export type TFunction = (key: string, params?: Record<string, string | number>) => string;

// 컴포넌트에서 사용: 언어 변경 시 자동 re-render됨
export function useTranslation(): TFunction {
    const language = useAppStore((state) => state.language);
    const lang = resolveLang(language);
    return (key, params) => {
        const template = dicts[lang]?.[key] ?? dicts.en[key] ?? key;
        return interpolate(template, params);
    };
}

// 컴포넌트 외부(Alert 콜백, 유틸 등)에서 사용. 호출 시점의 zustand 언어를 즉시 읽음.
export function t(key: string, params?: Record<string, string | number>): string {
    const lang = resolveLang(useAppStore.getState().language);
    const template = dicts[lang]?.[key] ?? dicts.en[key] ?? key;
    return interpolate(template, params);
}
