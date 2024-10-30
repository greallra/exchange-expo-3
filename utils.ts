export function fbTimeObjectToDateObject(fbTimeObject) {
  return fbTimeObject.seconds * 1000 + fbTimeObject.nanoseconds / 1000000;
}
