export type CafeteriaId = 'a1' | 'b2' | 'c3';
export type Weekday = '일' | '월' | '화' | '수' | '목' | '금' | '토';
export type MealKey = 'breakfast' | 'lunch' | 'dinner';

export type MealMenu = {
    breakfast: string[];
    lunch: string[];
    dinner: string[];
};

export const cafeterias: { id: CafeteriaId; name: string }[] = [
    { name: '학생식당', id: 'a1' },
    { name: '교직원식당', id: 'b2' },
    { name: '분식당', id: 'c3' },
];

export const mealLabels = [
    { key: 'breakfast', label: 'Breakfast' },
    { key: 'lunch', label: 'Lunch' },
    { key: 'dinner', label: 'Dinner' },
] as const;

type MenuItemDetail = {
    description: string;
    ingredients: string[];
};

const INGREDIENT_TRANSLATIONS: Record<string, string> = {
    소고기: 'Beef',
    쇠고기: 'Beef',
    미역: 'Seaweed',
    국간장: 'Soup soy sauce',
    마늘: 'Garlic',
    된장: 'Soybean paste',
    두부: 'Tofu',
    채소: 'Vegetables',
    육수: 'Broth',
    쌀: 'Rice',
    양념: 'Seasoning',
    식용유: 'Cooking oil',
    소스: 'Sauce',
    빵: 'Bread',
    버터: 'Butter',
    잼: 'Jam',
    우유: 'Milk',
    곡물: 'Grains',
    과일: 'Fruit',
    견과류: 'Nuts',
    유제품: 'Dairy',
    계란: 'Egg',
    소금: 'Salt',
    김: 'Seaweed sheet',
    면: 'Noodles',
    양념장: 'Sauce',
    밀가루: 'Flour',
    고기: 'Meat',
    닭고기: 'Chicken',
    후추: 'Black pepper',
    돼지고기: 'Pork',
    생선: 'Fish',
    레몬: 'Lemon',
    해산물: 'Seafood',
    토마토: 'Tomato',
    올리브오일: 'Olive oil',
    버섯: 'Mushrooms',
    곡류: 'Grains',
    김치: 'Kimchi',
    오이: 'Cucumber',
    상추: 'Lettuce',
    콩나물: 'Bean sprouts',
    김치국물: 'Kimchi broth',
    감자: 'Potato',
    당근: 'Carrot',
    옥수수: 'Corn',
    시금치: 'Spinach',
    단무지: 'Pickled radish',
    깍두기: 'Cubed radish kimchi',
    무생채: 'Seasoned radish',
    나물: 'Seasoned greens',
    드레싱: 'Dressing',
    과일컵: 'Fruit cup',
    타르타르소스: 'Tartar sauce',
    두유: 'Soy milk',
    크림치즈: 'Cream cheese',
    아메리카노: 'Americano',
    카레: 'Curry',
    치즈: 'Cheese',
};

