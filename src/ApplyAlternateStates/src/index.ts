//#region imports
import * as enigmajs from "enigma.js";
import * as schema from "../node_modules/enigma.js/schemas/12.34.11.json";
import * as websocket from "ws";
import * as path from "path";
import * as fs from "fs";
import * as jwt from "jsonwebtoken";
import * as https from "https"
//#endregion

//#region interfaces
interface IConfig {
    hostname: string;
    userDirectory: string;
    userId: string;
    password: string;
    certPath: string;
    proxyPrefix: string;
    showLogs: boolean;
}

interface IPayload {
    UserDirectory: string;
    UserId: string;
    Attribute: any;
}
//#endregion

//#region declare variables
const config: IConfig = require("./config.json");

let idFirstObject = "listOne";
let idSecondObject = "listTwo";
let appId: string;
let protocol = null;

let outputs: string[] = [];
//#endregion

//#region enums
enum ConnectionType {
    desktop,
    serverDirect,
    serverJwt
}
//#endregion

class Guid {
    static newGuid(): string {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
            return v.toString(16);
        });
    }
}

class Q2gApp {

    private global: EngineAPI.IGlobal;
    private appId: string;
    private name: string;
    private app: EngineAPI.IApp;
    private sheet: EngineAPI.IGenericObject;

    constructor(name: string, global: any) {
        this.name = name; // "ApplyStatesTestApplication"
        this.global = global;
    }

    /**
     * deleateApp
     */
    public deleteApp(): Promise<void> {
        console.log("deleteApp");

        return new Promise((resolve, reject) => {
            this.global.deleteApp(appId)
            .then(() => {
                resolve();
            })
            .catch((error) => {
                reject(error);
            });
        });
    }

    /**
     * setScript
     */
    public setScriptAndReload(script: string): Promise<void> {
        console.log("setScriptAndReload");

        return new Promise((resolve, reject) => {
            this.app.setScript(script)
            .then(() => {
                return this.app.doReload();
            })
            .then(() => {
                resolve();
            })
            .catch((error) => {
                reject(error);
            })
        })
    }

    /**
     * createApp
     */
    public createApp(name?: string): Promise<void> {
        console.log("createApp");

        return new Promise((resolve, reject) => {

            if (typeof(name) !== "undefined") {
                this.name = name;
            }

            this.global.createApp(this.name, "Main")
            .then((app) => {
                this.appId = app.qAppId;
                appId = app.qAppId;
                resolve();
            })
            .catch((error) => {
                reject(error);
            })
        });
    }

    /**
     * openApp
     */
    public openApp(): Promise<void> {
        console.log("openApp");

        return new Promise((resolve, reject) => {
            this.global.openDoc(appId)
            .then((app: EngineAPI.IApp) => {
                this.app = app;
                resolve();
            })
            .catch((error) => {
                reject(error);
            });
        })
    }

    /**
     * createSheetObjects
     */
    public createSheetObjects() {
        console.log("createSheetObjects");

        return new Promise((resolve, reject) => {
            let props: EngineAPI.IGenericObjectProperties;

            props = {
                qInfo: {
                    qType: "sheet",
                    qId: "sheet01"
                },
                qMetaDef: {  
                    title: "Test sheet",
                    description: "Test sheet"
                },
                rank: 0,
                thumbnail: {
                    qStaticContentUrlDef: {}
                },
                columns: 24,
                rows: 12,
                cells: []
            }

            this.app.createObject(props)
            .then((res) => {
                this.sheet = res;
                resolve();
            })
            .catch((error) => {
                reject(error);
            })

        });
    }

