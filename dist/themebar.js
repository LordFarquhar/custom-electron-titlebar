"use strict";
/*--------------------------------------------------------------------------------------------------------
 *  Copyright (c) 2018 Alex Torres
 *  Licensed under the MIT License. See License in the project root for license information.
 *
 *  This file has parts of one or more project files (VS Code) from Microsoft
 *  You can check your respective license and the original file in https://github.com/Microsoft/vscode/
 *-------------------------------------------------------------------------------------------------------*/

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Themebar = void 0;

const lifecycle_1 = require("./vs/base/common/lifecycle");

const commonTheme = ".titlebar {\r\n    position: absolute;\r\n    top: 0;\r\n    left: 0;\r\n    right: 0;\r\n    box-sizing: border-box;\r\n    width: 100%;\r\n    font-size: 13px;\r\n    padding: 0 16px;\r\n    overflow: hidden;\r\n    flex-shrink: 0;\r\n    align-items: center;\r\n    justify-content: center;\r\n    user-select: none;\r\n    zoom: 1;\r\n    line-height: 22px;\r\n    height: 22px;\r\n    display: flex;\r\n    z-index: 99999;\r\n}\r\n\r\n.titlebar.cet-windows, .titlebar.cet-linux {\r\n    padding: 0;\r\n    height: 30px;\r\n    line-height: 30px;\r\n    justify-content: left;\r\n    overflow: visible;\r\n}\r\n\r\n.titlebar.inverted, .titlebar.inverted .menubar,\r\n.titlebar.inverted .window-controls-container {\r\n    flex-direction: row-reverse;\r\n}\r\n\r\n.titlebar.inverted .window-controls-container {\r\n    margin: 0 5px 0 0;\r\n}\r\n\r\n.titlebar.first-buttons .window-controls-container {\r\n    order: -1;\r\n    margin: 0 5px 0 0;\r\n}\r\n/* Drag region */\r\n\r\n.titlebar .titlebar-drag-region {\r\n    top: 0;\r\n    left: 0;\r\n    display: block;\r\n    position: absolute;\r\n    width: 100%;\r\n    height: 100%;\r\n    z-index: -1;\r\n    -webkit-app-region: drag;\r\n}\r\n\r\n/* icon app */\r\n\r\n.titlebar > .window-appicon {\r\n    width: 35px;\r\n    height: 30px;\r\n    position: relative;\r\n    z-index: 99;\r\n    background-repeat: no-repeat;\r\n    background-position: center center;\r\n    background-size: 16px;\r\n    flex-shrink: 0;\r\n}\r\n\r\n/* Menu bar */\r\n\r\n.menubar {\r\n    display: flex;\r\n    flex-shrink: 1;\r\n    box-sizing: border-box;\r\n    height: 30px;\r\n    overflow: hidden;\r\n    flex-wrap: wrap;\r\n}\r\n\r\n.menubar.bottom {\r\n    order: 1;\r\n    width: 100%;\r\n    padding: 0 5px;\r\n}\r\n\r\n.menubar .menubar-menu-button {\r\n    align-items: center;\r\n    box-sizing: border-box;\r\n    padding: 0px 8px;\r\n    cursor: default;\r\n    -webkit-app-region: no-drag;\r\n    zoom: 1;\r\n    white-space: nowrap;\r\n    outline: 0;\r\n}\r\n\r\n.menubar .menubar-menu-button.disabled {\r\n    opacity: 0.4;\r\n}\r\n\r\n.menubar .menubar-menu-button:not(.disabled):focus,\r\n.menubar .menubar-menu-button:not(.disabled).open,\r\n.menubar .menubar-menu-button:not(.disabled):hover {\r\n    background-color: rgba(255, 255, 255, .1);\r\n}\r\n\r\n.titlebar.light .menubar .menubar-menu-button:focus,\r\n.titlebar.light .menubar .menubar-menu-button.open,\r\n.titlebar.light .menubar .menubar-menu-button:hover {\r\n    background-color: rgba(0, 0, 0, .1);\r\n}\r\n\r\n.menubar-menu-container {\r\n    position: absolute;\r\n    display: block;\r\n    left: 0px;\r\n    opacity: 1;\r\n    outline: 0;\r\n    border: none;\r\n    text-align: left;\r\n    margin: 0 auto;\r\n    padding: .5em 0;\r\n    margin-left: 0;\r\n    overflow: visible;\r\n    justify-content: flex-end;\r\n    white-space: nowrap;\r\n    box-shadow: 0 5px 5px -3px rgba(0,0,0,.2), 0 8px 10px 1px rgba(0,0,0,.14), 0 3px 14px 2px rgba(0,0,0,.12);\r\n    z-index: 99999;\r\n}\r\n\r\n.menubar-menu-container:focus {\r\n    outline: 0;\r\n}\r\n\r\n.menubar-menu-container .action-item {\r\n    padding: 0;\r\n    transform: none;\r\n    display: -ms-flexbox;\r\n    display: flex;\r\n    outline: none;\r\n}\r\n\r\n.menubar-menu-container .action-item.active {\r\n    transform: none;\r\n}\r\n\r\n.menubar-menu-container .action-menu-item {\r\n    -ms-flex: 1 1 auto;\r\n    flex: 1 1 auto;\r\n    display: -ms-flexbox;\r\n    display: flex;\r\n    height: 2.5em;\r\n    align-items: center;\r\n    position: relative;\r\n}\r\n\r\n.menubar-menu-container .action-label {\r\n    -ms-flex: 1 1 auto;\r\n    flex: 1 1 auto;\r\n    text-decoration: none;\r\n    padding: 0 1em;\r\n    background: none;\r\n    font-size: 12px;\r\n    line-height: 1;\r\n}\r\n\r\n.menubar-menu-container .action-label:not(.separator),\r\n.menubar-menu-container .keybinding {\r\n    padding: 0 2em 0 1em;\r\n}\r\n\r\n.menubar-menu-container .keybinding,\r\n.menubar-menu-container .submenu-indicator {\r\n    display: inline-block;\r\n    -ms-flex: 2 1 auto;\r\n    flex: 2 1 auto;\r\n    padding: 0 2em 0 1em;\r\n    text-align: right;\r\n    font-size: 12px;\r\n    line-height: 1;\r\n}\r\n\r\n.menubar-menu-container .submenu-indicator {\r\n    height: 100%;\r\n    -webkit-mask: url(\"data:image/svg+xml;charset=utf-8,%3Csvg width='14' height='14' viewBox='0 0 14 14' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M4.52 12.364L9.879 7 4.52 1.636l.615-.615L11.122 7l-5.986 5.98-.615-.616z' fill='%23000'/%3E%3C/svg%3E\") no-repeat right center/13px 13px;\r\n    mask: url(\"data:image/svg+xml;charset=utf-8,%3Csvg width='14' height='14' viewBox='0 0 14 14' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M4.52 12.364L9.879 7 4.52 1.636l.615-.615L11.122 7l-5.986 5.98-.615-.616z' fill='%23000'/%3E%3C/svg%3E\") no-repeat right center/13px 13px;\r\n    font-size: 60%;\r\n    margin: 0 2em 0 1em;\r\n}\r\n\r\n.menubar-menu-container .action-item.disabled .action-menu-item,\r\n.menubar-menu-container .action-label.separator {\r\n    opacity: 0.4;\r\n}\r\n\r\n.menubar-menu-container .action-label:not(.separator) {\r\n    display: inline-block;\r\n    -webkit-box-sizing: border-box;\r\n    -o-box-sizing: border-box;\r\n    -moz-box-sizing: border-box;\r\n    -ms-box-sizing:\tborder-box;\r\n    box-sizing:\tborder-box;\r\n    margin: 0;\r\n}\r\n\r\n.menubar-menu-container .action-item .submenu {\r\n    position: absolute;\r\n}\r\n\r\n.menubar-menu-container .action-label.separator {\r\n    font-size: inherit;\r\n    padding: .2em 0 0;\r\n    margin-left: .8em;\r\n    margin-right: .8em;\r\n    margin-bottom: .2em;\r\n    width: 100%;\r\n    border-bottom: 1px solid transparent;\r\n}\r\n\r\n.menubar-menu-container .action-label.separator.text {\r\n    padding: 0.7em 1em 0.1em 1em;\r\n    font-weight: bold;\r\n    opacity: 1;\r\n}\r\n\r\n.menubar-menu-container .action-label:hover {\r\n    color: inherit;\r\n}\r\n\r\n.menubar-menu-container .menu-item-check {\r\n    position: absolute;\r\n    visibility: hidden;\r\n    -webkit-mask: url(\"data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='-2 -2 16 16'%3E%3Cpath fill='%23424242' d='M9 0L4.5 9 3 6H0l3 6h3l6-12z'/%3E%3C/svg%3E\") no-repeat 50% 56%/15px 15px;\r\n    mask: url(\"data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='-2 -2 16 16'%3E%3Cpath fill='%23424242' d='M9 0L4.5 9 3 6H0l3 6h3l6-12z'/%3E%3C/svg%3E\") no-repeat 50% 56%/15px 15px;\r\n    width: 2em;\r\n    height: 2em;\r\n    margin: 0 0 0 0.7em;\r\n}\r\n\r\n.menubar-menu-container .menu-item-icon {\r\n    width: 18px;\r\n    height: 18px;\r\n    margin: 0 0 0 1.1em;\r\n}\r\n\r\n.menubar-menu-container .menu-item-icon img {\r\n    display: inherit;\r\n    width: 100%;\r\n    height: 100%;\r\n}\r\n\r\n.menubar-menu-container .action-menu-item.checked .menu-item-icon {\r\n    visibility: hidden;\r\n}\r\n\r\n.menubar-menu-container .action-menu-item.checked .menu-item-check {\r\n    visibility: visible;\r\n}\r\n\r\n/* Title */\r\n\r\n.titlebar .window-title {\r\n    flex: 0 1 auto;\r\n    font-size: 12px;\r\n    overflow: hidden;\r\n    white-space: nowrap;\r\n    text-overflow: ellipsis;\r\n    margin: 0 auto;\r\n    zoom: 1;\r\n}\r\n\r\n/* Window controls */\r\n\r\n.titlebar .window-controls-container {\r\n    display: flex;\r\n    flex-grow: 0;\r\n    flex-shrink: 0;\r\n    text-align: center;\r\n    position: relative;\r\n    z-index: 99;\r\n    -webkit-app-region: no-drag;\r\n    height: 30px;\r\n    margin-left: 5px;\r\n}\r\n\r\n/* Resizer */\r\n\r\n.titlebar.cet-windows .resizer, .titlebar.cet-linux .resizer {\r\n    -webkit-app-region: no-drag;\r\n    position: absolute;\r\n}\r\n\r\n.titlebar.cet-windows .resizer.top, .titlebar.cet-linux .resizer.top {\r\n    top: 0;\r\n    width: 100%;\r\n    height: 6px;\r\n}\r\n\r\n.titlebar.cet-windows .resizer.left, .titlebar.cet-linux .resizer.left {\r\n    top: 0;\r\n    left: 0;\r\n    width: 6px;\r\n    height: 100%;\r\n}";
const macTheme = ".titlebar.cet-mac {\r\n    padding: 0;\r\n}\r\n\r\n.titlebar .window-controls-container .window-icon-bg {\r\n    display: inline-block;\r\n    -webkit-app-region: no-drag;\r\n    height: 12px;\r\n    width: 12px;\r\n    margin: 7.5px 4px;\r\n    border-radius: 50%;\r\n    overflow: hidden;\r\n}\r\n\r\n.titlebar .window-controls-container .window-icon-bg.inactive {\r\n    background-color: #cdcdcd;\r\n}\r\n\r\n.titlebar .window-controls-container .window-icon-bg:not(.inactive) .window-icon {\r\n    height: 100%;\r\n    width: 100%;\r\n    background-color: transparent;\r\n    -webkit-mask-size: 100% !important;\r\n    mask-size: 100% !important;\r\n}\r\n\r\n.titlebar .window-controls-container .window-icon-bg:not(.inactive) .window-icon:hover {\r\n    background-color: rgba(0, 0, 0, 0.4);\r\n}\r\n\r\n.titlebar .window-controls-container .window-icon-bg:not(.inactive).window-minimize-bg {\r\n    background-color: #febc28;\r\n}\r\n\r\n.titlebar .window-controls-container .window-icon-bg:not(.inactive).window-minimize-bg:hover {\r\n    background-color: #feb30a;\r\n}\r\n\r\n.titlebar .window-controls-container .window-icon-bg:not(.inactive).window-restore-bg {\r\n    background-color: #01cc4e;\r\n}\r\n\r\n.titlebar .window-controls-container .window-icon-bg:not(.inactive).window-restore-bg:hover {\r\n    background-color: #01ae42;\r\n}\r\n\r\n.titlebar .window-controls-container .window-icon-bg:not(.inactive).window-close-bg {\r\n    background-color: #ff5b5d;\r\n}\r\n\r\n.titlebar .window-controls-container .window-icon-bg:not(.inactive).window-close-bg:hover {\r\n    background-color: #ff3c3f;\r\n}\r\n\r\n.titlebar .window-controls-container .window-icon-bg:not(.inactive).window-close-bg .window-close {\r\n    -webkit-mask: url(\"data:image/svg+xml;charset=utf-8,%3Csvg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z' fill='%23000'/%3E%3C/svg%3E\") no-repeat 50% 50%;\r\n    mask: url(\"data:image/svg+xml;charset=utf-8,%3Csvg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z' fill='%23000'/%3E%3C/svg%3E\") no-repeat 50% 50%;\r\n}\r\n\r\n.titlebar .window-controls-container .window-icon-bg:not(.inactive) .window-maximize {\r\n    -webkit-mask: url(\"data:image/svg+xml;charset=utf-8,%3Csvg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M18.17,12L15,8.83L16.41,7.41L21,12L16.41,16.58L15,15.17L18.17,12M5.83,12L9,15.17L7.59,16.59L3,12L7.59,7.42L9,8.83L5.83,12Z' fill='%23000'/%3E%3C/svg%3E\") no-repeat 50% 50%;\r\n    mask: url(\"data:image/svg+xml;charset=utf-8,%3Csvg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M18.17,12L15,8.83L16.41,7.41L21,12L16.41,16.58L15,15.17L18.17,12M5.83,12L9,15.17L7.59,16.59L3,12L7.59,7.42L9,8.83L5.83,12Z' fill='%23000'/%3E%3C/svg%3E\") no-repeat 50% 50%;\r\n    transform: rotate(-45deg);\r\n}\r\n\r\n.titlebar .window-controls-container .window-icon-bg:not(.inactive) .window-unmaximize {\r\n    -webkit-mask: url(\"data:image/svg+xml;charset=utf-8,%3Csvg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M5.41,7.41L10,12L5.41,16.59L4,15.17L7.17,12L4,8.83L5.41,7.41M18.59,16.59L14,12L18.59,7.42L20,8.83L16.83,12L20,15.17L18.59,16.59Z' fill='%23000'/%3E%3C/svg%3E\") no-repeat 50% 50%;\r\n    mask: url(\"data:image/svg+xml;charset=utf-8,%3Csvg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M5.41,7.41L10,12L5.41,16.59L4,15.17L7.17,12L4,8.83L5.41,7.41M18.59,16.59L14,12L18.59,7.42L20,8.83L16.83,12L20,15.17L18.59,16.59Z' fill='%23000'/%3E%3C/svg%3E\") no-repeat 50% 50%;\r\n    transform: rotate(-45deg);\r\n}\r\n\r\n.titlebar .window-controls-container .window-icon-bg:not(.inactive) .window-minimize {\r\n    -webkit-mask: url(\"data:image/svg+xml;charset=utf-8,%3Csvg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M19,13H5V11H19V13Z' fill='%23000'/%3E%3C/svg%3E\") no-repeat 50% 50%;\r\n    mask: url(\"data:image/svg+xml;charset=utf-8,%3Csvg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M19,13H5V11H19V13Z' fill='%23000'/%3E%3C/svg%3E\") no-repeat 50% 50%;\r\n}";
const winTheme = ".titlebar .window-controls-container .window-icon-bg {\r\n    display: inline-block;\r\n    -webkit-app-region: no-drag;\r\n    height: 100%;\r\n    width: 46px;\r\n}\r\n\r\n.titlebar .window-controls-container .window-icon-bg .window-icon {\r\n    height: 100%;\r\n    width: 100%;\r\n    -webkit-mask-size: 23.1%;\r\n    mask-size: 23.1%;\r\n}\r\n\r\n.titlebar .window-controls-container .window-icon-bg .window-icon.window-close {\r\n    -webkit-mask: url(\"data:image/svg+xml;charset=utf-8,%3Csvg width='11' height='11' viewBox='0 0 11 11' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M6.279 5.5L11 10.221l-.779.779L5.5 6.279.779 11 0 10.221 4.721 5.5 0 .779.779 0 5.5 4.721 10.221 0 11 .779 6.279 5.5z' fill='%23000'/%3E%3C/svg%3E\") no-repeat 50% 50%;\r\n    mask: url(\"data:image/svg+xml;charset=utf-8,%3Csvg width='11' height='11' viewBox='0 0 11 11' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M6.279 5.5L11 10.221l-.779.779L5.5 6.279.779 11 0 10.221 4.721 5.5 0 .779.779 0 5.5 4.721 10.221 0 11 .779 6.279 5.5z' fill='%23000'/%3E%3C/svg%3E\") no-repeat 50% 50%;\r\n}\r\n\r\n.titlebar .window-controls-container .window-icon-bg .window-icon.window-close:hover {\r\n    background-color: #ffffff!important;\r\n}\r\n\r\n.titlebar .window-controls-container .window-icon-bg .window-icon.window-unmaximize {\r\n    -webkit-mask: url(\"data:image/svg+xml;charset=utf-8,%3Csvg width='11' height='11' viewBox='0 0 11 11' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 8.798H8.798V11H0V2.202h2.202V0H11v8.798zm-3.298-5.5h-6.6v6.6h6.6v-6.6zM9.9 1.1H3.298v1.101h5.5v5.5h1.1v-6.6z' fill='%23000'/%3E%3C/svg%3E\") no-repeat 50% 50%;\r\n    mask: url(\"data:image/svg+xml;charset=utf-8,%3Csvg width='11' height='11' viewBox='0 0 11 11' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 8.798H8.798V11H0V2.202h2.202V0H11v8.798zm-3.298-5.5h-6.6v6.6h6.6v-6.6zM9.9 1.1H3.298v1.101h5.5v5.5h1.1v-6.6z' fill='%23000'/%3E%3C/svg%3E\") no-repeat 50% 50%;\r\n}\r\n\r\n.titlebar .window-controls-container .window-icon-bg .window-icon.window-maximize {\r\n    -webkit-mask: url(\"data:image/svg+xml;charset=utf-8,%3Csvg width='11' height='11' viewBox='0 0 11 11' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 0v11H0V0h11zM9.899 1.101H1.1V9.9h8.8V1.1z' fill='%23000'/%3E%3C/svg%3E\") no-repeat 50% 50%;\r\n    mask: url(\"data:image/svg+xml;charset=utf-8,%3Csvg width='11' height='11' viewBox='0 0 11 11' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 0v11H0V0h11zM9.899 1.101H1.1V9.9h8.8V1.1z' fill='%23000'/%3E%3C/svg%3E\") no-repeat 50% 50%;\r\n}\r\n\r\n.titlebar .window-controls-container .window-icon-bg .window-icon.window-minimize {\r\n    -webkit-mask: url(\"data:image/svg+xml;charset=utf-8,%3Csvg width='11' height='11' viewBox='0 0 11 11' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 4.399V5.5H0V4.399h11z' fill='%23000'/%3E%3C/svg%3E\") no-repeat 50% 50%;\r\n    mask: url(\"data:image/svg+xml;charset=utf-8,%3Csvg width='11' height='11' viewBox='0 0 11 11' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 4.399V5.5H0V4.399h11z' fill='%23000'/%3E%3C/svg%3E\") no-repeat 50% 50%;\r\n}\r\n\r\n.titlebar .window-controls-container .window-icon-bg.window-close-bg:hover {\r\n    background-color: rgba(232, 17, 35, 0.9)!important;\r\n}\r\n\r\n.titlebar .window-controls-container .window-icon-bg.inactive {\r\n    background-color: transparent!important;\r\n}\r\n\r\n.titlebar .window-controls-container .window-icon-bg.inactive .window-icon {\r\n    opacity: .4;\r\n}\r\n\r\n.titlebar .window-controls-container .window-icon {\r\n    background-color: #eeeeee;\r\n}\r\n\r\n.titlebar.light .window-controls-container .window-icon {\r\n    background-color: #333333;\r\n}\r\n\r\n.titlebar.inactive .window-controls-container .window-icon {\r\n    opacity: .7;\r\n}\r\n\r\n.titlebar .window-controls-container .window-icon-bg:not(.inactive):hover {\r\n    background-color: rgba(255, 255, 255, .1);\r\n}\r\n\r\n.titlebar.light .window-controls-container .window-icon-bg:not(.inactive):hover {\r\n    background-color: rgba(0, 0, 0, .1);\r\n}";

