import { useRef, useState, useEffect } from "react";
import {
  Animated,
  StyleSheet,
  Text,
  View,
  Pressable,
  Dimensions,
  Alert,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { basePutUnique } from "../services/baseCall";
import { useUser } from "../hooks/useUser";
import { usePath } from "../hooks/usePath";
import { ActivityLvlLabels, GenderLabels, ObjectiveLabels, restrictionOptions } from "../enum/profileEnum";



export default function QuestionaryScreen() {
  const [step, setStep] = useState(0);
  const [data, setData] = useState({
    gender: "",
    objective: "",
    activity_lvl: "",
    restrictions: [] as string[],
  });

  const handlePath = usePath()

  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-20)).current;

  const fadeIn = () => {
    opacity.setValue(0);
    translateY.setValue(-20);
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const userData = useUser();
  console.log(userData)

  useEffect(() => {
    const timeout = setTimeout(() => {
      fadeIn();
    }, 100);
    return () => clearTimeout(timeout);
  }, [step]);


  const questions = [
    {
      key: "gender",
      label: "Qual é o seu gênero?",
      options: Object.entries(GenderLabels).map(([value, label]) => ({
        label,
        value,
      })),
    },
    {
      key: "objective",
      label: "Qual é o seu objetivo principal?",
      options: Object.entries(ObjectiveLabels).map(([value, label]) => ({
        label,
        value,
      })),
    },
    {
      key: "activity_lvl",
      label: "Qual é o seu nível de atividade física?",
      options: Object.entries(ActivityLvlLabels).map(([value, label]) => ({
        label,
        value,
      })),
    },
    {
      key: "restrictions",
      label: "Você tem alguma restrição alimentar?",
      options: restrictionOptions,
    },
  ];

  const current = questions[step];

  const toggleRestriction = (value: string) => {
    setData((prev) => {
      const alreadySelected = prev.restrictions.includes(value);
      return {
        ...prev,
        restrictions: alreadySelected
          ? prev.restrictions.filter((v) => v !== value)
          : [...prev.restrictions, value],
      };
    });
  };

  const canProceed = (): boolean => {
    const key = current.key;
    if (key === "restrictions") return true;
    return Boolean(data[key as keyof typeof data]);
  };


  const handleNext = async () => {
    if (!canProceed()) {
      Alert.alert("Ops!", "Por favor, selecione uma opção antes de continuar.");
      return;
    }

    if (step < questions.length - 1) {
      setStep(step + 1);
    } else {
      // valida todas as obrigatórias
      if (!data.gender || !data.objective || !data.activity_lvl) {
        Alert.alert("Atenção", "Responda todas as perguntas obrigatórias antes de finalizar.");
        return;
      }
      console.log("🧠 Dados finais:", data);
      const mergedData = { ...userData, ...data }


      const { restrictions, ...payload } = mergedData;

      console.log('n', payload)

      const response = await basePutUnique("users", payload);
      // if (response && response.status === 200) {
      Alert.alert("Sucesso", "Seus dados foram salvos com sucesso!");
      handlePath('/profile/seeProfile')
      // } else {
      //   Alert.alert("Erro", "Houve um problema ao salvar seus dados. Tente novamente.");
      // }
    }
  };

  const handleBack = () => {
    if (step > 0) setStep(step - 1);
  };



  return (
    <View style={styles.container}>
      <View
        style={{
          position: "absolute",
          top: 80,
          left: 0,
          right: 0,
          alignItems: "center",
        }}
      >
        <Text style={{ fontSize: 30 }}>Sustento</Text>
      </View>

      <Animated.View
        style={[
          styles.questionContainer,
          { opacity, transform: [{ translateY }] },
        ]}
      >
        <Text style={styles.question}>{current.label}</Text>

        {current.key === "restrictions" ? (
          <View style={styles.multiSelectWrapper}>
            {current.options.map((opt) => {
              const selected = data.restrictions.includes(opt.value);
              return (
                <Pressable
                  key={opt.value}
                  onPress={() => toggleRestriction(opt.value)}
                  style={[
                    styles.multiOption,
                    selected && styles.multiOptionSelected,
                  ]}
                >
                  <Text
                    style={[
                      styles.multiOptionText,
                      selected && styles.multiOptionTextSelected,
                    ]}
                  >
                    {opt.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        ) : (
          (() => {
            const safeValue = data[current.key as keyof Omit<typeof data, 'restrictions'>] || "";

            return (
              <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue={safeValue} // Agora seguro
                  onValueChange={(val) =>
                    setData((prev) => ({ ...prev, [current.key]: val }))
                  }
                  style={styles.picker}
                >
                  <Picker.Item label="Selecione..." value="" />
                  {current.options.map((opt) => (
                    <Picker.Item key={opt.value} label={opt.label} value={opt.value} />
                  ))}
                </Picker>
              </View>
            );
          })() // Usamos uma IIFE (Immediately Invoked Function Expression) para declarar a constante no escopo
        )}

        <View style={styles.buttonRow}>
          <Pressable
            style={[
              styles.button,
              step === 0 && { opacity: 0.5, backgroundColor: "#A5D6A7" },
            ]}
            onPress={handleBack}
            disabled={step === 0}
          >
            <Text style={styles.buttonText}>Voltar</Text>
          </Pressable>

          <Pressable style={styles.button} onPress={handleNext}>
            <Text style={styles.buttonText}>
              {step < questions.length - 1 ? "Próximo" : "Finalizar"}
            </Text>
          </Pressable>
        </View>
      </Animated.View>
    </View>
  );
}

const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  questionContainer: {
    width: width * 0.8,
    alignItems: "center",
    paddingVertical: 40,
  },
  question: {
    fontSize: 22,
    fontWeight: "600",
    color: "#212121",
    textAlign: "center",
    marginBottom: 20,
  },
  pickerWrapper: {
    width: "100%",
    borderWidth: 1.5,
    borderColor: "#BDBDBD",
    borderRadius: 8,
    marginBottom: 30,
  },
  picker: {
    height: "auto",
    width: "100%",
  },
  multiSelectWrapper: {
    width: "100%",
    marginBottom: 30,
  },
  multiOption: {
    borderWidth: 1.5,
    borderColor: "#BDBDBD",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 10,
    alignItems: "center",
  },
  multiOptionSelected: {
    backgroundColor: "#4CAF50",
    borderColor: "#4CAF50",
  },
  multiOptionText: {
    color: "#212121",
    fontWeight: "500",
  },
  multiOptionTextSelected: {
    color: "#FFF",
    fontWeight: "600",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 10,
  },
  button: {
    flex: 1,
    backgroundColor: "#4CAF50",
    paddingVertical: 12,
    marginHorizontal: 5,
    borderRadius: 8,
    elevation: 3,
    alignItems: "center",
  },
  buttonText: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 16,
  },
});
