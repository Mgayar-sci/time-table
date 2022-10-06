const convert2ArraysToDict = (a, b) => {
  return a.reduce((d, x, i) => {
    if (!b[i]) return d;
    d[x] = b[i];
    return d;
  }, {});
};

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
    return {
      start,
      end,
      availableLvls: Array.from(lvlsSet),
      availableMajors: Array.from(majorsSet),
      availableTypes: Array.from(typeSet),
    };
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

const stackClassesPerLvl = (lvl = [], allowedMajors, allowedTypes) => {
  const rows = [[]];
  for (let i = 0; i < lvl.length; i++) {
    const lecture = lvl[i];
    if (!allowedMajors[lecture.class] || !allowedTypes[lecture.type]) continue;
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

export {
    getStartEnd,
  convert2ArraysToDict,
  generatePeriodsArray,
  generateDaysDict,
  stackClassesPerLvl,
  fillMissingSlots,
  fillMissingSlotsPerRow,
};
