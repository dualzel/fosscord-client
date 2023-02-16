import { MaterialCommunityIcons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { CommonActions } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { observer } from "mobx-react";
import React from "react";
import {
  Animated,
  FlatList,
  Platform,
  Pressable,
  ScrollView,
  SectionList,
  View,
} from "react-native";
import { Avatar, Button, Text, useTheme } from "react-native-paper";
import Container from "../components/Container";
import GuildListGuild from "../components/GuildListGuild";
import BottomTabBar from "../components/ReactNavigationBottomTabs/views/BottomTabBar";
import Swiper from "../components/Swiper";
import { CustomTheme } from "../constants/Colors";
import BottomTabBarProgressContext from "../contexts/BottomTabBarProgressContext";
import useChannel from "../hooks/useChannel";
import useGuild from "../hooks/useGuild";
import { DomainContext } from "../stores/DomainStore";
import {
  ChannelsParamList,
  ChannelsStackScreenProps,
  RootStackScreenProps,
} from "../types";
import { CDNRoutes, DefaultUserAvatarAssets } from "../utils/Endpoints";
import REST from "../utils/REST";

const sectionPlaceholderData = [
  {
    title: "Section 1",
    data: ["member1", "member2", "member3", "member4", "member4"],
  },
  {
    title: "Section 2",
    data: ["member1", "member2", "member3", "member4", "member4"],
  },
  {
    title: "Section 3",
    data: ["member1", "member2", "member3", "member4", "member4"],
  },
  {
    title: "Section 4",
    data: ["member1", "member2", "member3", "member4", "member4"],
  },
];

const Stack = createNativeStackNavigator<ChannelsParamList>();
const Tab = createBottomTabNavigator<ChannelsParamList>();

const ChannelDesktop = observer(
  ({
    route: {
      params: { guildId, channelId },
    },
    navigation,
  }: ChannelsStackScreenProps<"Channel">) => {
    const theme = useTheme<CustomTheme>();
    const domain = React.useContext(DomainContext);
    const guild = useGuild(guildId, domain);
    const channel = useChannel(guildId, channelId, domain);

    React.useEffect(() => {
      if (!channel) return;
      // get the first channel in the guild and update the route params
      channelId = channel.id;
      navigation.dispatch(CommonActions.setParams({ channelId: channel.id }));

      domain.gateway.onChannelOpen(guildId, channelId);

      channel.getChannelMessages(domain, 50).catch(console.error);
    }, [channelId, channel]);

    if (!guild) {
      return (
        <Container>
          <Text>Guild not found</Text>
        </Container>
      );
    }

    if (!channel) {
      return (
        <Container>
          <Text>
            Could not find channel by id, or could not get the first channel in
            the guild
          </Text>
        </Container>
      );
    }

    return (
      <Container verticalCenter horizontalCenter flexOne displayFlex row>
        <Container
          testID="channelSidebar"
          style={{
            backgroundColor: theme.colors.palette.backgroundPrimary70,
            height: "100%",
            width: 240,
          }}
        >
          <Container testID="channelsWrapper" displayFlex flexOne>
            <Container
              testID="channelHeader"
              verticalCenter
              horizontalCenter
              style={{
                height: 48,
                backgroundColor: theme.colors.palette.backgroundPrimary70,
              }}
              isSurface
              elevation={1}
            >
              <Text>{guild.name}</Text>
            </Container>
            <Container displayFlex flexOne>
              <ScrollView style={{ padding: 10 }}>
                <SectionList
                  sections={guild.channelList}
                  keyExtractor={(item, index) => item.id + index}
                  renderItem={({ item }) => (
                    <View style={{ marginHorizontal: 10 }}>
                      <Text>#{item.name}</Text>
                    </View>
                  )}
                  renderSectionHeader={({ section: { title } }) => {
                    if (!title) return null;
                    return (
                      <View
                        style={{
                          backgroundColor:
                            theme.colors.palette.backgroundPrimary70,
                        }}
                      >
                        <Text>{title.toUpperCase()}</Text>
                      </View>
                    );
                  }}
                  stickySectionHeadersEnabled={true}
                  contentContainerStyle={{ padding: 10 }}
                />
              </ScrollView>
            </Container>
          </Container>
          <Container
            testID="channelFooter"
            style={{
              backgroundColor: theme.colors.palette.backgroundPrimary50,
            }}
          >
            <Container
              testID="userActions"
              displayFlex
              row
              horizontalCenter
              style={{
                height: 52,
                paddingVertical: 8,
                backgroundColor: "transparent",
              }}
            >
              <Container style={{ marginHorizontal: 8 }}>
                <Avatar.Image
                  size={32}
                  source={{ uri: domain.account.user?.avatarURL }}
                />
              </Container>
              <Container>
                <Text>
                  {domain.account.user?.username}#
                  {domain.account.user?.discriminator}
                </Text>
              </Container>
            </Container>
          </Container>
        </Container>

        <Container
          testID="chatContainer"
          style={{
            height: "100%",
            backgroundColor: theme.colors.palette.backgroundPrimary100,
          }}
          displayFlex
          flexOne
        >
          <Container
            testID="chatHeader"
            verticalCenter
            style={{
              height: 48,
              paddingHorizontal: 10,
              backgroundColor: theme.colors.palette.backgroundPrimary100,
            }}
            isSurface
            elevation={1}
          >
            <Text>#{channel.name}</Text>
          </Container>
          <Container testID="chat" displayFlex flexOne row>
            <Container testID="chatContent" displayFlex flexOne>
              <FlatList
                data={channel.messages.asList()}
                renderItem={({ item }) => (
                  <Container
                    key={item.id}
                    horizontalCenter
                    row
                    style={{ marginHorizontal: 10, paddingVertical: 10 }}
                  >
                    <Avatar.Image
                      size={32}
                      source={{
                        uri: item.author?.avatar
                          ? REST.makeCDNUrl(
                              CDNRoutes.userAvatar(
                                item.author.id,
                                item.author.avatar
                              )
                            )
                          : "https://cdn.discordapp.com" +
                            CDNRoutes.defaultUserAvatar(
                              (Number(item.author?.discriminator) %
                                5) as DefaultUserAvatarAssets
                            ),
                      }}
                      style={{ backgroundColor: "transparent" }}
                    />
                    <Container verticalCenter style={{ marginLeft: 10 }}>
                      <Container row horizontalCenter>
                        <Text style={{ fontWeight: "500", fontSize: 16 }}>
                          {item.author?.username}
                        </Text>
                        <Text
                          style={{
                            fontSize: 12,
                            fontWeight: "500",
                            color: theme.colors.textMuted,
                            marginLeft: 5,
                          }}
                        >
                          {item.timestamp.toLocaleString()}
                        </Text>
                      </Container>
                      <Text>{item.content}</Text>
                    </Container>
                  </Container>
                )}
                keyExtractor={(item) => item.id}
                inverted={true}
              />
            </Container>
            <Container
              testID="memberList"
              style={{
                width: 240,
                backgroundColor: theme.colors.palette.backgroundPrimary70,
              }}
              displayFlex
            >
              <SectionList
                sections={guild.memberList?.listData || []}
                keyExtractor={(item, index) => index + item.id}
                renderItem={({ item }) => (
                  <View>
                    <Text>{item.user.username}</Text>
                  </View>
                )}
                renderSectionHeader={({ section: { title } }) => (
                  <View
                    style={{
                      backgroundColor: theme.colors.palette.backgroundPrimary70,
                      paddingTop: 10,
                    }}
                  >
                    <Text
                      style={{
                        color: theme.colors.textMuted,
                      }}
                    >
                      {title}
                    </Text>
                  </View>
                )}
                contentContainerStyle={{ padding: 10 }}
              />
            </Container>
          </Container>
        </Container>
      </Container>
    );
  }
);

const ChannelsScreenDesktop = observer(
  ({ navigation }: RootStackScreenProps<"Channels">) => {
    const domain = React.useContext(DomainContext);
    const theme = useTheme<CustomTheme>();

    return (
      <Container verticalCenter horizontalCenter flexOne displayFlex row>
        <Container
          testID="guildsList"
          style={{
            height: "100%",
            backgroundColor: theme.colors.palette.backgroundPrimary40,
            width: 72,
            zIndex: 3,
          }}
          displayFlex
          horizontalCenter
        >
          <ScrollView style={{ overflow: "visible" }}>
            <Pressable
              onPress={() => {
                navigation.navigate("Channels", {
                  screen: "Channel",
                  params: { guildId: "me" },
                });
              }}
            >
              <Avatar.Icon icon="home" size={48} />
            </Pressable>

            <Container
              testID="guildListGuildIconContainer"
              style={{ overflow: "visible" }}
            >
              {domain.guilds.asList().map((guild) => {
                return (
                  <GuildListGuild
                    key={guild.id}
                    guild={guild}
                    onPress={() => {
                      navigation.navigate("Channels", {
                        screen: "Channel",
                        params: { guildId: guild.id },
                      });
                    }}
                  />
                );
              })}
            </Container>
          </ScrollView>
        </Container>

        <Container
          testID="outerContainer"
          style={{ height: "100%" }}
          displayFlex
          flexOne
          row
        >
          <Stack.Navigator
            initialRouteName="Channel"
            screenOptions={{
              headerShown: false,
            }}
          >
            <Stack.Screen
              name="Channel"
              component={ChannelDesktop}
              initialParams={{ guildId: "me" }}
            />
          </Stack.Navigator>
        </Container>
      </Container>
    );
  }
);

function SettingsMobile({ navigation }: ChannelsStackScreenProps<"Settings">) {
  return (
    <Container isSafe>
      <Text>Settings</Text>
    </Container>
  );
}

const ChannelMobile = observer(
  ({
    route: {
      params: { guildId, channelId },
    },
    navigation,
  }: ChannelsStackScreenProps<"Channel">) => {
    const theme = useTheme<CustomTheme>();
    const domain = React.useContext(DomainContext);
    const guild = useGuild(guildId, domain);
    const channel = useChannel(guildId, channelId, domain);

    React.useEffect(() => {
      if (!channel) return;
      // get the first channel in the guild and update the route params
      channelId = channel.id;
      navigation.dispatch(CommonActions.setParams({ channelId: channel.id }));

      domain.gateway.onChannelOpen(guildId, channelId);
    }, [channelId, channel]);

    /**
     * Constructions the Guild and Channel list for the left side of the Swipper component
     */
    const leftAction = (
      <Container flexOne row>
        <Container
          style={{
            width: 72,
            backgroundColor: theme.colors.palette.backgroundPrimary40,
          }}
        >
          <ScrollView>
            <Pressable
              onPress={() => {
                navigation.dispatch(
                  CommonActions.navigate("Channels", {
                    screen: "Channel",
                    params: { guildId: "me" },
                  })
                );
              }}
            >
              <Avatar.Icon icon="home" size={48} />
            </Pressable>

            <Container testID="guildListGuildIconContainer">
              {domain.guilds.asList().map((guild) => {
                return (
                  <GuildListGuild
                    key={guild.id}
                    guild={guild}
                    onPress={() => {
                      navigation.dispatch(
                        CommonActions.navigate("Channels", {
                          screen: "Channel",
                          params: { guildId: guild.id },
                        })
                      );
                    }}
                  />
                );
              })}
            </Container>
          </ScrollView>
        </Container>
        <Container
          testID="channelSidebar"
          flexOne
          style={{
            backgroundColor: theme.colors.palette.backgroundPrimary70,
            borderTopLeftRadius: 10,
            borderTopRightRadius: 10,
          }}
        >
          <Container
            testID="channelHeader"
            verticalCenter
            horizontalCenter
            style={{
              height: 74,
              borderTopLeftRadius: 10,
              borderTopRightRadius: 10,
              backgroundColor: theme.colors.palette.backgroundPrimary70,
            }}
            isSurface
            elevation={1}
          >
            {/* TODO: private channels  */}
            <Text>{guild?.name}</Text>
          </Container>
          <Container testID="channelSidebarBody" flexOne>
            {/* TODO: private channels  */}
            <SectionList
              sections={guild?.channelList ?? []}
              keyExtractor={(item, index) => item.id + index}
              renderItem={({ item }) => (
                <View style={{ marginHorizontal: 10 }}>
                  <Text>#{item.name}</Text>
                </View>
              )}
              renderSectionHeader={({ section: { title } }) => {
                if (!title) return null;
                return (
                  <View
                    style={{
                      backgroundColor: theme.colors.palette.backgroundPrimary70,
                    }}
                  >
                    <Text>{title.toUpperCase()}</Text>
                  </View>
                );
              }}
              stickySectionHeadersEnabled={true}
              contentContainerStyle={{ padding: 10 }}
            />
          </Container>
        </Container>
      </Container>
    );

    /**
     * Constructions the Member list component for the right side of the swiper
     */
    const rightAction = (
      <Container
        flexOne
        style={{
          borderTopLeftRadius: 10,
          borderTopRightRadius: 10,
          backgroundColor: theme.colors.palette.backgroundPrimary70,
        }}
      >
        <Container
          verticalCenter
          horizontalCenter
          style={{
            height: 74,
            padding: 10,
          }}
        >
          <Text>Member List Header</Text>
        </Container>
        <Container
          verticalCenter
          style={{
            padding: 10,
            backgroundColor: theme.colors.palette.backgroundPrimary100,
          }}
        >
          <SectionList
            sections={guild?.memberList?.listData || []}
            keyExtractor={(item, index) => index + item.id}
            renderItem={({ item }) => (
              <View>
                <Text>{item.user.username}</Text>
              </View>
            )}
            renderSectionHeader={({ section: { title } }) => (
              <View
                style={{
                  backgroundColor: theme.colors.palette.backgroundPrimary100,
                  paddingTop: 10,
                }}
              >
                <Text
                  style={{
                    color: theme.colors.textMuted,
                  }}
                >
                  {title}
                </Text>
              </View>
            )}
            stickySectionHeadersEnabled={true}
            contentContainerStyle={{ padding: 10 }}
          />
        </Container>
      </Container>
    );

    return (
      <Swiper
        leftChildren={leftAction}
        rightChildren={rightAction}
        containerStyle={{
          backgroundColor: theme.colors.palette.backgroundPrimary40,
        }}
      >
        <Container
          flexOne
          displayFlex
          verticalCenter
          horizontalCenter
          style={{
            backgroundColor: theme.colors.palette.backgroundPrimary90,
            borderTopLeftRadius: 10,
            borderTopRightRadius: 10,
          }}
        >
          {/* // TODO: render channel messages */}
          {/* <FlatList
                data={channel.messages.asList()}
                renderItem={({ item }) => (
                  <Container
                    key={item.id}
                    horizontalCenter
                    row
                    style={{ marginHorizontal: 10, paddingVertical: 10 }}
                  >
                    <Avatar.Image
                      size={32}
                      source={{
                        uri: item.author?.avatar
                          ? REST.makeCDNUrl(
                              CDNRoutes.userAvatar(
                                item.author.id,
                                item.author.avatar
                              )
                            )
                          : "https://cdn.discordapp.com" +
                            CDNRoutes.defaultUserAvatar(
                              (Number(item.author?.discriminator) %
                                5) as DefaultUserAvatarAssets
                            ),
                      }}
                      style={{ backgroundColor: "transparent" }}
                    />
                    <Container verticalCenter style={{ marginLeft: 10 }}>
                      <Container row horizontalCenter>
                        <Text style={{ fontWeight: "500", fontSize: 16 }}>
                          {item.author?.username}
                        </Text>
                        <Text
                          style={{
                            fontSize: 12,
                            fontWeight: "500",
                            color: theme.colors.textMuted,
                            marginLeft: 5,
                          }}
                        >
                          {item.timestamp.toLocaleString()}
                        </Text>
                      </Container>
                      <Text>{item.content}</Text>
                    </Container>
                  </Container>
                )}
                keyExtractor={(item) => item.id}
                inverted={true}
              /> */}
          {!guild ? (
            <Text>Guild not found</Text>
          ) : !channel ? (
            <Text>Channel not found</Text>
          ) : (
            <>
              <Text style={{ color: "red" }}>Guild: {guildId}</Text>
              <Text style={{ color: "red" }}>Channel: {channelId}</Text>
              <Button mode="contained" onPress={domain.toggleDarkTheme}>
                Theme
              </Button>
            </>
          )}
        </Container>
      </Swiper>
    );
  }
);

const ChannelsScreenMobile = observer(() => {
  const theme = useTheme<CustomTheme>();

  return (
    <BottomTabBarProgressContext.Provider
      value={{
        progress: new Animated.Value(0),
        setProgress: (progress: number) => {},
      }}
    >
      <Tab.Navigator
        initialRouteName="Channel"
        screenOptions={{
          headerShown: false,
          // tabBarActiveBackgroundColor: theme.colors.primary,
          tabBarStyle: {
            backgroundColor: theme.colors.palette.backgroundPrimary0,
          },
          tabBarShowLabel: false,
        }}
        tabBar={(props) => <BottomTabBar {...props} />}
      >
        <Tab.Screen
          name="Channel"
          component={ChannelMobile}
          initialParams={{ guildId: "me" }}
          options={{
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="chat" color={color} size={size} />
            ),
          }}
        />
        <Tab.Screen
          name="Settings"
          component={SettingsMobile}
          options={{
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="cog" color={color} size={size} />
            ),
          }}
        />
      </Tab.Navigator>
    </BottomTabBarProgressContext.Provider>
  );
});

function ChannelsScreen(props: RootStackScreenProps<"Channels">) {
  const Element = Platform.isMobile
    ? ChannelsScreenMobile
    : ChannelsScreenDesktop;

  return <Element {...props} />;
}

export default observer(ChannelsScreen);