    /**
     * insertNewFilterPaneWithField
     */
    public insertNewFilterPaneWithFieldPropertyTree(idOne: string, idTwo: string): Promise<void> {
        console.log(`insertNewFilterPaneWithFieldPropertyTree (${idOne}, ${idTwo})`);

        return new Promise((resolve, reject) => {

            this.sheet.getFullPropertyTree()
            .then((propertyTree) => {
                propertyTree.qProperty.cells = [
                    {
                        name: "filterpane1",
                        type: "filterpane",
                        col: 0,
                        row: 0,
                        colspan:
                        24,
                        rowspan: 12
                    }
                ]

                let props: EngineAPI.IGenericObjectEntry;
                let props1: EngineAPI.IGenericObjectEntry;
                let props2: EngineAPI.IGenericObjectEntry;
                let props3: EngineAPI.IGenericObjectEntry;

                props2 = {
                    qChildren: [],
                    qProperty: {
                        qInfo: {
                            qType: "listbox",
                            qId: idOne
                        },
                        qListObjectDef: {
                            qDef: {
                                autoSort: true,
                                qFieldDefs: ["a"],
                                qFieldLabels: ["aOriginal"],
                                qSortCriterias: [
                                    {
                                        qSortByState: 1,
                                        qSortByLoadOrder: 1,
                                        qSortByNumeric: 1,
                                        qSortByAscii: 1
                                    }
                                ]
                            },
                            qShowAlternatives: true
                        },
                        title: "a",
                        visualization: "listbox"
                    },
                    qEmbeddedSnapshotRef: null,
                }

                props3 = {
                    qChildren: [],
                    qProperty: {
                        qInfo: {
                            qType: "listbox",
                            qId: idTwo
                        },
                        qListObjectDef: {
                            qDef: {
                                autoSort: true,
                                qFieldDefs: ["a"],
                                qFieldLabels: ["aAlternative"],
                                qSortCriterias: [
                                    {
                                        qSortByState: 1,
                                        qSortByLoadOrder: 1,
                                        qSortByNumeric: 1,
                                        qSortByAscii: 1
                                    }
                                ]
                            },
                            qShowAlternatives: true
                        },
                        title: "b",
                        visualization: "listbox"
                    },
                    qEmbeddedSnapshotRef: null,
                }

                props1 = {
                    qChildren: [props2, props3],
                    qProperty: {
                        footnote: "",
                        qChildListDef: {
                            qData: {
                                info: "/qInfo"
                            }
                        },
                        qInfo: {
                            qType: "filterpane", 
                            qId: "filterpane1"
                        },
                        showDetails: false,
                        showTitles: false,
                        subtitle: "",
                        title: "",
                        visualization: "filterpane"
                    },
                    qEmbeddedSnapshotRef: null,
                }

                props = {
                    qChildren: [
                        props1
                    ],
                    qEmbeddedSnapshotRef: null,
                    qProperty: propertyTree.qProperty
                }

                return this.sheet.setFullPropertyTree(props);

            })
            .then(() => {
                resolve();
            })
            .catch((error) => {
                reject(error);
            })
        });
    }

    /**
     * setAlternateStates
     */
    public setAlternateStates(name: string): Promise<void> {
        console.log(`setAlternateStates (${name})`);

        return this.app.addAlternateState(name)
    }

    /**
     * setSheetObjectsInDifferentState
     */
    public setSheetObjectToState(stateName: string, objectId: string): Promise<void> {
        console.log(`setSheetObjectToState (${stateName}, ${objectId})`);

        return new Promise((resolve, reject) => {
            this.app.getObject(objectId)
            .then((res) => {
                let patches: EngineAPI.INxPatch;
                patches = {
                    qPath: "/qListObjectDef/qStateName",
                    qOp: "Add",
                    qValue: "\""+stateName+"\""
                }

                return res.applyPatches([patches], false)
            })
            .then(() => {
                resolve();
            })
            .catch((error) => {
                reject(error);
            })
        })
    }

    /**
     * setSheetObjectToNewTitle
     */
    public setSheetObjectToNewTitle(objectId: string): Promise<void> {
        console.log(`setSheetObjectToNewTitle (${objectId})`);;

        return new Promise((resolve, reject) => {
            this.app.getObject(objectId)
            .then((res) => {
                let patches: EngineAPI.INxPatch;
                patches = {
                    qPath: "/title",
                    qOp: "Add",
                    qValue: "\""+Guid.newGuid()+"\""
                }

                return res.applyPatches([patches], false)
            })
            .then(() => {
                resolve();
            })
            .catch((error) => {
                reject(error);
            })
        })
    }

