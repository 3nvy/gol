import { useRef, useEffect, useState, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { toggleCell, setPattern } from "./store/patternSlice";

const neighborCoordinates = [
  [-1, -1],
  [0, -1],
  [1, -1],
  [-1, 0],
  [1, 0],
  [-1, 1],
  [0, 1],
  [1, 1],
];

const Canvas = (props) => {
  const canvasRef = useRef(null);

  const [drawnCellsCount, setDrawnCellsCount] = useState(0);
  const [runningIntervalId, setRunningInterval] = useState(0);

  const [reDraw, updateDrawState] = useState();
  const reDrawCanvas = useCallback(() => updateDrawState({}), []);

  const [{ width, height }, setDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  const startPos = useRef(null);
  const setStartPos = (pos) => (startPos.current = pos);

  const offsetMoveInit = useRef({ x: 0, y: 0 });
  const updateWorldMoveInit = (pos) => (offsetMoveInit.current = pos);

  const dragOffsetMoveInit = useRef({ x: 0, y: 0 });
  const updateDragOffsetMoveInit = (pos) => (dragOffsetMoveInit.current = pos);

  const worldOffset = useRef({ x: 0, y: 0 });
  const moveWorldOffset = (pos) => (worldOffset.current = pos);

  const dragOffset = useRef({ x: 0, y: 0 });
  const moveDragOffset = (pos) => (dragOffset.current = pos);

  const stepsRef = useRef({ step: 0, oldStep: 0 });

  const cells = useSelector((state) => state.pattern);
  const { isRunning, speed, step, oldStep } = useSelector((state) => state.controls);

  const dispatch = useDispatch();

  const clearCanvas = (ctx) => {
    let left = -Math.ceil(ctx.canvas.width / stepsRef.current.step) * stepsRef.current.oldStep;
    let top = -Math.ceil(ctx.canvas.height / stepsRef.current.step) * stepsRef.current.oldStep;
    let right = 2 * ctx.canvas.width;
    let bottom = 2 * ctx.canvas.height;
    ctx.clearRect(left, top, right - left, bottom - top);
  };

  const draw = (ctx) => {
    let drawnCells = 0;
    clearCanvas(ctx);
    ctx.strokeStyle = "#b1abab";
    ctx.fillStyle = "yellow";

    // Disable grid re-render when running (Performance Increased)
    let left = -Math.ceil(ctx.canvas.width / stepsRef.current.step) * stepsRef.current.step;
    let top = -Math.ceil(ctx.canvas.height / stepsRef.current.step) * stepsRef.current.step;
    let right = 2 * ctx.canvas.width;
    let bottom = 2 * ctx.canvas.height;

    if (!isRunning) {
      ctx.beginPath();
      for (let x = left; x < right; x += stepsRef.current.step) {
        ctx.moveTo(x, top);
        ctx.lineTo(x, bottom);
      }
      for (let y = top; y < bottom; y += stepsRef.current.step) {
        ctx.moveTo(left, y);
        ctx.lineTo(right, y);
      }

      ctx.stroke();
    }

    for (let cc of cells) {
      const [x, y] = cc.split(":");
      const fX = +x * stepsRef.current.step - worldOffset.current.x * stepsRef.current.step;
      const pfX = +x * stepsRef.current.step - dragOffset.current.x * stepsRef.current.step;

      const fY = +y * stepsRef.current.step - worldOffset.current.y * stepsRef.current.step;
      const pfY = +y * stepsRef.current.step - dragOffset.current.y * stepsRef.current.step;

      if (
        pfX >= 0 - stepsRef.current.step &&
        pfX <= ctx.canvas.width + stepsRef.current.step &&
        pfY >= 0 - stepsRef.current.step &&
        pfY <= ctx.canvas.height + stepsRef.current.step
      ) {
        drawnCells++;
        ctx.fillRect(fX, fY, stepsRef.current.step, stepsRef.current.step);
        if (stepsRef.current.step > 3) ctx.strokeRect(fX, fY, stepsRef.current.step, stepsRef.current.step);
      }
    }

    setDrawnCellsCount(drawnCells)
  };

  const calculateWorldOffset = (evt, canvas) => {
    const offsetMoveFinal = getPos(evt, canvas);
    const offsetX = Math.round((offsetMoveInit.current.x - offsetMoveFinal.x) / stepsRef.current.step);
    const offsetY = Math.round((offsetMoveInit.current.y - offsetMoveFinal.y) / stepsRef.current.step);

    const worldOffsetX = worldOffset.current.x + offsetX;
    const worldOffsetY = worldOffset.current.y + offsetY;

    moveWorldOffset({ x: worldOffsetX, y: worldOffsetY });
    moveDragOffset({ x: worldOffsetX, y: worldOffsetY });
  };

  const calculateDragOffset = (offsetMoveFinal) => {
    const offsetX =
      offsetMoveInit.current.x - offsetMoveFinal.x < 0
        ? Math.ceil(Math.abs((offsetMoveInit.current.x - offsetMoveFinal.x) / stepsRef.current.step)) * -1
        : Math.ceil((offsetMoveInit.current.x - offsetMoveFinal.x) / stepsRef.current.step);
    const offsetY =
      offsetMoveInit.current.y - offsetMoveFinal.y < 0
        ? Math.ceil(Math.abs((offsetMoveInit.current.y - offsetMoveFinal.y) / stepsRef.current.step)) * -1
        : Math.ceil((offsetMoveInit.current.y - offsetMoveFinal.y) / stepsRef.current.step);

    moveDragOffset({
      x: dragOffsetMoveInit.current.x + offsetX,
      y: dragOffsetMoveInit.current.y + offsetY,
    });
  };

  const reset = (ctx) => {
    setStartPos(null);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    reDrawCanvas();
  };

  const getPos = (evt, canvas) => ({
    x: (evt.changedTouches?.[0].clientX ?? evt.touches?.[0].clientX ?? evt.clientX) - canvas.offsetLeft,
    y: (evt.changedTouches?.[0].clientY ?? evt.touches?.[0].clientY ?? evt.clientY) - canvas.offsetTop,
  });

  const nextCellState = () => {
    const newCellSet = new Set();
    const cellMap = new Map(cells.map((cc) => [cc, { alive: true, aliveNext: false, isNew: false }]));

    for (let [cc, { alive, isNew }] of cellMap) {
      const [x, y] = cc.split(":");
      const aliveNeighbors = neighborCoordinates.reduce((acc, [ncX, ncY]) => {
        const nc = `${+x + ncX}:${+y + ncY}`;
        const cell = cellMap.get(nc);
        if (cell) acc += cellMap.get(nc)?.alive || 0;
        else if (!isNew) cellMap.set(nc, { alive: false, aliveNext: false, isNew: true });

        return acc;
      }, 0);

      if ((!alive && aliveNeighbors === 3) || (alive && (aliveNeighbors === 2 || aliveNeighbors === 3)))
        newCellSet.add(cc);
    }

    dispatch(setPattern([...newCellSet]));
  };

  const handleCanvasClick = (evt) => {
    evt.preventDefault();
    const [x, y] = [
      Math.floor(evt.pageX / stepsRef.current.step) + worldOffset.current.x,
      Math.floor(evt.pageY / stepsRef.current.step) + worldOffset.current.y,
    ];
    dispatch(toggleCell(`${x}:${y}`));
  };

  const handleMouseDown = (evt) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const currentPos = getPos(evt, canvas);

    reset(ctx);
    updateWorldMoveInit(currentPos);
    setStartPos(currentPos);
    updateDragOffsetMoveInit({
      x: dragOffset.current.x,
      y: dragOffset.current.y,
    });
  };

  const handleMouseUp = (evt) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    calculateWorldOffset(evt, canvas);
    reset(ctx);
  };

  const handleMouseMove = (evt) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    // Only move the grid when we registered a mousedown event
    if (!startPos.current) return;
    let pos = getPos(evt, canvas);
    calculateDragOffset(pos);
    // Move coordinate system in the same way as the cursor
    ctx.translate(pos.x - startPos.current.x, pos.y - startPos.current.y);
    reDrawCanvas();
    setStartPos(pos);
  };

  /**
   * Handle page resize
   */
  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  /**
   * Update Step and OldStep states used within the draw functionality
   */
  useEffect(() => {
    stepsRef.current = { step, oldStep };
  }, [step]);

  /**
   * Handle canvas redraw
   */
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    draw(ctx);
  }, [width, height, cells, reDraw, isRunning, step]);

  /**
   * Handle game running state
   */
  useEffect(() => {
    if (isRunning) {
      const newRunningIntervalId = setTimeout(() => nextCellState(), speed);
      setRunningInterval(newRunningIntervalId);
    } else {
      clearTimeout(runningIntervalId);
      setRunningInterval(0);
    }

    return clearTimeout(runningIntervalId);
  }, [isRunning, cells, speed]);

  /**
   * Handle canvas mouse events
   */
  useEffect(() => {
    const canvas = canvasRef.current;

    canvas.addEventListener("contextmenu", handleCanvasClick);
    canvas.addEventListener("mousedown", handleMouseDown);
    canvas.addEventListener("mouseup", handleMouseUp);
    canvas.addEventListener("mousemove", handleMouseMove);

    canvas.addEventListener("touchstart", handleMouseDown);
    canvas.addEventListener("touchend", handleMouseUp);
    canvas.addEventListener("touchmove", handleMouseMove);

    return () => {
      canvas.removeEventListener("contextmenu", handleCanvasClick);
      canvas.removeEventListener("mousedown", handleMouseDown);
      canvas.removeEventListener("mouseup", handleMouseUp);
      canvas.removeEventListener("mousemove", handleMouseMove);

      canvas.removeEventListener("touchstart", handleMouseDown);
      canvas.removeEventListener("touchend", handleMouseUp);
      canvas.removeEventListener("touchmove", handleMouseMove);
    };
  }, []);

  return (
    <>
      <canvas width={width} height={height} ref={canvasRef} {...props} />
      <div className="drawn-cells-count">Cell Count: {drawnCellsCount}</div>
    </>
  );
};

export default Canvas;
