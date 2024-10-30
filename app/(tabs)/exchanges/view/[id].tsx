import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, Image, ActivityIndicator } from "react-native";
import { useLocalSearchParams, Link, router } from "expo-router";
import { useToast } from "react-native-toast-notifications";
import { useMutation } from "@tanstack/react-query";
import { useStore } from "@/store/store";
import { useQuery } from "@tanstack/react-query";
import GoogleMap from "@/components/maps/MapViewOne.tsx";
import { Icon } from "@/components/icon";
import tailwind from "twrnc";
import { Button, ButtonText } from "@/components/button";
import { Avatar } from "@/components/avatar";
import {
  formatExchange,
  esGetDoc,
  esUpdateDoc,
  checkUserIsValidToJoin,
  safeParse,
  parseLocation,
  addParticipantToExchange,
  removeMyselfFromExchange,
  getPartipantsOfLanguages,
  checkUserHasJoined,
} from "exchanges-shared";
import { FIREBASE_DB } from "@/firebase/firebaseConfig";

export default function ViewExchange() {
  const { languages, users, user: me, setActivePage } = useStore();
  const { id } = useLocalSearchParams();
  const [refreshKey, setFefreshKey] = useState(1);
  const [visible, setVisible] = useState(false);
  const toast = useToast();
  const [participantsTeachingLanguage, setParticipantsTeachingLanguage] =
    useState([]);
  const [participantsLearningLanguage, setParticipantsLearningLanguage] =
    useState([]);
  const [amValidToJoin, setAmValidToJoin] = useState(false);
  const [haveJoined, setHaveJoined] = useState(false);
  const [notValidReason, setNotValidReason] = useState("");
  const [serverError, setServerError] = useState("");

  const mutation = useMutation({
    mutationFn: (data) => {
      return esUpdateDoc(FIREBASE_DB, "exchanges", id, data);
      // if (isEditMode) {
      //   console.log("esUpdateDoc", exchange.id, data);

      //   return esUpdateDoc(FIREBASE_DB, "exchanges", id, data);
      // } else {
      //   return esAddDoc(FIREBASE_DB, "exchanges", data);
      // }
    },
    onError: (err) => {
      toast.show(err.message, { type: "error", placement: "top" });
      console.log("onError", err);
      setServerError(err.message);
    },
    onSettled: () => {
      console.log("onSettled");
    },
    onSuccess: (data) => {
      setFefreshKey(Math.random());
      toast.show("message", { type: "success", placement: "top" });
      // router.push("/exchanges");
      console.log("onSuccess", data);
    },
  });

  async function handleAddParticipant(user) {
    const { isValid, message, joiningUser } = checkUserIsValidToJoin(
      exchange,
      participantsTeachingLanguage,
      participantsLearningLanguage,
      me,
      user
    );

    if (!isValid) {
      toast.show(message, { type: "error", placement: "top" });
      return;
    }
    let participantsUserAdded = [...exchange.participantIds, me.id || me.uid];
    mutation.mutate({ participantIds: participantsUserAdded });
  }

  async function handleRemoveMyself() {
    try {
      if (me.id === exchange.organizerId) {
        toast.show("Organizers cannot remove themselves from the exchange", {
          type: "Error",
          placement: "top",
        });
      }
      let participantsMeRemoved = [...exchange.participantIds];
      participantsMeRemoved.splice(participantsMeRemoved.indexOf(me.id), 1);
      mutation.mutate({ participantIds: participantsMeRemoved });
    } catch (error) {
      console.log(error);
      toast.show(`Error removing you from the Exchange, ${error.message}`, {
        type: "error",
        placement: "top",
      });
    }
  }

  const participantsList = (participants, teachingLanguageId) => {
    const divContainer = [];
    for (let i = 0; i < exchange.capacity / 2; i++) {
      const participant = participants[i];
      divContainer.push(
        <View className="flex items-center pb-1">
          {participant ? (
            <>
              <Avatar
                source={{
                  uri: participant.avatarUrl
                    ? participant.avatarUrl
                    : `https://avatar.iran.liara.run/username?username=${participant.username}`,
                }}
                size="xs"
              />
              <Text className="font-bold">{participant.username}</Text>
            </>
          ) : (
            <>
              <Avatar
                source={{
                  uri: `https://avatar.iran.liara.run/username?username=?`,
                }}
                size="xs"
              />
              <Text className="text-slate-500">"Free"</Text>
            </>
          )}
        </View>
      );
    }
    return <View onPress={() => setVisible(true)}>{divContainer}</View>;
  };

  // Get the exchange
  const {
    isPending,
    isError,
    error,
    data: exchange,
  } = useQuery({
    queryKey: ["exchange", refreshKey],
    queryFn: async () => {
      const res = await esGetDoc(FIREBASE_DB, "exchanges", id);
      return formatExchange(res.docSnap.data(), languages, users);
    },
  });

  useEffect(() => {
    setActivePage({
      name: exchange?.name,
      route: "/exchanges",
    });
  }, [exchange]);

  useEffect(() => {
    if (exchange && users.length > 0) {
      const { participantsTeachingLanguage, participantsLearningLanguage } =
        getPartipantsOfLanguages(users, exchange);
      setParticipantsTeachingLanguage(participantsTeachingLanguage);
      setParticipantsLearningLanguage(participantsLearningLanguage);
    }
  }, [exchange, users]);

  useEffect(() => {
    if (
      exchange &&
      me &&
      participantsTeachingLanguage &&
      participantsLearningLanguage
    ) {
      const { isValid, message } = checkUserIsValidToJoin(
        exchange,
        participantsTeachingLanguage,
        participantsLearningLanguage,
        me
      );
      setAmValidToJoin(isValid);
      setHaveJoined(checkUserHasJoined(me, exchange));
      setNotValidReason(message);
    }
  }, [participantsTeachingLanguage, participantsLearningLanguage]);

  if (isError) {
    return (
      <Text>
        {error.message}{" "}
        <Text onPress={() => router.push(`/exchanges`)}>Back</Text>
      </Text>
    );
  }

  if (isPending) {
    return (
      <View>
        <ActivityIndicator size="large" color="green" />
      </View>
    );
  }
  if (!users || !languages || !exchange) {
    return <Text>Dont have all data required</Text>;
  }

  let exchangeIsFull = false;
  if (exchange) {
    exchangeIsFull =
      participantsTeachingLanguage.length === exchange.capacity / 2 &&
      participantsLearningLanguage.length === exchange.capacity / 2;
  }

  console.log("pass", exchange);

  return (
    <ScrollView>
      <Text>{exchange.name}</Text>
      <Text onPress={() => router.push(`/exchanges`)}>Back</Text>
      {!exchange.location && (
        <Image
          source={{
            uri: "https://reactjs.org/logo-og.png",
          }}
        />
      )}
      {exchange.location ? (
        <GoogleMap location={exchange.location} />
      ) : (
        <View className="h-36 bg-green-500">
          <View className="bg-red-200 p-3 m-3 rounded-lg border border-red-500 flex-row">
            <Icon
              type="Ionicons"
              name="location-outline"
              size={20}
              color={tailwind.color("text-red-500")}
            />
            <Text className="pl-2">Map Not Available</Text>
          </View>
        </View>
      )}

      <View className="p-2">
        <Text className="text-lg font-bold">
          {exchange.teachingLanguageUnfolded.name} to{" "}
          {exchange.learningLanguageUnfolded.name} Language Exchange at{" "}
          {parseLocation(exchange.location)}
        </Text>
        <View
          className="flex-row flex-wrap justify-between pt-2"
          id="info-boxes"
        >
          <View className="w-1/2 space-y-2">
            <View className="flex-row items-center">
              <View className="mr-2">
                <Icon
                  type="Ionicons"
                  name="location-outline"
                  size={20}
                  color={tailwind.color("text-gray-500")}
                />
              </View>
              <Text>{parseLocation(exchange.location).substring(0, 19)}</Text>
            </View>
            <View className="flex-row items-center">
              <View className="mr-2">
                <Icon
                  type="Ionicons"
                  name="hourglass-outline"
                  size={20}
                  color={tailwind.color("text-gray-500")}
                />
              </View>
              <Text>
                {exchange.duration}{" "}
                <Text className="text-xs text-gray-500">(Duration)</Text>
              </Text>
            </View>
            <View className="flex-row items-center">
              <View className="mr-2">
                <Icon
                  type="Ionicons"
                  name="person-outline"
                  size={20}
                  color={tailwind.color("text-gray-500")}
                />
              </View>
              <Text>
                {exchange.organizerUnfolded?.username}{" "}
                <Text className="text-xs text-gray-500">
                  {me.id === exchange.organizerId
                    ? "(Organizer - you)"
                    : "(Organizer)"}
                </Text>
              </Text>
            </View>
          </View>
          <View className="w-1/2 space-y-2">
            <View className="flex-row items-center">
              <View className="mr-2">
                <Icon
                  type="Ionicons"
                  name="time-outline"
                  size={20}
                  color={tailwind.color("text-gray-500")}
                />
              </View>
              <Text>{exchange.timeHour}</Text>
            </View>
            <View className="flex-row items-center">
              <View className="mr-2">
                <Icon
                  type="Ionicons"
                  name="flag-outline"
                  size={20}
                  color={tailwind.color("text-gray-500")}
                />
              </View>
              <Text>
                {exchange.learningLanguageUnfolded.name},{" "}
                {exchange.teachingLanguageUnfolded.name}
              </Text>
            </View>
            <View className="flex-row items-center">
              <View className="mr-2">
                <Icon
                  type="Ionicons"
                  name="people-outline"
                  size={20}
                  color={tailwind.color("text-gray-500")}
                />
              </View>
              <Text>
                {exchange.capacity}{" "}
                <Text className="text-xs text-gray-500">(Total capacity)</Text>
              </Text>
            </View>
          </View>
        </View>
        <View className="py-4">
          <Text>
            Lorem ipsum, dolor sit amet consectetur adipisicing elit. Sit et
            molestiae ipsam dignissimos labore. Nostrum exercitationem excepturi
            voluptas, illum veritatis at animi eum non ad a dolor quos pariatur
            libero.
          </Text>
        </View>
        {/* <Divider /> */}
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-xl pb-2">Who's Attending?</Text>
          {/* <AddFriendsPopover
          visible={popoverVisible}
          setVisible={setPopoverVisible}
          loading={isLoading}
          handleAddParticipant={handleAddParticipant}
          exchange={exchange} /> */}
          <Button
            className="p-1 text-xs"
            // onPress={() => setPopoverVisible(true)}
          >
            Add Friends
          </Button>
        </View>
        <View className=" pb-10">
          <View className="flex-row m-auto space-x-2">
            <View className="flex items-center space-y-2">
              <Image
                source={{
                  uri: `https://www.worldometers.info/img/flags/${exchange.learningLanguageUnfolded.iso_alpha2}-flag.gif`,
                }}
                className="w-8 h-6 rounded"
              />
              <View className="flex-row items-center justify-center">
                <Text className="text-grey-500">
                  {exchange.teachingLanguageUnfolded.name}:
                </Text>
                <Text className="font-bold">
                  {participantsTeachingLanguage.length} /{exchange.capacity / 2}
                </Text>
              </View>
              <View>
                {participantsList(
                  participantsTeachingLanguage,
                  exchange.teachingLanguageId
                )}
              </View>
            </View>

            <View className="flex items-center space-y-2">
              <Image
                source={{
                  uri: `https://www.worldometers.info/img/flags/${exchange.teachingLanguageUnfolded.iso_alpha2}-flag.gif`,
                }}
                className="w-8 h-6 rounded"
              />
              <View>
                <Text className="font-bold">
                  {exchange.learningLanguageUnfolded.name}:{" "}
                  {participantsLearningLanguage.length} /{" "}
                  {exchange.capacity / 2}{" "}
                </Text>
              </View>

              <View className="">
                {participantsList(
                  participantsLearningLanguage,
                  exchange.learningLanguageId
                )}
              </View>
            </View>
          </View>
        </View>
        {exchangeIsFull && <Button disabled>The Exchange is full :-(</Button>}
        {!exchangeIsFull && !amValidToJoin && !haveJoined && (
          <Button disabled>{notValidReason}</Button>
        )}
        {haveJoined && (
          <Button onPress={handleRemoveMyself}>
            {mutation.isPending ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              "Remove myself"
            )}
          </Button>
        )}
        {amValidToJoin && !haveJoined && (
          <Button disabled={haveJoined} onPress={() => handleAddParticipant()}>
            {mutation.isPending ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              "Join"
            )}
          </Button>
        )}
      </View>
    </ScrollView>
  );
}

