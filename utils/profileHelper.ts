import { RESTRICTION_IDS } from "../enum/profileEnum";
import { baseDelete, basePost } from "../services/baseCall";

export const syncUserRestrictions = async (
    userId: number,
    currentRestrictions: string[] | null,
    initialRestrictions: string[] | null
) => {
    const current = currentRestrictions || [];
    const initial = initialRestrictions || [];

    const toAdd = current.filter(r => !initial.includes(r));
    const toRemove = initial.filter(r => !current.includes(r));

    console.log(`Syncing Restrictions for UserID: ${userId}`);

    const promises: Promise<any>[] = [];

    // ADD
    toAdd.forEach(rKey => {
        // CORREÇÃO 2: .toUpperCase() para garantir match
        const rId = RESTRICTION_IDS[rKey.toUpperCase()];
        if (rId && userId) {
            promises.push(basePost('/userRestrictions', { user_id: userId, restriction_id: rId }));
        }
    });

    // REMOVE (DELETE)
    toRemove.forEach(rKey => {
        const rId = RESTRICTION_IDS[rKey.toUpperCase()];

        // Verificação de segurança antes de chamar
        if (rId && userId) {
            promises.push(
                baseDelete(`/userRestrictions?user_id=${userId}&restriction_id=${rId}`)
            );
        } else {
            console.error("Dados inválidos para Delete:", { userId, rId, rKey });
        }
    });

    await Promise.all(promises);
};