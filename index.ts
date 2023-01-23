import { httpServer } from "./src/http_server/index.js";
import { Button, down, left, mouse, MouseClass, Point, right, up } from "@nut-tree/nut-js";
import { createServer } from "node:http";
import * as WebSocket from "ws";
import { WebSocketServer, createWebSocketStream } from "ws";

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

wss.on("connection", function connection(ws) {
  // TODO: display webSocket params
  console.log("A new client Connected!");
  const duplex = createWebSocketStream(ws, { encoding: "utf8", decodeStrings: false });

  duplex.on("data", async (command: string) => {
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
      let commandText = command.split(" ")[0];
      const mousePosition = await mouse.getPosition();
      const msgToSendBack = command + " " + mousePosition.x + "," + mousePosition.y;
      duplex.write(msgToSendBack, (err) => {
        if (err) {
          console.error("Oops, something went wrong", err);
          // TODO: return ?
        }
        console.log(`send: ${command} ${mousePosition.toString()} \n`);
      });
    }

    if (command.startsWith("draw_square")) {
      const [commandText, squareSideStr] = command.split(" ");
      const squareSide = +squareSideStr;
      //console.log(commandText);
      //TODO: read canvas's edge and draw only within the frame

      const { x, y } = await mouse.getPosition();
      mouse.drag([new Point(x, y), new Point(x + squareSide, y)]);
      mouse.drag([new Point(x + squareSide, y), new Point(x + squareSide, y + squareSide)]);
      mouse.drag([new Point(x + squareSide, y + squareSide), new Point(x, y + squareSide)]);
      mouse.drag([new Point(x, y + squareSide), new Point(x, y)]);
      duplex.write(command, (err) => {
        if (err) {
          console.error("Oops, something went wrong", err);
        }
        console.log(`send: ${command}} \n`);
      });
    }

    if (command.startsWith("draw_rectangle")) {
      let commandText = command.split(" ")[0];
      const firstSide = +command.split(" ")[1];
      const secondSide = +command.split(" ")[2];
      console.log(commandText);
      //TODO: read canvas's edge and draw only within the frame

      const mousePosition = await mouse.getPosition();

      const { x, y } = mousePosition;
      const path = [
        new Point(x, y),
        new Point(x + firstSide, y),
        new Point(x + firstSide, y + secondSide),
        new Point(x, y + secondSide),
        new Point(x, y),
      ];

      await mouse.pressButton(Button.LEFT);

      await path.reduce(
        (mouseMovePromise, point) =>
          mouseMovePromise.then(async (previousPoint) => {
            await mouse.drag([previousPoint, point]);
            return point;
          }),
        Promise.resolve<Point>(path[0])
      );
      // await mouse.move(path);
      await mouse.releaseButton(Button.LEFT);

      duplex.write(command, (err) => {
        if (err) {
          console.error("Oops, something went wrong", err);
        }
        console.log(`send: ${command}} \n`);
      });
    }

    if (command.startsWith("draw_circle")) {
      let commandText = command.split(" ")[0];
      const radius = +command.split(" ")[1];
      //TODO: read canva's edge and draw only within the frame

      const mousePosition = await mouse.getPosition();
      const xCenter = mousePosition.x - radius;
      const yCenter = mousePosition.y;

      const path = [...Array(360)].map(
        (_, deg) =>
          new Point(
            xCenter + Math.round(Math.cos((2 * Math.PI * deg) / 360) * radius),
            yCenter + Math.round(Math.sin((2 * Math.PI * deg) / 360) * radius)
          )
      );

      console.log(`mouse (x,y): (${mousePosition.x},${mousePosition.y})`);
      console.log(path, JSON.stringify(path.map((p) => `[${p.x}, ${p.y}]`)));

      await mouse.pressButton(Button.LEFT);
      await mouse.move(path);
      await mouse.releaseButton(Button.LEFT);

      duplex.write(command, (error) => {
        if (error) {
          console.error("Oops, something went wrong", error);
        }
        console.log(`send: ${command}} \n`);
      });
    }
  });
});

server.listen(8080, () => {
  console.log("server started on port 8080");
});