// import { useState, useEffect, useCallback, useReducer } from 'react';
// import { useFocusEffect } from '@react-navigation/native';
// import { setActivePage } from '@/features/header/headerSlice'
// import { useSelector, useDispatch } from 'react-redux'
// import { useLocalSearchParams, Link } from 'expo-router';
// import { useGlobalContext } from "@/context/GlobalProvider";
// import { images } from '@/constants'
// import { FIREBASE_DB } from '@/firebase/firebaseConfig';
// // C
// import { View, Text, StyleSheet, Image, ScrollView } from 'react-native';
// import { Button, List, ListItem, Icon, Layout, Spinner, Text as KText, Divider, Avatar, Modal, Card,} from '@ui-kitten/components';
// import { useToast } from "react-native-toast-notifications";
// import AvatarItem from '@/components/AvatarItem'
// import { safeImageParse } from '@/common/utils'
// import { formatExchange , esGetDoc, esUpdateDoc, checkUserIsValidToJoin, safeParse, parseLocation,
//   addParticipantToExchange, removeMyselfFromExchange, getPartipantsOfLanguages, checkUserHasJoined } from 'exchanges-shared'
// import useFetch from '@/hooks/useFetch';
// import useFetchOne from '@/hooks/useFetchOne';
// import useLanguages from '@/hooks/useLanguages';
// import { useRoute } from '@react-navigation/native';
// import GoogleMap from '@/components/GoogleMap.tsx'
// import AddFriendsPopover from '@/components/AddFriendsPopover'
// import AddFriendsAutoComplete from '@/components/AddFriendsAutoComplete'
// import { KittenModal } from '@/components/KittenModal'
// import LoadingButton from '@/components/LoadingButton'
// import { validateFormForServer } from '@/services/formValidation'

