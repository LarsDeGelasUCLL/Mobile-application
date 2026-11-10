import { Pressable, StyleSheet, View } from "react-native";
import { Card, Icon, Row, Stack, Text } from "../../../components/primitives";
import { GroupAvatar } from "../../groups/components/GroupAvatar";
import { colors } from "../../../theme/colors";

interface FeedPostCardProps {
  groupName: string;
  groupImageUri?: string;
  groupFallbackColor?: string;
  timestamp: string;
  title: string;
  caption: string;
  kind: "event" | "photo";
  eventDate?: string;
  eventTime?: string;
  eventLocation?: string;
  reactionCount: string;
  commentCount: string;
}

export function FeedPostCard({
  groupName,
  groupImageUri,
  groupFallbackColor,
  timestamp,
  title,
  caption,
  kind,
  eventDate,
  eventTime,
  eventLocation,
  reactionCount,
  commentCount,
}: FeedPostCardProps) {
  return (
    <Card>
      <Stack gap="md">
        <Row align="center" gap="sm">
          <GroupAvatar
            name={groupName}
            imageUri={groupImageUri}
            fallbackColor={groupFallbackColor}
            size={42}
          />
          <View style={styles.postByline}>
            <Stack gap="none">
              <Text size="sm" weight="bold">
                {groupName}
              </Text>
              <Text size="sm" color={colors.muted}>
                {timestamp}
              </Text>
            </Stack>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`More options for ${groupName} post`}
            hitSlop={8}
          >
            <Icon name="ellipsis-horizontal" size={22} color={colors.muted} />
          </Pressable>
        </Row>

        <Stack gap="sm">
          <Text size="lg" weight="bold">
            {title}
          </Text>
          <Text color={colors.muted}>{caption}</Text>
        </Stack>

        {kind === "event" ? (
          <View style={styles.eventArtwork}>
            <View style={styles.eventDecoration} />
            <View style={styles.eventIcon}>
              <Icon name="calendar" size={34} color="#FFFFFF" />
            </View>
            <Stack gap="none">
              <Text size="sm" weight="bold" color="#FFFFFF">
                YOU’RE INVITED
              </Text>
              <Text size="lg" weight="bold" color="#FFFFFF">
                Welcome
              </Text>
            </Stack>
            <View style={styles.eventDate}>
              <Text size="sm" weight="bold" color={colors.primaryDark}>
                {eventDate}
              </Text>
            </View>
          </View>
        ) : (
          <View style={styles.photoArtwork}>
            <View style={styles.photoCircleOne} />
            <View style={styles.photoCircleTwo} />
            <View style={styles.photoContent}>
              <Icon name="sparkles" size={30} color="#FFFFFF" />
              <Text size="lg" weight="bold" color="#FFFFFF">
                Weekend memories
              </Text>
              <Text size="sm" color="#F6EDFF">
                Shared by Weekend crew
              </Text>
            </View>
          </View>
        )}

        {kind === "event" ? (
          <Stack gap="sm">
            {eventTime ? (
              <Row align="center" gap="sm">
                <Icon name="time-outline" size={18} color={colors.primary} />
                <Text size="sm" color={colors.muted}>
                  {eventTime}
                </Text>
              </Row>
            ) : null}
            {eventLocation ? (
              <Row align="center" gap="sm">
                <Icon
                  name="location-outline"
                  size={18}
                  color={colors.primary}
                />
                <Text size="sm" color={colors.muted}>
                  {eventLocation}
                </Text>
              </Row>
            ) : null}
          </Stack>
        ) : null}

        <View style={styles.divider} />
        <Row justify="space-between" align="center">
          <Row gap="md" align="center">
            <Row gap="sm" align="center">
              <Icon name="heart-outline" size={19} color={colors.muted} />
              <Text size="sm" color={colors.muted}>
                {reactionCount}
              </Text>
            </Row>
            <Row gap="sm" align="center">
              <Icon name="chatbubble-outline" size={18} color={colors.muted} />
              <Text size="sm" color={colors.muted}>
                {commentCount} comments
              </Text>
            </Row>
          </Row>
          <Icon name="paper-plane-outline" size={19} color={colors.muted} />
        </Row>
      </Stack>
    </Card>
  );
}

const styles = StyleSheet.create({
  postByline: {
    flex: 1,
  },
  eventArtwork: {
    minHeight: 150,
    padding: 18,
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: colors.primaryDark,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  eventDecoration: {
    position: "absolute",
    right: -24,
    top: -50,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: "#765DB4",
  },
  eventIcon: {
    width: 58,
    height: 58,
    borderRadius: 17,
    backgroundColor: "#8569C4",
    alignItems: "center",
    justifyContent: "center",
  },
  eventDate: {
    position: "absolute",
    right: 12,
    bottom: 12,
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: colors.surface,
  },
  photoArtwork: {
    height: 180,
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "#7957A5",
    alignItems: "center",
    justifyContent: "center",
  },
  photoCircleOne: {
    position: "absolute",
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: "#A66D8A",
    top: -94,
    left: -40,
  },
  photoCircleTwo: {
    position: "absolute",
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "#D18A67",
    bottom: -100,
    right: -15,
  },
  photoContent: {
    alignItems: "center",
    gap: 5,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
  },
});
