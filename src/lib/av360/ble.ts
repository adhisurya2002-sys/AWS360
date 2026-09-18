// Web Bluetooth service for AV360_PRO + mock fallback.
// Public API is the same in both modes so the UI doesn't care.

import { DEVICE_NAME, NORDIC_UART, type Animal, type ConnState } from "./types";
import { LineBufferParser, type ParsedFields } from "./parser";

export type Listener = (fields: ParsedFields) => void;
export type StateListener = (state: ConnState, info?: string) => void;

export interface ScanResult {
  id: string;
  name: string;
  rssi?: number;
}

export interface BleAdapter {
  readonly mode: "web-bluetooth" | "mock";
  isSupported(): boolean;
  requestDevice(): Promise<ScanResult | null>;
  connect(): Promise<void>;
  disconnect(userInitiated?: boolean): Promise<void>;
  writeAnimal(animal: Animal): Promise<void>;
  onData(listener: Listener): () => void;
  onState(listener: StateListener): () => void;
  getState(): ConnState;
  getDeviceName(): string | null;
}

abstract class BaseAdapter implements BleAdapter {
  abstract readonly mode: "web-bluetooth" | "mock";
  protected dataListeners = new Set<Listener>();
  protected stateListeners = new Set<StateListener>();
  protected state: ConnState = "idle";
  protected deviceName: string | null = null;

  abstract isSupported(): boolean;
  abstract requestDevice(): Promise<ScanResult | null>;
  abstract connect(): Promise<void>;
  abstract disconnect(userInitiated?: boolean): Promise<void>;
  abstract writeAnimal(animal: Animal): Promise<void>;

  onData(listener: Listener): () => void {
    this.dataListeners.add(listener);
    return () => this.dataListeners.delete(listener);
  }
  onState(listener: StateListener): () => void {
    this.stateListeners.add(listener);
    listener(this.state);
    return () => this.stateListeners.delete(listener);
  }
  getState() {
    return this.state;
  }
  getDeviceName() {
    return this.deviceName;
  }
  protected emitData(f: ParsedFields) {
    if (Object.keys(f).length === 0) return;
    this.dataListeners.forEach((l) => l(f));
  }
  protected setState(s: ConnState, info?: string) {
    this.state = s;
    this.stateListeners.forEach((l) => l(s, info));
  }
}

// ---------- Web Bluetooth adapter ----------

class WebBluetoothAdapter extends BaseAdapter {
  readonly mode = "web-bluetooth" as const;
  private device: BluetoothDevice | null = null;
  private server: BluetoothRemoteGATTServer | null = null;
  private txChar: BluetoothRemoteGATTCharacteristic | null = null;
  private rxChar: BluetoothRemoteGATTCharacteristic | null = null;
  private parser = new LineBufferParser();
  private userDisconnected = false;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;

  isSupported() {
    return typeof navigator !== "undefined" && !!(navigator as Navigator).bluetooth;
  }

  async requestDevice(): Promise<ScanResult | null> {
    if (!this.isSupported()) throw new Error("Web Bluetooth not supported on this browser");
    this.setState("scanning");
    try {
      const device = await navigator.bluetooth!.requestDevice({
        // Filter to AV360_PRO when possible; allow prefix as a fallback.
        filters: [{ namePrefix: DEVICE_NAME }],
        optionalServices: [NORDIC_UART.service],
      });
      this.device = device;
      const name = device.name ?? DEVICE_NAME;
      this.deviceName = name;
      device.addEventListener("gattserverdisconnected", this.handleDisconnected);
      this.setState("idle");
      return { id: device.id, name };
    } catch (e) {
      this.setState("idle", (e as Error).message);
      return null;
    }
  }

  async connect() {
    if (!this.device) throw new Error("No device selected — scan first");
    this.userDisconnected = false;
    this.setState("connecting");
    const server = await this.device.gatt!.connect();
    this.server = server;
    const service = await server.getPrimaryService(NORDIC_UART.service);
    this.txChar = await service.getCharacteristic(NORDIC_UART.tx);
    this.rxChar = await service.getCharacteristic(NORDIC_UART.rx);
    this.txChar.addEventListener("characteristicvaluechanged", this.handleNotify);
    await this.txChar.startNotifications();
    this.parser.reset();
    this.setState("connected");
  }