// export default function ViewExchange({ navigation }) {
//   const [theKey, setTheKey] = useState(0);
//   const [, forceUpdate] = useReducer(x => x + 1, 0);
//   const [popoverVisible, setPopoverVisible] = useState(false);
//   const { id } = useLocalSearchParams();
//   const { user: me } = useGlobalContext();
//   const [amValidToJoin, setAmValidToJoin] = useState(false);
//   const [haveJoined, setHaveJoined] = useState(false);
//   const [notValidReason, setNotValidReason] = useState('');

//   const [isLoading, setIsLoading] = useState(false);
//   const [exchange, setExchange] = useState(null);
//   const { languages } = useLanguages();
//   const { data: users } = useFetch('users')
//   const { data: exchangeListener } = useFetchOne('exchanges', id)
//   const [participantsTeachingLanguage, setParticipantsTeachingLanguage] = useState([])
//   const [participantsLearningLanguage, setParticipantsLearningLanguage] = useState([])
//   const toast = useToast();
//   const route = useRoute();
//   const dispatch = useDispatch()
//   const [visible, setVisible] = useState(false);

//   useFocusEffect(
//     useCallback(() => {
//       dispatch(setActivePage({ activePage: `View ${exchange && exchange.name ? exchange.name: 'Exchange'}`, leftside: 'arrow'}))
//     }, [exchange])
//   );
//   useFocusEffect(useCallback(() => { setTheKey(Math.random()); } , []))

