import { EARTH_RADIUS_METERS } from '../constants';
import { Vector3 } from '../types';

/**
 * Converts degrees to radians
 */
export const toRad = (degrees: number): number => {
  return degrees * (Math.PI / 180);
};

/**
 * Calculates the distance in meters between two coordinates using Haversine formula
 */
export const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_METERS * c;
};

/**
 * Calculates the cartesian offset (x, z) in meters of target relative to source.
 * Assumes a local tangent plane approximation which is sufficient for visual range AR.
 * 
 * Coordinate System (Three.js standard):
 * +X = East
 * -Z = North
 * +Y = Up
 */
export const calculateOffset = (sourceLat: number, sourceLon: number, targetLat: number, targetLon: number): Vector3 => {
  const lat1Rad = toRad(sourceLat);
  const lat2Rad = toRad(targetLat);
  const latDiffRad = toRad(targetLat - sourceLat);
  const lonDiffRad = toRad(targetLon - sourceLon);

  // North-South distance (along meridian)
  // This corresponds to -Z in Three.js if looking North
  const northOffset = EARTH_RADIUS_METERS * latDiffRad;

  // East-West distance (along parallel)
  // This corresponds to +X in Three.js
  const eastOffset = EARTH_RADIUS_METERS * lonDiffRad * Math.cos(lat1Rad);

  return {
    x: eastOffset,
    y: 0, // Altitude handled separately
    z: -northOffset // In Three.js, negative Z is often "forward" or North in standard mapping
  };
};