const MENU_ITEM_TRANSLATION_RULES: Array<[RegExp, string]> = [
    [/김치볶음밥/, 'Kimchi Fried Rice'],
    [/소고기미역국/, 'Beef Seaweed Soup'],
    [/미역국/, 'Seaweed Soup'],
    [/미소된장국|된장국/, 'Miso Soybean Paste Soup'],
    [/북어국/, 'Dried Pollack Soup'],
    [/어묵국/, 'Fish Cake Soup'],
    [/콩나물국/, 'Bean Sprout Soup'],
    [/계란국/, 'Egg Soup'],
    [/맑은국/, 'Clear Soup'],
    [/감자스프/, 'Potato Soup'],
    [/옥수수스프/, 'Corn Soup'],
    [/야채스프/, 'Vegetable Soup'],
    [/오뎅탕/, 'Fish Cake Hot Pot'],
    [/닭개장/, 'Spicy Chicken Soup'],
    [/닭죽/, 'Chicken Porridge'],
    [/볶음밥/, 'Fried Rice'],
    [/덮밥/, 'Rice Bowl'],
    [/비빔밥/, 'Bibimbap'],
    [/오므라이스/, 'Omurice'],
    [/카레라이스/, 'Curry Rice'],
    [/라볶이/, 'Rabokki'],
    [/떡볶이/, 'Tteokbokki'],
    [/떡라면/, 'Tteok Ramen'],
    [/돈코츠라멘/, 'Tonkotsu Ramen'],
    [/라면/, 'Ramen'],
    [/우동/, 'Udon'],
    [/쫄면/, 'Spicy Noodles'],
    [/국수/, 'Noodles'],
    [/짬뽕/, 'Jjamppong'],
    [/짜장/, 'Jajang'],
    [/김밥천국세트/, 'Gimbap Set'],
    [/김밥/, 'Gimbap'],
    [/유부초밥/, 'Inari Sushi'],
    [/주먹밥/, 'Rice Ball'],
    [/샌드위치/, 'Sandwich'],
    [/토스트/, 'Toast'],
    [/식빵/, 'Bread'],
    [/베이글/, 'Bagel'],
    [/팬케이크/, 'Pancake'],
    [/시리얼/, 'Cereal'],
    [/그래놀라/, 'Granola'],
    [/오트밀/, 'Oatmeal'],
    [/모닝빵/, 'Dinner Roll'],
    [/요거트/, 'Yogurt'],
    [/우유/, 'Milk'],
    [/두유/, 'Soy Milk'],
    [/치즈/, 'Cheese'],
    [/샐러드/, 'Salad'],
    [/스프/, 'Soup'],
    [/계란후라이|계란프라이/, 'Fried Egg'],
    [/삶은 달걀|삶은 계란/, 'Boiled Egg'],
    [/계란찜/, 'Steamed Egg'],
    [/계란말이/, 'Rolled Omelet'],
    [/오믈렛/, 'Omelet'],
    [/스크램블/, 'Scrambled Egg'],
    [/닭강정/, 'Sweet Crispy Chicken'],
    [/닭갈비/, 'Spicy Chicken Stir-fry'],
    [/닭죽/, 'Chicken Porridge'],
    [/돈까스/, 'Pork Cutlet'],
    [/치킨너겟/, 'Chicken Nuggets'],
    [/튀김만두/, 'Fried Dumplings'],
    [/군만두/, 'Pan-Fried Dumplings'],
    [/만두/, 'Dumplings'],
    [/김말이/, 'Seaweed Roll Fritters'],
    [/순대/, 'Sundae'],
    [/튀김/, 'Fried Snacks'],
    [/미니돈까스/, 'Mini Pork Cutlet'],
    [/생선까스/, 'Fish Cutlet'],
    [/치킨/, 'Chicken'],
    [/닭/, 'Chicken'],
    [/돼지고기|돈육|제육|돼지/, 'Pork'],
    [/소고기|쇠고기|비프/, 'Beef'],
    [/고등어/, 'Mackerel'],
    [/삼치/, 'Spanish Mackerel'],
    [/연어/, 'Salmon'],
    [/생선/, 'Fish'],
    [/새우/, 'Shrimp'],
    [/오징어/, 'Squid'],
    [/게/, 'Crab'],
    [/조개/, 'Shellfish'],
    [/굴/, 'Oyster'],
    [/해물/, 'Seafood'],
    [/토마토/, 'Tomato'],
    [/복숭아/, 'Peach'],
    [/사과/, 'Apple'],
    [/바나나/, 'Banana'],
    [/귤/, 'Mandarin'],
    [/오렌지/, 'Orange'],
    [/딸기/, 'Strawberry'],
    [/블루베리/, 'Blueberry'],
    [/과일컵/, 'Fruit Cup'],
    [/감자튀김/, 'French Fries'],
    [/감자조림/, 'Braised Potatoes'],
    [/감자채볶음/, 'Stir-fried Potatoes'],
    [/콘샐러드/, 'Corn Salad'],
    [/양배추샐러드/, 'Cabbage Salad'],
    [/연어샐러드/, 'Salmon Salad'],
    [/토마토샌드위치/, 'Tomato Sandwich'],
    [/제육볶음/, 'Spicy Pork Stir-fry'],
    [/제육쌈밥/, 'Spicy Pork Wrap Rice'],
    [/제육덮밥/, 'Spicy Pork Rice Bowl'],
    [/돈불고기/, 'Pork Bulgogi'],
    [/소불고기정식/, 'Beef Bulgogi Set Meal'],
    [/불고기정식/, 'Bulgogi Set Meal'],
    [/불고기/, 'Bulgogi'],
    [/돈육김치찌개/, 'Pork Kimchi Stew'],
    [/김치찌개/, 'Kimchi Stew'],
    [/짜장덮밥/, 'Jajang Rice Bowl'],
    [/고등어구이/, 'Grilled Mackerel'],
    [/삼치구이/, 'Grilled Spanish Mackerel'],
    [/오징어볶음/, 'Stir-fried Squid'],
    [/브로콜리/, 'Broccoli'],
    [/호박볶음/, 'Stir-fried Zucchini'],
    [/버섯볶음/, 'Stir-fried Mushrooms'],
    [/나물무침/, 'Seasoned Greens'],
    [/오이무침/, 'Seasoned Cucumber'],
    [/무생채/, 'Seasoned Radish'],
    [/상추쌈/, 'Lettuce Wraps'],
    [/상추/, 'Lettuce'],
    [/단무지/, 'Pickled Radish'],
    [/깍두기/, 'Cubed Radish Kimchi'],
    [/김치/, 'Kimchi'],
    [/쿨피스/, 'Coolpis'],
    [/교자만두/, 'Gyoza'],
    [/춘권/, 'Spring Roll'],
    [/소시지볶음|소세지볶음/, 'Stir-fried Sausage'],
    [/두부스테이크/, 'Tofu Steak'],
    [/연두부샐러드/, 'Soft Tofu Salad'],
    [/소고기덮밥/, 'Beef Rice Bowl'],
];

