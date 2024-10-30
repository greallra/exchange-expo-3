import { StyleSheet, Text, View } from "react-native";
import { useCallback, useEffect, useRef, useState } from "react";
import MapView from "react-native-maps";
import { Marker } from "react-native-maps";
import { useFocusEffect } from "@react-navigation/native";
import { Dimensions } from "react-native";

const GoogleMap = ({ location }) => {
  const [coords, setCoords] = useState({
    latitude: 53.425632,
    longitude: -6.257375499999998,
    latitudeDelta: 0.010711600000000487,
    longitudeDelta: 0.006022263868066241,
  });
  const { width, height } = Dimensions.get("window");
  const ASPECT_RATIO = width / height;
  const LATITUDE_DELTA = 0.0922;

  // const lat = details.geometry.location.lat;
  // const lng = details.geometry.location.lng;
  // const latDelta = details.geometry.viewport.northeast.lat - details.geometry.viewport.southwest.lat;
  // const lngDelta = latDelta * ASPECT_RATIO;

  useEffect(() => {
    if (location.geometry) {
      // not sure how necessary this calc is
      // const latDelta = location.geometry.viewport.northeast.lat - location.geometry.viewport.southwest.lat
      //   setCoords({
      //     latitude: location.geometry.location.lat,
      //     longitude: location.geometry.location.lng,
      //     latitudeDelta: latDelta,
      //     longitudeDelta: latDelta * ASPECT_RATIO
      // })
      setCoords({
        latitude: location.geometry.location.lat,
        longitude: location.geometry.location.lng,
        // latitudeDelta: location.geometry.viewport.southwest.lat,
        // longitudeDelta: location.geometry.viewport.southwest.lng,
      });
    }
    // console.log("location", JSON.stringify(coords, null, 2));
    console.log("location", location);
  }, [location]);

  return (
    <View style={styles.container}>
      {coords && (
        <MapView
          style={styles.map}
          // initialRegion={{
          //   latitude: location.lat,
          //   longitude: location.lng,
          //   latitudeDelta: 0.0922,
          //   longitudeDelta: 0.0421,
          // }}
          region={coords}
        >
          <Marker coordinate={coords} title="title" />
        </MapView>
      )}
    </View>
  );
};

export default GoogleMap;

const styles = StyleSheet.create({
  // container: {
  //   flex: 1
  // },
  map: {
    width: "100%",
    height: 300,
  },
});
