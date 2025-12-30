import { baseDelete, basePost } from "../services/baseCall";

const RESTRICTION_IDS: Record<string, number> = {
    'VEGAN': 1,
    'VEGETARIAN': 2,
    'GLUTEN_FREE': 3,
    'LACTOSE_FREE': 4
};

export const syncUserRestrictions = async (
    userId: number,
    currentRestrictions: string[] | null,
    initialRestrictions: string[] | null
) => {
    const current = currentRestrictions || [];
    const initial = initialRestrictions || [];

    const toAdd = current.filter(r => !initial.includes(r));
    const toRemove = initial.filter(r => !current.includes(r));

    const promises: Promise<any>[] = [];

    toAdd.forEach(rKey => {
        const rId = RESTRICTION_IDS[rKey.toUpperCase()];
        if (rId && userId) {
            promises.push(basePost('userRestrictions', { user_id: userId, restriction_id: rId }));
        }
    });

    toRemove.forEach(rKey => {
        const rId = RESTRICTION_IDS[rKey.toUpperCase()];
        if (rId && userId) {
            promises.push(
                baseDelete('userRestrictions', {
                    user_id: userId,
                    restriction_id: rId
                })
            );
        }
    });

    await Promise.all(promises);
};