    /**
     * selectValues
     */
    public selectValues(objectId: string): Promise<void> {
        console.log("selectValues");

        return new Promise((resolve, reject) => {
            this.app.getObject(objectId)
            .then((object) => {
                return object.selectListObjectValues("/qListObjectDef", [0,1], false);
            })
            .then(() => {
                resolve();
            })
            .catch((error) => {
                reject(error);
            })
        })
    }

    /**
     * compareSelected
     */
    public compareSelected(objectIdFirst: string, objectIdSrecond: string) {
        console.log("compareSelected");

        let countFirstObject: number;
        let countSecondObject: number;

        let stateFirstObject: string;
        let stateSecondObject: string;

        return new Promise((resolve, reject) => {
            let selectedFirstObject: number;
            let selectedSecondObject: number;

            let object: EngineAPI.IGenericObject;

            this.app.getObject(objectIdFirst)
            .then((resObject) => {
                object = resObject;
                return resObject.getLayout();
            })
            .then((layout) => {
                countFirstObject = (layout as any).qListObject.qDimensionInfo.qStateCounts.qSelected
                return object.getProperties();
            })
            .then((resProperties) => {
                stateFirstObject = resProperties.qListObjectDef.qStateName;
                return this.app.getObject(objectIdSrecond);
            })
            .then((resObject) => {
                object = resObject;
                return resObject.getLayout();
            })
            .then((layout) => {
                countSecondObject = (layout as any).qListObject.qDimensionInfo.qStateCounts.qSelected
                console.log(`   First Object: ${countFirstObject} | Second Object: ${countSecondObject}`);
                let msg = `       First Object: ${countFirstObject} | Second Object: ${countSecondObject}`
                outputs.push(msg);
                return object.getProperties();
            })
            .then((resProperties) => {
                stateSecondObject = resProperties.qListObjectDef.qStateName;
                console.log(`   First Object: ${stateFirstObject} | Second Object: ${stateSecondObject}`);
                let msg = `       First Object: ${stateFirstObject} | Second Object: ${stateSecondObject}`
                outputs.push(msg);
                resolve();
            })
            .catch((error) => {
                reject(error);
            })
        })
    }

    /**
     * removeAlternateStateFromObject
     */
    public removeAlternateStateFromObject(objectId: string): Promise<void> {
        console.log(`removeAlternateStateFromObject (${objectId})`);
        return new Promise((resolve, reject) => {
            let stateName = "$"
            this.app.getObject(objectId)
            .then((res) => {
                let patches: EngineAPI.INxPatch;
                patches = {
                    qPath: "/qListObjectDef/qStateName",
                    qOp: "Add",
                    qValue: "\""+stateName+"\""
                }

                return res.applyPatches([patches], false)
            })
            .then(() => {
                resolve();
            })
            .catch((error) => {
                reject(error);
            })
        });
    }

    /**
     * doSave
     */
    public doSave(): Promise<void> {
        console.log("doSave");
        return this.app.doSave();
    }

    /**
     * clearSelection
     */
    public clearSelection(): Promise<void> {
        console.log("clearSelection");
        return this.app.clearAll(false);
    }

    /**
     * showAlternateStatesOnApp
     */
    public showAlternateStatesOnApp(): Promise<void> {
        console.log("showAlternateStatesOnApp");
        return new Promise((resolve, reject) => {
            this.app.getAppLayout()
            .then((appLayout) => {
                let assist = appLayout.qStateNames.join(" | ");
                console.log("   All States: ", assist);
                let msg = `       All States: ${assist}`
                outputs.push(msg);
                resolve();
            })
            .catch((error) => {
                reject(error);
            })
        })
    }

    /**
     * removeAlternateStateFromApp
     */
    public removeAlternateStateFromApp(stateName: string): Promise<void> {
        console.log(`removeAlternateStateFromApp (${stateName})`);
        return this.app.removeAlternateState(stateName)
    }

    /**
     * getAppLayout
     */
    public getAppLayout(): Promise<EngineAPI.INxAppLayout> {
        console.log("getAppLayout");
        return this.app.getAppLayout();
    }

