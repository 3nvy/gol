import { useSelector, useDispatch } from "react-redux";
import { setRunningState, setStep, setSpeed } from "./store/gameControlsSlice";
import { setPattern } from "./store/patternSlice";

const GameControls = () => {
  const dispatch = useDispatch();

  const { isRunning, speed, speedSteps, speedRange, step, stepRange } = useSelector((state) => state.controls);

  const readPattern = (pattern) => {
    const newCellSet = new Set();
    const moves = pattern.replaceAll("$", "$ ").replaceAll("b", "b ").replaceAll("o", "o ").slice(0, -1).split(" ");

    let x = 0;
    let y = 0;

    for (let move of moves) {
      const paddedMove = move.padStart(2, 1);
      const [steps, state] = paddedMove.match(new RegExp(`.{1,${paddedMove.length - 1}}`, "g"));

      if (state === "$") {
        y += +steps;
        x = 0;
      } else if (state === "b") x += +steps;
      else {
        for (let i = 0; i < steps; i++) {
          x++;
          newCellSet.add(`${x}:${y}`);
        }
      }
    }

    dispatch(setPattern([...newCellSet]));
  };

  const onRunningBtnClick = () => dispatch(setRunningState(!isRunning));

  const onPatternLoadBtnClick = () => {
    dispatch(setRunningState(false));

    let pattern = prompt("Input Pattern");
    if (pattern != null) {
      readPattern(pattern);
    }
  };

  const onStepChange = (evt) => dispatch(setStep(+evt.target.value));

  const onSpeedChange = (evt) => dispatch(setSpeed(+evt.target.value));

  return (
    <div className="game-controls-wrapper">
    
      <div className="slide-container">
        <label>Zoom:</label>
        <input type="range" min={stepRange.min} max={stepRange.max} value={step} onChange={onStepChange} />
      </div>

      <div className="slide-container">
        <label>Speed:</label>
        <input
          type="range"
          min={speedRange.min}
          max={speedRange.max}
          value={speed}
          step={speedSteps}
          onChange={onSpeedChange}
        />
      </div>

      <div className="button-group">
        <button onClick={onRunningBtnClick}>{isRunning ? "Stop" : "Start"}</button>
        <button onClick={onPatternLoadBtnClick}>Load Pattern</button>
      </div>
    </div>
  );
};

export default GameControls;