export function translateMenuItem(name: string): string {
    const matchedRule = MENU_ITEM_TRANSLATION_RULES.find(([match]) => match.test(name));
    return matchedRule ? matchedRule[1] : name;
}

function translateIngredient(name: string): string {
    return INGREDIENT_TRANSLATIONS[name] ?? translateMenuItem(name);
}

function translateIngredients(ingredients: string[]): string[] {
    return ingredients.map((ingredient) => translateIngredient(ingredient));
}

const menuDetailRules: Array<{
    match: RegExp;
    description: string;
    ingredients: string[];
}> = [
    {
        match: /미역국/,
        description: 'A soup made by simmering beef and seaweed together',
        ingredients: ['소고기', '미역', '국간장', '마늘'],
    },
    {
        match: /된장국/,
        description: 'A soup simmered with soybean paste, tofu, and vegetables',
        ingredients: ['된장', '두부', '채소', '육수'],
    },
    {
        match: /볶음밥/,
        description: 'Ingredients are chopped and stir-fried with rice',
        ingredients: ['쌀', '채소', '양념', '식용유'],
    },
    {
        match: /덮밥/,
        description: 'Seasoned ingredients served over rice',
        ingredients: ['쌀', '채소', '양념', '소스'],
    },
    {
        match: /샐러드/,
        description: 'Fresh vegetables served with dressing',
        ingredients: ['채소', '드레싱', '과일', '견과류'],
    },
    {
        match: /토스트|식빵|베이글|팬케이크|샌드위치|모닝빵/,
        description: 'A simple meal of bread or baked goods served with butter',
        ingredients: ['빵', '버터', '잼', '우유'],
    },
    {
        match: /시리얼|그래놀라|오트밀/,
        description: 'Grains served simply with milk and fruit',
        ingredients: ['곡물', '우유', '과일', '견과류'],
    },
    {
        match: /우유|요거트|치즈|크림|스프/,
        description: 'A mild dish made with dairy or a cream base',
        ingredients: ['유제품', '채소', '과일'],
    },
    {
        match: /계란|달걀|오믈렛|스크램블|계란찜|계란후라이|삶은 달걀/,
        description: 'Eggs prepared by boiling, frying, or steaming',
        ingredients: ['계란', '소금', '버터'],
    },
    {
        match: /김밥|주먹밥|유부초밥|비빔밥|덮밥|볶음밥|라이스|밥$/,
        description: 'Rice-based dish combined with vegetables and other ingredients',
        ingredients: ['쌀', '채소', '양념', '김'],
    },
    {
        match: /라면|우동|국수|쫄면|짬뽕|떡볶이|라볶이|떡라면/,
        description: 'Noodles or rice cakes simmered in broth and seasoning',
        ingredients: ['면', '양념장', '채소', '육수'],
    },
    {
        match: /만두|김말이|튀김|군만두|치킨너겟|돈까스/,
        description: 'Ingredients coated and fried until crisp',
        ingredients: ['밀가루', '식용유', '소스', '고기'],
    },
    {
        match: /닭|치킨/,
        description: 'Chicken seasoned or fried into a hearty dish',
        ingredients: ['닭고기', '소금', '후추', '양념'],
    },
    {
        match: /돼지|제육|돈육|불고기|돈까스/,
        description: 'Pork or seasoned meat stir-fried or grilled',
        ingredients: ['돼지고기', '양념', '채소', '밥'],
    },
    {
        match: /소고기|쇠고기|불고기|비프/,
        description: 'Beef seasoned and stir-fried or braised',
        ingredients: ['쇠고기', '양념', '채소', '밥'],
    },
    {
        match: /고등어|생선|연어|삼치|멸치/,
        description: 'A simple grilled fish dish',
        ingredients: ['생선', '소금', '레몬', '채소'],
    },
    {
        match: /새우|해물|오징어|게|조개|굴/,
        description: 'Seafood stir-fried or simmered together',
        ingredients: ['해산물', '양념', '채소', '면'],
    },
    {
        match: /견과|땅콩|호두/,
        description: 'A nut-based dish with a rich, savory flavor',
        ingredients: ['견과류', '과일', '곡물'],
    },
    {
        match: /토마토/,
        description: 'Tomatoes cooked together with vegetables',
        ingredients: ['토마토', '채소', '올리브오일'],
    },
];

