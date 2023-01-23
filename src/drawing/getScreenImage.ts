import { Region, screen } from "@nut-tree/nut-js";
import Jimp from "jimp";
import { SCREENSHOT_HEIGHT, SCREENSHOT_WIDTH } from "./constants";

const getScreenShot = async (x: number, y: number): Promise<string> => {
  const region = new Region(
    Math.max(0, x - SCREENSHOT_WIDTH / 2),
    Math.max(0, y - SCREENSHOT_HEIGHT / 2),
    SCREENSHOT_WIDTH,
    SCREENSHOT_HEIGHT
  );

  screen.highlight(region);
  const screenImage = await screen.grabRegion(region);
  const screenImageToRGB = await screenImage.toRGB();

  const screenImageToJimp = new Jimp({
    data: screenImageToRGB.data,
    width: screenImageToRGB.width,
    height: screenImageToRGB.height,
  });
  const buffer = await screenImageToJimp.getBufferAsync(Jimp.MIME_PNG);
  return buffer.toString("base64");
};

export { getScreenShot };
