export interface PaidCourse {
  id: string;
  title: string;
  subtitle: string;
  level: string;
  totalDays: number;
  price: number;
  stripeUrl: string;
  password: string;
  paymentLinkId: string;
  sampleDays: number[];
  baseUrl: string;
  description: string;
  emoji: string;
  comingSoon?: boolean;
}

export const PAID_COURSES: PaidCourse[] = [
  {
    id: 'australia-english-30days',
    title: '30日間オーストラリア英語',
    subtitle: 'ワーホリ準備編',
    level: '英検5級レベル',
    totalDays: 30,
    price: 500,
    stripeUrl: 'https://buy.stripe.com/fZu3cu4MheU6fDxfJMd7q00',
    password: 'AUSSIE5Q2026',
    paymentLinkId: 'plink_1T91NcAosn7fgv89ozT3FJcF',
    sampleDays: [1, 8, 22],
    baseUrl: '/australia-english',
    description: 'オーストラリアで実際に使う英語を1日ずつ。カフェ・職場・シェアハウスの実践フレーズ30日分。',
    emoji: '🦘',
  },
  {
    id: 'australia-english-3',
    title: '30日間オーストラリア英語',
    subtitle: 'ワーホリ準備編（英検3級レベル）',
    level: '英検3級レベル',
    totalDays: 30,
    price: 500,
    stripeUrl: 'https://buy.stripe.com/aFa5kC3Id9zMbnheFId7q02',
    password: 'AUSSIE3Q2026',
    paymentLinkId: 'plink_1T9jr1Aosn7fgv894PEiTjn3',
    sampleDays: [1, 8, 22],
    baseUrl: '/australia-english-3',
    description: 'オーストラリアで実際に使う英語を1日ずつ。英検3級レベルの文法・語彙で実践フレーズ30日分。',
    emoji: '🦘',
  },
  {
    id: 'australia-english-p2',
    title: '30日間オーストラリア英語',
    subtitle: 'ワーホリ準備編（英検準2級レベル）',
    level: '英検準2級レベル',
    totalDays: 30,
    price: 500,
    stripeUrl: 'https://buy.stripe.com/cNi00i6UpeU6gHB414d7q01',
    password: 'AUSSIEP2Q2026',
    paymentLinkId: 'plink_1T9josAosn7fgv89sT02Ic3Y',
    sampleDays: [1, 8, 22],
    baseUrl: '/australia-english-p2',
    description: 'オーストラリアで実際に使う英語を1日ずつ。英検準2級レベルの文法・語彙で実践フレーズ30日分。',
    emoji: '🦘',
  },
];

export function findCourseByPaymentLink(paymentLinkId: string): PaidCourse | undefined {
  return PAID_COURSES.find(c => c.paymentLinkId === paymentLinkId);
}
