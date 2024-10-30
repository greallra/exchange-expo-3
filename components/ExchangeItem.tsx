import React, { useState, useEffect } from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import { Link, router } from "expo-router";
import { parseLocation, esDeleteDoc } from "exchanges-shared";
import { Icon } from "@/components/icon";

import tailwind from "twrnc";
import { FIREBASE_DB } from "@/firebase/firebaseConfig";

type ExchangeItemProps = {};

export default function ExchangeItem({
  id,
  name,
  teachingLanguageId,
  learningLanguageId,
  teachingLanguageUnfolded,
  learningLanguageUnfolded,
  organizerId,
  capacity,
  location,
  time,
  participantIds,
  users,
}) {
  const [allParticipants, setAllParticipants] = useState([]);
  const [participantsTeachingLanguage, setParticipantsTeachingLanguage] =
    useState([]);
  const [participantsLearningLanguage, setParticipantsLearningLanguage] =
    useState([]);

  useEffect(() => {
    if (participantIds && users && participantIds.length > 0 && users.length) {
      const allParticipants = users.filter((user) =>
        participantIds.includes(user.id)
      );
      console.log("allParticipants x", allParticipants);

      setAllParticipants(allParticipants);
    }
  }, [participantIds]);

  useEffect(() => {
    setParticipantsTeachingLanguage(
      allParticipants.filter((p) => p.teachingLanguageId === teachingLanguageId)
    );
    setParticipantsLearningLanguage(
      allParticipants.filter((p) => p.teachingLanguageId === learningLanguageId)
    );
  }, [allParticipants]);

  const isMyExchange = organizerId === users.id;
  const isAdmin = true;

  return (
    <TouchableOpacity
      className="p-3 m-2 bg-white bg-whiterounded border border-slate-200"
      key={id}
      onPress={() => router.push(`/exchanges/view/${id}`)}
    >
      <View className="flex flex-row ">
        <View className="mr-5 w-2/12">
          <View className="flex-row mb-3 items-center justify-center">
            <Image
              //   source={images[props.teachingLanguageUnfolded.iso_alpha2]}
              source={{
                uri: `https://www.worldometers.info/img/flags/${teachingLanguageUnfolded.iso_alpha2}-flag.gif`,
              }}
              className="w-6 h-6 rounded"
            />
            <Text>
              {" "}
              {participantsTeachingLanguage.length}/{capacity / 2}
            </Text>
          </View>
          <View className="flex-row items-center justify-center">
            <Image
              //   source={images[props.teachingLanguageUnfolded.name.toLowerCase()]}
              source={{
                uri: `https://www.worldometers.info/img/flags/${learningLanguageUnfolded.iso_alpha2}-flag.gif`,
              }}
              className="w-6 h-6 rounded"
            />
            <Text>
              {" "}
              {participantsLearningLanguage.length}/{capacity / 2}
            </Text>
          </View>
        </View>
        <View className="flex w-7/12">
          <Text className="text-medium font-bold pb-1">{name}</Text>
          <Text>
            {teachingLanguageUnfolded.name} to {learningLanguageUnfolded.name}{" "}
            language exchange of {capacity} people at{" "}
            {location?.description?.split(",")[0]}.
          </Text>
        </View>
        <View className="w-3/12 flex justify-between items-end pr-3">
          <Text className="font-psemibold">5.00pm</Text>
          <View className="flex-row items-center">
            {/* <Icon style={styles.icon} fill="#8F9BB3" name="people-outline" /> */}
            <Icon
              type="Ionicons"
              name="people-circle-outline"
              size={24}
              color={tailwind.color("text-black")}
            />
            <Text className="pl-2">
              {participantIds?.length} / {capacity}
            </Text>
          </View>
        </View>
      </View>
      {isMyExchange ||
        (isAdmin && (
          <View className="flex-row space-x-3">
            <TouchableOpacity
              onPress={() => router.push(`/exchanges/edit/${id}`)}
            >
              <Icon
                type="Ionicons"
                name="create-outline"
                size={20}
                color={tailwind.color("text-black")}
              />
            </TouchableOpacity>
            <TouchableOpacity
              className=""
              onPress={() => {
                esDeleteDoc(FIREBASE_DB, "exchanges", id);
                router.push("/exchanges");
              }}
            >
              <Icon
                type="Ionicons"
                name="trash-outline"
                size={20}
                color={tailwind.color("text-black")}
              />
            </TouchableOpacity>
          </View>
        ))}
    </TouchableOpacity>
  );
}

// import { useState, useEffect } from "react";
// import { Text, View, Image, StyleSheet, TouchableOpacity } from "react-native";
// import { Link, router } from "expo-router";
// import { useGlobalContext } from "@/context/GlobalProvider";
// import {
//   Card,
//   Layout,
//   Text as Ktext,
//   Icon,
//   Divider,
// } from "@ui-kitten/components";
// import { images } from "@/constants";
// import { parseLocation } from "exchanges-shared";

// interface ExchangeItemProps {
//   id: string;
//   name: string;
//   location: Object;
//   capacity: number;
//   organizerId: string;
//   organizerUnfolded: object;
//   time: string;
//   participantIds: Array;
//   teachingLanguageId: string;
//   learningLanguageId: string;
//   learningLanguageUnfolded: object;
//   teachingLanguageUnfolded: object;
//   smallFlag: string;
//   users: Array;
//   isMyLanguages: Boolean;
//   isMyExchanges: Boolean;
// }

// const cardCol = {
//   marginRight: "20px",
//   whiteSpace: "nowrap",
//   minWidth: "70px",
// };