class ThemingRegistry extends _get__("lifecycle_1").Disposable {
  constructor() {
    super();
    this.theming = [];
    this.theming = [];
  }

  onThemeChange(theme) {
    this.theming.push(theme);
    return (0, _get__("lifecycle_1").toDisposable)(() => {
      const idx = this.theming.indexOf(theme);
      this.theming.splice(idx, 1);
    });
  }

  getTheming() {
    return this.theming;
  }

}

class Themebar extends _get__("ThemingRegistry") {
  constructor() {
    super();
    this.registerTheme(collector => {
      collector.addRule(_get__("commonTheme"));
    });
  }

  registerTheme(theme) {
    this.onThemeChange(theme);
    let cssRules = [];
    let hasRule = {};
    let ruleCollector = {
      addRule: rule => {
        if (!hasRule[rule]) {
          cssRules.push(rule);
          hasRule[rule] = true;
        }
      }
    };
    this.getTheming().forEach(p => p(ruleCollector));

    _get__("_applyRules")(cssRules.join('\n'), 'titlebar-style');
  }

  static get win() {
    return collector => {
      collector.addRule(_get__("winTheme"));
    };
  }

  static get mac() {
    return collector => {
      collector.addRule(_get__("macTheme"));
    };
  }

}

exports.Themebar = _get__("Themebar");