//   async function handleAddParticipant(user) {
//       setIsLoading(true)
//       const { isValid, message, joiningUser } = checkUserIsValidToJoin(exchange, participantsTeachingLanguage, participantsLearningLanguage, me, user)

//       if (!isValid) {
//         setIsLoading(false)
//         toast.show(message, { type: 'error', placement: "top" });
//         return;
//       }
//       const { error, response } = await addParticipantToExchange(FIREBASE_DB, exchange, joiningUser)
//       if (error) {
//         setIsLoading(false)
//         return toast.show(message, { type: 'error', placement: "top" });
//       }
//       await fetchData(id)
//       setIsLoading(false)
//   }

//   async function handleRemoveMyself() {
//     try {
//       setIsLoading(true)
//       const { success, message } = await removeMyselfFromExchange(FIREBASE_DB, me, exchange)
//       if (!success) {
//         setIsLoading(false)
//         return toast.show(`Organizers cannot remove themselves from the exchange`, { type: 'error', placement: "top" });
//       }
//       await fetchData(id)
//       setIsLoading(false)
//       toast.show(`You Have been removed from the Exchange`, { type: 'success', placement: "top" });
//     } catch (error) {
//       console.log(error);

//       setIsLoading(false)
//       toast.show(`Error removing you from the Exchange, ${error.message}`, { type: 'error', placement: "top" });
//     }
//   }

