import AsyncStorage from "@react-native-async-storage/async-storage";
import useLogger from "../hooks/useLogger";

interface RouteSettings {
  api: string;
  cdn: string;
  invite: string;
  template: string;
  gift: string;
  scheduledEvent: string;
  gateway: string;
}

export const DefaultRouteSettings: RouteSettings = {
  api: `https://fosscord-server.visibleillusion.repl.co/api`,
  cdn: "https://fosscord-cdn.visibleillusion.repl.co",
  invite: "https://fosscord-server.visibleillusion.repl.co/invite",
  template: "https://fosscord-server.visibleillusion.repl.co/template",
  gift: "https://fosscord-server.visibleillusion.repl.co/gift",
  scheduledEvent: "https://fosscord-server.visibleillusion.repl.co/events",
  gateway: "wss://fosscord-gateway.visibleillusion.repl.co",
};

export const Globals: {
  logger: {
    debug: (...args: unknown[]) => void;
    info: (...args: unknown[]) => void;
    warn: (...args: unknown[]) => void;
    error: (...args: unknown[]) => void;
  };
  init: () => Promise<void>;
  save: () => Promise<void>;
  routeSettings: RouteSettings;
} = {
  logger: useLogger("Globals"),
  init: async () => {
    return new Promise((resolve, reject) => {
      Globals.logger.info("Initializing Globals");
      AsyncStorage.getItem("routeSettings")
        .then((settings) => {
          if (!settings) return resolve();
          Globals.routeSettings = JSON.parse(settings);
          Globals.logger.info("Loaded route settings from storage");
          resolve();
        })
        .catch((e) => {
          Globals.logger.error(
            `Error loading route settings from storage: ${e}`
          );
          reject();
        });
    });
  },
  save: async () => {
    return new Promise((resolve, reject) => {
      AsyncStorage.setItem(
        "routeSettings",
        JSON.stringify(Globals.routeSettings)
      )
        .then(() => {
          resolve();
        })
        .catch((e) => {
          Globals.logger.error(`Error saving route settings to storage: ${e}`);
          reject();
        });
    });
  },
  routeSettings: DefaultRouteSettings,
};
