import { Text, View, TextInput, StyleSheet } from "react-native";
import { Link, router, Redirect } from "expo-router";

import { Button, ButtonText } from "@/components/button";
import { useStore } from "@/store/store";

export default function Index() {
  const { user } = useStore();

  console.log("user", user);
  if (user) {
    return <Redirect href="exchanges" />;
  }

  return (
    <View className="flex items-center justify-center h-full space-y-6">
      <Text className="font-pblack">used fonts here</Text>
      <Text className="font-pregular">used fonts pregular</Text>
      <Text className="">used fonts pregular</Text>
      <Button onPress={() => router.push("/login")} className="w-10/12">
        <ButtonText>Login</ButtonText>
      </Button>
      <Text>Or</Text>
      <Button onPress={() => router.push("/signup")} className="w-10/12">
        <ButtonText>Signup</ButtonText>
      </Button>
      <Text>Or</Text>
      <Button onPress={() => router.push("/exchanges")} className="w-10/12">
        <ButtonText>See Exchanges in your area</ButtonText>
      </Button>
    </View>
  );
}

// import { useState, useEffect } from "react";
// import {
//   Text,
//   View,
//   ScrollView,
//   Image,
//   StyleSheet,
//   Pressable,
// } from "react-native";
// import { Link, router, Redirect } from "expo-router";
// import { useGlobalContext } from "@/context/GlobalProvider";
// import { SafeAreaView } from "react-native-safe-area-context";
// import Loader from "@/components/Loader";
// import { images } from "@/constants";
// import { Button, Layout } from "@ui-kitten/components";
// import registerNNPushToken from "native-notify";

// export default function RootLayout() {
//   // registerNNPushToken(22721, 'k4Ew1cxbwqlEmCrX7zZhqR');
//   const { loading, user } = useGlobalContext();
//   // console.log('process.env.API_KEY', process.env.API_KEY);
//   // console.log('process.env;', process.env);
//   try {
//     console.log("EXPO_PUBLIC_API_KEY", process.env.EXPO_PUBLIC_FB_API_KEY);
//   } catch (error) {
//     console.log(error);
//   }
//   if (user) {
//     return <Redirect href="exchanges" />;
//   }
//   const blurhash =
//     "|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[";
//   return (
//     <SafeAreaView>
//       <Loader isLoading={loading} />
//       <ScrollView contentContainerStyle={{ height: "100%" }}>
//         <Layout style={styles.container} level="4">
//           {/* <Image
//             source={images.ronanLogo}
//             style={{height: '100%'}}
//             resizeMode="contain"
//             /> */}
//           {/* <Image
//               style={styles.image}
//               source={images.ronanLogo}
//               placeholder={{ blurhash }}
//               transition={1000}
//             /> */}
//           {/* <Link href="/profile" style={{color: 'red'}}>profile</Link> */}
//           <View
//             style={{
//               position: "absolute",
//               display: "flex",
//               justifyContent: "center",
//               alignItems: "center",
//             }}
//           >
//             <Link href="/login">
//               <Button
//                 style={{ margin: 2 }}
//                 status="primary"
//                 onPress={() => router.push("/login")}
//               >
//                 Login
//               </Button>
//             </Link>
//             <Text style={{ padding: 10 }}>Or</Text>
//             <Link href="/login">
//               <Button
//                 style={{ margin: 2 }}
//                 status="danger"
//                 onPress={() => router.push("/signup")}
//               >
//                 Signup
//               </Button>
//             </Link>
//           </View>
//         </Layout>
//       </ScrollView>
//     </SafeAreaView>
//   );
// }
// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     // backgroundColor: '#D4D4D4',
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   image: {
//     // flex: 1,
//     // width: '50%',
//     // backgroundColor: '#0553',
//   },
// });
