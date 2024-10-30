import { StyleSheet, Text, View, Image, SafeAreaView } from "react-native";
import React, { useEffect } from "react";
// import { useSelector } from "react-redux";
// import { useGlobalContext } from "@/context/GlobalProvider";
import { useStore } from "@/store/store";
import { useRoute } from "@react-navigation/native";
import { Tabs, Redirect, Stack, route } from "expo-router";
import { Icon } from "@/components/icon";
import tailwind from "twrnc";
// import { icons } from "@/constants";
import Header from "@/components/Header";

const TabIcon = (
  <Icon
    type="Ionicons"
    name="information-circle-outline"
    size={24}
    color={tailwind.color("text-white")}
  />
);
const RenderIcon = ({
  icon1,
  icon2,
  color,
  name,
  focused,
}): React.ReactElement => (
  <SafeAreaView
    style={{ display: "flex", justifyContent: "center", alignItems: "center" }}
  >
    <View
      style={{
        display: "flex",
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Icon
        // style={styles.icon}
        name={icon1}
        fill={focused && "#8F9BB3"}
        animation="shake"
      />
      <Icon
        type="Ionicons"
        name="people-circle-outline"
        size={24}
        color={tailwind.color("text-black")}
      />
    </View>
    <Text
      className="font-pbold"
      status="basic"
      appearance={focused ? "hint" : "default"}
      style={{ marginTop: 0 }}
    >
      {name}
    </Text>
  </SafeAreaView>
);

const PrivateLayout = (props) => {
  //   const { loading, user } = useGlobalContext();
  const { user } = useStore();

  const { languages, getData } = useStore();

  useEffect(() => {
    async function go() {
      await getData();
    }
    go();
  }, [getData]);
  useEffect(() => {
    console.log("languages effect", languages);
  }, [languages]);
  console.log("languages xx", languages);
  console.log("getData", getData);

  //   const route = useRoute();
  let hideTabs = false;

  if (!user) return <Redirect href="/login" />;
  //   if (!loading && !user) return <Redirect href="/login" />;

  return (
    <>
      <Header />
      <Tabs
        screenOptions={{
          tabBarShowLabel: false,
          // tabBarActiveBackgroundColor: 'success',
          // tabBarInactiveBackgroundColor: 'danger',
          tabBarStyle: {
            display: hideTabs ? "none" : "flex",
            backgroundColor: "#F7F9FC",
            borderTopWidth: 1,
            // borderTopColor: 'danger',
            height: 85,
          },
        }}
      >
        <Tabs.Screen
          name="exchanges/index"
          options={{
            title: "Exchanges",
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <RenderIcon icon1="flag" icon2="flag-outline" name="Exchanges" />
            ),
          }}
        />
        <Tabs.Screen
          name="exchanges/create/index"
          options={{
            title: "Create Exchange",
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <RenderIcon
                icon1="edit-outline"
                icon2="calendar"
                // color={icons.color}
                name="Create Exchange"
                focused={focused}
              />
              // <TabIcon
              //   // icon={icons.profile}
              //   color={color}
              //   name="Create Exchange"
              //   focused={focused}
              // />
            ),
          }}
        />
        <Tabs.Screen
          name="exchanges/view/[id]"
          options={{
            title: "View Exchange",
            headerShown: false,
            href: null,
          }}
        />
        <Tabs.Screen
          name="exchanges/edit/[id]"
          options={{
            title: "Edit Exchange",
            headerShown: false,
            href: null,
          }}
        />
      </Tabs>
    </>
  );
};

export default PrivateLayout;

const styles = StyleSheet.create({
  baseText: {
    fontFamily: "Cochin",
  },
  icon: {
    width: 24,
    height: 24,
    padding: 0,
  },
});
