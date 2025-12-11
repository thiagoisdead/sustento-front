import React from "react";
import { StyleSheet, View, Pressable } from "react-native";
import { Text, Divider } from "react-native-paper";
import { MealPlan } from "../../types/meal"; 
import { COLORS } from "../../constants/theme"; 
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const formatValue = (val?: number | null, suffix = "") => {
  if (val === null || val === undefined) return "--";
  return `${val}${suffix}`;
};

// Adicionei onDelete nas props
export const MealPlanCard = ({ 
  mealData, 
  onPress, 
  onDelete 
}: { 
  mealData: MealPlan; 
  onPress: () => void; 
  onDelete: () => void; 
}) => {
  const isActive = mealData?.active;
  const isManual = mealData?.source === 'MANUAL';

  const hasAnyGoal =
    mealData?.target_calories ||
    mealData?.target_protein ||
    mealData?.target_carbs ||
    mealData?.target_fat ||
    mealData?.target_water;

  return (
    // Mudei de View com onTouchEnd para Pressable para melhor controle de clique
    <Pressable 
      style={[styles.card, isActive ? styles.cardActiveBorder : styles.cardInactiveBorder]} 
      onPress={onPress}
    >
      <View style={styles.header}>
        {/* Lado Esquerdo: Título e Badge IA/Manual */}
        <View style={styles.titleContainer}>
          <Text style={styles.planName} numberOfLines={1} ellipsizeMode="tail">
            {mealData?.plan_name || "Plano sem nome"}
          </Text>

          <View style={[styles.sourceBadge, isManual ? styles.bgManual : styles.bgAuto]}>
            <MaterialCommunityIcons
              name={isManual ? "pencil-outline" : "robot-outline"}
              size={12}
              color="#FFF"
            />
            <Text style={styles.sourceText}>
              {isManual ? "Manual" : "IA"}
            </Text>
          </View>
        </View>

        {/* Lado Direito: Container para Status e Lixeira lado a lado */}
        <View style={styles.rightActionsContainer}>
          
          {/* Status Badge */}
          <View style={[styles.statusBadge, isActive ? styles.bgActive : styles.bgInactive]}>
            <Text style={mealData?.active ? styles.statusTextActive : styles.statusTextInactive}>
              {isActive ? "Ativo" : "Inativo"}
            </Text>
          </View>

          {/* Botão de Excluir */}
          <Pressable 
            onPress={(e) => {
               // Impede que o clique na lixeira abra o card
               e.stopPropagation(); 
               onDelete();
            }} 
            style={styles.deleteButton}
            hitSlop={10} // Aumenta a área de toque
          >
            <MaterialCommunityIcons name="trash-can-outline" size={22} color="#FF5252" />
          </Pressable>

        </View>
      </View>

      <Divider style={styles.divider} />

      <View style={styles.statsContainer}>
        {hasAnyGoal ? (
          <>
            <View style={styles.mainStatsRow}>
              <View style={styles.statItem}>
                <MaterialCommunityIcons name="fire" size={18} color="#FF5722" />
                <Text style={styles.statValue}>
                  {formatValue(mealData?.target_calories, " kcal")}
                </Text>
              </View>

              <View style={styles.statItem}>
                <MaterialCommunityIcons name="water" size={18} color="#2196F3" />
                <Text style={styles.statValue}>
                  {formatValue(mealData?.target_water, " ml")}
                </Text>
              </View>
            </View>

            <View style={styles.macrosRow}>
              <Text style={styles.macroText}>
                <Text style={{ fontWeight: 'bold', color: COLORS.textDark }}>Prot: </Text>
                {formatValue(mealData?.target_protein, "g")}
              </Text>
              <Text style={styles.macroText}>
                <Text style={{ fontWeight: 'bold', color: COLORS.textDark }}>Carb: </Text>
                {formatValue(mealData?.target_carbs, "g")}
              </Text>
              <Text style={styles.macroText}>
                <Text style={{ fontWeight: 'bold', color: COLORS.textDark }}>Gord: </Text>
                {formatValue(mealData?.target_fat, "g")}
              </Text>
            </View>
          </>
        ) : (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="chart-box-outline" size={20} color="#999" />
            <Text style={styles.emptyText}>Sem metas definidas</Text>
          </View>
        )}
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    width: '100%',
    maxWidth: 340,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,

    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,

    borderWidth: 1,
    borderColor: COLORS.borderColor,
    backgroundColor: '#fff' // Garante fundo branco
  },

  cardActiveBorder: {
    backgroundColor: COLORS.cardActiveBg,
    borderColor: COLORS.cardActiveBorder,
  },

  cardInactiveBorder: {
    backgroundColor: COLORS.cardInactiveBg,
    borderColor: COLORS.cardInactiveBorder,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },

  titleContainer: {
    flex: 1,
    paddingRight: 8,
  },

  // NOVO ESTILO: Container do lado direito
  rightActionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8, // Espaço entre o badge e a lixeira
  },

  // NOVO ESTILO: Botão da lixeira
  deleteButton: {
    padding: 4,
  },

  planName: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textDark,
    marginBottom: 4,
  },

  sourceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    gap: 4,
  },

  bgManual: { backgroundColor: COLORS.badgeManual },
  bgAuto: { backgroundColor: COLORS.badgeAI },

  sourceText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },

  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },

  bgActive: { backgroundColor: COLORS.badgeActiveBg },
  bgInactive: { backgroundColor: COLORS.badgeInactiveBg },

  statusTextActive: {
    fontSize: 13,
    fontWeight: '800',
    color: "#be0000",
  },
  statusTextInactive: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.textDark,
  },

  divider: {
    backgroundColor: '#EEE',
    marginBottom: 12,
  },

  statsContainer: {
    gap: 8,
  },

  mainStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
  },

  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  statValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },

  macrosRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 8,
    borderRadius: 8,
  },

  macroText: {
    fontSize: 14,
    color: '#666',
  },

  emptyState: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    opacity: 0.6,
  },

  emptyText: {
    fontStyle: 'italic',
    color: '#666',
  }
});