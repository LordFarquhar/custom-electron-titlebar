import { IMenuItem, IMenuStyle, IMenuOptions } from "./api";
import { Disposable } from "vs/base/common/lifecycle";
import { Event } from "vs/base/common/event";
import { MenuItem } from "electron";
interface ISubMenuData {
    parent: CETMenu;
    submenu?: CETMenu;
}
export declare class CETMenu extends Disposable {
    items: IMenuItem[];
    private focusedItem?;
    private readonly menuContainer;
    private mnemonics;
    private readonly options;
    private readonly closeSubMenu;
    private triggerKeys;
    parentData: ISubMenuData;
    private _onDidCancel;
    get onDidCancel(): Event<void>;
    constructor(container: HTMLElement, options?: IMenuOptions, closeSubMenu?: () => void);
    setAriaLabel(label: string): void;
    private isTriggerKeyEvent;
    private updateFocusedItem;
    getContainer(): HTMLElement;
    createMenu(items: MenuItem[]): void;
    focus(index?: number): void;
    focus(selectFirst?: boolean): void;
    private focusNext;
    private focusPrevious;
    private updateFocus;
    private doTrigger;
    private cancel;
    dispose(): void;
    style(style: IMenuStyle): void;
    private focusItemByElement;
    private setFocusedItem;
}
export {};
