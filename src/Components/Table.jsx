import React, { useEffect, useState } from "react";
import Slot from "./Slot";

import { convert2ArraysToDict } from "../Helpers/data";
import "./Table.css";

let availableLvls = [],
  availableMajors = [],
  availableTypes = [];

// let allowedLvls = {},
//   allowedMajors = {},
//   allowedTypes = {};

const getStartEnd = (data = []) => {
  let end = undefined,
    start = undefined;
  const lvlsSet = new Set(),
    majorsSet = new Set(),
    typeSet = new Set();
  for (let index = 0; index < data.length; index++) {
    const row = data[index];
    if (row.hasOwnProperty("الي")) {
      const rowValue = parseInt(row["الي"].split(":")[0]);
      if (end === undefined || end < rowValue) end = rowValue;
    }
    if (row.hasOwnProperty("من")) {
      const rowValue = parseInt(row["من"].split(":")[0]);
      if (start === undefined || start > rowValue) start = rowValue;
    }
    if (row.hasOwnProperty("تدرس للمستوي")) {
      const rowValue = parseInt(row["تدرس للمستوي"]);
      lvlsSet.add(rowValue);
    }
    if (row.hasOwnProperty("كود المقرر")) {
      const rowValue = row["كود المقرر"].charAt(0);
      majorsSet.add(rowValue);
    }
    if (row.hasOwnProperty("نوع الدراسة")) {
      const rowValue = row["نوع الدراسة"];
      typeSet.add(rowValue);
    }
    // console.log("{start,end}", row["من"], row["الي"]);
  }
  availableLvls = Array.from(lvlsSet);
  availableMajors = Array.from(majorsSet);
  availableTypes = Array.from(typeSet);
  return { start, end };
};

const generatePeriodsArray = ({ start = 8, end = 23 }) => {
  const arr = [];
  for (let index = parseInt(start); index < end; index++) {
    arr.push(index + "-" + (index + 1));
  }
  return arr;
};

const generateDaysDict = (data = []) => {
  const days = {};
  for (let index = 0; index < data.length; index++) {
    const row = data[index];
    if (row.hasOwnProperty("اليوم")) {
      const rowDay = row["اليوم"];
      row.lvl = row["تدرس للمستوي"];
      row.type = row["نوع الدراسة"];
      //   console.log('lvl', lvl);
      row.periods = {
        start: parseInt(row["من"].split(":")[0]),
        end: parseInt(row["الي"].split(":")[0]),
      };
      row.class = row["كود المقرر"].charAt(0);
      if (row.lvl)
        row.displayText =
          row["كود المقرر"] +
          " (" +
          row["نوع الدراسة"] +
          ") مج" +
          row["المجموعة"];
      // + " الساعة "+ row["من"];
      row.place =
        row["المكان"].length > 2 ? row["المكان"] : "مدرج " + row["المكان"];
      if (days.hasOwnProperty(rowDay)) {
        if (days[rowDay].hasOwnProperty(row.lvl))
          days[rowDay][row.lvl].push(row);
        else days[rowDay][row.lvl] = [row];
      } else {
        days[rowDay] = { [row.lvl]: [row] };
      }
    }
  }
  //   console.log("days", days);
  return days;
};

const stackClassesPerLvl = (lvl = []) => {
  const rows = [[]];
  for (let i = 0; i < lvl.length; i++) {
    const lecture = lvl[i];
    let insertAt = 0;
    for (let j = 0; j < rows.length; j++) {
      const row = rows[j];
      for (let k = 0; k < row.length; k++) {
        const slot = row[k];
        if (
          !(
            slot.periods.end <= lecture.periods.start ||
            slot.periods.start >= lecture.periods.end
          )
        )
          insertAt = j + 1;
      }
    }
    // console.log('rows.length, insertAt', rows.length, insertAt);
    if (rows.length - 1 < insertAt) rows[insertAt] = [];
    lecture.colSpan = lecture.periods.end - lecture.periods.start;
    rows[insertAt].push(lecture);
  }
  rows.forEach((slots) =>
    slots.sort((a, b) => {
      return a.periods.start - b.periods.start;
    })
  );
  //   console.log("rows", rows);
  return rows;
};

const fillMissingSlots = (rows, periods) => {
  const newRows = [];
  for (let i = 0; i < rows.length; i++) {
    newRows[i] = fillMissingSlotsPerRow(rows[i], periods);
  }
  return newRows;
};
const fillMissingSlotsPerRow = (slots, periods) => {
  //   console.log("slots", slots);
  const newSlots = [];
  let NextPeriodIndex = periods.start;
  for (let i = 0; i < slots.length; i++) {
    const slot = slots[i];
    for (let j = NextPeriodIndex; j < periods.end; j++) {
      if (slot.periods.start > j) newSlots.push({ colSpan: 1 });
      else {
        newSlots.push(slot);
        NextPeriodIndex = slot.periods.end;
        break;
      }
    }
  }
  for (let j = NextPeriodIndex; j < periods.end; j++) {
    newSlots.push({ colSpan: 1 });
  }
  //   console.log("newSlots", newSlots, NextPeriodIndex);
  return newSlots;
};