function _applyRules(styleSheetContent, rulesClassName) {
  let themeStyles = document.head.getElementsByClassName(rulesClassName);

  if (themeStyles.length === 0) {
    let styleElement = document.createElement('style');
    styleElement.className = rulesClassName;
    styleElement.innerHTML = styleSheetContent;
    document.head.appendChild(styleElement);
  } else {
    themeStyles[0].innerHTML = styleSheetContent;
  }
}

function _getGlobalObject() {
  try {
    if (!!global) {
      return global;
    }
  } catch (e) {
    try {
      if (!!window) {
        return window;
      }
    } catch (e) {
      return this;
    }
  }
}

;
var _RewireModuleId__ = null;

function _getRewireModuleId__() {
  if (_RewireModuleId__ === null) {
    let globalVariable = _getGlobalObject();

    if (!globalVariable.__$$GLOBAL_REWIRE_NEXT_MODULE_ID__) {
      globalVariable.__$$GLOBAL_REWIRE_NEXT_MODULE_ID__ = 0;
    }

    _RewireModuleId__ = __$$GLOBAL_REWIRE_NEXT_MODULE_ID__++;
  }

  return _RewireModuleId__;
}

function _getRewireRegistry__() {
  let theGlobalVariable = _getGlobalObject();

  if (!theGlobalVariable.__$$GLOBAL_REWIRE_REGISTRY__) {
    theGlobalVariable.__$$GLOBAL_REWIRE_REGISTRY__ = Object.create(null);
  }

  return theGlobalVariable.__$$GLOBAL_REWIRE_REGISTRY__;
}

