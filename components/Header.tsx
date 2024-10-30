import { useEffect } from "react";
import { router } from "expo-router";
import {
  Text,
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from "react-native";
import { Avatar } from "@/components/avatar";
import { useStore } from "@/store/store";

import { Icon } from "@/components/icon";
import tailwind from "twrnc";
import { Button, ButtonText } from "@/components/button";

export default function Header() {
  const { user, setNav, navOpen, activePage, setActivePage } = useStore();
  useEffect(() => {
    console.log("activePage", activePage);
  }, [activePage]);
  console.log("user  header", user);

  return (
    <View className="bg-white border-b border-b-slate-200 h-24 flex-row justify-between items-end px-4 pb-2">
      <View>
        {activePage && (
          <Button
            className="rounded-full bg-slate-400"
            onPress={() => {
              router.push(activePage.route);
              setActivePage("");
            }}
          >
            <Icon
              type="Ionicons"
              name="arrow-back-outline"
              size={20}
              color={tailwind.color("text-white")}
            />
          </Button>
        )}
        {!activePage && user && user.teachingLanguageUnfolded && (
          <Text className="font-pbold flex-row space-x-1">
            {" "}
            <Image
              source={{
                uri: `https://www.worldometers.info/img/flags/${user.teachingLanguageUnfolded.iso_alpha2}-flag.gif`,
              }}
              className="w-4 h-4 rounded"
            />
            <Image
              source={{
                uri: `https://www.worldometers.info/img/flags/${user.learningLanguageUnfolded.iso_alpha2}-flag.gif`,
              }}
              className="w-4 h-4 rounded"
            />
          </Text>
        )}
      </View>
      {activePage && activePage.name ? (
        <Text className="font-pbold">{activePage.name}</Text>
      ) : (
        <Text className="font-pbold">Language Exchanges in Dublin</Text>
      )}

      <TouchableOpacity
        onPress={() => {
          // setNav(!navOpen);
          router.push("/profile");
        }}
      >
        {user.avatarUrl ? (
          <Avatar
            source={{
              uri: user.avatarUrl,
            }}
            className="w-6 h-6"
          />
        ) : (
          <Avatar
            source={{
              uri: `https://avatar.iran.liara.run/username?username=${user.username}`,
            }}
            className="w-6 h-6"
          />
        )}
      </TouchableOpacity>
    </View>
  );
}
