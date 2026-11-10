import { useState } from "react";
import { Alert, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import {
  Card,
  Icon,
  Row,
  Screen,
  Stack,
  Text,
} from "../../src/components/primitives";
import {
  FeedFilterMenu,
  type FeedFilter,
} from "../../src/features/home/components/FeedFilterMenu";
import { FeedPostCard } from "../../src/features/home/components/FeedPostCard";
import {
  GroupHighlights,
  type GroupHighlight,
} from "../../src/features/home/components/GroupHighlights";
import { HomeHeader } from "../../src/features/home/components/HomeHeader";
import { colors } from "../../src/theme/colors";
import { useAuthStore } from "../../src/state/useAuthStore";

const groups: GroupHighlight[] = [
  { id: "ucll", name: "UCLL Community", fallbackColor: "#6D4BC3" },
  { id: "weekend", name: "Weekend crew", fallbackColor: "#D77958" },
  { id: "studio", name: "Studio North", fallbackColor: "#377E78" },
  { id: "hikers", name: "The hikers", fallbackColor: "#66824D" },
];

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [feedFilter, setFeedFilter] = useState<FeedFilter>("for-you");

  return (
    <Screen padding="md">
      <View style={styles.container} testID="home-screen">
        <Stack gap="lg">
          <HomeHeader
            name={user?.name ?? "User"}
            onNotificationsPress={() =>
              Alert.alert(
                "Notifications",
                "Group and event invitations will show up here.",
              )
            }
          />

          <GroupHighlights
            groups={groups}
            onSeeAllPress={() => router.push("/groups")}
            onGroupPress={(_group) => {
              // TODO: Route to `/groups/${_group.id}` when group detail routes exist.
              router.push("/groups");
            }}
          />

          <Stack gap="md">
            <Row justify="space-between" align="center">
              <Text size="lg" weight="bold">
                News and invites
              </Text>
              <FeedFilterMenu value={feedFilter} onChange={setFeedFilter} />
            </Row>

            <FeedPostCard
              groupName="UCLL Community"
              groupFallbackColor="#6D4BC3"
              timestamp="2 hours ago"
              title="Campus welcome day"
              caption="A new year, new faces, and a whole lot to explore. Come say hi at our welcome event!"
              kind="event"
              eventDate="THU, SEP 12"
              eventTime="16:00"
              eventLocation="Campus Leuven"
              reactionCount="24"
              commentCount="8"
            />

            <FeedPostCard
              groupName="Weekend crew"
              groupFallbackColor="#D77958"
              timestamp="Yesterday"
              title="That night was one for the books ✨"
              caption="Already planning the next one. Drop your favorite moments below."
              kind="photo"
              reactionCount="12"
              commentCount="3"
            />

            <Card>
              <Row align="center" gap="sm">
                <View style={styles.tipIcon}>
                  <Icon
                    name="people-outline"
                    size={20}
                    color={colors.primary}
                  />
                </View>
                <Stack gap="none">
                  <Text size="sm" weight="bold">
                    Your groups, all in one place
                  </Text>
                  <Text size="sm" color={colors.muted}>
                    Join a community or start a group with friends.
                  </Text>
                </Stack>
              </Row>
            </Card>
          </Stack>
        </Stack>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tipIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
});
