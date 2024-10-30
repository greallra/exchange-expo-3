import React from "react";
import { View, Text } from "react-native";
import { router } from "expo-router";
import UserForm from "@/components/forms/UserForm";

export default function signup() {
  return (
    <View className="p-4">
      <Text
        onPress={() => router.push(`/exchanges`)}
        className="p-6 bg-slate-500"
      >
        Back
      </Text>
      <UserForm />
    </View>
  );
}
