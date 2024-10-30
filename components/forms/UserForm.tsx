import { useState, useCallback, useEffect } from "react";
import {
  Text,
  View,
  Alert,
  StyleSheet,
  Image,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { Button, ButtonText } from "@/components/button";
import DateTimePicker from "@react-native-community/datetimepicker";
import tailwind from "twrnc";
import { useMutation } from "@tanstack/react-query";
import * as ImagePicker from "expo-image-picker";
import uuid from "react-native-uuid";
import { Icon } from "@/components/icon";
import { useToast } from "react-native-toast-notifications";

import { Link, router, useLocalSearchParams } from "expo-router";
import { useStore } from "@/store/store";
import { useFocusEffect } from "@react-navigation/native";
import { formatISO, format } from "date-fns";
import { fbTimeObjectToDateObject } from "@/utils";

import { useForm, Controller } from "react-hook-form";
import {
  //   formatPostDataExchange,
  //   validateForm,
  esAddUser,
  esAddDoc,
  esUpdateDoc,
} from "exchanges-shared";

import { TextInput } from "@/components/text-input";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  FIREBASE_AUTH,
  FIREBASE_DB,
  signInWithEmailAndPassword,
  signOut,
  createUserWithEmailAndPassword,
  getAuth,
  //   storage,
} from "@/firebase/firebaseConfig";

import {
  ref,
  uploadBytes,
  uploadBytesResumable,
  listAll,
  getDownloadURL,
  getStorage,
  list,
} from "firebase/storage";
import { ProgressBar } from "@/components/progress-bar";
import { RadioButtons } from "@/components/radio-buttons";

// Create a root reference
const storage = getStorage();

const schema = z.object({
  firstname: z.string().min(3),
  lasttname: z.string().min(3),
  username: z.string().refine((s) => !s.includes(" "), "No Spaces!"),
  email: z.string().email(),
  password: z.string().min(6),
  teachingLanguageId: z.string(),
  learningLanguageId: z.string(),
  time: z.date(),
});