function _getRewiredData__() {
  let moduleId = _getRewireModuleId__();

  let registry = _getRewireRegistry__();

  let rewireData = registry[moduleId];

  if (!rewireData) {
    registry[moduleId] = Object.create(null);
    rewireData = registry[moduleId];
  }

  return rewireData;
}

(function registerResetAll() {
  let theGlobalVariable = _getGlobalObject();

  if (!theGlobalVariable['__rewire_reset_all__']) {
    theGlobalVariable['__rewire_reset_all__'] = function () {
      theGlobalVariable.__$$GLOBAL_REWIRE_REGISTRY__ = Object.create(null);
    };
  }
})();

var INTENTIONAL_UNDEFINED = '__INTENTIONAL_UNDEFINED__';
let _RewireAPI__ = {};

(function () {
  function addPropertyToAPIObject(name, value) {
    Object.defineProperty(_RewireAPI__, name, {
      value: value,
      enumerable: false,
      configurable: true
    });
  }

  addPropertyToAPIObject('__get__', _get__);
  addPropertyToAPIObject('__GetDependency__', _get__);
  addPropertyToAPIObject('__Rewire__', _set__);
  addPropertyToAPIObject('__set__', _set__);
  addPropertyToAPIObject('__reset__', _reset__);
  addPropertyToAPIObject('__ResetDependency__', _reset__);
  addPropertyToAPIObject('__with__', _with__);
})();

