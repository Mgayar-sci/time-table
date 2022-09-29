import React from "react";

const getStartEnd = (data = []) => {
  let end = undefined,
    start = undefined;
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
    // console.log("{start,end}", row["من"], row["الي"]);
  }
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
      const lvl = row["تدرس للمستوي"];
      //   console.log('lvl', lvl);
      row.periods = {
        start: parseInt(row["من"].split(":")[0]),
        end: parseInt(row["الي"].split(":")[0]),
      };
      row.displayText =
        row["كود المقرر"] +
        " (" +
        row["نوع الدراسة"] +
        ") مج" +
        row["المجموعة"] 
        // + " الساعة "+ row["من"];
      row.place =
        row["المكان"].length > 2 ? row["المكان"] : "مدرج " + row["المكان"];
      if (days.hasOwnProperty(rowDay)) {
        if (days[rowDay].hasOwnProperty(lvl)) days[rowDay][lvl].push(row);
        else days[rowDay][lvl] = [row];
      } else {
        days[rowDay] = { [lvl]: [row] };
      }
    }
  }
  console.log("days", days);
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
  rows.forEach(slots=> slots.sort((a, b) => {
    return a.periods.start - b.periods.start;
}))
  console.log("rows", rows);
  return rows;
};

const fillMissingSlots = (rows, periods) => {
    const newRows=[];
    for (let i = 0; i < rows.length; i++) {
        newRows[i] = fillMissingSlotsPerRow(rows[i], periods);
    }
    return newRows;
}
const fillMissingSlotsPerRow = (slots, periods) => {
    console.log('slots', slots);
    const newSlots = [];
    let NextPeriodIndex = periods.start;
    for (let i = 0; i < slots.length; i++) {
        const slot = slots[i];
        for (let j = NextPeriodIndex; j < periods.end; j++) {
            if(slot.periods.start > j)
                newSlots.push({colSpan:1});
            else{
                newSlots.push(slot);
                NextPeriodIndex = slot.periods.end;
                break;
            }
        }
    }
    for (let j = NextPeriodIndex; j < periods.end; j++) {
        newSlots.push({colSpan:1});
    }
    console.log('newSlots', newSlots, NextPeriodIndex);
    return newSlots;
}

const RenderDay = ({daysDict, day, periods}) =>{
    const lvls=[];
    let dayColSpan = 0;
    const singleDay = daysDict[day];
    // console.log('daysDict', daysDict);
    // console.log('periods', periods);
    // console.log('day', day);
    // console.log('singleDay', singleDay);
    
    for (const lvl in singleDay) {
        const singleLvl = singleDay[lvl];
        // console.log('singleLvl', singleLvl);
        const lvlRows = stackClassesPerLvl(singleLvl);
        // console.log('lvlRows', lvlRows);
        lvls.push(fillMissingSlots(lvlRows, periods));
        dayColSpan+=lvlRows.length+1;
    }
    console.log('lvls', lvls);
    return (
      <>
        <tr>
          <td rowSpan={dayColSpan+1} align="center" height="50">
            <b>{day}</b>
          </td>
        </tr>
        {lvls.map((lvl, index) => (
            <>
          <tr>
            <td rowSpan={lvl.length + 1} align="center" height="50">
              <b>{Object.keys(singleDay)[index]}</b>
            </td>
          </tr>
          {lvl.map((row) => (
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
          </>
        ))}
      </>
    );
}

const Table = ({ title = "Time Table", data = [] }) => {
  if (!data || data.length === 0) return <></>;

  const periods = getStartEnd(data);
  const periodsArr = generatePeriodsArray(periods);
  const daysDict = generateDaysDict(data);
//   let  Sat="";
//   for (const day in daysDict) {
//     if (Object.hasOwnProperty.call(daysDict, day)) {
//         Sat = RenderDay(daysDict, day, periods);
//     }
//   }
//   const lvl1Rows = stackClassesPerLvl(daysDict["السبت"]["1"]);
//   const filledLvl1 = fillMissingSlots(lvl1Rows, periods);

//   const lvl2Rows = stackClassesPerLvl(daysDict["السبت"]["2"]);
//   const lvl3Rows = stackClassesPerLvl(daysDict["السبت"]["3"]);
//   const lvl4Rows = stackClassesPerLvl(daysDict["السبت"]["4"]);

  return (
    <>
      <h1>{title}</h1>
      <table border="5" cellSpacing="0" align="center">
        <thead>
          <tr>
            <td align="center" height="50" width="100">
              <br />
              <b>اليوم</b>
            </td>
            <td align="center" height="50" width="100">
              <br />
              <b>المستوى</b>
            </td>
            {periodsArr.map((period) => (
              <td align="center" height="50" width="100" key={period}>
                <br />
                <b>{period}</b>
              </td>
            ))}
          </tr>
        </thead>
        <tbody>
            <RenderDay daysDict={daysDict} day="السبت" periods={periods}/>
            <RenderDay daysDict={daysDict} day="الأحد" periods={periods}/>
            <RenderDay daysDict={daysDict} day="الإثنين" periods={periods}/>
            <RenderDay daysDict={daysDict} day="الثلاثاء" periods={periods}/>
            <RenderDay daysDict={daysDict} day="الأربعاء" periods={periods}/>
            <RenderDay daysDict={daysDict} day="الخميس" periods={periods}/>
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
