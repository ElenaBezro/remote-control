"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var index_js_1 = require("./src/http_server/index.js");
var nut_js_1 = require("@nut-tree/nut-js");
var node_http_1 = require("node:http");
var ws_1 = require("ws");
var HTTP_PORT = 8181;
index_js_1.httpServer.listen(HTTP_PORT, function () {
    console.log("Start static http server on the ".concat(HTTP_PORT, " port!"));
});
var server = (0, node_http_1.createServer)(function (req, res) {
    console.log(req.url);
    if (req.method === "GET" && req.url === "/healthcheck") {
        res.end("OK!");
        return;
    }
});
var wss = new ws_1.WebSocketServer({ server: server });
wss.on("connection", function connection(ws) {
    var _this = this;
    // TODO: display webSocket params
    console.log("A new client Connected!");
    var duplex = (0, ws_1.createWebSocketStream)(ws, { encoding: "utf8", decodeStrings: false });
    duplex.on("data", function (command) { return __awaiter(_this, void 0, void 0, function () {
        var msgToSendBack;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log("received: %s", command);
                    if (!command.startsWith("mouse_up")) return [3 /*break*/, 2];
                    return [4 /*yield*/, nut_js_1.mouse.move((0, nut_js_1.up)(command.slice(8)))];
                case 1:
                    _a.sent();
                    msgToSendBack = command.split(" ").join("");
                    duplex.write(msgToSendBack, function (err) {
                        if (err) {
                            console.log("Oops, something went wrong");
                        }
                        console.log("send: ".concat(command.slice(0, 8), " on").concat(command.slice(8), " px \n"));
                    });
                    _a.label = 2;
                case 2: return [2 /*return*/];
            }
        });
    }); });
});
server.listen(8080, function () {
    console.log("server started on port 8080");
});
