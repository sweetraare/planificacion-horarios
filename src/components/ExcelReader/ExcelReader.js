import React, { useState } from "react";
import XLSX from "xlsx";
import { SheetJSFT } from "./types";
import { Button, InputGroup } from "react-bootstrap";

const ExcelReader = ({ callbackData }) => {
  const [file, setFile] = useState({});

  const handleChange = (e) => {
    const files = e.target.files;
    if (files && files[0]) {
      setFile(files[0]);
    }
  };

  const handleFile = () => {
    /* Boilerplate to set up FileReader */
    const reader = new FileReader();
    const rABS = !!reader.readAsBinaryString;

    reader.onload = (e) => {
      /* Parse data */
      const bstr = e.target.result;
      const wb = XLSX.read(bstr, {
        type: rABS ? "binary" : "array",
        bookVBA: true,
      });
      /* Get first worksheet */
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      /* Convert array of arrays */
      const data = XLSX.utils.sheet_to_json(ws);
      /* Update state */
      callbackData(data);
    };

    if (rABS) {
      reader.readAsBinaryString(file);
    } else {
      reader.readAsArrayBuffer(file);
    }
  };

  return (
    <div>
      <InputGroup>
        <input
          type="file"
          className="form-control"
          id="file"
          accept={SheetJSFT}
          onChange={handleChange}
        />
        <InputGroup.Append>
          <Button onClick={handleFile}>Subir</Button>
        </InputGroup.Append>
      </InputGroup>
    </div>
  );
};

export default ExcelReader;
