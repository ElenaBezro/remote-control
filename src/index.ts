import { httpServer } from "./http_server/index";
import { down, left, mouse, right, up } from "@nut-tree/nut-js";
import { createServer } from "node:http";
import os from "node:os";
import { WebSocketServer, createWebSocketStream } from "ws";
import { drawCircle, drawRectangle, getScreenShot } from "./drawing/index";

const HTTP_PORT = 8181;

// TODO: refactor, find a better place for nut init
mouse.config.mouseSpeed = 250;

httpServer.listen(HTTP_PORT, () => {
  console.log(`Start static http server on the ${HTTP_PORT} port!`);
});

const server = createServer((req, res) => {
  console.log(req.url);
  if (req.method === "GET" && req.url === "/healthcheck") {
    res.end("OK!");
    return;
  }
});

const wss = new WebSocketServer({ server });
const WS_PORT: number = 8080;

const getIPAddress = (): string => {
  var interfaces = os.networkInterfaces();
  for (var devName in interfaces) {
    const iface = interfaces[devName];
    if (iface) {
      for (let i = 0; i < iface.length; i++) {
        const alias = iface[i];
        if (alias.family === "IPv4" && alias.address !== "127.0.0.1" && !alias.internal) return alias.address;
      }
    }
  }
  return "0.0.0.0";
};

wss.on("connection", function connection(ws) {
  console.log(`WS port: ${WS_PORT}`);
  console.log(`IP-address: ${getIPAddress()}`);
  const duplex = createWebSocketStream(ws, { encoding: "utf8", decodeStrings: false });
  //TODO: обработка ошибок?

  duplex.on("data", async (command: string) => {
    try {
      console.log("received: %s", command);

      if (command.startsWith("mouse_up")) {
        let commandText = command.split(" ")[0];
        await mouse.move(up(+command.slice(commandText.length)));
        const msgToSendBack = command.split(" ").join("");
        duplex.write(msgToSendBack, (err) => {
          if (err) {
            console.error("Oops, something went wrong", err);
          }
          console.log(`send: ${command.slice(0, 8)} on${command.slice(8)} px \n`);
        });
      }

      if (command.startsWith("mouse_down")) {
        let commandText = command.split(" ")[0];
        await mouse.move(down(+command.slice(commandText.length)));
        const msgToSendBack = command.split(" ").join("");
        duplex.write(msgToSendBack, (err) => {
          if (err) {
            console.error("Oops, something went wrong", err);
          }
          console.log(`send: ${command.slice(0, commandText.length)} on${command.slice(commandText.length)} px \n`);
        });
      }

      if (command.startsWith("mouse_left")) {
        let commandText = command.split(" ")[0];
        await mouse.move(left(+command.slice(commandText.length)));
        const msgToSendBack = command.split(" ").join("");
        duplex.write(msgToSendBack, (err) => {
          if (err) {
            console.error("Oops, something went wrong", err);
          }
          console.log(`send: ${command.slice(0, commandText.length)} on${command.slice(commandText.length)} px \n`);
        });
      }

      if (command.startsWith("mouse_right")) {
        let commandText = command.split(" ")[0];
        await mouse.move(right(+command.slice(commandText.length)));
        const msgToSendBack = command.split(" ").join("");
        duplex.write(msgToSendBack, (err) => {
          if (err) {
            console.error("Oops, something went wrong", err);
          }
          console.log(`send: ${command.slice(0, commandText.length)} on${command.slice(commandText.length)} px \n`);
        });
      }

      if (command.startsWith("mouse_position")) {
        const { x, y } = await mouse.getPosition();
        const msgToSendBack = `${command} ${x},${y}`;

        duplex.write(msgToSendBack, (err) => {
          if (err) {
            console.error("Oops, something went wrong", err);
            // TODO: return ?
          }
          console.log(`send: ${msgToSendBack}\n`);
        });
      }

      if (command.startsWith("draw_square")) {
        const [commandText, squareSideStr] = command.split(" ");
        const squareSide = +squareSideStr;
        //TODO: read canvas's edge and draw only within the frame
        await drawRectangle(squareSide, squareSide);

        duplex.write(command, (err) => {
          if (err) {
            console.error("Oops, something went wrong", err);
          }
          console.log(`send: ${command}} \n`);
        });
      }

      if (command.startsWith("draw_rectangle")) {
        const [_commandText, firstSideStr, secondSideStr] = command.split(" ");
        const firstSide = +firstSideStr;
        const secondSide = +secondSideStr;
        await drawRectangle(firstSide, secondSide);

        duplex.write(command, (err) => {
          if (err) {
            console.error("Oops, something went wrong", err);
          }
          console.log(`send: ${command}} \n`);
        });
      }

      if (command.startsWith("draw_circle")) {
        const [_commandText, radiusStr] = command.split(" ");
        const radius = +radiusStr;
        await drawCircle(radius);

        duplex.write(command, (error) => {
          if (error) {
            console.error("Oops, something went wrong", error);
          }
          console.log(`send: ${command}} \n`);
        });
      }

      if (command.startsWith("prnt_scrn")) {
        const { x, y } = await mouse.getPosition();
        const screenShot = await getScreenShot(x, y);

        duplex.write(screenShot, (error) => {
          if (error) {
            console.error("Oops, something went wrong", error);
          }
          console.log(`send: ${command}} \n`);
        });
      }
    } catch (error) {
      if (error instanceof Error) {
        console.log(error.message);
      }
    }
  });
});

process.on("SIGINT", () => {
  wss.close();
  server.close();
  httpServer.close();
});

server.listen(WS_PORT, () => {
  console.log("WS server started on port 8080");
});