// const ExchangeItem = (props: ExchangeItemProps) => {
//   const [allParticipants, setAllParticipants] = useState([]);
//   const [participantsTeachingLanguage, setParticipantsTeachingLanguage] =
//     useState([]);
//   const [participantsLearningLanguage, setParticipantsLearningLanguage] =
//     useState([]);
//   const { user } = useGlobalContext();
//   // const { hovered, ref } = useHover();
//   // const navigate = useNavigate();
//   const isAttending = props.participantIds.includes(user.id);
//   const isHost = props.organizerId === user.id;

//   function getStatus() {
//     console.log("props.participantIds", props.participantIds);
//     console.log("user.id", user.id);

//     if (isAttending) {
//       return "success";
//     } else {
//       return "basic";
//     }
//   }

//   useEffect(() => {
//     if (props.participantIds.length > 0 && props.users.length) {
//       const allParticipants = props.users.filter((user) =>
//         props.participantIds.includes(user.id)
//       );
//       setAllParticipants(allParticipants);
//     }
//   }, [props.participantIds]);
//   useEffect(() => {
//     setParticipantsTeachingLanguage(
//       allParticipants.filter(
//         (p) => p.teachingLanguageId === props.teachingLanguageId
//       )
//     );
//     setParticipantsLearningLanguage(
//       allParticipants.filter(
//         (p) => p.teachingLanguageId === props.learningLanguageId
//       )
//     );
//   }, [allParticipants]);

//   return (
//     <Card status={getStatus()} key={props.id}>
//       <TouchableOpacity
//         key={props.id}
//         style={styles.layoutContainer}
//         onPress={() => router.push(`/exchanges/view/${props.id}`)}
//       >
//         <View style={styles.leftCol}>
//           <View style={styles.icons}>
//             <Image
//               source={images[props.teachingLanguageUnfolded.name.toLowerCase()]}
//               style={[styles.flag, { marginRight: 7 }]}
//             />
//             {/* <Ktext>-</Ktext> */}
//             <Image
//               source={images[props.learningLanguageUnfolded.name.toLowerCase()]}
//               style={styles.flag}
//             />
//           </View>
//           <View style={[styles.icons, styles.mt]}>
//             {/* <Icon
//                       style={styles.icon}
//                       fill='#8F9BB3'
//                       name='people-outline'
//                     /> */}
//             <Ktext numberOfLines={1} style={{ paddingLeft: 5 }} category="s2">
//               {participantsTeachingLanguage.length}/{props.capacity / 2}
//             </Ktext>
//             <Ktext numberOfLines={1} style={{ paddingLeft: 18 }} category="s2">
//               {participantsLearningLanguage.length}/{props.capacity / 2}
//             </Ktext>
//           </View>
//         </View>
//         <View style={styles.middleCol}>
//           <View style={[styles.icons]}>
//             <Ktext numberOfLines={2} category="h6">
//               {parseLocation(props.location)}
//             </Ktext>
//             <Icon style={styles.icon} fill="#8F9BB3" name="pin" />
//           </View>

//           <Ktext numberOfLines={3}>
//             {props.teachingLanguageUnfolded.name} to{" "}
//             {props.learningLanguageUnfolded.name} language exchange of{" "}
//             {props.capacity} people at {parseLocation(props.location)}.
//           </Ktext>
//           {/* <View style={styles.fr}>
//                     <Icon
//                       style={styles.icon}
//                       fill='#8F9BB3'
//                       name='pricetags'
//                     />
//                     <Ktext numberOfLines={1}>{props.name}</Ktext>
//                   </View>
//                   <View style={[styles.fr, styles.mt]}>
//                     <Icon
//                       style={styles.icon}
//                       fill='#8F9BB3'
//                       name='pin'
//                     />
//                     <Ktext numberOfLines={1}>{safeParse('geometry', props.geometry)}</Ktext></View>  */}
//         </View>
//         <View style={styles.rightCol}>
//           <Ktext>{props.time}</Ktext>
//           <View style={[styles.icons, styles.mt]}>
//             <Icon style={styles.icon} fill="#8F9BB3" name="people-outline" />
//             <Ktext numberOfLines={1} style={{ paddingLeft: 5 }}>
//               {props.participantIds.length} / {props.capacity}
//             </Ktext>
//           </View>
//           {/* <Ktext numberOfLines={1}>{safeParse('organizerUnfolded', props.organizerUnfolded)}</Ktext> */}
//         </View>
//       </TouchableOpacity>
//     </Card>
//   );
// };
// export default ExchangeItem;

// const styles = StyleSheet.create({
//   fr: {
//     flexDirection: "row",
//   },
//   mt: {
//     marginTop: 5,
//   },
//   link: {
//     padding: 0,
//     width: "100%",
//   },
//   layoutContainer: {
//     width: "100%",
//     flexDirection: "row",
//     flexWrap: "wrap",
//     paddingVertical: 10,
//     paddingHorizontal: 10,
//     backgroundColor: "white",
//   },
//   leftCol: {
//     display: "flex",
//     // flexDirection: 'row',
//     marginRight: 10,
//   },
//   middleCol: {
//     flex: 3,
//     marginRight: 30,
//   },
//   rightCol: {
//     flex: 1,
//     flexDirection: "reverse",
//     justifyContent: "space-between",
//     alignItems: "flex-end",
//     // margin: 10
//   },
//   icons: {
//     display: "flex",
//     flexDirection: "row",
//   },
//   icon: {
//     width: 20,
//     height: 20,
//   },
//   flag: {
//     width: 30,
//     height: 30,
//   },
// });
