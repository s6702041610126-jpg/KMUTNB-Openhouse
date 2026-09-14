import React, { createContext, useState, useEffect, useContext } from 'react';
import * as Location from 'expo-location';
import { FACULTIES } from '../constants/faculties';
import { AVATARS } from '../constants/avatars';
import { REWARDS } from '../constants/missions';

export const AppContext = createContext();

// Helper to calculate distance in meters (Haversine formula)
export function getDistanceMeters(lat1, lon1, lat2, lon2) {
  const R = 6371e3;
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

// Generate initial placeholder steps (will be replaced by OSRM real steps)
export function generateTurnByTurnSteps(userLat, userLng, faculty, activity = null) {
  const dist = getDistanceMeters(userLat, userLng, faculty.latitude, faculty.longitude);
  const timeMin = Math.max(1, Math.round(dist / 75));

  const steps = [
    {
      icon: '🚶',
      instruction: `Start navigating to ${faculty.name}`,
      distance: Math.round(dist * 0.4),
    },
    {
      icon: '↗️',
      instruction: `Heading into ${faculty.building}`,
      distance: Math.round(dist * 0.4),
    },
    {
      icon: activity ? '🚪' : '🏁',
      instruction: activity
        ? `Enter ${activity.room} to join "${activity.title}"`
        : `Arrived at ${faculty.name}!`,
      distance: Math.round(dist * 0.2),
    },
  ];

  return {
    facultyId: faculty.id,
    facultyName: faculty.name,
    building: faculty.building,
    color: faculty.color,
    latitude: faculty.latitude,
    longitude: faculty.longitude,
    activityId: activity ? activity.id : null,
    activityTitle: activity ? activity.title : null,
    activityRoom: activity ? activity.room : null,
    activityXp: activity ? activity.xp : 10,
    totalDistance: dist,
    initialTotalDistance: dist, // kept for step progress calc
    totalTimeMin: timeMin,
    steps,
    currentStepIndex: 0,
    isArrived: dist < 15,
  };
}

export const AppProvider = ({ children }) => {
  // ── User Profile ──────────────────────────────────────────────────────────
  const [userProfile, setUserProfile] = useState({
    name: 'KMUTNB Explorer',
    school: 'KMUTNB Demonstration School',
    avatarId: 'gear-bot',
    isRegistered: false,
    role: 'student',
  });

  // ── Location ──────────────────────────────────────────────────────────────
  const KMUTNB_DEFAULT_LOCATION = {
    latitude: 13.81935,
    longitude: 100.51430,
    heading: 0,
    accuracy: 5,
  };

  const [locationMode, setLocationMode] = useState('auto');
  const [userLocation, setUserLocation] = useState(KMUTNB_DEFAULT_LOCATION);

  // ── Navigation ────────────────────────────────────────────────────────────
  const [activeNavigator, setActiveNavigator] = useState(null);
  const [mapViewMode, setMapViewMode] = useState('navigator');

  // ── Gamification ──────────────────────────────────────────────────────────
  const [completedActivities, setCompletedActivities] = useState(['act-ced-1']);
  const [visitedFaculties, setVisitedFaculties] = useState(['industrial-ed']);
  const [earnedXP, setEarnedXP] = useState(25);
  const [redeemedRewards, setRedeemedRewards] = useState([]);

  // ── UI State ──────────────────────────────────────────────────────────────
  const [selectedFacultyModal, setSelectedFacultyModal] = useState(null);
  const [isQRScannerOpen, setIsQRScannerOpen] = useState(false);
  const [isCertificateOpen, setIsCertificateOpen] = useState(false);
  const [pendingStaffScan, setPendingStaffScan] = useState(null);
  const [staffSession, setStaffSession] = useState(null); // { facultyId, facultyCode, facultyName, facultyColor, facultyBadge }

  // ── GPS Tracking ──────────────────────────────────────────────────────────
  // Fetch a single high-accuracy GPS fix
  const refreshCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
          mayShowUserSettingsDialog: true,
        });
        if (location?.coords) {
          const pos = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            heading: location.coords.heading || 0,
            accuracy: location.coords.accuracy || 1,
          };
          setUserLocation(pos);
          return pos;
        }
      }
    } catch (err) {
      console.log('refreshCurrentLocation error:', err);
    }
    return null;
  };

  const resetToCampusLocation = () => {
    setLocationMode('campus');
    setUserLocation(KMUTNB_DEFAULT_LOCATION);
  };

  const setLocationModeAuto = () => {
    setLocationMode('auto');
    // refreshCurrentLocation is defined above, safe to call
    refreshCurrentLocation();
  };

  // Continuous GPS watch — only active when locationMode === 'auto'
  useEffect(() => {
    if (locationMode !== 'auto') return;

    let subscription;
    let watchId;

    const startTracking = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') throw new Error('Permission denied');

        // Immediate single fix
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
          mayShowUserSettingsDialog: true,
        });
        if (location?.coords) {
          setUserLocation({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            heading: location.coords.heading || 0,
            accuracy: location.coords.accuracy || 1,
          });
        }

        // Continuous watch
        subscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.High,
            distanceInterval: 1,   // update every 1 metre moved
            timeInterval: 1000,    // or every 1 second
          },
          (loc) => {
            if (loc?.coords) {
              setUserLocation({
                latitude: loc.coords.latitude,
                longitude: loc.coords.longitude,
                heading: loc.coords.heading || 0,
                accuracy: loc.coords.accuracy || 1,
              });
            }
          }
        );
      } catch (err) {
        console.log('Location tracking error (Expo):', err.message);
        // HTML5 fallback (web/simulator)
        if (typeof navigator !== 'undefined' && navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              if (pos?.coords) {
                setUserLocation({
                  latitude: pos.coords.latitude,
                  longitude: pos.coords.longitude,
                  heading: pos.coords.heading || 0,
                  accuracy: pos.coords.accuracy || 1,
                });
              }
            },
            null,
            { enableHighAccuracy: true }
          );
          watchId = navigator.geolocation.watchPosition(
            (pos) => {
              if (pos?.coords) {
                setUserLocation({
                  latitude: pos.coords.latitude,
                  longitude: pos.coords.longitude,
                  heading: pos.coords.heading || 0,
                  accuracy: pos.coords.accuracy || 1,
                });
              }
            },
            (e) => console.log('HTML5 geo watch error:', e),
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
          );
        }
      }
    };

    startTracking();

    return () => {
      subscription?.remove();
      if (typeof navigator !== 'undefined' && navigator.geolocation && watchId !== undefined) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [locationMode]);

  // ── Navigator distance/arrival updater ───────────────────────────────────
  // Updates ONLY distance, time, isArrived, and currentStepIndex.
  // Does NOT touch `steps` — those come from OSRM via updateNavigatorRoute().
  useEffect(() => {
    if (!activeNavigator) return;

    const remainingDist = getDistanceMeters(
      userLocation.latitude,
      userLocation.longitude,
      activeNavigator.latitude,
      activeNavigator.longitude
    );

    const remainingTime = Math.max(1, Math.round(remainingDist / 75));
    const isArrived = remainingDist <= 20;

    // Step progress based on total steps and remaining ratio
    const totalSteps = activeNavigator.steps.length;
    const initDist = activeNavigator.initialTotalDistance || activeNavigator.totalDistance;
    const ratio = initDist > 0 ? 1 - remainingDist / initDist : 0;
    const stepIndex = Math.min(
      Math.floor(ratio * totalSteps),
      totalSteps - 1
    );

    setActiveNavigator((prev) => {
      if (!prev) return null;
      // Skip update if nothing meaningful changed (avoids infinite render loop)
      if (
        prev.totalDistance === remainingDist &&
        prev.currentStepIndex === stepIndex &&
        prev.isArrived === isArrived
      ) return prev;
      return {
        ...prev,
        totalDistance: remainingDist,
        totalTimeMin: remainingTime,
        currentStepIndex: stepIndex,
        isArrived,
      };
    });

    // Auto stamp on arrival
    if (isArrived && activeNavigator.facultyId) {
      checkInFacultyStamp(activeNavigator.facultyId);
    }
  }, [userLocation]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Profile ───────────────────────────────────────────────────────────────
  const registerUser = (name, school, avatarId) => {
    setUserProfile({
      name: name.trim() || 'KMUTNB Explorer',
      school: school.trim() || 'High School Student',
      avatarId: avatarId || 'gear-bot',
      isRegistered: true,
      role: 'student',
    });
  };

  const toggleStaffMode = () => {
    setUserProfile((prev) => ({
      ...prev,
      role: prev.role === 'student' ? 'staff' : 'student',
    }));
  };

  // ── Navigation ────────────────────────────────────────────────────────────
  const startNavigation = (faculty, activity = null) => {
    const nav = generateTurnByTurnSteps(
      userLocation.latitude,
      userLocation.longitude,
      faculty,
      activity
    );
    setActiveNavigator(nav);
    setMapViewMode('navigator');
  };

  const clearNavigation = () => {
    setActiveNavigator(null);
  };

  // Called by InAppMapView when OSRM returns real route data
  const updateNavigatorRoute = (routeData) => {
    if (!routeData) return;
    setActiveNavigator((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        totalDistance: routeData.totalDistance ?? prev.totalDistance,
        initialTotalDistance: routeData.totalDistance ?? prev.initialTotalDistance,
        totalTimeMin: routeData.totalTimeMin ?? prev.totalTimeMin,
        steps:
          routeData.steps && routeData.steps.length > 0
            ? routeData.steps
            : prev.steps,
        currentStepIndex: 0,
      };
    });
  };

  // ── Gamification ──────────────────────────────────────────────────────────
  const checkInFacultyStamp = (facultyId) => {
    setVisitedFaculties((prev) =>
      prev.includes(facultyId) ? prev : [...prev, facultyId]
    );
  };

  const checkInActivity = (facultyId, activityId, xpAmount = 10) => {
    if (!completedActivities.includes(activityId)) {
      setCompletedActivities((prev) => [...prev, activityId]);
      setEarnedXP((prev) => prev + xpAmount);
    }
    checkInFacultyStamp(facultyId);
  };

  const redeemReward = (rewardId) => {
    const reward = REWARDS.find((r) => r.id === rewardId);
    if (!reward) return { success: false, message: 'Reward not found' };
    if (earnedXP < reward.costXP)
      return { success: false, message: `Not enough XP (need ${reward.costXP} XP)` };
    if (reward.requiredFaculties > visitedFaculties.length)
      return { success: false, message: `Need stamps from ${reward.requiredFaculties} faculties first` };

    const token = 'KMUTNB-' + Math.random().toString(36).substring(2, 9).toUpperCase();
    setRedeemedRewards((prev) => [
      ...prev,
      {
        rewardId,
        rewardTitle: reward.title,
        token,
        status: 'pending',
        date: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
    setEarnedXP((prev) => prev - reward.costXP);
    return { success: true, token, message: 'Reward QR generated successfully!' };
  };

  const confirmStaffAction = (scanData) => {
    if (scanData.type === 'STUDENT_ACTIVITY') {
      checkInActivity(scanData.facultyId, scanData.activityId, scanData.xp || 10);
      return { success: true, message: `Approved! Activity ${scanData.activityTitle} recorded` };
    }
    if (scanData.type === 'REWARD_TOKEN') {
      setRedeemedRewards((prev) =>
        prev.map((r) => (r.token === scanData.token ? { ...r, status: 'redeemed' } : r))
      );
      return { success: true, message: `Confirmed delivery of reward "${scanData.rewardTitle}"` };
    }
    return { success: false, message: 'Invalid QR Code data' };
  };

  const selectedAvatar = AVATARS.find((a) => a.id === userProfile.avatarId) || AVATARS[0];

  return (
    <AppContext.Provider
      value={{
        // Profile
        userProfile,
        selectedAvatar,
        registerUser,
        toggleStaffMode,
        // Location
        userLocation,
        setUserLocation,
        locationMode,
        setLocationModeAuto,
        resetToCampusLocation,
        refreshCurrentLocation,
        // Navigation
        activeNavigator,
        startNavigation,
        clearNavigation,
        updateNavigatorRoute,
        mapViewMode,
        setMapViewMode,
        // Gamification
        completedActivities,
        visitedFaculties,
        earnedXP,
        redeemedRewards,
        checkInActivity,
        checkInFacultyStamp,
        redeemReward,
        confirmStaffAction,
        // UI
        selectedFacultyModal,
        setSelectedFacultyModal,
        isQRScannerOpen,
        setIsQRScannerOpen,
        isCertificateOpen,
        setIsCertificateOpen,
        pendingStaffScan,
        setPendingStaffScan,
        staffSession,
        setStaffSession,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);