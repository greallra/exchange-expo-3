import { useMutation } from "@tanstack/react-query";
import { useState, useCallback } from "react";
import { Link, router, useLocalSearchParams } from "expo-router";
import { useStore } from "@/store/store";
import { useFocusEffect } from "@react-navigation/native";
import { formatISO, format } from "date-fns";
import { fbTimeObjectToDateObject } from "@/utils";

import { useForm, Controller } from "react-hook-form";
import {
  formatPostDataExchange,
  validateForm,
  esAddDoc,
  esUpdateDoc,
  updateFormFieldsWithDefaultData,
  getFormFields,
} from "exchanges-shared";

import { TextInput } from "@/components/text-input";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  FIREBASE_AUTH,
  FIREBASE_DB,
  signInWithEmailAndPassword,
  signOut,
} from "@/firebase/firebaseConfig";

import {
  View,
  Alert,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Button, ButtonText } from "@/components/button";
import RangeSlider from "./form-elements/RangeSlider";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Icon } from "@/components/icon";
import tailwind from "twrnc";
import { RadioButtons } from "@/components/radio-buttons";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";

const schema = z.object({
  age_range: z.array(z.number()),
  name: z.string().min(2),
  // capacity: z
  //   .string()
  //   .regex(/2|4|6|8|10/, "must be even number no greater than 10"),
  capacity: z.number().lte(10).multipleOf(2),
  time: z.date(),
  duration: z.number(),
  gender: z.string(),
  location: z.object({
    description: z.string(),
    formatted_address: z.string(),
    geometry: z.object({
      location: z.object({
        lat: z.number(),
        lng: z.number(),
      }),
      viewport: z.object({
        northeast: z.object({
          lat: z.number(),
          lng: z.number(),
        }),
        southwest: z.object({
          lat: z.number(),
          lng: z.number(),
        }),
      }),
    }),
    photos: z.array(
      z.object({
        height: z.number(),
        html_attributions: z.array(z.string()),
        photo_reference: z.string(),
        width: z.number(),
      })
    ),
  }),
  learningLanguageId: z.string(),
  teachingLanguageId: z.string(),
  organizerId: z.string(),
  participantIds: z.array(z.string()),
});