const RenderDay = ({ daysDict, day, periods, allowedLvls }) => {
  const lvls = [];
  let dayColSpan = 0;
  const singleDay = daysDict[day];
  
  if (
    !allowedLvls ||
    allowedLvls === {} ||
    Object.keys(allowedLvls).length === 0
  )
    return null;

  for (const lvl in singleDay) {
    if (allowedLvls[lvl]) {
      const singleLvl = singleDay[lvl];
      const lvlRows = stackClassesPerLvl(singleLvl);
      lvls.push(fillMissingSlots(lvlRows, periods));
      dayColSpan += lvlRows.length;
    }
  }
  return (
    <>
      <tr>
        <th rowSpan={dayColSpan} align="center" height="50" key={day}>
          {day}
        </th>
        <td
          rowSpan={lvls[0].length}
          align="center"
          height="50"
          key={Object.keys(singleDay)[0]}
        >
          {Object.keys(allowedLvls)[0]}
        </td>
        {lvls[0][0].map((lecture, index) => (
          <Slot lecture={lecture} key={index} />
        ))}
      </tr>
      {lvls[0].slice(1).map((row, i) => (
        <tr key={i}>
          {row.map((lecture, index) => (
            <Slot lecture={lecture} key={index} />
          ))}
        </tr>
      ))}
      {lvls.slice(1).map((lvl, index) => (
        <>
          <tr>
            <td rowSpan={lvl.length} align="center" height="50">
              <b>{Object.keys(allowedLvls)[index + 1]}</b>
            </td>
            {lvl[0].map((lecture, index) => (
              <Slot lecture={lecture} key={index} />
            ))}
          </tr>
          {lvl.slice(1).map((row, i) => (
            <tr key={i}>
              {row.map((lecture, index) => (
                <Slot lecture={lecture} key={index} />
              ))}
            </tr>
          ))}
        </>
      ))}
    </>
  );
};

