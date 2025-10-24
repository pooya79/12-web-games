// Simple page management system for the Tower Defense game

export type PageName = "menu" | "game" | "tiles" | "settings";

class PageManager {
    private currentPage: PageName = "menu";
    private pages: Map<PageName, HTMLElement>;
    private onPageChangeCallbacks: Map<PageName, (() => void)[]> = new Map();

    constructor() {
        this.pages = new Map([
            ["menu", document.getElementById("menu-page")!],
            ["game", document.getElementById("game-page")!],
            ["tiles", document.getElementById("tiles-page")!],
            ["settings", document.getElementById("settings-page")!],
        ]);

        // Initialize callbacks map
        for (const pageName of this.pages.keys()) {
            this.onPageChangeCallbacks.set(pageName, []);
        }
    }

    /**
     * Switch to a different page
     */
    showPage(pageName: PageName): void {
        // Hide current page
        const currentPageElement = this.pages.get(this.currentPage);
        if (currentPageElement) {
            currentPageElement.classList.add("hidden");
        }

        // Show new page
        const newPageElement = this.pages.get(pageName);
        if (newPageElement) {
            newPageElement.classList.remove("hidden");
            this.currentPage = pageName;

            // Trigger callbacks for this page
            const callbacks = this.onPageChangeCallbacks.get(pageName) || [];
            callbacks.forEach((callback) => callback());
        } else {
            console.error(`Page "${pageName}" not found`);
        }
    }

    /**
     * Get the current active page
     */
    getCurrentPage(): PageName {
        return this.currentPage;
    }

    /**
     * Register a callback to be called when switching to a specific page
     */
    onPageChange(pageName: PageName, callback: () => void): void {
        const callbacks = this.onPageChangeCallbacks.get(pageName);
        if (callbacks) {
            callbacks.push(callback);
        }
    }

    /**
     * Set up navigation buttons
     */
    setupNavigation(): void {
        // Menu page buttons
        document
            .getElementById("start-game-btn")
            ?.addEventListener("click", () => {
                this.showPage("game");
            });

        document
            .getElementById("view-tiles-btn")
            ?.addEventListener("click", () => {
                this.showPage("tiles");
            });

        document
            .getElementById("settings-btn")
            ?.addEventListener("click", () => {
                this.showPage("settings");
            });

        // Back to menu buttons
        document
            .getElementById("back-to-menu-btn")
            ?.addEventListener("click", () => {
                this.showPage("menu");
            });

        document
            .getElementById("back-to-menu-tiles-btn")
            ?.addEventListener("click", () => {
                this.showPage("menu");
            });

        document
            .getElementById("back-to-menu-settings-btn")
            ?.addEventListener("click", () => {
                this.showPage("menu");
            });

        // Settings controls
        const volumeSlider = document.getElementById(
            "volume-slider"
        ) as HTMLInputElement;
        const volumeValue = document.getElementById("volume-value");

        volumeSlider?.addEventListener("input", (e) => {
            const value = (e.target as HTMLInputElement).value;
            if (volumeValue) {
                volumeValue.textContent = value;
            }
        });
    }
}

// Export a singleton instance
export const pageManager = new PageManager();
