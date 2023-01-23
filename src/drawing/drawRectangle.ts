import { Button, mouse, Point, straightTo } from "@nut-tree/nut-js";

const drawRectangle = async (width: number, height: number): Promise<void> => {
  const mousePosition = await mouse.getPosition();

  const { x, y } = mousePosition;
  const points = [
    new Point(x, y),
    new Point(x + width, y),
    new Point(x + width, y + height),
    new Point(x, y + height),
    new Point(x, y),
  ];

  await mouse.pressButton(Button.LEFT);

  for (const point of points) {
    const path = await straightTo(point);
    await mouse.move(path);
  }

  await mouse.releaseButton(Button.LEFT);
};

export { drawRectangle };