function _get__(variableName) {
  let rewireData = _getRewiredData__();

  if (rewireData[variableName] === undefined) {
    return _get_original__(variableName);
  } else {
    var value = rewireData[variableName];

    if (value === INTENTIONAL_UNDEFINED) {
      return undefined;
    } else {
      return value;
    }
  }
}

function _get_original__(variableName) {
  switch (variableName) {
    case "lifecycle_1":
      return lifecycle_1;

    case "commonTheme":
      return commonTheme;

    case "_applyRules":
      return _applyRules;

    case "winTheme":
      return winTheme;

    case "macTheme":
      return macTheme;

    case "ThemingRegistry":
      return ThemingRegistry;

    case "Themebar":
      return Themebar;
  }

  return undefined;
}

function _assign__(variableName, value) {
  let rewireData = _getRewiredData__();

  if (rewireData[variableName] === undefined) {
    return _set_original__(variableName, value);
  } else {
    return rewireData[variableName] = value;
  }
}

function _set_original__(variableName, _value) {
  switch (variableName) {}

  return undefined;
}

function _update_operation__(operation, variableName, prefix) {
  var oldValue = _get__(variableName);

  var newValue = operation === '++' ? oldValue + 1 : oldValue - 1;

  _assign__(variableName, newValue);

  return prefix ? newValue : oldValue;
}

