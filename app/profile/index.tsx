import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import { useEffect, useState, useCallback } from "react";
import Header from "@/components/Header";
import { Button, ButtonText } from "@/components/button";
import UserForm from "@/components/forms/UserForm";

import {
  getFormFields,
  formatPostDataUser,
  validateForm,
  updateFormFieldsWithDefaultData,
  updateFormFieldsWithSavedData,
  esUpdateDoc,
  esGetDoc,
  esDeleteDocs,
  checkForLanguageChange,
  esSetDoc,
  formatUserData,
} from "exchanges-shared";
import { FIREBASE_DB, FIREBASE_AUTH } from "@/firebase/firebaseConfig";

import { useFocusEffect } from "@react-navigation/native";
import { useToast } from "react-native-toast-notifications";
import { useStore } from "@/store/store";

const Profile = () => {
  const { loading, user, setActivePage, languages } = useStore();
  const [busy, setBusy] = useState(true);
  const toast = useToast();

  useFocusEffect(
    useCallback(() => {
      setActivePage({ name: "My Profile", route: "/exchanges" });
    }, [])
  );

  const handleLogout = () => {
    FIREBASE_AUTH.signOut().then((user) => {
      router.push("/");
    });
  };

  async function deleteDocsThenSubmit(stateOfForm) {
    // setLoading(true);
    // await esDeleteDocs(FIREBASE_DB, "exchanges", "organizerId", user.id);
    // setLanguageChangeDocsDeleted(true);
    // setTimeout(() => {
    //   handleSubmit(stateOfForm);
    //   setModalVisible(false);
    // }, 5000);
  }
  const loader = (
    <View
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <ActivityIndicator size="large" color="green" />
    </View>
  );

  return (
    <ScrollView style={{ width: "100%", height: "100%" }}>
      <Header />

      <UserForm />

      <Button style={{ margin: 2 }} status="danger" onPress={handleLogout}>
        <ButtonText>Logout</ButtonText>
      </Button>
    </ScrollView>
  );
};

export default Profile;
