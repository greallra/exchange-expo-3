import { Text, View, Image } from "react-native";
import { Tabs, router, Stack, Redirect } from "expo-router";
// import { icons } from "@/constants";
import { useStore } from "@/store/store";

export default function PublicLayout() {
  const { user } = useStore();
  if (user) return <Redirect href="/exchanges" />;

  return (
    <>
      <Stack>
        <Stack.Screen
          name="login"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="signup"
          options={{
            headerShown: false,
          }}
        />
      </Stack>
    </>
  );
}
