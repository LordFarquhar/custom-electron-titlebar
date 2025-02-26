import { IDisposable, Disposable } from 'vs/base/common/lifecycle';
export declare namespace EventType {
    const Tap = "-monaco-gesturetap";
    const Change = "-monaco-gesturechange";
    const Start = "-monaco-gesturestart";
    const End = "-monaco-gesturesend";
    const Contextmenu = "-monaco-gesturecontextmenu";
}
export interface GestureEvent extends MouseEvent {
    initialTarget: EventTarget | undefined;
    translationX: number;
    translationY: number;
    pageX: number;
    pageY: number;
    tapCount: number;
}
export declare class Gesture extends Disposable {
    private static readonly SCROLL_FRICTION;
    private static INSTANCE;
    private static readonly HOLD_DELAY;
    private dispatched;
    private targets;
    private ignoreTargets;
    private handle;
    private activeTouches;
    private _lastSetTapCountTime;
    private static readonly CLEAR_TAP_COUNT_TIME;
    private constructor();
    static addTarget(element: HTMLElement): IDisposable;
    static ignoreTarget(element: HTMLElement): IDisposable;
    private static isTouchDevice;
    dispose(): void;
    private onTouchStart;
    private onTouchEnd;
    private newGestureEvent;
    private dispatchEvent;
    private inertia;
    private onTouchMove;
}
