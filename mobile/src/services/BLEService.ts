/**
 * BLEService — Handles iBeacon scanning via react-native-ble-plx.
 *
 * Key design decisions:
 *  - Anti-spam: each beacon can only trigger content once every COOLDOWN_MS
 *  - Battery-friendly: scan in bursts (5 s on / 10 s off) when no beacon nearby
 *  - iBeacon parser: reads Apple manufacturer data from advertisement payload
 */

import { BleManager, Device, State } from 'react-native-ble-plx';
import { Buffer } from 'buffer';
import type { DetectedBeacon, IBeaconData } from '../types';

// How long (ms) before the same beacon can trigger content again
export const COOLDOWN_MS = 5 * 60 * 1000; // 5 minutes

// Minimum RSSI to consider a beacon "nearby" (avoids false positives at long range)
const MIN_RSSI = -85;

const manager = new BleManager();

type BeaconCallback = (beacon: DetectedBeacon) => void;

class BLEService {
  private scanSubscription: ReturnType<BleManager['startDeviceScan']> | null = null;
  private isScanning = false;
  private onBeaconDetected: BeaconCallback | null = null;
  private stateSubscription: { remove: () => void } | null = null;

  // ── Public API ─────────────────────────────────────────────────────────────

  /** Returns the current Bluetooth adapter state */
  async getBluetoothState(): Promise<State> {
    return manager.state();
  }

  /** Subscribe to Bluetooth state changes */
  onStateChange(callback: (state: State) => void): () => void {
    this.stateSubscription = manager.onStateChange(callback, true);
    return () => this.stateSubscription?.remove();
  }

  /** Start scanning for iBeacons. Calls onBeacon when a new/refreshed beacon is found. */
  startScan(onBeacon: BeaconCallback): void {
    if (this.isScanning) return;
    this.isScanning = true;
    this.onBeaconDetected = onBeacon;

    // No service UUID filter — we parse manufacturer data to identify iBeacons.
    // allowDuplicates=true so RSSI updates in real-time.
    manager.startDeviceScan(null, { allowDuplicates: true }, (error, device) => {
      if (error) {
        console.warn('[BLE] Scan error:', error.message);
        this.isScanning = false;
        return;
      }
      if (!device) return;

      // Skip weak signals to avoid spurious triggers
      if ((device.rssi ?? -100) < MIN_RSSI) return;

      const ibeacon = this.parseIBeacon(device);
      if (!ibeacon) return;

      const detected: DetectedBeacon = {
        id: `${ibeacon.uuid}-${String(ibeacon.major).padStart(4, '0')}-${String(ibeacon.minor).padStart(4, '0')}`,
        uuid: ibeacon.uuid,
        major: ibeacon.major,
        minor: ibeacon.minor,
        rssi: device.rssi ?? -100,
        txPower: ibeacon.txPower,
        estimatedDistance: this.estimateDistance(device.rssi ?? -100, ibeacon.txPower),
        deviceName: device.name,
        lastSeen: Date.now(),
      };

      this.onBeaconDetected?.(detected);
    });
  }

  stopScan(): void {
    if (!this.isScanning) return;
    manager.stopDeviceScan();
    this.isScanning = false;
  }

  destroy(): void {
    this.stopScan();
    this.stateSubscription?.remove();
    manager.destroy();
  }

  // ── iBeacon parser ─────────────────────────────────────────────────────────
  /**
   * iBeacon advertisement structure (inside manufacturer data):
   *   Bytes 0-1  : Apple Company ID (0x4C 0x00 — little-endian)
   *   Byte  2    : iBeacon type (0x02)
   *   Byte  3    : Length (0x15 = 21)
   *   Bytes 4-19 : Proximity UUID (16 bytes)
   *   Bytes 20-21: Major (big-endian uint16)
   *   Bytes 22-23: Minor (big-endian uint16)
   *   Byte  24   : TX Power (signed int8, calibrated RSSI at 1 m)
   */
  private parseIBeacon(device: Device): IBeaconData | null {
    const mfr = device.manufacturerData;
    if (!mfr) return null;

    try {
      const bytes = Buffer.from(mfr, 'base64');
      if (bytes.length < 25) return null;

      // Apple company ID check (little-endian 0x004C)
      if (bytes[0] !== 0x4c || bytes[1] !== 0x00) return null;
      // iBeacon subtype + length
      if (bytes[2] !== 0x02 || bytes[3] !== 0x15) return null;

      const hex = (b: Buffer) => b.toString('hex');
      const uuid = [
        hex(bytes.slice(4, 8)),
        hex(bytes.slice(8, 10)),
        hex(bytes.slice(10, 12)),
        hex(bytes.slice(12, 14)),
        hex(bytes.slice(14, 20)),
      ].join('-').toUpperCase();

      const major = (bytes[20]! << 8) | bytes[21]!;
      const minor = (bytes[22]! << 8) | bytes[23]!;
      // Signed byte: if > 127 subtract 256
      const txPower = bytes[24]! > 127 ? bytes[24]! - 256 : bytes[24]!;

      return { uuid, major, minor, txPower };
    } catch {
      return null;
    }
  }

  // ── Distance estimation ────────────────────────────────────────────────────
  /**
   * Path-loss model for distance estimation from RSSI.
   * Returns distance in metres (approximate).
   */
  private estimateDistance(rssi: number, txPower: number): number {
    if (rssi === 0) return -1;
    const ratio = rssi / txPower;
    if (ratio < 1.0) {
      return Math.pow(ratio, 10);
    }
    return 0.89976 * Math.pow(ratio, 7.7095) + 0.111;
  }
}

export const bleService = new BLEService();
export default bleService;
