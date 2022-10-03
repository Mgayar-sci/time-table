import React from "react";

const Slot = ({ lecture }) => {
  return (
    <td
      colSpan={lecture.colSpan}
      align="center"
      height="50"
      className={lecture.class}
    >
      {lecture.displayText}
      <br />
      {lecture.place}
    </td>
  );
};

export default Slot;
