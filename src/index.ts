import { MyCustomCard as AlarmPanelCard } from "./custom-element/alarm-panel-card";
import { printVersion } from "./utils";

// Registering card
customElements.define("alarm-panel-card", AlarmPanelCard);

printVersion();