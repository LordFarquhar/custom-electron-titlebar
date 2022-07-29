import { IDisposable, Disposable } from "vs/base/common/lifecycle";
declare class ThemingRegistry extends Disposable {
    private readonly theming;
    constructor();
    protected onThemeChange(theme: Theme): IDisposable;
    protected getTheming(): Theme[];
}
export declare class Themebar extends ThemingRegistry {
    constructor();
    protected registerTheme(theme: Theme): void;
    static get win(): Theme;
    static get mac(): Theme;
}
export interface CssStyle {
    addRule(rule: string): void;
}
export interface Theme {
    (collector: CssStyle): void;
}
export {};
