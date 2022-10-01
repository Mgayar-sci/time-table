import React, { useState } from "react";
import Papa from "papaparse";
import Table from "./Table";

// Allowed extensions for input file
const allowedExtensions = ["csv"];

const App = () => {
  // This state will store the parsed data
  const [data, setData] = useState([]);

  // It state will contain the error when
  // correct file extension is not used
  const [error, setError] = useState("");

  // It will store the file uploaded by the user
  const [file, setFile] = useState("");

  // This function will be called when
  // the file input changes
  const handleFileChange = (e) => {
    setError("");

    // Check if user has entered the file
    if (e.target.files.length) {
      const inputFile = e.target.files[0];

      // Check the file extensions, if it not
      // included in the allowed extensions
      // we show the error
      const fileExtension = inputFile?.type.split("/")[1];
      if (!allowedExtensions.includes(fileExtension)) {
        setError("Please input a csv file");
        return;
      }

      // If input type is correct set the state
      setFile(inputFile);
    }
  };
  const handleParse = () => {
    // If user clicks the parse button without
    // a file we show a error
    if (!file) return setError("Enter a valid file");

    // Initialize a reader which allows user
    // to read any file or blob.
    const reader = new FileReader();

    // Event listener on reader when the file
    // loads, we parse it and set the data.
    reader.onload = async ({ target }) => {
      const csv = Papa.parse(target.result, { header: true });
      const parsedData = csv?.data;
      // const columns = Object.keys(parsedData[0]);
      console.log("parsedData", parsedData);
      setData(parsedData);
    };
    reader.readAsText(file);
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        flexDirection: "column",
      }}
    >
      <div
      style={{
        display: "flex",
        alignItems: "center",
      }}>
        <label
          htmlFor="csvInput"
          style={{ display: "block", cursor: "pointer" }}
        >
          اختر الملف
        </label>
        <div>{file.name}</div>
        <input
          onChange={handleFileChange}
          id="csvInput"
          name="file"
          type="File"
          style={{ visibility: "hidden" }}
        />
        <div>
          <button onClick={handleParse}>استخرج الجدول</button>
        </div>
        {/* <div style={{ marginTop: "3rem" }}>
          {error
            ? error
            : Object.entries(data[0] || {}).map((col, idx) => (
                <div key={idx}>{col[0] + ":" + col[1]}</div>
              ))}
        </div> */}
      </div>
      {error ? error : <Table data={data} />}
    </div>
  );
};

export default App;
