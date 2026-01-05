export interface GiftSimCard {
    id: number;
    giftName: string;
    giftSimCardStatus: 'ACTIVE' | 'INACTIVE';
    createdAt: string;
}
