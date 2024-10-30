import React from "react";

import { View, Text } from "react-native";
import LoginForm from "@/components/forms/LoginForm";

export default function login() {
  return (
    <View className="p-4">
      <LoginForm />
    </View>
  );
}