export function getMenuItemDetail(name: string): MenuItemDetail {
    const matchedRule = menuDetailRules.find((rule) => rule.match.test(name));

    if (matchedRule) {
        return {
            description: matchedRule.description,
            ingredients: translateIngredients(matchedRule.ingredients),
        };
    }

    return {
        description: 'A dish prepared in a simple, basic style',
        ingredients: [translateMenuItem(name), 'Vegetables', 'Basic seasoning'],
    };
}

export function getWeekdayFromDateString(dateString: string): Weekday | null {
    const date = new Date(`${dateString}T00:00:00`);
    if (Number.isNaN(date.getTime())) return null;

    return ['일', '월', '화', '수', '목', '금', '토'][date.getDay()] as Weekday;
}

export const mockMenuByWeekday: Record<Weekday, Record<CafeteriaId, MealMenu>> = {
    월: {
        a1: {
            breakfast: ['토스트', '삶은 달걀', '바나나', '우유'],
            lunch: ['김치볶음밥', '미소된장국', '닭강정', '샐러드','김치','연두부','간장'],
            dinner: ['제육덮밥', '어묵국', '깍두기', '요거트'],
        },
        b2: {
            breakfast: ['시리얼', '플레인 요거트', '사과', '두유'],
            lunch: ['소불고기정식', '북어국', '계란찜', '나물무침'],
            dinner: ['연어샐러드', '감자스프', '모닝빵', '과일컵'],
        },
        c3: {
            breakfast: ['참치김밥', '컵과일', '두유'],
            lunch: ['치즈돈까스', '양배추샐러드', '우동', '단무지'],
            dinner: ['라볶이', '순대', '튀김만두', '쿨피스'],
        },
    },
    화: {
        a1: {
            breakfast: ['밥', '계란후라이', '김구이', '콩나물국'],
            lunch: ['닭갈비', '상추쌈', '맑은국', '깍두기'],
            dinner: ['카레라이스', '미니돈까스', '콘샐러드', '배추김치'],
        },
        b2: {
            breakfast: ['베이글', '크림치즈', '오렌지', '아메리카노'],
            lunch: ['돈육김치찌개', '계란말이', '시금치나물', '밥'],
            dinner: ['두부스테이크', '브로콜리', '옥수수스프', '샐러드'],
        },
        c3: {
            breakfast: ['모닝빵', '딸기잼', '요거트', '바나나'],
            lunch: ['우동정식', '김말이', '만두튀김', '단무지'],
            dinner: ['비빔만두', '떡볶이', '오뎅탕', '쿨피스'],
        },
    },
    수: {
        a1: {
            breakfast: ['현미밥', '소고기미역국', '두부조림', '김치'],
            lunch: ['돈불고기', '감자채볶음', '미역국', '오이무침'],
            dinner: ['삼치구이', '호박볶음', '계란국', '깍두기'],
        },
        b2: {
            breakfast: ['콘프레이크', '우유', '귤', '삶은 달걀'],
            lunch: ['오므라이스', '크림스프', '치킨너겟', '샐러드'],
            dinner: ['제육쌈밥', '된장국', '버섯볶음', '배추김치'],
        },
        c3: {
            breakfast: ['유부초밥', '우유', '사과'],
            lunch: ['떡라면', '김밥', '만두', '단무지'],
            dinner: ['새우볶음밥', '계란국', '춘권', '샐러드'],
        },
    },
    목: {
        a1: {
            breakfast: ['식빵', '딸기잼', '계란스크램블', '우유'],
            lunch: ['오징어볶음', '콩나물국', '두부부침', '김치'],
            dinner: ['닭강정', '감자조림', '미역국', '과일'],
        },
        b2: {
            breakfast: ['그릭요거트', '그래놀라', '블루베리', '두유'],
            lunch: ['돈까스정식', '양배추샐러드', '우동국물', '단무지'],
            dinner: ['연두부샐러드', '소세지볶음', '야채스프', '모닝빵'],
        },
        c3: {
            breakfast: ['김밥', '바나나우유', '귤'],
            lunch: ['라면', '만두', '김말이', '단무지'],
            dinner: ['쫄면', '군만두', '삶은 계란', '오이무침'],
        },
    },
    금: {
        a1: {
            breakfast: ['밥', '소시지볶음', '계란국', '김치'],
            lunch: ['짜장덮밥', '짬뽕국물', '군만두', '단무지'],
            dinner: ['고등어구이', '무생채', '된장국', '과일컵'],
        },
        b2: {
            breakfast: ['팬케이크', '시럽', '우유', '사과'],
            lunch: ['닭개장', '계란말이', '나물무침', '밥'],
            dinner: ['치킨샐러드', '옥수수스프', '빵', '요거트'],
        },
        c3: {
            breakfast: ['토마토샌드위치', '우유', '바나나'],
            lunch: ['돈코츠라멘', '교자만두', '샐러드', '단무지'],
            dinner: ['김치볶음밥', '계란후라이', '미역국', '쿨피스'],
        },
    },
    토: {
        a1: {
            breakfast: ['시리얼', '우유', '바나나'],
            lunch: ['불고기비빔밥', '된장국', '계란찜', '김치'],
            dinner: ['돈까스', '양배추샐러드', '스프', '과일'],
        },
        b2: {
            breakfast: ['베이글', '크림치즈', '딸기', '두유'],
            lunch: ['카레우동', '감자튀김', '샐러드', '단무지'],
            dinner: ['소고기덮밥', '미소국', '나물무침', '요거트'],
        },
        c3: {
            breakfast: ['주먹밥', '두유', '귤'],
            lunch: ['떡볶이', '순대', '튀김', '오뎅'],
            dinner: ['김밥천국세트', '라면', '김말이', '단무지'],
        },
    },
    일: {
        a1: {
            breakfast: ['토스트', '잼', '우유', '삶은 달걀'],
            lunch: ['제육볶음', '콩나물국', '상추', '김치'],
            dinner: ['닭죽', '샐러드', '과일컵', '요거트'],
        },
        b2: {
            breakfast: ['오트밀', '견과류', '바나나', '두유'],
            lunch: ['생선까스', '타르타르소스', '수프', '샐러드'],
            dinner: ['불고기정식', '된장국', '계란찜', '나물무침'],
        },
        c3: {
            breakfast: ['샌드위치', '우유', '사과'],
            lunch: ['우동', '김밥', '군만두', '단무지'],
            dinner: ['라볶이', '김말이', '순대', '쿨피스'],
        },
    },
};