export default function UserForm({ isEditMode = false }) {
  const [key, setTheKey] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const [progress, setProgress] = useState<number | null>(0);
  const [imageEdited, setImageEdited] = useState<boolean>(false);
  const toast = useToast();

  useFocusEffect(
    useCallback(() => {
      setTheKey(Math.random());
    }, [])
  );
  const { languages, user } = useStore();
  const [serverError, setServerError] = useState("");
  const {
    control,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      firstname: user ? user.firstname : "",
      //  name: exchange ? exchange.name : "",
      //  capacity: exchange ? exchange.capacity : 6,
      time: user ? new Date(fbTimeObjectToDateObject(user.dob)) : new Date(),
      //  duration: exchange ? exchange.duration : 60,
      //  gender: exchange ? exchange.gender : "0",
      //  location: exchange ? exchange.location : null,
      //  learningLanguageId: exchange
      //    ? exchange.learningLanguageId
      //    : user.teachingLanguageId,
      //  teachingLanguageId: exchange
      //    ? exchange.teachingLanguageId
      //    : user.learningLanguageId,
      //  organizerId: exchange ? exchange.organizerId : user.id,
      //  participantIds: exchange ? exchange.participantIds : [user.id],
    },
  });

  async function fileSend() {
    const name = uuid.v4();
    try {
      setUploading(true);
      const uploadResp = await uploadToFirebase(image, name, (v) => {
        console.log(v);
        setProgress(v);
      });

      setUploading(false);
      console.log("uploadResp", uploadResp);
      await esUpdateDoc(FIREBASE_DB, "users", user.id, {
        avatarUrl: uploadResp.downloadUrl,
        avatarId: name,
      });
      toast.show("Profile image updated successfully", {
        type: "success",
        placement: "top",
      });
      setImageEdited(false);
    } catch (err) {
      setImageEdited(false);
      setUploading(false);
      toast.show(err.message, { type: "error", placement: "top" });
      console.log("fileSend err", err);
    }
  }

  const uploadToFirebase = async (uri, name, onProgress) => {
    const fetchResponse = await fetch(uri);
    const theBlob = await fetchResponse.blob();

    const imageRef = ref(getStorage(), `images/${name}`);

    const uploadTask = uploadBytesResumable(imageRef, theBlob);

    return new Promise((resolve, reject) => {
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          onProgress && onProgress(progress);
        },
        (error) => {
          // Handle unsuccessful uploads
          console.log(error);
          reject(error);
        },
        async () => {
          const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
          resolve({
            downloadUrl,
            metadata: uploadTask.snapshot.metadata,
          });
        }
      );
    });
  };

  const pickImage = async () => {
    setImageEdited(true);
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      base64: true,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    console.log("result", result);

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  useEffect(() => {
    setImage(user?.avatarUrl);
  }, [user]);

  function createUser(data) {
    return new Promise(async (resolve, reject) => {
      try {
        const auth = getAuth();
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          data.email,
          data.password
        );
        delete data.password;
        resolve(esAddUser(FIREBASE_DB, userCredential, "users", data));
      } catch (error) {
        reject(error);
      }
    });
  }

  const mutation = useMutation({
    mutationFn: (data) => {
      if (isEditMode) {
        return esUpdateDoc(FIREBASE_DB, "users", id, data);
      } else {
        console.log("data", data);

        return createUser(data);
      }
    },
    onError: (err) => {
      console.log("onError", err);
      setServerError(err.message);
    },
    onSettled: () => {
      console.log("onSettled");
    },
    onSuccess: (data) => {
      router.push("/exchanges");
      console.log("onSuccess", data);
    },
  });

  const onSubmit = (data) => {
    console.log("pass validation", data); // Handle form submission
    mutation.mutate(data);
  };
  console.log("errors", errors);
  console.log("user cf", user, languages);
  //   if (!user || !user.teachingLanguageUnfolded) {
  //     return <Text className="text-md font-bold text-center">No user found</Text>;
  //   }

  return (
    <ScrollView className="p-2 mb-44">
      {user && (
        <View>
          <View className="p-4">
            <Text className="m-auto font-bold pb-3">Profile Image</Text>
            {image ? (
              <Image
                source={{ uri: image }}
                className="w-56 h-56 rounded-lg m-auto"
              />
            ) : (
              <Image
                source={{
                  uri: `https://avatar.iran.liara.run/username?username=${user.firstname}+${user.lastname}`,
                }}
                className="w-56 h-56 rounded-lg m-auto"
              />
            )}
            <View className="flex-row justify-center">
              <Button
                title="Pick an image from camera roll"
                onPress={pickImage}
                className="w-12 left-1 opacity-50 mr-2  mt-2 rounded-full"
              >
                <Icon
                  type="Ionicons"
                  name="pencil-outline"
                  size={20}
                  color={tailwind.color("text-white")}
                />
              </Button>
              <Button
                title="Pick an image from camera roll"
                onPress={pickImage}
                className="w-12 left-1 opacity-50  mt-2 rounded-full"
              >
                <Icon
                  type="Ionicons"
                  name="trash-outline"
                  size={20}
                  color={tailwind.color("text-white")}
                />
              </Button>
            </View>
          </View>
          {!uploading && imageEdited && (
            <Button className="my-2" status="danger" onPress={fileSend}>
              <ButtonText>
                {image?.includes("firebasestorage")}save image
              </ButtonText>
            </Button>
          )}
          {uploading && (
            <View className="my-2">
              <ProgressBar progress={progress} />
              <View className="flex-row items-center justify-center">
                <Text>Uploading Image </Text>
                <ActivityIndicator
                  animating={uploading}
                  color="black"
                  size={50}
                />
              </View>
            </View>
          )}
        </View>
      )}
      <Text className="m-auto font-bold pb-3 mt-6">Your Info</Text>
      <Text className="text-left font-semibold mb-1 ">First Name</Text>
      <Controller
        control={control}
        render={({ field: { onChange, onBlur, value } }) => (
          <>
            <TextInput
              placeholder="firstname"
              className="bg-white"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
            />
          </>
        )}
        name="firstname"
      />
      {errors.firstname?.message && (
        <Text className="mt-1 text-red-500">{errors.firstname.message}</Text>
      )}
      <Text className="text-left font-semibold mb-1 mt-4">Last Name</Text>
      <Controller
        control={control}
        render={({ field: { onChange, onBlur, value } }) => (
          <>
            <TextInput
              placeholder="lastname"
              className="bg-white"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
            />
          </>
        )}
        name="lastname"
      />
      {errors.lastname?.message && (
        <Text className="mt-1 text-red-500">{errors.lastname.message}</Text>
      )}
      <Text className="text-left font-semibold mb-1 mt-4">Username</Text>
      <Controller
        control={control}
        render={({ field: { onChange, onBlur, value } }) => (
          <>
            <TextInput
              placeholder="username"
              className="bg-white"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
            />
          </>
        )}
        name="username"
      />
      {errors.username?.message && (
        <Text className="mt-1 text-red-500">{errors.username.message}</Text>
      )}
      <Text className="text-left font-semibold mb-1 mt-4">Email</Text>
      <Controller
        control={control}
        render={({ field: { onChange, onBlur, value } }) => (
          <>
            <TextInput
              placeholder="email"
              className="bg-white"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
            />
          </>
        )}
        name="email"
      />
      {errors.email?.message && (
        <Text className="mt-1 text-red-500">{errors.email.message}</Text>
      )}
      <Text className="text-left font-semibold mb-1 mt-4">Password</Text>
      <Controller
        control={control}
        render={({ field: { onChange, onBlur, value } }) => (
          <>
            <TextInput
              placeholder="password"
              className="bg-white"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
            />
          </>
        )}
        name="password"
      />
      {errors.password?.message && (
        <Text className="mt-1 text-red-500">{errors.password.message}</Text>
      )}
      <Controller
        control={control}
        rules={{
          maxLength: 100,
        }}
        render={({ field: { onChange, onBlur, value } }) => (
          <View className="flex-row pt-2">
            <DateTimePicker
              display="compact"
              testID="dateTimePicker"
              value={value}
              mode="date"
              is24Hour={true}
              onChange={(event, selectedDate) => {
                onChange(selectedDate);
                // setIsEditingTime(false);
                // setTimeEdited(true);
              }}
            />
          </View>
        )}
        name="time"
      />
      {/* <View>
        <TouchableOpacity className="" onPress={() => setIsEditingTime(true)}>
          <Icon
            type="Ionicons"
            name="create-outline"
            size={24}
            color={tailwind.color("text-black")}
          />
        </TouchableOpacity>
      </View> */}
      {errors.time?.message && (
        <Text className="mt-1 text-red-500">{errors.time.message}</Text>
      )}

      <Controller
        control={control}
        rules={{
          maxLength: 100,
        }}
        render={({ field: { onChange, onBlur, value } }) => (
          <>
            <View className="flex-row justify-between items-center w-full mt-3">
              <Text className="font-semibold mb-1">
                What's your Native Language
              </Text>
              {/* <Text className="text-2xl">{value} minutes</Text> */}
            </View>
            <RadioButtons
              activeItem={value}
              onSelectItem={onChange}
              options={[
                {
                  key: "english",
                  label: "English",
                  value: "0",
                },
                {
                  key: "spanish",
                  label: "Spanish",
                  value: "1",
                },
                {
                  key: "french",
                  label: "French",
                  value: "2",
                },
              ]}
            />
          </>
        )}
        name="teachingLanguageId"
      />
      {errors.teachingLanguageId?.message && (
        <Text className="mt-1 text-red-500">
          {errors.teachingLanguageId.message}
        </Text>
      )}

      <Controller
        control={control}
        rules={{
          maxLength: 100,
        }}
        render={({ field: { onChange, onBlur, value } }) => (
          <>
            <View className="flex-row justify-between items-center w-full mt-3">
              <Text className="font-semibold mb-1">
                What language are you learning?
              </Text>
              {/* <Text className="text-2xl">{value} minutes</Text> */}
            </View>
            <RadioButtons
              activeItem={value}
              onSelectItem={onChange}
              options={[
                {
                  key: "english",
                  label: "English",
                  value: "0",
                },
                {
                  key: "spanish",
                  label: "Spanish",
                  value: "1",
                },
                {
                  key: "french",
                  label: "French",
                  value: "2",
                },
              ]}
            />
          </>
        )}
        name="learningLanguageId"
      />
      {errors.learningLanguageId?.message && (
        <Text className="mt-1 text-red-500">
          {errors.learningLanguageId.message}
        </Text>
      )}

      {serverError && <Text className="mt-1 text-red-500">{serverError}</Text>}
      <Button onPress={handleSubmit(onSubmit)} className="w-full my-3">
        <ButtonText>
          {mutation.status === "idle" ? "Submit" : <ActivityIndicator />}
        </ButtonText>
      </Button>
    </ScrollView>
  );
}
