import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, StyleSheet, Switch, Text, View } from "react-native";

export default function NotificationsScreen() {
  const { t } = useTranslation();
  const [pushEnabled, setPushEnabled] = useState(true);
  const [repliesEnabled, setRepliesEnabled] = useState(true);
  const [challengesEnabled, setChallengesEnabled] = useState(true);
  const [tipsEnabled, setTipsEnabled] = useState(false);

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
          {t("settings.notifications")}
        </Text>
      </View>

      <View style={styles.content}>
        {/* Master toggle */}
        <View style={styles.masterCard}>
          <View style={styles.masterRow}>
            <View style={styles.masterLeft}>
              <View style={styles.masterIcon}>
                <Ionicons name="notifications" size={20} color="#8B5CF6" />
              </View>
              <View style={styles.masterInfo}>
                <Text style={styles.masterTitle}>{t("settings.notificationTypes.pushTitle")}</Text>
                <Text style={styles.masterSubtitle}>
                  {t("settings.notificationTypes.pushDesc")}
                </Text>
              </View>
            </View>
            <Switch
              value={pushEnabled}
              onValueChange={setPushEnabled}
              trackColor={{ false: "#374151", true: "#8B5CF6" }}
              thumbColor="#fff"
            />
          </View>
        </View>

        {pushEnabled && (
          <>
            <Text style={styles.sectionTitle}>
              {t("settings.notificationTypes.title")}
            </Text>
            <View style={styles.listContainer}>
              <NotificationItem
                label={t("settings.notificationTypes.replies")}
                description={t("settings.notificationTypes.repliesDesc")}
                value={repliesEnabled}
                onChange={setRepliesEnabled}
              />
              <NotificationItem
                label={t("settings.notificationTypes.challenges")}
                description={t("settings.notificationTypes.challengesDesc")}
                value={challengesEnabled}
                onChange={setChallengesEnabled}
              />
              <NotificationItem
                label={t("settings.notificationTypes.tips")}
                description={t("settings.notificationTypes.tipsDesc")}
                value={tipsEnabled}
                onChange={setTipsEnabled}
                isLast
              />
            </View>
          </>
        )}
      </View>
    </View>
  );
}

function NotificationItem({
  label,
  description,
  value,
  onChange,
  isLast = false,
}: {
  label: string;
  description: string;
  value: boolean;
  onChange: (v: boolean) => void;
  isLast?: boolean;
}) {
  return (
    <View
      style={[
        styles.itemContainer,
        !isLast && styles.itemBorder,
      ]}
    >
      <View style={styles.itemInfo}>
        <Text style={styles.itemLabel}>{label}</Text>
        <Text style={styles.itemDescription}>{description}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: "#374151", true: "#8B5CF6" }}
        thumbColor="#fff"
      />
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
  masterCard: {
    backgroundColor: "#1A1A2E", // bg-dark-50
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  masterRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  masterLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  masterIcon: {
    width: 40,
    height: 40,
    backgroundColor: "rgba(139, 92, 246, 0.2)", // bg-primary/20
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  masterInfo: {
    flex: 1,
  },
  masterTitle: {
    color: "white",
    fontWeight: "500",
  },
  masterSubtitle: {
    color: "#6B7280", // text-gray-500
    fontSize: 14,
  },
  sectionTitle: {
    color: "#6B7280", // text-gray-500
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 12,
    textTransform: "uppercase",
  },
  listContainer: {
    backgroundColor: "#1A1A2E", // bg-dark-50
    borderRadius: 12,
    overflow: "hidden",
  },
  itemContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },
  itemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#0F0F1A", // border-dark
  },
  itemInfo: {
    flex: 1,
    marginRight: 16,
  },
  itemLabel: {
    color: "white",
  },
  itemDescription: {
    color: "#6B7280", // text-gray-500
    fontSize: 14,
  },
});
