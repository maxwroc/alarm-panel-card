import { HomeAssistant } from "../ha-types";
import { html, LitElement } from "../lit-element";
import { ICardConfig } from "../types";
import styles from "./card-styles";

import PatternLock from "../lib/PatternLock";

/**
 * Main card class definition
 */
export class MyCustomCard extends LitElement {

    private cardTitle: string = "Card header";

    /**
     * CSS for the card
     */
    static get styles() {
        return styles;
    }

    /**
     * List of properties which trigger update when changed
     */
    static get properties() {
        return {
            cardTitle: { type: String },
        };
    }

    /**
     * Called on every hass update
     */
    set hass(hass: HomeAssistant) {
    }

    /**
     * Called every time when entity config is updated
     * @param config Card configuration (yaml converted to JSON)
     */
    setConfig(config: ICardConfig) {
        this.cardTitle = config.title;
    }

    /**
     * Renders the card when the update is requested (when any of the properties are changed)
     */
    render() {
        setTimeout(() => {
            const lock = new PatternLock("#lock", {
                document: this.shadowRoot,
                onPattern: pattern => {
                    return confirm("Is pattern fine: " + pattern)
                }
            });
        }, 2000)
        return html`
        <ha-card>
            <svg class="patternlock" id="lock" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <g class="lock-actives"></g>
                <g class="lock-lines"></g>
                <g class="lock-dots">
                    <circle cx="20" cy="20" r="5"/>
                    <circle cx="50" cy="20" r="2"/>
                    <circle cx="80" cy="20" r="2"/>
            
                    <circle cx="20" cy="50" r="2"/>
                    <circle cx="50" cy="50" r="2"/>
                    <circle cx="80" cy="50" r="2"/>
            
                    <circle cx="20" cy="80" r="2"/>
                    <circle cx="50" cy="80" r="2"/>
                    <circle cx="80" cy="80" r="2"/>
                </g>
            </svg>
        </ha-card>
        `;
    }
}