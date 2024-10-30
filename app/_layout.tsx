import { useEffect } from "react";
import { useFonts } from "expo-font";
import {
  Text,
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { Stack, router } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { ToastProvider } from "react-native-toast-notifications";
import { Icon } from "@/components/icon";
import tailwind from "twrnc";
import "react-native-reanimated";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { FIREBASE_DB, FIREBASE_AUTH } from "@/firebase/firebaseConfig";

import { useColorScheme } from "@/hooks/useColorScheme";
import { useStore } from "@/store/store";
import { Button, ButtonText } from "@/components/button";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { user, fetchCurrentUser, navOpen, setNav } = useStore();
  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const [fontsLoaded, error] = useFonts({
    "Poppins-Black": require("../assets/fonts2/Poppins-Black.ttf"),
    "Poppins-Bold": require("../assets/fonts2/Poppins-Bold.ttf"),
    "Poppins-ExtraBold": require("../assets/fonts2/Poppins-ExtraBold.ttf"),
    "Poppins-ExtraLight": require("../assets/fonts2/Poppins-ExtraLight.ttf"),
    "Poppins-Light": require("../assets/fonts2/Poppins-Light.ttf"),
    "Poppins-Medium": require("../assets/fonts2/Poppins-Medium.ttf"),
    "Poppins-Regular": require("../assets/fonts2/Poppins-Regular.ttf"),
    "Poppins-SemiBold": require("../assets/fonts2/Poppins-SemiBold.ttf"),
    "Poppins-Thin": require("../assets/fonts2/Poppins-Thin.ttf"),
  });
  console.log("RootLayout: user", user);

  const queryClient = new QueryClient();

  useEffect(() => {
    if (error) throw error;

    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, error]);

  if (!fontsLoaded) {
    return null;
  }

  if (!fontsLoaded && !error) {
    return null;
  }
  const SuccessIcon = (
    <Icon
      type="Ionicons"
      name="location-outline"
      size={20}
      color={tailwind.color("text-gray-500")}
    />
  );

  function handleLogout() {
    FIREBASE_AUTH.signOut()
      .then((user) => {
        //  router.push("/");
        //  console.log("signOut", user);
      })
      .finally(() => {
        setNav(false);
      });
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider
        placement="top"
        duration={5000}
        animationType="slide-in"
        animationDuration={250}
        successColor="green"
        dangerColor="red"
        warningColor="orange"
        successIcon={SuccessIcon}
        normalColor="gray"
      >
        {/* {navOpen && (
          <View
            className="bg-secondary p-8 rounded-lg text-white absolute w-[200px] h-[300px] top-40 right-10 "
            style={{
              zIndex: 9999,
              // elevation: Platform.OS === "android" ? 50 : 0,
            }}
          >
            <Text className="text-white font-pextrabold">
              {user?.firstname} {user?.lastname}
            </Text>
            <Text className="text-white font-pextrabold">{user?.email}</Text>
            <TouchableOpacity onPress={() => router.push("/profile")}>
              <Icon
                type="Ionicons"
                name="pencil-outline"
                size={30}
                color={tailwind.color("text-gray-500")}
              />
            </TouchableOpacity>

            <Button className="w-full mt-3 mt-auto" onPress={handleLogout}>
              <ButtonText className="">Logout</ButtonText>
            </Button>
          </View>
        )} */}
        <Stack
          screenOptions={{
            headerShown: false,
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen
            name="(public)"
            options={{ headerShown: false, animation: "slide_from_bottom" }}
          />
        </Stack>
      </ToastProvider>
    </QueryClientProvider>
  );
}
// import { Stack, Tabs, Slot, SplashScreen } from "expo-router";
// import { Text, View, StyleSheet } from "react-native";
// import { useFonts } from "expo-font";
// import { useEffect } from "react";
// import GlobalProvider from "@/context/GlobalProvider";
// import * as eva from "@eva-design/eva";
// import {
//   ApplicationProvider,
//   IconRegistry,
//   Layout,
//   Text as KText,
//   Button,
//   Icon,
// } from "@ui-kitten/components";
// import { default as theme } from "@/kitten/custom-theme2.json";
// import { default as mapping } from "@/kitten/mapping.json";
// import { EvaIconsPack } from "@ui-kitten/eva-icons";
// import { ToastProvider } from "react-native-toast-notifications";
// import { Provider } from "react-redux";
// import store from "@/store/store.js";

// SplashScreen.preventAutoHideAsync();

// export default function RootLayout() {
//   const [fontsLoaded, error] = useFonts({
//     "Poppins-Black": require("../assets/fonts/Poppins-Black.ttf"),
//     "Poppins-Bold": require("../assets/fonts/Poppins-Bold.ttf"),
//     "Poppins-ExtraBold": require("../assets/fonts/Poppins-ExtraBold.ttf"),
//     "Poppins-ExtraLight": require("../assets/fonts/Poppins-ExtraLight.ttf"),
//     "Poppins-Light": require("../assets/fonts/Poppins-Light.ttf"),
//     "Poppins-Medium": require("../assets/fonts/Poppins-Medium.ttf"),
//     "Poppins-Regular": require("../assets/fonts/Poppins-Regular.ttf"),
//     "Poppins-SemiBold": require("../assets/fonts/Poppins-SemiBold.ttf"),
//     "Poppins-Thin": require("../assets/fonts/Poppins-Thin.ttf"),
//   });

//   useEffect(() => {
//     if (error) throw error;

//     if (fontsLoaded) {
//       SplashScreen.hideAsync();
//     }
//   }, [fontsLoaded, error]);

//   if (!fontsLoaded) {
//     return null;
//   }

//   if (!fontsLoaded && !error) {
//     return null;
//   }

//   const SuccessIcon = <Icon fill="#8F9BB3" name="star" />;

//   return (
//     <GlobalProvider>
//       <Provider store={store}>
//         <IconRegistry icons={EvaIconsPack} />
//         <ApplicationProvider
//           {...eva}
//           customMapping={mapping}
//           theme={{ ...eva.light, ...theme }}
//         >
//           <ToastProvider
//             placement="top"
//             duration={5000}
//             animationType="slide-in"
//             animationDuration={250}
//             successColor="green"
//             dangerColor="red"
//             warningColor="orange"
//             successIcon={SuccessIcon}
//             normalColor="gray"
//           >
//             <Stack>
//               <Stack.Screen
//                 name="(public)"
//                 options={{ headerShown: false, animation: "slide_from_bottom" }}
//               />
//               <Stack.Screen
//                 name="(tabs)"
//                 options={{ headerShown: false, animation: "slide_from_bottom" }}
//               />
//               <Stack.Screen
//                 name="profile"
//                 options={{ headerShown: false, animation: "slide_from_right" }}
//               />
//               {/* <Stack.Screen name="settings" options={{ headerShown: false, animation: 'slide_from_right' }} /> */}
//               <Stack.Screen name="index" options={{ headerShown: false }} />
//             </Stack>
//           </ToastProvider>
//         </ApplicationProvider>
//       </Provider>
//     </GlobalProvider>
//   );
// }

// const styles = StyleSheet.create({});
