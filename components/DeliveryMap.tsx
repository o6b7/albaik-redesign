import { LatLng } from '@/constants/delivery';
import { Bike, ChefHat, LocateFixed, MapPin } from 'lucide-react-native';
import { useRef } from 'react';
import { TouchableOpacity, View } from 'react-native';
import MapView, { Marker, Polyline, Region } from 'react-native-maps';

interface DeliveryMapProps {
  isDark: boolean;
  region: Region;
  routeCoords: LatLng[];
  /** Live driver position; marker hidden while null. */
  driver: LatLng | null;
  target: LatLng;
  targetKind: 'restaurant' | 'customer';
  /** Optional secondary marker (e.g. the restaurant during the delivery leg). */
  origin?: LatLng;
  height?: number;
  /** Allow gestures and show a recenter button (driver-side). */
  interactive?: boolean;
}

/** Map showing the driver, the current destination, and the route between them. */
export function DeliveryMap({
  isDark,
  region,
  routeCoords,
  driver,
  target,
  targetKind,
  origin,
  height = 240,
  interactive = false,
}: DeliveryMapProps) {
  const mapRef = useRef<MapView>(null);
  const targetColor = targetKind === 'restaurant' ? '#C0392B' : '#10B981';

  return (
    <View
      style={{
        borderRadius: 20,
        overflow: 'hidden',
        height,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
      }}
    >
      <MapView
        ref={mapRef}
        style={{ flex: 1 }}
        {...(interactive ? { initialRegion: region } : { region })}
        userInterfaceStyle={isDark ? 'dark' : 'light'}
        scrollEnabled={interactive}
        zoomEnabled={interactive}
        pitchEnabled={false}
        rotateEnabled={false}
      >
        {/* Route — soft casing under a crisp stroke */}
        <Polyline
          coordinates={routeCoords}
          strokeColor="rgba(192, 57, 43, 0.22)"
          strokeWidth={9}
          lineCap="round"
          lineJoin="round"
        />
        <Polyline
          coordinates={routeCoords}
          strokeColor="#C0392B"
          strokeWidth={4}
          lineCap="round"
          lineJoin="round"
        />

        {/* Origin (e.g. restaurant while delivering to the customer) */}
        {origin && (
          <Marker coordinate={origin} anchor={{ x: 0.5, y: 0.5 }}>
            <View
              style={{
                width: 26,
                height: 26,
                borderRadius: 13,
                backgroundColor: '#C0392B',
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 2,
                borderColor: '#fff',
                opacity: 0.9,
              }}
            >
              <ChefHat size={12} color="#fff" />
            </View>
          </Marker>
        )}

        {/* Destination */}
        <Marker coordinate={target} anchor={{ x: 0.5, y: 0.5 }}>
          <View
            style={{
              width: 34,
              height: 34,
              borderRadius: 17,
              backgroundColor: targetColor,
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: 2,
              borderColor: '#fff',
            }}
          >
            {targetKind === 'restaurant' ? (
              <ChefHat size={15} color="#fff" />
            ) : (
              <MapPin size={15} color="#fff" />
            )}
          </View>
        </Marker>

        {/* Driver */}
        {driver && (
          <Marker coordinate={driver} anchor={{ x: 0.5, y: 0.5 }}>
            <View
              style={{
                width: 38,
                height: 38,
                borderRadius: 19,
                backgroundColor: '#F59E0B',
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 2,
                borderColor: '#fff',
                shadowColor: '#F59E0B',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.4,
                shadowRadius: 6,
                elevation: 4,
              }}
            >
              <Bike size={17} color="#fff" />
            </View>
          </Marker>
        )}
      </MapView>

      {interactive && (
        <TouchableOpacity
          onPress={() => mapRef.current?.animateToRegion(region, 400)}
          activeOpacity={0.8}
          style={{
            position: 'absolute',
            right: 12,
            bottom: 12,
            width: 38,
            height: 38,
            borderRadius: 19,
            backgroundColor: isDark ? '#2A2A2A' : '#fff',
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.15,
            shadowRadius: 6,
            elevation: 4,
          }}
        >
          <LocateFixed size={18} color={isDark ? '#ccc' : '#333'} />
        </TouchableOpacity>
      )}
    </View>
  );
}
