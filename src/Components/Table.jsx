import React, { useEffect, useState } from "react";
import SingleDay from "./SingleDay";

import { convert2ArraysToDict, generateDaysDict, generatePeriodsArray, getStartEnd } from "../Helpers/data";
import "./Table.css";



const Table = ({ title = "Time Table", data = [] }) => {
  const handleLvlsOnChange = (position) => {
    const updatedCheckedState = allowedLvls.map((item, index) =>
      index === position ? !item : item
    );
    console.log("updatedCheckedState", updatedCheckedState);

    setCheckedLvlsState(updatedCheckedState);
  };
  const handleMajorsOnChange = (position) => {
    const updatedCheckedState = allowedMajors.map((item, index) =>
      index === position ? !item : item
    );
    console.log("updatedCheckedState", updatedCheckedState);

    setCheckedMajorsState(updatedCheckedState);
  };

  const handleTypesOnChange = (position) => {
    const updatedCheckedState = allowedTypes.map((item, index) =>
      index === position ? !item : item
    );
    console.log("updatedCheckedState", updatedCheckedState);

    setCheckedTypesState(updatedCheckedState);
  };

  const {start, end, availableLvls, availableMajors, availableTypes} = getStartEnd(data);
  const periodsArr = generatePeriodsArray({start, end});
  const daysDict = generateDaysDict(data);

  useEffect(() => {
    setCheckedLvlsState(Array.from(availableLvls.map(() => true)));
    setCheckedMajorsState(Array.from(availableMajors.map(() => true)));
    setCheckedTypesState(Array.from(availableTypes.map(() => true)));
  }, [start]);
  
  const weekdays = ["السبت", "الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس"];
  const [allowedLvls, setCheckedLvlsState] = useState([]);
  const [allowedMajors, setCheckedMajorsState] = useState([]);
  const [allowedTypes, setCheckedTypesState] = useState([]);

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
        {availableMajors.map((m, index) => (
          <>
            <input
              type="checkbox"
              id={`custom-checkbox-${index}`}
              name={m}
              value={m}
              checked={allowedMajors[index]}
              onChange={() => handleMajorsOnChange(index)}
            />
            <label htmlFor={`custom-checkbox-${index}`}>{`(${m})`}</label>
          </>
        ))}
      </div>
      <div>
        <span>أنواع الدراسة بالملف: </span>
        {availableTypes.map((t, index) => (
          <>
            <input
              type="checkbox"
              id={`custom-checkbox-${index}`}
              name={t}
              value={t}
              checked={allowedTypes[index]}
              onChange={() => handleTypesOnChange(index)}
            />
            <label htmlFor={`custom-checkbox-${index}`}>{`(${t})`}</label>
          </>
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
          {weekdays.map(
            (day, i) => (
              <SingleDay
                daysDict={daysDict}
                day={day}
                periods={{ start, end }}
                allowedLvls={convert2ArraysToDict(availableLvls, allowedLvls)}
                allowedMajors={convert2ArraysToDict(
                  availableMajors,
                  allowedMajors
                )}
                allowedTypes={convert2ArraysToDict(
                  availableTypes,
                  allowedTypes
                )}
                key={i}
              />
            )
          )}
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