function _set__(variableName, value) {
  let rewireData = _getRewiredData__();

  if (typeof variableName === 'object') {
    Object.keys(variableName).forEach(function (name) {
      rewireData[name] = variableName[name];
    });
    return function () {
      Object.keys(variableName).forEach(function (name) {
        _reset__(variableName);
      });
    };
  } else {
    if (value === undefined) {
      rewireData[variableName] = INTENTIONAL_UNDEFINED;
    } else {
      rewireData[variableName] = value;
    }

    return function () {
      _reset__(variableName);
    };
  }
}

function _reset__(variableName) {
  let rewireData = _getRewiredData__();

  delete rewireData[variableName];

  if (Object.keys(rewireData).length == 0) {
    delete _getRewireRegistry__()[_getRewireModuleId__];
  }

  ;
}

function _with__(object) {
  let rewireData = _getRewiredData__();

  var rewiredVariableNames = Object.keys(object);
  var previousValues = {};

  function reset() {
    rewiredVariableNames.forEach(function (variableName) {
      rewireData[variableName] = previousValues[variableName];
    });
  }

  return function (callback) {
    rewiredVariableNames.forEach(function (variableName) {
      previousValues[variableName] = rewireData[variableName];
      rewireData[variableName] = object[variableName];
    });
    let result = callback();

    if (!!result && typeof result.then == 'function') {
      result.then(reset).catch(reset);
    } else {
      reset();
    }

    return result;
  };
}

let _typeOfOriginalExport = typeof module.exports;

function addNonEnumerableProperty(name, value) {
  Object.defineProperty(module.exports, name, {
    value: value,
    enumerable: false,
    configurable: true
  });
}

if ((_typeOfOriginalExport === 'object' || _typeOfOriginalExport === 'function') && Object.isExtensible(module.exports)) {
  addNonEnumerableProperty('__get__', _get__);
  addNonEnumerableProperty('__GetDependency__', _get__);
  addNonEnumerableProperty('__Rewire__', _set__);
  addNonEnumerableProperty('__set__', _set__);
  addNonEnumerableProperty('__reset__', _reset__);
  addNonEnumerableProperty('__ResetDependency__', _reset__);
  addNonEnumerableProperty('__with__', _with__);
  addNonEnumerableProperty('__RewireAPI__', _RewireAPI__);
}