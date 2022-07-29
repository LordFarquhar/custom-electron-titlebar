import { Color } from 'vs/base/common/color';
import { Themebar } from './themebar';
import { TitlebarOptions } from "./typings/titlebar";
export declare class Titlebar extends Themebar {
    private titlebar;
    private title;
    private dragRegion;
    private appIcon;
    private menubarContainer;
    private windowControls;
    private maxRestoreControl;
    private container;
    private resizer;
    private isInactive;
    private currentWindow;
    private readonly _options;
    private menubar;
    private events;
    constructor(options?: Partial<TitlebarOptions>);
    private closeMenu;
    private registerListeners;
    private removeListeners;
    private createTitlebar;
    private onBlur;
    private onFocus;
    private onMenubarVisibilityChanged;
    private onMenubarFocusChanged;
    private onDidChangeWindowFocus;
    private onDidChangeMaximized;
    private onDidChangeFullscreen;
    private updateStyles;
    /**
     * get the options of the titlebar
     */
    get options(): TitlebarOptions;
    /**
     * Update the background color of the title bar
     * @param backgroundColor The color for the background
     */
    updateBackground(backgroundColor: Color): void;
    /**
     * Update the item background color of the menubar
     * @param itemBGColor The color for the item background
     */
    updateItemBGColor(itemBGColor: Color): void;
    /**
     * Update the title of the title bar.
     * You can use this method if change the content of `<title>` tag on your html.
     * @param title The title of the title bar and document.
     */
    updateTitle(title?: string): void;
    /**
     * It method set new icon to title-bar-icon of title-bar.
     * @param path path to icon
     */
    updateIcon(path: string): void;
    /**
     * Update the default menu or set a new menu.
     * @param menu The menu.
     */
    updateMenu(menu: Electron.Menu): void;
    /**
     * Update the position of menubar.
     * @param menuPosition The position of the menu `left` or `bottom`.
     */
    updateMenuPosition(menuPosition: "left" | "bottom"): void;
    /**
     * Horizontal alignment of the title.
     * @param side `left`, `center` or `right`.
     */
    setHorizontalAlignment(side: "left" | "center" | "right"): void;
    /**
     * Remove the titlebar, menubar and all methods.
     */
    dispose(): void;
}
