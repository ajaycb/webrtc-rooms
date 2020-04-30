import React, { useState, useEffect } from "react";
import { WhiteBoardData } from "janus-api";
import Board from "./board/index";

const WhiteBoard = ({ room, ...otherProps }) => {
  let [board] = useState(new WhiteBoardData(room));

  return <Board boardRoom={board} {...otherProps} />;
};
export default WhiteBoard;