//   async function fetchData(id:string) {
//     try {
//       const {docSnap} = await esGetDoc(FIREBASE_DB, "exchanges", id);
//       console.log('docSnap.data()', docSnap.data());
//       console.log('languages', languages);
//       console.log('users', users);
//       try {
//         const formattedExchange = formatExchange({...docSnap.data(), id: docSnap.id}, languages, users)
//         console.log('formattedExchange', formattedExchange);

//         setExchange(formattedExchange)
//       } catch (error) {
//         console.log('errrr', error);
//         toast.show(`Error fetching exchanges`, { type: 'success', placement: "top" });
//       }

//     } catch (error) {

//     }
//   }

//   useEffect(() => {
//     if (languages.length > 0) {
//       fetchData(id)
//     }
//   }, [languages, users]);
//   useEffect(() => {
//     fetchData(id)
//   }, [id]);

//   useEffect(() => {

//     if (exchangeListener && languages.length > 0 && users.length > 0) {
//       const formattedExchange = formatExchange({...exchangeListener, id: exchangeListener.id}, languages, users)
//       setExchange(formattedExchange)
//     }

//   }, [exchangeListener, id, languages]);

//   useEffect(() => {
//     if (exchange && users.length > 0) {
//       const { participantsTeachingLanguage, participantsLearningLanguage } = getPartipantsOfLanguages(users, exchange)
//       setParticipantsTeachingLanguage(participantsTeachingLanguage);
//       setParticipantsLearningLanguage(participantsLearningLanguage);
//     }
//   }, [exchange, users])

//   useEffect(() => {
//     if (exchange && me && participantsTeachingLanguage && participantsLearningLanguage) {
//       const { isValid, message } = checkUserIsValidToJoin(exchange, participantsTeachingLanguage, participantsLearningLanguage, me);
//       setAmValidToJoin(isValid)
//       setHaveJoined(checkUserHasJoined(me, exchange));
//       setNotValidReason(message)
//     }
//   }, [participantsTeachingLanguage, participantsLearningLanguage])

