import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";

export default function PrivacyScreen() {
  const { t } = useTranslation();

  const handleDeleteData = () => {
    Alert.alert(
      "Supprimer mes données",
      "Cette action est irréversible. Toutes tes analyses et données seront supprimées.",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: () => {
            // TODO: Implement data deletion
            Alert.alert("Données supprimées", "Tes données ont été supprimées.");
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </Pressable>
        <Text style={styles.headerTitle}>
          {t("settings.privacy")}
        </Text>
      </View>

      <View style={styles.content}>
        {/* Privacy info */}
        <View style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <Ionicons name="shield-checkmark" size={24} color="#8B5CF6" />
            <Text style={styles.infoTitle}>
              Tes données sont protégées
            </Text>
          </View>
          <Text style={styles.infoText}>
            Toutes tes conversations sont analysées localement et de manière
            sécurisée. Nous ne stockons jamais le contenu de tes messages
            originaux.
          </Text>
        </View>

        {/* Privacy options */}
        <Text style={styles.sectionTitle}>
          Options de confidentialité
        </Text>
        <View style={styles.optionsList}>
          <PrivacyItem
            icon="eye-off-outline"
            label="Posts anonymes par défaut"
            description="Tes posts communautaires seront anonymes"
          />
          <PrivacyItem
            icon="image-outline"
            label="Flouter automatiquement"
            description="Les captures sont floutées avant envoi"
            isLast
          />
        </View>

        {/* Data management */}
        <Text style={styles.sectionTitle}>
          Gestion des données
        </Text>
        <View style={styles.optionsList}>
          <Pressable style={[styles.actionItem, styles.actionBorder]}>
            <Ionicons name="download-outline" size={24} color="#8B5CF6" />
            <View style={styles.actionInfo}>
              <Text style={styles.actionLabel}>Exporter mes données</Text>
              <Text style={styles.actionDescription}>
                Télécharge une copie de tes données
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#6B7280" />
          </Pressable>
          <Pressable
            onPress={handleDeleteData}
            style={styles.actionItem}
          >
            <Ionicons name="trash-outline" size={24} color="#EF4444" />
            <View style={styles.actionInfo}>
              <Text style={styles.deleteLabel}>Supprimer mes données</Text>
              <Text style={styles.actionDescription}>
                Supprime toutes tes analyses
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#6B7280" />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

function PrivacyItem({
  icon,
  label,
  description,
  isLast = false,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  description: string;
  isLast?: boolean;
}) {
  return (
    <View
      style={[
        styles.itemContainer,
        !isLast && styles.itemBorder,
      ]}
    >
      <Ionicons name={icon} size={24} color="#8B5CF6" />
      <View style={styles.itemInfo}>
        <Text style={styles.itemLabel}>{label}</Text>
        <Text style={styles.itemDescription}>{description}</Text>
      </View>
      <View style={styles.toggleTrack}>
        <View style={styles.toggleThumb} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0F0F1A", // bg-dark
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "white",
    marginLeft: 8,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  infoCard: {
    backgroundColor: "rgba(139, 92, 246, 0.1)", // bg-primary/10
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  infoHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  infoTitle: {
    color: "#8B5CF6", // text-primary
    fontWeight: "600",
    marginLeft: 8,
  },
  infoText: {
    color: "#D1D5DB", // text-gray-300
    fontSize: 14,
    lineHeight: 20,
  },
  sectionTitle: {
    color: "#6B7280", // text-gray-500
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 12,
    textTransform: "uppercase",
  },
  optionsList: {
    backgroundColor: "#1A1A2E", // bg-dark-50
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 24,
  },
  itemContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  itemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#0F0F1A", // border-dark
  },
  itemInfo: {
    flex: 1,
    marginLeft: 12,
  },
  itemLabel: {
    color: "white",
  },
  itemDescription: {
    color: "#6B7280", // text-gray-500
    fontSize: 14,
  },
  toggleTrack: {
    width: 48,
    height: 24,
    backgroundColor: "#8B5CF6", // bg-primary
    borderRadius: 12,
    justifyContent: "center",
    paddingHorizontal: 2,
  },
  toggleThumb: {
    width: 20,
    height: 20,
    backgroundColor: "white",
    borderRadius: 10,
    alignSelf: "flex-end",
  },
  actionItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  actionBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#0F0F1A", // border-dark
  },
  actionInfo: {
    flex: 1,
    marginLeft: 12,
  },
  actionLabel: {
    color: "white",
  },
  actionDescription: {
    color: "#6B7280", // text-gray-500
    fontSize: 14,
  },
  deleteLabel: {
    color: "#EF4444", // text-error
  },
});