    /**
     * getAllInfos
     */
    public getAllInfos(): Promise<EngineAPI.INxInfo[]> {
        console.log("getAllInfos");
        return this.app.getAllInfos();
    }

    /**
     * getAllInfos
     */
    public getAppProperties(): Promise<EngineAPI.INxAppProperties> {
        console.log("getAppProperties");
        return this.app.getAppProperties();
    }

    /**
     * reloadApp
     */
    public reloadApp(): Promise<boolean> {
        console.log("reloadApp");
        return this.app.doReload();
    }
}

class Q2gConnection {
    
    sessionConfig: enigmaJS.IConfig;
    session: enigmaJS.ISession;
    signedToken: string;
    config: IConfig;
    cookie: string

    constructor(config: IConfig) {
        this.config = config
    }

    /**
     * connect
     */
    public connect(connectionType: ConnectionType): Promise<enigmaJS.ISession> {
        console.log("connect");

        return new Promise((resolve, reject) => {
            try {

                this.createConnectionConfig(connectionType)
                .then(() => {
                    this.session = enigmajs.create(this.sessionConfig);
                    if (config.showLogs) {
                        this.session.on('traffic:sent', data => console.log('sent:', data));
                        this.session.on('traffic:received', data => console.log('received:', JSON.stringify(data, null, 4)));
                    }
                    resolve(this.session);
                })
                .catch((error) => {
                    reject(error)
                })

            } catch (error) {
                reject(error);
            }
        });

    }

    /**
     * dissconnect
     */
    public disconnect(): Promise<void> {
        console.log("disconnect");

        return new Promise((resolve, reject) => {
            this.session.close()
            .then(() => {
                resolve()
            })
            .catch((error) => {
                reject(error);
            })
        })

    }

    /**
     * open
     */
    public open(): Promise<any> {
        console.log("open");

        return new Promise((resolve, reject) => {
            this.session.open()
            .then((global) => {
                resolve(global);
            })
            .catch((error) => {
                console.log("Session Error", error)
                reject(error);
            })
        })

    }

    private getConfigToDesktop(): Promise<enigmaJS.IConfig> {
        console.log("getConfigToDesktop");

        return new Promise((resolve, reject) => {
            try {
                const serverConfig = {
                    schema: schema,
                    url: "ws://localhost:9076/app/engineData",
                    createSocket: url => new websocket(url)
                }
                resolve(serverConfig);
            } catch (error) {
                reject(error);
            }
        });

    }

    private getConfigToServerDirect(): Promise<enigmaJS.IConfig> {
        console.log("getConfigToServerDirect");

        return new Promise((resolve, reject) => {
            try {

                const certificates = {
                    cert: fs.readFileSync(path.resolve(this.config.certPath, 'client.pem')),
                    key: fs.readFileSync(path.resolve(this.config.certPath, 'client_key.pem')),
                    root: fs.readFileSync(path.resolve(this.config.certPath, 'root.pem'))
                };

                const protocol: any = {
                    ca: certificates.root,
                    cert: certificates.cert,
                    key: certificates.key,                 
                    headers: {
                        'X-Qlik-User':  `UserDirectory=internal; UserId=${this.config.userId}`
                    }
                }

                const ws = new websocket(`wss://${this.config.hostname}:4747/app/`, protocol)

                const serverConfig = {
                    schema: schema,
                    url: `wss://${this.config.hostname}:4747/app/engineData`,
                    protocol: {delta: false},
                    createSocket:  url => ws
                }

                resolve(serverConfig);
            } catch (error) {
                reject(error);
            }
        });

    }

    private getConfigWithCookieSession(): Promise<enigmaJS.IConfig> {
        console.log("getConfigWithCookieSession");

        return new Promise((resolve, reject) => {
            try {

                const url = `https://${this.config.hostname}/${this.config.proxyPrefix}/app/engineData`

                process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"

                const ws = new websocket(url, {
                    headers: {
                        Cookie: `X-Qlik-Session_jwt=${this.cookie}`
                    }
                });

                const serverConfig = {
                    schema,
                    url: url,
                    createSocket: url => ws,
                };
                resolve(serverConfig);
            } catch (error) {
                reject();
            }
        });
    }