const Table = ({ title = "Time Table", data = [] }) => {
  const handleLvlsOnChange = (position) => {
    const updatedCheckedState = allowedLvls.map((item, index) =>
      index === position ? !item : item
    );
    console.log("updatedCheckedState", updatedCheckedState);

    setCheckedLvlsState(updatedCheckedState);
  };

  const periods = getStartEnd(data);
  const periodsArr = generatePeriodsArray(periods);
  const daysDict = generateDaysDict(data);

  useEffect(() => {
    setCheckedLvlsState(Array.from(availableLvls.map(() => true)));
  }, [periods.start]);

  const [allowedLvls, setCheckedLvlsState] = useState(
    [true, true, true, true]
    // availableLvls
    // new Array(availableLvls.length).fill(true)
    // Array.from(availableLvls.map(l=> true))
  );

  if (!data || data.length === 0) return <></>;

  return (
    <>
      <div>
        <span>المستويات بالملف: </span>
        {availableLvls.map((l, index) => (
          <>
            <input
              type="checkbox"
              id={`custom-checkbox-${index}`}
              name={l}
              value={l}
              checked={allowedLvls[index]}
              onChange={() => handleLvlsOnChange(index)}
            />
            <label htmlFor={`custom-checkbox-${index}`}>{`(${l})`}</label>
          </>
        ))}
      </div>
      <div>
        <span>التخصصات بالملف: </span>
        {availableMajors.map((m) => (
          <span>{`(${m})`} </span>
        ))}
      </div>
      <div>
        <span>أنواع الدراسة بالملف: </span>
        {availableTypes.map((t) => (
          <span>{`(${t})`} </span>
        ))}
      </div>
      <h1>{title}</h1>
      <table id="export-me" border="5" cellSpacing="0" align="center">
        <thead>
          <tr>
            <th align="center" height="50" width="100">
              اليوم
            </th>
            <th align="center" height="50" width="100">
              المستوى
            </th>
            {periodsArr.map((period) => (
              <th align="center" height="50" width="100" key={period}>
                {period}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <RenderDay
            daysDict={daysDict}
            day="السبت"
            periods={periods}
            allowedLvls={convert2ArraysToDict(availableLvls, allowedLvls)}
            allowedLvls={Object.assign(
              {},
              ...availableLvls
                .map((x, i) => ({ [x]: allowedLvls[i] }))
                .filter((x) => Object.values(x || { 0: false })[0] === true)
            )}
            key={1}
          />
          {/* <RenderDay
            daysDict={daysDict}
            day="الأحد"
            periods={periods}
            key={2}
          />
          <RenderDay
            daysDict={daysDict}
            day="الإثنين"
            periods={periods}
            key={3}
          />
          <RenderDay
            daysDict={daysDict}
            day="الثلاثاء"
            periods={periods}
            key={4}
          />
          <RenderDay
            daysDict={daysDict}
            day="الأربعاء"
            periods={periods}
            key={5}
          />
          <RenderDay
            daysDict={daysDict}
            day="الخميس"
            periods={periods}
            key={6}
          /> */}
          {/* <tr>
            <td rowSpan={5+lvl1Rows.length+lvl2Rows.length+lvl3Rows.length+lvl4Rows.length} align="center" height="50">
              <b>السبت</b>
            </td>
          </tr>
          <tr>
            <td rowSpan={lvl1Rows.length+1} align="center" height="50">
              <b>1</b>
            </td>
          </tr>
            {filledLvl1.map((row) => (
              <tr>
                {row.map((lecture) => (
                  <td colSpan={lecture.colSpan} align="center" height="50">
                    {lecture.displayText}
                    <br />
                    {lecture.place}
                  </td>
                ))}
              </tr>
            ))}
            <tr>
              <td rowSpan={lvl2Rows.length+1} align="center" height="50">
                <b>2</b>
              </td>
            </tr>
            {lvl2Rows.map((row) => (
              <tr>
                {row.map((lecture) => (
                  <td colSpan={lecture.colSpan} align="center" height="50">
                    {lecture.displayText}
                    <br />
                    {lecture.place}
                  </td>
                ))}
              </tr>
            ))}
            <tr>
              <td rowSpan={lvl3Rows.length+1} align="center" height="50">
                <b>3</b>
              </td>
            </tr>
            {lvl3Rows.map((row) => (
              <tr>
                {row.map((lecture) => (
                  <td colSpan={lecture.colSpan} align="center" height="50">
                    {lecture.displayText}
                    <br />
                    {lecture.place}
                  </td>
                ))}
              </tr>
            ))}
            <tr>
              <td rowSpan={lvl4Rows.length+1} align="center" height="50">
                <b>4</b>
              </td>
            </tr>
            {lvl4Rows.map((row) => (
              <tr>
                {row.map((lecture) => (
                  <td colSpan={lecture.colSpan} align="center" height="50">
                    {lecture.displayText}
                    <br />
                    {lecture.place}
                  </td>
                ))}
              </tr>
            ))} */}
          {/* <tr>
            <td align="center" height="50">
              <b>Tuesday</b>
            </td>
            <td colSpan="3" align="center" height="50">
              LAB
            </td>
            <td align="center" height="50">
              Eng
            </td>
            <td align="center" height="50">
              Che
            </td>
            <td align="center" height="50">
              Mat
            </td>
            <td align="center" height="50">
              SPORTS
            </td>
          </tr>
          <tr>
            <td align="center" height="50">
              <b>Wednesday</b>
            </td>
            <td align="center" height="50">
              Mat
            </td>
            <td align="center" height="50">
              phy
            </td>
            <td align="center" height="50">
              Eng
            </td>
            <td align="center" height="50">
              Che
            </td>
            <td colSpan="3" align="center" height="50">
              LIBRARY
            </td>
          </tr>
          <tr>
            <td align="center" height="50">
              <b>Thursday</b>
            </td>
            <td align="center" height="50">
              Phy
            </td>
            <td align="center" height="50">
              Eng
            </td>
            <td align="center" height="50">
              Che
            </td>
            <td colSpan="3" align="center" height="50">
              LAB
            </td>
            <td align="center" height="50">
              Mat
            </td>
          </tr>
          <tr>
            <td align="center" height="50">
              <b>Friday</b>
            </td>
            <td colSpan="3" align="center" height="50">
              LAB
            </td>
            <td align="center" height="50">
              Mat
            </td>
            <td align="center" height="50">
              Che
            </td>
            <td align="center" height="50">
              Eng
            </td>
            <td align="center" height="50">
              Phy
            </td>
          </tr>
          <tr>
            <td align="center" height="50">
              <b>Saturday</b>
            </td>
            <td align="center" height="50">
              Eng
            </td>
            <td align="center" height="50">
              Che
            </td>
            <td align="center" height="50">
              Mat
            </td>
            <td colSpan="3" align="center" height="50">
              SEMINAR
            </td>
            <td align="center" height="50">
              SPORTS
            </td>
          </tr> */}
        </tbody>
      </table>
    </>
  );
};

export default Table;