//   const participantsList = (participants, teachingLanguage) => {
//     const divContainer = [];
//     for (let i = 0; i < exchange.capacity / 2; i++) {
//       divContainer.push(<AvatarItem
//         key={i}
//         user={participants[i]}
//         exchange={exchange}
//         amValidToJoin={amValidToJoin}
//         teachingLanguage={teachingLanguage} />)
//     }
//     return <View onPress={() => setVisible(true)}>{divContainer}</View>;
//   }
// let exchangeIsFull = false;
// if (exchange) {
//   exchangeIsFull = participantsTeachingLanguage.length === exchange.capacity / 2 && participantsLearningLanguage.length === exchange.capacity / 2
// }

//    return exchange ? (<ScrollView style={{marginBottom: 50}}>
//     {!exchange.location && <Image
//         source={images.map}
//         style={{ backgroundColor: 'powderblue',  width: '100%',}}
//     />
//  }
//     {exchange.location &&
//       <GoogleMap location={exchange.location}/>
//     }
//     {/* <Button onPress={forceUpdate}>
//       Click me to refresh
//     </Button> */}
//     <Layout style={styles.container} level='0'>
//       <KText
//         style={[styles.text, styles.white]}
//         category='h6'
//       >{exchange.teachingLanguageUnfolded.label} to {exchange.learningLanguageUnfolded.label} Language Exchange at {parseLocation(exchange.location)}</KText>
//       <View style={styles.infoBoxSection}>
//         <View style={styles.infoBox}>
//           <Icon
//             style={styles.icon}
//             fill='#8F9BB3'
//             name='pin'
//           />
//           <KText style={styles.text}>{parseLocation(exchange.location)}</KText>
//         </View>
//         <View style={styles.infoBox}>
//           <Icon
//             style={styles.icon}
//             fill='#8F9BB3'
//             name='calendar-outline'
//           />
//           <KText style={styles.text}>{exchange.timeUnix}</KText>
//         </View>
//         <View style={styles.infoBox}>
//           <Icon
//             style={styles.icon}
//             fill='#8F9BB3'
//             name='clock'
//           />
//           <KText style={styles.text}>{exchange.duration}</KText>
//         </View>
//         <View style={styles.infoBox}>
//           <Icon
//             style={styles.icon}
//             fill='#8F9BB3'
//             name='flag-outline'
//           />
//           <KText style={styles.text}>{exchange.teachingLanguageUnfolded.label}, {exchange.learningLanguageUnfolded.label}</KText>
//         </View>
//         <View style={styles.infoBox}>
//           <Icon
//             style={styles.icon}
//             fill='#8F9BB3'
//             name='person'
//           />
//           <KText style={styles.text}>{safeParse('organizerUnfolded', exchange.organizerUnfolded)} {exchange.organizerId === me.id && <KText appearance='hint'  category='p2'>(You are hosting)</KText>}</KText>
//         </View>
//         <View style={styles.infoBox}>
//           <Icon
//             style={styles.icon}
//             fill='#8F9BB3'
//             name='pricetags'
//           />
//           <KText style={styles.text}>{exchange.name}</KText>
//         </View>
//       </View>
//       <View style={styles.detailsSection}>
//         <KText style={styles.text}>Lorem ipsum, dolor sit amet consectetur adipisicing elit. Sit et molestiae ipsam dignissimos labore. Nostrum exercitationem excepturi voluptas, illum veritatis at animi eum non ad a dolor quos pariatur libero.</KText>
//       </View>
//       <Divider />
//       <View style={[styles.fr, { marginVertical: 20}]}>
//         <KText
//           category='h6'
//         >Who's Attending?</KText>
//         {/* <AddFriendsPopover
//           visible={popoverVisible}
//           setVisible={setPopoverVisible}
//           loading={isLoading}
//           handleAddParticipant={handleAddParticipant}
//           exchange={exchange} /> */}
//         <Button
//             onPress={() => setPopoverVisible(true)}>
//             Add Friends
//         </Button>
//       </View>
//       {popoverVisible && <KittenModal
//             title="Add Friends"
//             onclick={() => {}}
//             visible={popoverVisible}
//             isLoading={isLoading}
//             setVisible={setPopoverVisible}
//             >
//           <AddFriendsAutoComplete
//           visible={popoverVisible}
//           setVisible={setPopoverVisible}
//           loading={isLoading}
//           handleAddParticipant={handleAddParticipant}
//           exchange={exchange} />
//         </KittenModal>}

