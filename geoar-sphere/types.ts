export enum GeolocationStatus {
  IDLE = 'IDLE',
  LOCATING = 'LOCATING',
  READY = 'READY',
  ERROR = 'ERROR'
}

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface Vector3 {
  x: number;
  y: number;
  z: number;
}