    private generateCookieWithJwt() {
        console.log("generateCookieWithJwt");

        const key: jwt.Secret = fs.readFileSync(path.resolve(__dirname, "../jwtTest_private.key"));

        const payload: IPayload = {
            UserDirectory: this.config.userDirectory,
            UserId: this.config.userId,
            Attribute: []
        }
    
        this.signedToken = jwt.sign(payload, key, { 
            algorithm: 'RS512' 
        });
        
        const options = {
            hostname: `${this.config.hostname}`,
            port: 443,
            path: `/${this.config.proxyPrefix}/sense/app`,
            method: 'GET',
            headers: {
                Authorization: `Bearer ${this.signedToken}`
            }
        };

        process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"
        
        const req = https.request(options, (res) => {
            if (res.headers.hasOwnProperty("set-cookie")) {
                let cookieValue: string = Object.getOwnPropertyDescriptor(res.headers, "set-cookie").value[0];
                this.cookie = cookieValue.substring(cookieValue.indexOf("=")+1, cookieValue.indexOf("=") + 1 + 36);
            }
        });
            
        req.on('error', (error) => {
            console.log("ERROR", error);
        });
        req.end();
    }

    private getConfigToServerJwt(): Promise<enigmaJS.IConfig> {
        console.log("getConfigToServerJwt");

        return new Promise((resolve, reject) => {
            try {

                const key: jwt.Secret = fs.readFileSync(path.resolve(__dirname, "../jwtTest_private.key"));

                const payload: IPayload = {
                    UserDirectory: this.config.userDirectory,
                    UserId: this.config.userId,
                    Attribute: []
                }

                this.signedToken = jwt.sign(payload, key, { 
                    algorithm: 'RS512' 
                });

                protocol = {
                    headers: {
                        Authorization: `Bearer ${this.signedToken}`
                    }
                }

                const url = `https://${this.config.hostname}/${this.config.proxyPrefix}/app/engineData`

                process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"

                const ws = new websocket(url, protocol);

                const serverConfig = {
                    schema,
                    url: url,
                    createSocket: url => ws,
                };

                resolve(serverConfig);
            } catch (error) {
                reject(error);
            }
        });
    }

    private createConnectionConfig(connectionType: ConnectionType) {
        console.log("createConnectionConfig");

        return new Promise((resolve, reject) => {
            try {
                switch (connectionType) {

                    case ConnectionType.serverDirect:
                        console.log("ConnectionType.serverDirect");
                        this.getConfigToServerDirect()
                            .then((config) => {
                                this.sessionConfig = config;
                                resolve();
                            })
                        .catch((error) => {
                            console.error("ERROR", error);
                        })
                        break;
                
                    case ConnectionType.serverJwt:
                        console.log("ConnectionType.serverJwt");

                        if (typeof(this.cookie) === "undefined") {
                            // this.generateCookieWithJwt()
                            this.getConfigToServerJwt()
                                .then((config) => {
                                    this.sessionConfig = config;
                                    this.generateCookieWithJwt()
                                    resolve();
                                })
                            .catch((error) => {
                                console.error("ERROR", error);
                            })
                        } 
                        else {

                            this.getConfigWithCookieSession()
                                .then((config) => {
                                    this.sessionConfig = config;
                                    resolve();
                                })
                            .catch((error) => {
                                console.error("ERROR", error);
                            })
                        }


                        
                        break;
                
                    default:
                        console.log("ConnectionType.desktop");
                        this.getConfigToDesktop()
                            .then((config) => {
                                this.sessionConfig = config;
                                resolve();
                            })
                        .catch((error) => {
                            console.error("ERROR", error);
                        })
                        break;
                }
            } catch (error) {
                reject(error);
            }
        });
    }

}