//       <View style={styles.participantsContainer}>
//         <View style={styles.participantsInnerContainer}>
//             <View style={{padding: '30px'}}>
//                 <View style={styles.participantsColumnTitle}>
//                   <Avatar source={safeImageParse('teachingLanguageUnfolded', exchange)} size='tiny' />
//                   <KText category='label'>{ exchange.teachingLanguageUnfolded.name }: {participantsTeachingLanguage.length} / {exchange.capacity / 2}</KText>
//                 </View>
//                 <View style={styles.participantsColumnAvatars}>
//                   {participantsList(participantsTeachingLanguage, exchange.teachingLanguageId)}
//                 </View>
//             </View>
//             <View style={{padding: '30px'}}>
//                 <View style={styles.participantsColumnTitle}>
//                   <Avatar source={safeImageParse('learningLanguageUnfolded', exchange)}   size='tiny' />
//                   <KText category='label'>{ exchange.learningLanguageUnfolded.name }: {participantsLearningLanguage.length} / {exchange.capacity / 2} </KText>
//                 </View>
//                 <View style={styles.participantsColumnAvatars}>
//                     {participantsList(participantsLearningLanguage, exchange.learningLanguageId)}
//                 </View>
//             </View>
//         </View>
//     </View>
//     {!isLoading && exchangeIsFull && <Button status='primary'  disabled>
//       The Exchange is full :-(
//     </Button>}
//     {!isLoading && !exchangeIsFull && !amValidToJoin && !haveJoined && <Button status='primary'  disabled>
//       {notValidReason}
//     </Button> }
//     {!isLoading && haveJoined && <Button status='danger'   onPress={handleRemoveMyself}>
//       Remove myself
//     </Button> }
//     {!isLoading && amValidToJoin && !haveJoined &&
//     <Button status="primary"
//       disabled={haveJoined}
//     onPress={() => handleAddParticipant()}
//     appearance='filled'>
//       Join
//     </Button> }
//     {isLoading && <LoadingButton status="primary"/>}

//     </Layout>

//    </ScrollView>) : (<View style={{width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center'}}><Spinner status='warning' /></View>)

// }

// const styles = StyleSheet.create({
//   container: {
//     padding: 5
//     // flex: 1,
//     // justifyContent: 'center',
//     // alignItems: 'center',
//   },
//   white: {
//     backgroundColor: 'white'
//   },
//   fr: {
//     display: "flex",
//     flexDirection: "row",
//     justifyContent: 'space-between',
//     // alignItems: 'center',
//   },
//   infoBoxSection: {
//     display: "flex",
//     flexDirection: "row",
//     flexWrap: 'wrap',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginTop: 10
//   },
//   infoBox: {
//     display: "flex",
//     flexDirection: "row",
//     alignItems: 'center',
//     width: '50%'
//   },
//   icon: {
//     margin: 6,
//     width: 24,
//     height: 24,
//   },
//   iconFlag: {
//     marginLeft: -10,
//     width: 24,
//     height: 24,
//   },
//   detailsSection: {
//     paddingVertical: 10
//   },
//   participantsInnerContainer: {
//     display: "flex",
//     flexDirection: "row",
//     justifyContent: 'space-evenly',
//   },
//   participantsColumnTitle: {
//     display: "flex",
//     alignItems: 'center',
//     marginBottom: 15
//   },
//   participantsColumnAvatars: {
//     display: "flex",
//     flexDirection: "row",
//     justifyContent: 'center',
//   },
//   modalContainer: {
//     minHeight: 192,
//     padding: 25
//   },
//   backdrop: {
//     backgroundColor: 'rgba(0, 0, 0, 0.5)',
//   },
// });
