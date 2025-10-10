export enum Objective {
    LOSE_WEIGHT = "LOSE_WEIGHT",
    GAIN_MUSCLE = "GAIN_MUSCLE",
    MAINTENANCE = "MAINTENANCE",
}

export const ObjectiveLabels: Record<Objective, string> = {
    [Objective.LOSE_WEIGHT]: "Perder Peso",
    [Objective.GAIN_MUSCLE]: "Ganhar Massa",
    [Objective.MAINTENANCE]: "Manutenção",
};

export enum Gender {
    M = "M",
    F = "F",
}
export const GenderLabels: Record<Gender, string> = {
    [Gender.M]: "Masculino",
    [Gender.F]: "Feminino",
};

export enum ActivityLvl {
    SEDENTARY = "SEDENTARY",
    LIGHTLY_ACTIVE = "LIGHTLY_ACTIVE",
    MODERATELY_ACTIVE = "MODERATELY_ACTIVE",
    ACTIVE = "ACTIVE",
    VERY_ACTIVE = "VERY_ACTIVE",
}

export const ActivityLvlLabels: Record<ActivityLvl, string> = {
    [ActivityLvl.SEDENTARY]: "Sedentário",
    [ActivityLvl.LIGHTLY_ACTIVE]: "Levemente Ativo",
    [ActivityLvl.MODERATELY_ACTIVE]: "Moderadamente Ativo",
    [ActivityLvl.ACTIVE]: "Ativo",
    [ActivityLvl.VERY_ACTIVE]: "Muito Ativo",
};