  async disconnect(userInitiated = true) {
    this.userDisconnected = userInitiated;
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    try {
      if (this.txChar) {
        try {
          await this.txChar.stopNotifications();
        } catch {
          /* ignore */
        }
        this.txChar.removeEventListener("characteristicvaluechanged", this.handleNotify);
      }
      if (this.server?.connected) this.server.disconnect();
    } finally {
      this.setState("disconnected");
    }
  }

  async writeAnimal(animal: Animal) {
    if (!this.rxChar) throw new Error("Not connected");
    const bytes = new TextEncoder().encode(`${animal}\n`);
    if (this.rxChar.writeValueWithoutResponse) {
      await this.rxChar.writeValueWithoutResponse(bytes);
    } else {
      await this.rxChar.writeValue(bytes);
    }
  }

  private handleNotify = (event: Event) => {
    const target = event.target as BluetoothRemoteGATTCharacteristic;
    const value = target.value;
    if (!value) return;
    const u8 = new Uint8Array(value.buffer as ArrayBuffer, value.byteOffset, value.byteLength);
    const fields = this.parser.feedBytes(u8);
    this.emitData(fields);
  };

  private handleDisconnected = () => {
    this.setState(this.userDisconnected ? "disconnected" : "reconnecting");
    if (this.userDisconnected) return;
    // Auto-reconnect every 5s.
    this.reconnectTimer = setTimeout(() => this.tryReconnect(), 5000);
  };

  private tryReconnect = async () => {
    if (this.userDisconnected || !this.device) return;
    try {
      await this.connect();
    } catch {
      this.setState("reconnecting");
      this.reconnectTimer = setTimeout(this.tryReconnect, 5000);
    }
  };
}

// ---------- Mock adapter (fallback for unsupported browsers / demo) ----------

class MockAdapter extends BaseAdapter {
  readonly mode = "mock" as const;
  private interval: ReturnType<typeof setInterval> | null = null;
  private currentAnimal: Animal = "DOG";
  private t = 0;

  isSupported() {
    return true;
  }

  async requestDevice(): Promise<ScanResult | null> {
    this.setState("scanning");
    await new Promise((r) => setTimeout(r, 600));
    this.deviceName = `${DEVICE_NAME} (Simulated)`;
    this.setState("idle");
    return { id: "mock-av360", name: this.deviceName, rssi: -55 };
  }

  async connect() {
    this.setState("connecting");
    await new Promise((r) => setTimeout(r, 400));
    this.setState("connected");
    this.start();
  }

  async disconnect() {
    this.stop();
    this.setState("disconnected");
  }

  async writeAnimal(animal: Animal) {
    this.currentAnimal = animal;
    // echo back so UI updates
    this.emitData({ animal });
  }

  private start() {
    this.stop();
    this.t = 0;
    this.interval = setInterval(() => {
      this.t += 1;
      const baselines: Record<Animal, { hr: number; spo2: number; temp: number }> = {
        DOG: { hr: 95, spo2: 97, temp: 38.5 },
        CAT: { hr: 130, spo2: 97, temp: 38.6 },
        COW: { hr: 65, spo2: 96, temp: 38.7 },
        GOAT: { hr: 80, spo2: 97, temp: 39.0 },
      };
      const b = baselines[this.currentAnimal];
      // Subtle jitter, occasional alert spike for demo realism.
      const jitter = (amp: number) => (Math.random() - 0.5) * amp;
      const spike = this.t % 45 === 0;
      const hr = Math.round(b.hr + jitter(8) + (spike ? 60 : 0));
      const spo2 = Math.max(80, Math.round(b.spo2 + jitter(2) - (spike ? 12 : 0)));
      const temp = +(b.temp + jitter(0.4)).toFixed(1);
      this.emitData({ animal: this.currentAnimal, hr, spo2, temp });
    }, 1000);
  }
  private stop() {
    if (this.interval) clearInterval(this.interval);
    this.interval = null;
  }
}

// ---------- Singleton resolver ----------

let _adapter: BleAdapter | null = null;

export function getBleAdapter(forceMock = false): BleAdapter {
  if (_adapter) return _adapter;
  if (typeof window === "undefined") {
    _adapter = new MockAdapter();
    return _adapter;
  }
  const supported =
    !forceMock && typeof navigator !== "undefined" && !!(navigator as Navigator).bluetooth;
  _adapter = supported ? new WebBluetoothAdapter() : new MockAdapter();
  return _adapter;
}

export function resetBleAdapter() {
  _adapter = null;
}
