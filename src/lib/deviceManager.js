import { base44 } from '@/api/base44Client';

// Device limits per subscription tier
export const DEVICE_LIMITS = {
  free: 1,
  trial: 1,
  asas: 1,
  standard: 2,
  premium: 2,
  keluarga: 4,
  pro: 4,
};

// Generate a stable device fingerprint based on browser/OS info
export function getDeviceFingerprint() {
  const nav = window.navigator;
  const screen = window.screen;
  const raw = [
    nav.userAgent,
    nav.language,
    screen.colorDepth,
    screen.width + 'x' + screen.height,
    new Date().getTimezoneOffset(),
  ].join('|');

  // Simple hash
  let hash = 0;
  for (let i = 0; i < raw.length; i++) {
    const char = raw.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash).toString(36);
}

// Generate human-readable device name
export function getDeviceName() {
  const ua = window.navigator.userAgent;
  let browser = 'Browser';
  let os = 'Device';

  if (ua.includes('Chrome') && !ua.includes('Edg')) browser = 'Chrome';
  else if (ua.includes('Firefox')) browser = 'Firefox';
  else if (ua.includes('Safari') && !ua.includes('Chrome')) browser = 'Safari';
  else if (ua.includes('Edg')) browser = 'Edge';

  if (ua.includes('Windows')) os = 'Windows';
  else if (ua.includes('Mac')) os = 'Mac';
  else if (ua.includes('Android')) os = 'Android';
  else if (ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS';
  else if (ua.includes('Linux')) os = 'Linux';

  return `${browser} on ${os}`;
}

// Check if current device is registered, register if within limit
// Returns: { allowed: boolean, devices: [], limitReached: boolean }
export async function checkAndRegisterDevice(userEmail, tier) {
  const deviceId = getDeviceFingerprint();
  const limit = DEVICE_LIMITS[tier] || 1;

  const devices = await base44.entities.RegisteredDevice.filter({ userEmail });

  // Check if already registered
  const existing = devices.find(d => d.deviceId === deviceId);
  if (existing) {
    // Update lastSeen
    await base44.entities.RegisteredDevice.update(existing.id, {
      lastSeen: new Date().toISOString(),
    });
    return { allowed: true, devices, limitReached: false, deviceId };
  }

  // Not registered — check if limit reached
  if (devices.length >= limit) {
    return { allowed: false, devices, limitReached: true, deviceId };
  }

  // Register new device
  await base44.entities.RegisteredDevice.create({
    userEmail,
    deviceId,
    deviceName: getDeviceName(),
    lastSeen: new Date().toISOString(),
  });

  const updatedDevices = await base44.entities.RegisteredDevice.filter({ userEmail });
  return { allowed: true, devices: updatedDevices, limitReached: false, deviceId };
}

// recordId = the entity record's id (from RegisteredDevice.id), NOT the deviceId fingerprint
export async function removeDevice(recordId) {
  await base44.entities.RegisteredDevice.delete(recordId);
}

export async function getUserDevices(userEmail) {
  return base44.entities.RegisteredDevice.filter({ userEmail });
}