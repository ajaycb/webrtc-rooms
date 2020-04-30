import React, { useRef, useEffect, useState } from "react";
import LiterallyCanvas from "./canvas/LiterallyCanvas";

import Pencil from "./canvas/tools/Pencil";
import Highlighter from "./canvas/tools/Highlighter";
import Line from "./canvas/tools/Line";
import Pan from "./canvas/tools/Pan";

const Board = ({ width = 800, height = 450, showTools = true, boardRoom }) => {
  let board = useRef(null);
  const [tools] = useState([
    { display: "Pencil", klass: Pencil },
    { display: "Line", klass: Line },
    { display: "Pan", klass: Pan },
    { display: "Lazer", klass: Highlighter },
  ]);
  const [lc, setLc] = useState(
    new LiterallyCanvas({
      imageURLPrefix: "lib/img",
      primaryColor: "hsla(0, 0%, 0%, 0.5)",
      secondaryColor: "hsla(0, 0%, 100%, 0.5)",
      backgroundColor: "#eeeeee",
      strokeWidths: [1, 2, 5, 10, 20, 30],
      defaultStrokeWidth: 5,
      keyboardShortcuts: false,
      imageSize: { width, height },
      backgroundShapes: [],
      watermarkImage: null,
      watermarkScale: 1,
      zoomMin: 0.2,
      zoomMax: 4.0,
      zoomStep: 0.2,
      snapshot: null,
      tools: tools.map((t) => t.klass),
    })
  );

  useEffect(() => {
    lc.bindToElement(board.current);
    lc.on("shapeSave", (data) => {
      console.log("Drawing", data, lc.getSnapshot());
      boardRoom.send(lc.getSnapshot());
    });
    if (boardRoom) {
      boardRoom.on("receive", (msg) => {
        console.log("got message", msg);
        lc.loadSnapshot(msg);
      });
    }
  }, []);

  return (
    <div>
      {showTools && (
        <div>
          {tools.map((t, i) => (
            <button
              onClick={() => {
                console.warn("tool", t);
                t.instance = t.instance || new t.klass(lc);
                lc.setTool(t.instance);
              }}
            >
              {t.display}
            </button>
          ))}
        </div>
      )}
      <div ref={board} style={{ width, height, border: "1px solid #eee" }} />
    </div>
  );
};
export default Board;
