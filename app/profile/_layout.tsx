import { Text, View, Image } from "react-native";
import { Tabs, router, Stack, Redirect } from "expo-router";
import { useStore } from "@/store/store";

export default function PublicLayout() {
  const { loading, user } = useStore();

  if (!loading && !user) return <Redirect href="/exchanges" />;

  return (
    <>
      <Stack>
        <Stack.Screen
          name="index"
          options={{
            headerShown: false,
          }}
        />
        {/* <Stack.Screen
            name="signup"
            options={{
                headerShown: false,
            }}
            /> */}
      </Stack>
    </>
  );
}
