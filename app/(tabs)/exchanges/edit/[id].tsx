import React from "react";
import { useQuery } from "@tanstack/react-query";
import ExchangeForm from "@/components/forms/ExchangeForm";
import { router, useLocalSearchParams, Link } from "expo-router";
import { useEffect, useState, useContext, useCallback } from "react";
import { useStore } from "@/store/store";
import {
  // formatExchange,
  esGetDoc,
  // esUpdateDoc,
  // checkUserIsValidToJoin,
  // safeParse,
  // parseLocation,
  // addParticipantToExchange,
  // removeMyselfFromExchange,
  // getPartipantsOfLanguages,
  // checkUserHasJoined,
} from "exchanges-shared";
import { FIREBASE_DB } from "@/firebase/firebaseConfig";

import { useFocusEffect } from "@react-navigation/native";

import { Text, View, StyleSheet, ScrollView } from "react-native";

export default function index() {
  const { id } = useLocalSearchParams();
  const [key, setTheKey] = useState(0);
  const { setActivePage } = useStore();

  useFocusEffect(
    useCallback(() => {
      setTheKey(Math.random());
      setActivePage({
        name: "Edit exchange",
        route: "/exchanges",
      });
    }, [])
  );

  console.log("edit", id);
  // Get the exchange
  const {
    isPending,
    isError,
    error,
    data: exchange,
  } = useQuery({
    queryKey: ["exchange", key],
    queryFn: async () => {
      const res = await esGetDoc(FIREBASE_DB, "exchanges", id);
      return res.docSnap.data();
    },
  });

  if (isPending) {
    return <Text>Pending</Text>;
  }
  if (isError) {
    return (
      <Text>
        {error.message}{" "}
        <Text onPress={() => router.push(`/exchanges`)}>Back</Text>
      </Text>
    );
  }
  console.log("exchange", exchange);

  return (
    <View className="p-4">
      <ExchangeForm exchange={exchange} isEditMode={true} />
    </View>
  );
}
