import React, { useState } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";

function App() {
  const [file, setFile] = useState(null); // To store the file
  const [data, setData] = useState([]); // To store the uploaded data
  const [filteredData, setFilteredData] = useState([]); // To store the filtered data
  const [isDataMinimized, setIsDataMinimized] = useState(false); // To manage minimization of data
  const [isFilteredDataMinimized, setIsFilteredDataMinimized] = useState(false); // To manage minimization of filtered data

 // Filter for upload (no filters)
 const [uploadFilters, setUploadFilters] = useState({
  // No filters for upload
});

// Filter for when applying static or dynamic filters
const [appliedFilters, setAppliedFilters] = useState({
  Stage: ["PROD"], // Static filter for 'Stage' column
  Client: ["infosys"], // Static filter for 'Client' column
});
  const [newColumn, setNewColumn] = useState("");
  const [newFilterValues, setNewFilterValues] = useState("");

  const handleFileChange = (event) => setFile(event.target.files[0]);

  const handleUpload = async () => {
    if (!file) {
      alert("Please select a file to upload.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("filters", JSON.stringify(uploadFilters));

    try {
      const response = await axios.post("http://localhost:8080/api/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setData(response.data);
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };

  const applyFilters = async () => {
    if (!file) {
      alert("Please upload a file first.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("filters", JSON.stringify(appliedFilters));

    try {
      const response = await axios.post("http://localhost:8080/api/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setFilteredData(response.data);
    } catch (error) {
      console.error("Error filtering data:", error);
    }
  };

  const handleAddFilter = () => {
    if (newColumn && newFilterValues) {
      setAppliedFilters((prevFilters) => ({
        ...prevFilters,
        [newColumn]: newFilterValues.split(","),
      }));
      setNewColumn("");
      setNewFilterValues("");
    } else {
      alert("Please provide both column name and filter values.");
    }
  };

  const handleRemoveFilter = (column) => {
    const updatedFilters = { ...appliedFilters };
    delete updatedFilters[column];
    setAppliedFilters(updatedFilters);
  };

  const handleEditFilter = (column, newValues) => {
    const updatedFilters = { ...appliedFilters, [column]: newValues.split(",") };
    setAppliedFilters(updatedFilters);
  };

  const toggleDataMinimize = () => setIsDataMinimized((prev) => !prev);

  const toggleFilteredDataMinimize = () => setIsFilteredDataMinimized((prev) => !prev);

  const handleGenerateExcel = async () => {
    if (filteredData.length === 0) {
      alert("No filtered data available to generate an Excel file.");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:8080/api/generate",
        { filteredData },
        { responseType: "blob" }
      );

      const blob = new Blob([response.data], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "FilteredData.xlsx";
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error generating Excel file:", error);
    }
  };

  return (
    <div className="container">
      <h1 className="my-4">OLD Accounts Filter Tool</h1>

      <div className="mb-3">
        <label htmlFor="fileInput" className="form-label">
          Upload Excel File:
        </label>
        <input type="file" id="fileInput" className="form-control" onChange={handleFileChange} />
        <button className="btn btn-primary mt-3" onClick={handleUpload}>
          Upload
        </button>
      </div>

      {data.length > 0 && (
        <>
          <div className="d-flex justify-content-between">
            <h2>Uploaded Data</h2>
            <button className="btn btn-outline-info" onClick={toggleDataMinimize}>
              {isDataMinimized ? "Expand" : "Minimize"}
            </button>
          </div>
          {!isDataMinimized && (
            <table className="table table-bordered">
              <thead>
                <tr>
                  {Object.keys(data[0]).map((key) => (
                    <th key={key}>{key}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map((row, index) => (
                  <tr key={index}>
                    {Object.values(row).map((value, idx) => (
                      <td key={idx}>{value}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}

            {/* Static Filter Section */}
            {Object.keys(appliedFilters).length > 0 && (
        <>
          <h3>Apply Static Filters</h3>
          {Object.keys(appliedFilters).map((column) => (
            <div className="mb-3" key={column}>
              <label htmlFor={column} className="form-label">
                {column} (Static Filter Applied):
              </label>
              <input
                type="text"
                id={column}
                className="form-control"
                value={appliedFilters[column].join(", ")} // Display selected static filter values
                disabled // Disable editing since the filter is static
              />
              <button className="btn btn-warning mt-2" onClick={() => handleEditFilter(column, prompt(`Edit filter for ${column}`))}>
                Edit
              </button>
              <button className="btn btn-danger mt-2 ms-2" onClick={() => handleRemoveFilter(column)}>
                Remove
              </button>
            </div>
          ))}
        </>
      )}

      <h3>Apply Dynamic Filters</h3>
      <div className="mb-3">
        <label htmlFor="newColumn" className="form-label">
          New Column Name:
        </label>
        <input
          type="text"
          id="newColumn"
          className="form-control"
          value={newColumn}
          onChange={(e) => setNewColumn(e.target.value)}
          placeholder="Enter column name"
        />
      </div>
      <div className="mb-3">
        <label htmlFor="newFilterValues" className="form-label">
          Filter Values (comma-separated):
        </label>
        <input
          type="text"
          id="newFilterValues"
          className="form-control"
          value={newFilterValues}
          onChange={(e) => setNewFilterValues(e.target.value)}
          placeholder="Enter comma-separated filter values"
        />
      </div>
      <button className="btn btn-secondary mt-3" onClick={handleAddFilter}>
        Add Filter
      </button>

      <button className="btn btn-success mt-3" onClick={applyFilters}>
        Apply Filters
      </button>

      {filteredData.length > 0 && (
        <>
          <div className="d-flex justify-content-between">
            <h2>Filtered Data</h2>
            <button className="btn btn-outline-info" onClick={toggleFilteredDataMinimize}>
              {isFilteredDataMinimized ? "Expand" : "Minimize"}
            </button>
          </div>
          {!isFilteredDataMinimized && (
            <table className="table table-bordered">
              <thead>
                <tr>
                  {Object.keys(filteredData[0]).map((key) => (
                    <th key={key}>{key}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredData.map((row, index) => (
                  <tr key={index}>
                    {Object.values(row).map((value, idx) => (
                      <td key={idx}>{value}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <button className="btn btn-primary mt-3" onClick={handleGenerateExcel}>
            Generate Excel
          </button>
        </>
      )}
    </div>
  );
}

export default App;
