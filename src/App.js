import { useCallback, useEffect, useMemo, useState } from "react";
import "./App.css";
import ReactTable from "./components/ReactTable";

function App() {
  const [tableData, setTableData] = useState(
    /*localStorage.getItem("originalData") ||*/ []
  );
  const [originalData, setOriginalData] = useState();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [coloredRows, setColoredRows] = useState(false);
  const [sorted, setSorted] = useState(false);

  const originalTableData = useMemo(() => [...originalData], [originalData]);

  useEffect(() => {
    const getData = async () => {
      try {
        const response = await fetch("https://randomuser.me/api/?results=100");
        if (!response.ok) {
          throw new Error(
            `This is an HTTP error: The status is ${response.status}`
          );
        }
        console.log(response);
        let actualData = await response.json();
        setTableData(actualData.results);
        setOriginalData(actualData.results);
        localStorage.setItem(
          "originalData",
          JSON.stringify(actualData.results)
        );
        setError(null);
      } catch (err) {
        setError(err.message);
        setTableData([]);
      } finally {
        setLoading(false);
      }
    };
    setLoading(false);

    getData();
  }, []);

  const columns = useMemo(
    () => [
      {
        Header: "image",
        accessor: "picture.thumbnail",
        Cell: ({ cell }) => (
          <img src={cell.value} alt="foto" width="50px" height="50px" />
        ),
        minWidth: "32px",
      },
      {
        Header: "name",
        accessor: "name.first",
      },
      {
        Header: "name",
        accessor: "name.last",
      },
      {
        Header: "country",
        accessor: "location.country",
      },
      {
        id: "delete",
        Header: "delete",
        Cell: ({ row }) => {
          const dataCopy = [...tableData];
          return (
            <button
              onClick={() => {
                dataCopy.splice(row.index, 1);
                setTableData(dataCopy);
              }}
            >
              delete
            </button>
          );
        },
      },
    ],
    [tableData]
  );

  const data = useMemo(() => [...tableData], [tableData]);

  const handleColoredRows = useCallback(() => {
    setColoredRows((prev) => !prev);
  }, []);

  const customRowStyle = useCallback(
    (idx) => {
      if (coloredRows) {
        if (idx % 2 !== 0) return { backgroundColor: `#086E7D` };
        if (idx % 2 === 0) return { backgroundColor: `#FF7800` };
      }
    },
    [coloredRows]
  );

  const handleResetData = useCallback(() => {
    setTableData([...originalTableData]);
    setSorted(false);
  }, [originalTableData]);

  const compare = useCallback((a, b) => {
    if (a.location.country < b.location.country) {
      return -1;
    }
    if (a.location.country > b.location.country) {
      return 1;
    }
    return 0;
  }, []);

  const handleSort = useCallback(() => {
    setSorted((prev) => !prev);
    if (!sorted) setTableData([...tableData.sort(compare)]);
    if (sorted) setTableData([...[...tableData.sort(compare)].reverse()]);
  }, [compare, sorted, tableData]);

  return (
    <div className="App">
      <h1 className="app-title">Test React Countries</h1>
      {error ? (
        <div
          style={{ marginLeft: "1.5rem" }}
        >{`Ha ocurrido un error: ${error}`}</div>
      ) : loading ? (
        <p style={{ textAlign: "center" }}>{`Cargando tabla`}</p>
      ) : (
        <>
          <div className="buttons-container">
            <button onClick={handleColoredRows}>Colored rows</button>
            <button onClick={handleSort}>Sort by country</button>
            <button onClick={handleResetData}>Restore the init state</button>
          </div>
          <div className="table-container">
            <ReactTable
              columns={columns}
              data={data}
              customRowStyle={customRowStyle}
            />
          </div>
        </>
      )}
    </div>
  );
}

export default App;
