import { useMemo, useRef, useEffect, useState } from "react";
import { Frame } from "./Vector";

const Mesh = () => {
  const c = useRef<HTMLCanvasElement | null>(null);
  const [drawIntervall, setDrawIntervall] = useState<number | null>(null);

  const initFrame = () => {
    let f = new Frame(window.innerHeight, window.innerWidth);
    f.addLight(
      0,
      100,
      100,
      window.innerWidth * 0.1,
      window.innerHeight * 0.1,
      50,
    );
    f.addLight(
      100,
      0,
      100,
      window.innerWidth * 0.9,
      window.innerHeight * 0.9,
      50,
    );
    return f;
  };

  const frame = useMemo(() => {
    return initFrame();
  }, [c.current]);

  const drawFrame = () => {
    if (c.current) {
      // console.log('draw frame:	' , frame)
      const context = c.current.getContext("2d");
      context && context.clearRect(0, 0, c.current.width, c.current.height);
      context && frame.drawOnCanvas(context);
    }
  };

  useEffect(() => {
    if (frame && !drawIntervall) {
      // const i = setInterval(drawFrame, 1000 / 60)
      // console.log('set intervall ', i)
      // setDrawIntervall(i)
      drawFrame();
    }

    return () => {
      drawIntervall && clearInterval(drawIntervall);
    };
  }, [c.current, frame]);

  return (
    <canvas
      ref={c}
      height={window.innerHeight}
      width={window.innerWidth}
      onClick={() => drawFrame()}
    />
  );
};

export default Mesh;
