import React from 'react'
import { fillMissingSlots, stackClassesPerLvl } from '../Helpers/data';
import Slot from './Slot';

const SingleDay = ({ daysDict, day, periods, allowedLvls, allowedMajors, allowedTypes }) => {
    const lvls = [];
    let dayColSpan = 0;
    const singleDay = daysDict[day];
    
    if (
      !allowedLvls ||
      allowedLvls === {} ||
      Object.keys(allowedLvls).length === 0 ||
      !allowedMajors ||
      allowedMajors === {} ||
      Object.keys(allowedMajors).length === 0 ||
      !allowedTypes ||
      allowedTypes === {} ||
      Object.keys(allowedTypes).length === 0
    )
      return null;
  
    for (const lvl in singleDay) {
      if (allowedLvls[lvl]) {
        const singleLvl = singleDay[lvl];
        const lvlRows = stackClassesPerLvl(singleLvl, allowedMajors, allowedTypes);
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

  
export default SingleDay;