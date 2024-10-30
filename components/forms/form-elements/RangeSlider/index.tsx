import React, { useCallback, useEffect, useState } from "react";
import RangeSliderRN from "rn-range-slider";
import { View, Text } from "react-native";

import Label from "./Label";
import Notch from "./Notch";
import Rail from "./Rail";
import RailSelected from "./RailSelected";
import Thumb from "./Thumb";

const RangeSlider = ({
  from,
  to,
  step = 2,
  defaultValue,
  onChange,
  disableRange,
}) => {
  // const RangeSlider = () => {
  const [low, setLow] = useState(from);
  const [high, setHigh] = useState(to);

  const renderThumb = useCallback(() => <Thumb />, []);
  const renderRail = useCallback(() => <Rail />, []);
  const renderRailSelected = useCallback(() => <RailSelected />, []);
  const renderLabel = useCallback((newLow) => <Label text={newLow} />, []);
  const renderNotch = useCallback(() => <Notch />, []);

  const handleValueChange = useCallback(
    (newLow, newHigh) => {
      setLow(newLow);
      setHigh(newHigh);
      onChange(newLow, newHigh);
    },
    [setLow, setHigh]
  );

  useEffect(() => {
    console.log("defaultValue", defaultValue);

    if (defaultValue && defaultValue[0]) {
      setLow(defaultValue[0]);
    }
    if (defaultValue && defaultValue[1]) {
      setHigh(defaultValue[1]);
    }
  }, []);

  return (
    <View className=" w-full my-4">
      {/* <View className="bg-red border w-full">
        <View>
          <Text
            style={[
              { fontStyle: "italic" },
              { textAlign: "left", fontSize: 14, color: "#D2D2D2" },
            ]}
          >
            Minimum Age
          </Text>
          <Text
            style={[{ fontWeight: "bold" }, { fontSize: 18, color: "#000000" }]}
          >
            {value}
          </Text>
        </View>
        <View>
          <Text
          // style={[
          //   { fontStyle: "italic" },
          //   { textAlign: "right", fontSize: 14, color: "#D2D2D2" },
          // ]}
          >
            Maximum Age
          </Text>
          <Text
            style={[{ fontWeight: "bold" }, { fontSize: 18, color: "#000000" }]}
          >
            {high}
          </Text>
        </View>
      </View> */}
      <RangeSliderRN
        // style={styles.slider}
        low={low}
        high={high}
        min={from}
        max={to}
        step={step}
        floatingLabel
        renderThumb={renderThumb}
        renderRail={renderRail}
        renderRailSelected={renderRailSelected}
        disableRange={disableRange}
        // renderLabel={renderLabel}
        // renderNotch={renderNotch}
        onValueChanged={handleValueChange}
      />
    </View>
  );
};

export default RangeSlider;
