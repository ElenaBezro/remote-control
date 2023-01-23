import { Button, mouse, Point } from "@nut-tree/nut-js";

const drawCircle = async (radius: number, stepInDegrees = 1): Promise<void> => {
  const { x, y } = await mouse.getPosition();
  const xCenter = x - radius;
  const yCenter = y;

  const stepInRadians = 2 * Math.PI * stepInDegrees;

  const path = [...Array(360 / stepInDegrees)].map(
    (_, i) =>
      new Point(
        xCenter + Math.round(Math.cos((i * stepInRadians) / 360) * radius),
        yCenter + Math.round(Math.sin((i * stepInRadians) / 360) * radius)
      )
  );

  await mouse.pressButton(Button.LEFT);
  await mouse.move(path);
  await mouse.releaseButton(Button.LEFT);
};

export { drawCircle };