export default function ExchangeForm({ exchange, isEditMode }) {
  const [key, setTheKey] = useState(0);
  const { id } = useLocalSearchParams();
  const [isEditingLocation, setIsEditingLocation] = useState(false);
  const [isEditingTime, setIsEditingTime] = useState(false);
  const [timeEdited, setTimeEdited] = useState(false);
  console.log("zz exchange", exchange);

  useFocusEffect(
    useCallback(() => {
      setTheKey(Math.random());
    }, [])
  );
  const { user, languages } = useStore();
  const [serverError, setServerError] = useState("");
  const {
    control,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      age_range: exchange ? exchange.age_range : [18, 100],
      name: exchange ? exchange.name : "",
      capacity: exchange ? exchange.capacity : 6,
      time: exchange
        ? new Date(fbTimeObjectToDateObject(exchange.time))
        : new Date(),
      duration: exchange ? exchange.duration : 60,
      gender: exchange ? exchange.gender : "0",
      location: exchange ? exchange.location : null,
      learningLanguageId: exchange
        ? exchange.learningLanguageId
        : user.teachingLanguageId,
      teachingLanguageId: exchange
        ? exchange.teachingLanguageId
        : user.learningLanguageId,
      organizerId: exchange ? exchange.organizerId : user.id,
      participantIds: exchange ? exchange.participantIds : [user.id],
    },
  });

  const mutation = useMutation({
    mutationFn: (data) => {
      if (isEditMode) {
        console.log("esUpdateDoc", exchange.id, data);

        return esUpdateDoc(FIREBASE_DB, "exchanges", id, data);
      } else {
        return esAddDoc(FIREBASE_DB, "exchanges", data);
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
  if (!user || !user.teachingLanguageUnfolded) {
    return <Text className="text-md font-bold text-center">No user found</Text>;
  }

  return (
    <ScrollView keyboardShouldPersistTaps="always">
      <View className="flex flex-col h-full">
        <Text className="text-md font-bold text-center">
          Customize your {user.teachingLanguageUnfolded.name} -{" "}
          {user.learningLanguageUnfolded.name} Exchange
        </Text>
        <View className="flex-row jusitfy-center items-center py-4 space-x-3 m-auto">
          <Image
            source={{
              uri: `https://www.worldometers.info/img/flags/${user.teachingLanguageUnfolded.iso_alpha2}-flag.gif`,
            }}
            className="w-16 h-16 rounded"
          />
          {/* <Text className="text-4xl font-xl invisible">-</Text> */}
          <Image
            source={{
              uri: `https://www.worldometers.info/img/flags/${user.learningLanguageUnfolded.iso_alpha2}-flag.gif`,
            }}
            className="w-16 h-16 rounded"
          />
        </View>
        <Text className="text-left font-semibold mb-1">Exchange Name</Text>
        <Controller
          control={control}
          render={({ field: { onChange, onBlur, value } }) => (
            <>
              <TextInput
                placeholder="Exchange Name"
                className="bg-white"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
              />
            </>
          )}
          name="name"
        />
        {errors.name?.message && (
          <Text className="mt-1 text-red-500">{errors.name.message}</Text>
        )}
        <Controller
          control={control}
          rules={{
            maxLength: 100,
          }}
          render={({ field: { onChange, onBlur, value } }) => (
            <View className="mb-2">
              <View className="flex-row justify-between items-center w-full mt-3">
                <Text className="text-left font-semibold mb-1">Location</Text>

                {/* <Text className="text-2xl">{JSON.stringify(value)}</Text> */}
              </View>
              {!value || isEditingLocation ? (
                <ScrollView keyboardShouldPersistTaps="handled">
                  <GooglePlacesAutocomplete
                    listViewDisplayed={false}
                    styles={{
                      textInputContainer: {
                        // backgroundColor: "grey",
                        border: "1px solid red",
                      },
                      textInput: {
                        borderWidth: 1,
                        borderColor: "thistle",
                        // borderRadius: 50,
                        height: 48,
                        color: "#5d5d5d",
                        fontSize: 16,
                      },
                      predefinedPlacesDescription: {
                        color: "#1faadb",
                      },
                    }}
                    fetchDetails={true}
                    placeholder="Choose a location"
                    onPress={(data, details = null) => {
                      // 'details' is provided when fetchDetails = true
                      // console.log("map -data", JSON.stringify(data, null, 2));
                      // console.log("map -details", JSON.stringify(details, null, 2));
                      console.log("details, data)", details, data);
                      onChange({
                        description: data.description,
                        geometry: details?.geometry,
                        photos: details?.photos,
                        formatted_address: details.formatted_address,
                      });
                      setIsEditingLocation(false);
                    }}
                    query={{
                      key: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
                      language: "en",
                    }}
                    onFail={(e) => console.log(e)}
                  />
                </ScrollView>
              ) : (
                <View className="">
                  <View className="bg-green-200 rounded p-1 border border-green-500">
                    {value.description ? (
                      <Text>{value?.description}</Text>
                    ) : (
                      <Text>{exchange?.location?.description}</Text>
                    )}
                  </View>
                  <TouchableOpacity
                    className=""
                    onPress={() => setIsEditingLocation(true)}
                  >
                    <Icon
                      type="Ionicons"
                      name="create-outline"
                      size={24}
                      color={tailwind.color("text-black")}
                    />
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}
          name="location"
        />
        {errors.location && (
          <Text className="mt-1 text-red-500">Error with location</Text>
        )}
        <Text className="text-left font-semibold mb-1">Time</Text>
        <Controller
          control={control}
          rules={{
            maxLength: 100,
          }}
          render={({ field: { onChange, onBlur, value } }) => (
            <View className="flex-row pt-2">
              {!timeEdited || isEditingTime ? (
                <DateTimePicker
                  display="compact"
                  testID="dateTimePicker"
                  value={value}
                  mode="datetime"
                  is24Hour={true}
                  onChange={(event, selectedDate) => {
                    onChange(selectedDate);
                    setIsEditingTime(false);
                    setTimeEdited(true);
                  }}
                />
              ) : (
                <View className="bg-green-200 rounded p-1 border border-green-500">
                  <Text>{value && format(value, "iiii io LLLL, p")}</Text>
                </View>
              )}
            </View>
          )}
          name="time"
        />
        <View>
          <TouchableOpacity className="" onPress={() => setIsEditingTime(true)}>
            <Icon
              type="Ionicons"
              name="create-outline"
              size={24}
              color={tailwind.color("text-black")}
            />
          </TouchableOpacity>
        </View>
        {errors.time?.message && (
          <Text className="mt-1 text-red-500">{errors.time.message}</Text>
        )}
        <Controller
          control={control}
          rules={{
            maxLength: 100,
          }}
          render={({ field: { onChange, onBlur, value } }) => (
            // <TextInput
            //   placeholder="Number of Participants : 2|4|6|8|10"
            //   className="mt-2"
            //   onBlur={onBlur}
            //   onChangeText={onChange}
            //   value={value}
            // />
            <>
              <View className="flex-row justify-between items-center w-full mt-3">
                <Text className="font-semibold mb-1">
                  Number of Participants
                </Text>
                <Text className="text-2xl">{value}</Text>
              </View>
              <RangeSlider
                from={2}
                to={10}
                onChange={(v) => {
                  console.log("v", v);

                  onChange(v);
                }}
                defaultValue={[value]}
                disableRange
              />
            </>
          )}
          name="capacity"
        />
        {errors.capacity?.message && (
          <Text className="mt-1 text-red-500">{errors.capacity.message}</Text>
        )}
        <Controller
          control={control}
          rules={{
            maxLength: 100,
          }}
          render={({ field: { onChange, onBlur, value } }) => (
            <>
              <View className="flex-row justify-between items-center w-full mt-3">
                <Text className="font-semibold mb-1">Duration Of Exchange</Text>
                <Text className="text-2xl">{value} minutes</Text>
              </View>
              <RangeSlider
                from={30}
                to={180}
                step={15}
                onChange={(v) => {
                  console.log("v", v);

                  onChange(v);
                }}
                defaultValue={[value]}
                disableRange
              />
            </>
          )}
          name="duration"
        />
        {errors.duration?.message && (
          <Text className="mt-1 text-red-500">{errors.duration.message}</Text>
        )}
        <Controller
          control={control}
          rules={{
            maxLength: 100,
          }}
          render={({ field: { onChange, onBlur, value } }) => (
            <>
              <View className="flex-row justify-between items-center w-full mt-3">
                <Text className="font-semibold mb-1">Age Range</Text>
                <Text className="text-2xl">
                  {value[0]} - {value[1]} range
                </Text>
              </View>
              <RangeSlider
                from={18}
                to={100}
                step={1}
                onChange={(low, high) => {
                  onChange([low, high]);
                }}
                defaultValue={value}
                disableRange={false}
              />
            </>
          )}
          name="age_range"
        />
        {errors.age_range?.message && (
          <Text className="mt-1 text-red-500">{errors.age_range.message}</Text>
        )}
        <Controller
          control={control}
          rules={{
            maxLength: 100,
          }}
          render={({ field: { onChange, onBlur, value } }) => (
            <>
              <View className="flex-row justify-between items-center w-full mt-3">
                <Text className="font-semibold mb-1">Gender</Text>
                {/* <Text className="text-2xl">{value} minutes</Text> */}
              </View>
              <RadioButtons
                activeItem={value}
                onSelectItem={onChange}
                options={[
                  {
                    key: "anygender",
                    label: "Any Gender",
                    value: "0",
                  },
                  {
                    key: "male",
                    label: "Male",
                    value: "1",
                  },
                  {
                    key: "female",
                    label: "Female",
                    value: "2",
                  },
                ]}
              />
            </>
          )}
          name="gender"
        />
        {errors.gender?.message && (
          <Text className="mt-1 text-red-500">{errors.gender.message}</Text>
        )}
        {serverError && (
          <Text className="mt-1 text-red-500">{serverError}</Text>
        )}
        {/* <Button onPress={handleSubmit(onSubmit)} className="w-full mt-3">
        <Text className="text-white">Login</Text>
      </Button> */}
        <Button onPress={handleSubmit(onSubmit)}>
          <ButtonText>
            {mutation.isPending
              ? "Pending"
              : isEditMode
              ? "Edit Exchange"
              : "Create Exchange"}
          </ButtonText>
        </Button>
        {/* <Text className="pt-10">
        or <Link href="/signup">Signup</Link>
      </Text> */}
      </View>
    </ScrollView>
  );
}
