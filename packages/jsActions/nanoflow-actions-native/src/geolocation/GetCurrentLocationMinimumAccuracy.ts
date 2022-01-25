// This file was generated by Mendix Studio Pro.
//
// WARNING: Only the following code will be retained when actions are regenerated:
// - the code between BEGIN USER CODE and END USER CODE
// Other code you write will be lost the next time you deploy the project.

import { Big } from "big.js";
import { Platform, NativeModules } from "react-native";
import Geolocation, {
    GeolocationError,
    GeolocationOptions,
    GeolocationResponse,
    GeolocationStatic
} from "@react-native-community/geolocation";
import { GeolocationServiceStatic, GeoError, GeoPosition, GeoOptions } from "../../typings/Geolocation";

/**
 * This action retrieves the current geographical position of a user/device with a minimum accuracy as parameter. If a position is not acquired with minimum accuracy within a specific timeout it will retrieve the last most precise location.
 *
 * Since this can compromise privacy, the position is not available unless the user approves it. The web browser will request the permission at the first time the location is requested. When denied by the user it will not prompt a second time.
 *
 * On hybrid and native platforms the permission can be requested with the `RequestLocationPermission` action.
 *
 * Best practices:
 * https://developers.google.com/web/fundamentals/native-hardware/user-location/
 * @param {Big} timeout - The maximum length of time (in milliseconds) the device is allowed to take in order to return a location. If empty, there is no timeout.
 * @param {Big} maximumAge - The maximum age (in milliseconds) of a possible cached position that is acceptable to return. If set to 0, it means that the device cannot use a cached position and must attempt to retrieve the real current position. By default the device will always return a cached position regardless of its age.
 * @param {boolean} highAccuracy - Use a higher accuracy method to determine the current location. Setting this to false saves battery life.
 * @param {Big} minimumAccuracy - The minimum accuracy to be received in meters. Less amount of meters, more precise is the location.
 * @returns {Promise.<MxObject>}
 */
export async function GetCurrentLocationMinimumAccuracy(
    timeout?: Big,
    maximumAge?: Big,
    highAccuracy?: boolean,
    minimumAccuracy?: number
): Promise<mendix.lib.MxObject> {
    // BEGIN USER CODE

    let rnGeolocation: GeolocationServiceStatic | GeolocationStatic;

    if (navigator && navigator.product === "ReactNative") {
        if (NativeModules.RNFusedLocation) {
            const geolocationService = await import("react-native-geolocation-service");
            rnGeolocation = geolocationService.default;
        } else if (NativeModules.RNCGeolocation) {
            rnGeolocation = Geolocation;
        } else {
            return Promise.reject(new Error("Geolocation module couldn't find"));
        }
    } else if (navigator && navigator.geolocation) {
        rnGeolocation = navigator.geolocation;
    } else {
        return Promise.reject(new Error("Navigator couldn't find"));
    }

    return new Promise((resolve, reject) => {
        const options = getOptions();

        // This action is only required while running in PWA or hybrid.
        if (navigator && (!navigator.product || navigator.product !== "ReactNative")) {
            // This ensures the browser will not ignore the maximumAge https://stackoverflow.com/questions/3397585/navigator-geolocation-getcurrentposition-sometimes-works-sometimes-doesnt/31916631#31916631
            rnGeolocation.getCurrentPosition(
                // eslint-disable-next-line @typescript-eslint/no-empty-function
                () => {},
                // eslint-disable-next-line @typescript-eslint/no-empty-function
                () => {},
                {}
            );
        }

        const watchId: number = rnGeolocation.watchPosition(onSuccess, onError, options);
        const timeStart = Date.now();
        let lastAccruedPosition: GeolocationResponse | GeoPosition;

        function createGeolocationObject(position: GeolocationResponse | GeoPosition): void {
            mx.data.create({
                entity: "NanoflowCommons.Geolocation",
                callback: mxObject => resolve(mapPositionToMxObject(mxObject, position)),
                error: () =>
                    reject(new Error("Could not create 'NanoflowCommons.Geolocation' object to store location"))
            });
        }

        function onSuccess(position: GeolocationResponse | GeoPosition): void {
            if (watchId && (!minimumAccuracy || minimumAccuracy >= position.coords.accuracy)) {
                rnGeolocation.clearWatch(watchId);
                createGeolocationObject(position);
            } else {
                if (!lastAccruedPosition || position.coords.accuracy < lastAccruedPosition.coords.accuracy) {
                    lastAccruedPosition = position;
                }
                const timeDiff = Date.now() - timeStart;
                if (!timeout || timeout.lte(timeDiff)) {
                    rnGeolocation.clearWatch(watchId);
                    createGeolocationObject(lastAccruedPosition);
                }
            }
        }

        function onError(error: GeolocationError | GeoError): void {
            return reject(new Error(error.message));
        }

        function getOptions(): GeolocationOptions | GeoOptions {
            let timeoutNumber = timeout && Number(timeout.toString());
            const maximumAgeNumber = maximumAge && Number(maximumAge.toString());

            if (timeoutNumber === undefined && Platform.OS === "ios") {
                timeoutNumber = 30000;
            } else if (timeoutNumber === 0) {
                timeoutNumber = 3600000;
            }

            return {
                timeout: timeoutNumber,
                maximumAge: maximumAgeNumber,
                enableHighAccuracy: highAccuracy
            };
        }

        function mapPositionToMxObject(
            mxObject: mendix.lib.MxObject,
            position: GeolocationResponse | GeoPosition
        ): mendix.lib.MxObject {
            mxObject.set("Timestamp", new Date(position.timestamp));
            mxObject.set("Latitude", new Big(position.coords.latitude.toFixed(8)));
            mxObject.set("Longitude", new Big(position.coords.longitude.toFixed(8)));
            mxObject.set("Accuracy", new Big(position.coords.accuracy.toFixed(8)));
            if (position.coords.altitude != null) {
                mxObject.set("Altitude", new Big(position.coords.altitude.toFixed(8)));
            }
            if (position.coords.altitudeAccuracy != null && position.coords.altitudeAccuracy !== -1) {
                mxObject.set("AltitudeAccuracy", new Big(position.coords.altitudeAccuracy.toFixed(8)));
            }
            if (position.coords.heading != null && position.coords.heading !== -1) {
                mxObject.set("Heading", new Big(position.coords.heading.toFixed(8)));
            }
            if (position.coords.speed != null && position.coords.speed !== -1) {
                mxObject.set("Speed", new Big(position.coords.speed.toFixed(8)));
            }
            return mxObject;
        }
    });

    // END USER CODE
}
