export interface AllergyItem {
    id: string;
    icon: string;
    name: string;
    nameEn: string;
}

export const ALLERGY_LIST = [
    { id: "peanut", icon: "🥜", name: "땅콩", nameEn: "Peanut" },
    { id: "soybean", icon: "🫘", name: "대두", nameEn: "Soybean" },
    { id: "walnut", icon: "🌰", name: "호두", nameEn: "Walnut" },
    { id: "wheat", icon: "🌾", name: "밀", nameEn: "Wheat" },
    { id: "buckwheat", icon: "🌿", name: "메밀", nameEn: "Buckwheat" },
    { id: "sulfites", icon: "🧪", name: "아황산류", nameEn: "Sulfites" },
    { id: "egg", icon: "🥚", name: "난류", nameEn: "Egg" },
    { id: "milk", icon: "🥛", name: "우유", nameEn: "Milk" },
    { id: "mackerel", icon: "🐟", name: "고등어", nameEn: "Mackerel" },
    { id: "crab", icon: "🦀", name: "게", nameEn: "Crab" },
    { id: "shrimp", icon: "🦐", name: "새우", nameEn: "Shrimp" },
    { id: "squid", icon: "🦑", name: "오징어", nameEn: "Squid" },
    { id: "shellfish", icon: "🦪", name: "조개류", nameEn: "Shellfish" },
    { id: "peach", icon: "🍑", name: "복숭아", nameEn: "Peach" },
    { id: "tomato", icon: "🍅", name: "토마토", nameEn: "Tomato" },
    { id: "pork", icon: "🐷", name: "돼지고기", nameEn: "Pork" },
    { id: "chicken", icon: "🐔", name: "닭고기", nameEn: "Chicken" },
    { id: "beef", icon: "🐮", name: "쇠고기", nameEn: "Beef" },
];