function runTest(connectionType:ConnectionType) {
    return new Promise((resolve, reject) => {
        const script = `
            SET ThousandSep='.';
            SET DecimalSep=',';
            SET MoneyThousandSep='.';
            SET MoneyDecimalSep=',';
            SET MoneyFormat='#.##0,00 €;-#.##0,00 €';
            SET TimeFormat='hh:mm:ss';
            SET DateFormat='DD.MM.YYYY';
            SET TimestampFormat='DD.MM.YYYY hh:mm:ss[.fff]';
            SET FirstWeekDay=0;
            SET BrokenWeeks=0;
            SET ReferenceDay=4;
            SET FirstMonthOfYear=1;
            SET CollationLocale='de-DE';
            SET CreateSearchIndexOnReload=1;
            SET MonthNames='Jan.;Feb.;März;Apr.;Mai;Juni;Juli;Aug.;Sep.;Okt.;Nov.;Dez.';
            SET LongMonthNames='Januar;Februar;März;April;Mai;Juni;Juli;August;September;Oktober;November;Dezember';
            SET DayNames='Mo.;Di.;Mi.;Do.;Fr.;Sa.;So.';
            SET LongDayNames='Montag;Dienstag;Mittwoch;Donnerstag;Freitag;Samstag;Sonntag';

            LOAD * INLINE 
            [
            a,b,c
            1,1,1
            2,7,65
            3,2,234
            4,3,5
            2,5,3
            4,2,4
            6,6,3
            4,45,34
            3,2,34
            4,3,2
            ](delimiter is ',');
        `
        let connection: Q2gConnection = new Q2gConnection(config);
        let app: Q2gApp;
        const stateNameOne: string = "StateOne";
        const stateNameTwo: string = "StateTwo";
        const stateNameThree: string = "StateThree";

        
        //#region setup app
        connection.connect(connectionType)
            .then(() => {
                return connection.open();
            })
            .then((global) => {
                app = new Q2gApp("ApplyStatesTestApplication", global);
                return app.createApp();
            })
            .then(() => {
                return app.openApp()
            })
            .then(() => {
                return app.setScriptAndReload(script);
            })
            .then(() => {
                return app.setAlternateStates(stateNameOne);
            })
            .then(() => {
                return app.createSheetObjects();
            })
            .then(() => {
                return app.insertNewFilterPaneWithFieldPropertyTree(idFirstObject, idSecondObject);
            })
            .then(() => {
                return app.selectValues(idFirstObject);
            })
            .then(() => {
                let msg = `       Expected Result: First Object: 2 | Second Object: 2`
                outputs.push(msg);
                return app.compareSelected(idFirstObject, idSecondObject);
            })
            .then(() => {
                return app.doSave();
            })
            .then(() => {
                app = null;
                return connection.disconnect();
            })
        //#endregion

        //#region first test - set existing state to object
            .then(() => {
                outputs.push(" ");
                let msg = "    first test part 1 - set existing state to object";
                console.log(" ");
                console.log(`**** ${msg} ****`);
                outputs.push(msg);

                return connection.connect(connectionType);
            })
            .then(() => {
                return connection.open();
            })
            .then((global) => {
                app = new Q2gApp("ApplyStatesTestApplication", global);
                return app.openApp();
            })
            .then(() => {
                return app.showAlternateStatesOnApp();
            })
            .then(() => {
                return app.clearSelection();
            })
            .then(() => {
                return app.setSheetObjectToState(stateNameOne, idFirstObject);
            })
            .then(() => {
                return app.selectValues(idFirstObject);
            })
            .then(() => {
                let msg = `       Expected Result: First Object: 2 | Second Object: 0`
                outputs.push(msg);
                return app.compareSelected(idFirstObject, idSecondObject);
            })
            .then(() => {
                return app.doSave();
            })
            .then(() => {
                app = null;
                return connection.disconnect();
            })
        //#endregion

        //#region second test - select object with preset state
            .then(() => {
                outputs.push(" ");
                let msg = "    second test - select object with preset state";
                console.log(" ");
                console.log(`**** ${msg} ****`);
                outputs.push(msg);

                return connection.connect(connectionType);
            })
            .then(() => {
                return connection.open();
            })
            .then((global) => {
                app = new Q2gApp("ApplyStatesTestApplication", global);
                return app.openApp();
            })
            .then(() => {
                return app.showAlternateStatesOnApp();
            })
            .then(() => {
                return app.clearSelection();
            })
            .then(() => {
                return app.selectValues(idFirstObject);
            })
            .then(() => {
                let msg = `       Expected Result: First Object: 2 | Second Object: 0`
                outputs.push(msg);
                return app.compareSelected(idFirstObject, idSecondObject);
            })
            .then(() => {
                return app.doSave();
            })
            .then(() => {
                app = null;
                return connection.disconnect();
            })
        //#endregion

        //#region third test - set to object to new title
            .then(() => {
                outputs.push(" ");
                let msg = "    third test - set to object to new title";
                console.log(" ");
                console.log(`**** ${msg} ****`);
                outputs.push(msg);

                return connection.connect(connectionType);
            })
            .then(() => {
                return connection.open();
            })
            .then((global) => {
                app = new Q2gApp("ApplyStatesTestApplication", global);
                return app.openApp();
            })
            .then(() => {
                return app.showAlternateStatesOnApp();
            })
            .then(() => {
                return app.clearSelection();
            })
            .then(() => {
                return app.setSheetObjectToState(stateNameOne, idFirstObject);
            })
            .then(() => {
                return app.setSheetObjectToNewTitle(idFirstObject);
            })
            .then(() => {
                return app.selectValues(idFirstObject);
            })
            .then(() => {
                let msg = `       Expected Result: First Object: 2 | Second Object: 0`
                outputs.push(msg);
                return app.compareSelected(idFirstObject, idSecondObject);
            })
            .then(() => {
                return app.doSave();
            })
            .then(() => {
                app = null;
                return connection.disconnect();
            })
        //#endregion

        //#region fourth test - select object with preset state after reset title
            .then(() => {
                outputs.push(" ");
                let msg = "    fourth test - select object with preset state after reset title";
                console.log(" ");
                console.log(`**** ${msg} ****`);
                outputs.push(msg);

                return connection.connect(connectionType);
            })
            .then(() => {
                return connection.open();
            })
            .then((global) => {
                app = new Q2gApp("ApplyStatesTestApplication", global);
                return app.openApp();
            })
            .then(() => {
                return app.showAlternateStatesOnApp();
            })
            .then(() => {
                return app.clearSelection();
            })
            .then(() => {
                return app.selectValues(idFirstObject);
            })
            .then(() => {
                let msg = `       Expected Result: First Object: 2 | Second Object: 0`
                outputs.push(msg);
                return app.compareSelected(idFirstObject, idSecondObject);
            })
            .then(() => {
                return app.doSave();
            })
            .then(() => {
                app = null;
                return connection.disconnect();
            })
        //#endregion

        //#region fives test - create new state then select on object with state and remove state
            .then(() => {
                outputs.push(" ");
                let msg = "    fives test - create new state then select on object with state and remove state";
                console.log(" ");
                console.log(`**** ${msg} ****`);
                outputs.push(msg);
                return connection.connect(connectionType);
            })
            .then(() => {
                return connection.open();
            })
            .then((global) => {
                app = new Q2gApp("ApplyStatesTestApplication", global);
                return app.openApp();
            })
            .then(() => {
                return app.showAlternateStatesOnApp();
            })
            .then(() => {
                return app.clearSelection();
            })
            .then(() => {
                return app.setAlternateStates(stateNameTwo);
            })
            .then(() => {
                return app.doSave();
            })
            .then(() => {
                return app.getAppLayout();
            })
            .then(() => {
                return app.selectValues(idFirstObject);
            })
            .then(() => {
                let msg = `       Expected Result: First Object: 2 | Second Object: 0`
                outputs.push(msg);
                return app.compareSelected(idFirstObject, idSecondObject);
            })
            .then(() => {
                return app.removeAlternateStateFromObject(idFirstObject);
            })
            .then(() => {
                return app.doSave();
            })
            .then(() => {
                app = null;
                return connection.disconnect();
            })
    //#endregion

        //#region sixth test - set new state to object
            .then(() => {
                outputs.push(" ");
                let msg = "    sixth test - set new state to object";
                console.log(" ");
                console.log(`**** ${msg} ****`);
                outputs.push(msg);
                return connection.connect(connectionType);
            })
            .then(() => {
                return connection.open();
            })
            .then((global) => {
                app = new Q2gApp("ApplyStatesTestApplication", global);
                return app.openApp();
            })
            .then(() => {
                return app.showAlternateStatesOnApp();
            })
            .then(() => {
                return app.clearSelection();
            })
            .then(() => {
                return app.setAlternateStates(stateNameThree);
            })
            .then(() => {
                return app.setSheetObjectToState(stateNameTwo, idSecondObject);
            })
            .then(() => {
                return app.selectValues(idSecondObject);
            })
            .then(() => {
                let msg = `       Expected Result: First Object: 0 | Second Object: 2`
                outputs.push(msg);
                return app.compareSelected(idFirstObject, idSecondObject);
            })
            .then(() => {
                return app.doSave();
            })
            .then(() => {
                app = null;
                return connection.disconnect();
            })
        //#endregion

        //#region seventh test - remove state from app
            .then(() => {
                outputs.push(" ");
                let msg = "    seventh test - remove state from app";
                console.log(" ");
                console.log(`**** ${msg} ****`);
                outputs.push(msg);
                return connection.connect(connectionType);
            })
            .then(() => {
                return connection.open();
            })
            .then((global) => {
                app = new Q2gApp("ApplyStatesTestApplication", global);
                return app.openApp();
            })
            .then(() => {
                let msg = `       Expected: All States:  StateOne | StateTwo | StateThree`
                outputs.push(msg);
                return app.showAlternateStatesOnApp();
            })
            .then(() => {
                return app.removeAlternateStateFromApp(stateNameOne);
            })
            .then(() => {
                return app.doSave();
            })
            .then(() => {
                app = null;
                return connection.disconnect();
            })
            .then(() => {
                return connection.connect(connectionType);
            })
            .then(() => {
                return connection.open();
            })
            .then((global) => {
                app = new Q2gApp("ApplyStatesTestApplication", global);
                return app.openApp();
            })
            .then(() => {
                let msg = `       Expected: All States:  StateThree | StateTwo`
                outputs.push(msg);
                return app.showAlternateStatesOnApp();
            })
        //#endregion

        //#region clean up
            .then(() => {
                console.log(" ");
                console.log("CLEANUP");
                try {
                    return app.deleteApp();
                } catch (error) {
                    return;
                }
            })
            .then(() => {
                return connection.disconnect();
            })
            .then(() => {
                resolve();
            })
        .catch((error) => {
            console.log("ERROR CHECK")
            app.deleteApp()
                .then(() => {
                    return connection.disconnect();
                })
                .then(() => {
                    console.error("ERROR", error);
                    resolve();
                })
            .catch((error) => {
                console.error("ERROR", error);
                reject();
            })
        })
        //#endregion
    })
}

function main() {

    console.log(" ");
    console.log("**********************");
    console.log("**** test desktop ****");
    console.log("**********************");
    outputs.push(" ");
    let msg = "DESKTOP";
    outputs.push(msg);
    runTest(ConnectionType.desktop)
    .then(() => {
        console.log(" ");
        console.log("***************************");
        console.log("**** test serverDirect ****");
        console.log("***************************");
        outputs.push(" ");
        outputs.push(" ");
        let msg = "SERVER DIRECT";
        outputs.push(msg);
        return runTest(ConnectionType.serverDirect);
    })
    .then(() => {
        console.log(" ");
        console.log("************************");
        console.log("**** test serverJwt ****");
        console.log("************************");
        outputs.push(" ");
        outputs.push(" ");
        let msg = "SERVER JWT";
        outputs.push(msg);
        return runTest(ConnectionType.serverJwt);
    })
    .then(() => {
        console.log(" ");
        console.log(" ");
        console.log(" ");
        console.log("SUMMARY");
        for (const msg of outputs) {
            console.log(msg);
        }
        process.exit();
    })
    .catch((error) => {
        console.error("ERROR", error);
        process.exit();
    })

    

}

main();