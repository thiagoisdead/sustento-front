import { ActivityLvl, ActivityLvlLabels, Gender, GenderLabels, Objective, ObjectiveLabels } from '../enum/profileEnum';
import { User } from '../types/data';

export const enumToArray = (enumObj: any, labelsObj: any) => {
    return Object.values(enumObj).map((val: any) => ({
        label: labelsObj[val],
        value: val,
    }));
};

export const restrictionOptions = [
    { label: 'Vegano', value: 'VEGAN' },
    { label: 'Vegetariano', value: 'VEGETARIAN' },
    { label: 'Sem Glúten', value: 'GLUTEN_FREE' },
    { label: 'Sem Lactose', value: 'LACTOSE_FREE' },
];

export type FieldConfig = {
    key: keyof User;
    label: string;
    type: 'text' | 'number' | 'dropdown' | 'multi-select';
    options?: { label: string; value: string }[];
    large: boolean;
};

export const FIELDS: FieldConfig[] = [
    { key: 'name', label: 'Nome', type: 'text', large: false },
    { key: 'age', label: 'Idade', type: 'number', large: false },
    { key: 'email', label: 'Email', type: 'text', large: true },
    { key: 'weight', label: 'Peso (kg)', type: 'number', large: false },
    { key: 'height', label: 'Altura (cm)', type: 'number', large: false },
    { key: 'gender', label: 'Gênero', type: 'dropdown', options: enumToArray(Gender, GenderLabels), large: true },
    { key: 'activity_lvl', label: 'Atividade Física', type: 'dropdown', options: enumToArray(ActivityLvl, ActivityLvlLabels), large: true },
    { key: 'objective', label: 'Objetivo', type: 'dropdown', options: enumToArray(Objective, ObjectiveLabels), large: true },
    { key: 'restrictions', label: 'Restrições', type: 'multi-select', options: restrictionOptions, large: true },
];