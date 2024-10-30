import { Text, View, Alert } from "react-native";
import { Button, ButtonText } from "@/components/button";
import { useForm, Controller } from "react-hook-form";
import { Link } from "expo-router";
import { TextInput } from "@/components/text-input";
import { useMutation } from "@tanstack/react-query";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  FIREBASE_AUTH,
  signInWithEmailAndPassword,
  signOut,
} from "@/firebase/firebaseConfig";
import { useState } from "react";

const schema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(5, "Password is required"),
});

export default function App() {
  const [serverError, setServerError] = useState("");
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const mutation = useMutation({
    mutationFn: (data) => {
      return signInWithEmailAndPassword(
        FIREBASE_AUTH,
        data.email,
        data.password
      );
    },
    onError: (err) => {
      console.log("onError", err);
      setServerError(err.message);
    },
    onSettled: () => {
      console.log("onSettled");
    },
    onSuccess: (data) => {
      console.log("onSuccess", data);
    },
  });

  const onSubmit = (data) => {
    console.log("pass validation", data); // Handle form submission
    mutation.mutate(data);
  };

  return (
    <View className="flex flex-col justify-center items-center h-full">
      <Controller
        control={control}
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            placeholder="Email"
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
          />
        )}
        name="email"
      />
      {errors.email?.message && (
        <Text className="mt-1 text-red-500">{errors.email.message}</Text>
      )}
      <Controller
        control={control}
        rules={{
          maxLength: 100,
        }}
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            placeholder="Password"
            className="mt-2"
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
          />
        )}
        name="password"
      />
      {errors.password?.message && (
        <Text className="mt-1 text-red-500">{errors.password.message}</Text>
      )}
      {serverError && <Text className="mt-1 text-red-500">{serverError}</Text>}
      <Button onPress={handleSubmit(onSubmit)} className="w-full mt-3">
        <ButtonText>
          {mutation.status === "idle" ? "Login" : "loading"}
        </ButtonText>
      </Button>
      <Text></Text>

      <Text className="pt-10">
        or <Link href="/signup">Signup</Link>
      </Text>
    </View>
  );
}
