import React from "react";
import "./table.css";
import axios from "axios";

import {
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Checkbox,
  Button,
  Pagination,
  PaginationItem,
} from "@mui/material/";

import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import KeyboardDoubleArrowRightIcon from "@mui/icons-material/KeyboardDoubleArrowRight";
import KeyboardDoubleArrowLeftIcon from "@mui/icons-material/KeyboardDoubleArrowLeft";

import { useState, useEffect } from "react";

const MyTable = () => {
  // hooks
  const [admins, setAdmins] = useState([]);
  const [searchAdmins, setSearchAdmins] = useState([]);
  const [page, setPage] = useState([]);
  const [row, setRow] = useState([]);
  const [pageNo, setPageNo] = useState("p1");
  const [pageArray, setPageArray] = useState([]);
  const [editMode, setEditMode] = useState(null);
  const [adminFormData, setAdminFormData] = useState({
    id: "",
    name: "",
    email: "",
    role: "",
  });

  // total number of pages needed
  const totalPages = Math.ceil(searchAdmins.length / 10);

  // fetching data from get request from the url provided
  const fetchData = async () => {
    try {
      const url =
        "https://geektrust.s3-ap-southeast-1.amazonaws.com/adminui-problem/members.json";
      const data = await axios.get(url);
      setAdmins([...data.data]);
      setSearchAdmins([...data.data]);
    } catch (error) {
      return error;
    }
  };

  // decide what to be displayed in a page
  const pageMaker = (pageIndex, data) => {
    let firstIndex = 10 * (pageIndex - 1);
    let lastIndex = firstIndex + 10;
    if (lastIndex > data.length) {
      lastIndex = firstIndex + (data.length % 10);
    }
    let list = [];
    for (let i = firstIndex; i < lastIndex; i++) {
      list.push(data[i]);
    }

    setPage(list);
  };

  //handles the selection of rows
  const handleSelectedRows = (id, value) => {
    setRow((prev) => {
      let pr = [...prev];

      // for select all functionalities
      if (id === pageNo) {
        if (value === false) {
          setPageArray((prev) => {
            let pr = [...prev];
            let index = pr.indexOf(pageNo);
            pr.splice(index, 1);
            return pr;
          });

          let b = row.filter((i) => i === page[0]);
          if (row.length === page.length) {
            pr = [];
          } else if (row.length >= page.length) {
            let index = pr.indexOf(...b);
            pr.splice(index, page.length);
          }
        } else {
          pr.push(...page);

          pr = pr.filter((i, ind) => pr.indexOf(i) === ind);
          setPageArray((prev) => {
            let pr = [...prev];
            pr.push(pageNo);
            return pr;
          });
        }
      }

      // for individual selections
      let a = searchAdmins.filter((i) => i.id === id);

      if (pr.includes(...a)) {
        let index = pr.indexOf(...a);
        pr.splice(index, 1);
        setPageArray((prev) => {
          let pr = [...prev];
          let index = pr.indexOf(pageNo);
          pr.splice(index, 1);
          return pr;
        });
      } else {
        pr.push(...a);
      }

      return pr;
    });
  };

  // handle deleting function

  const handleDeleteRows = (id = "") => {
    setSearchAdmins((prev) => {
      let pr = [...prev];

      //handles multiple delete
      if (id === "") {
        row.forEach((i) => {
          if (pr.includes(i)) {
            let index = pr.indexOf(i);
            pr.splice(index, 1);
          }
        });
        setPageArray((prev) => {
          let pr = [...prev];
          let index = pr.indexOf(pageNo);
          pr.splice(index, 1);
          return pr;
        });
      } else {
        // handles single delete
        let a = searchAdmins.filter((i) => i.id === id);
        if (pr.includes(...a)) {
          let index = pr.indexOf(...a);
          pr.splice(index, 1);
        }
      }

      return pr;
    });

    setRow([]);
  };

  // captures the form data
  const handleFormChange = (e) => {
    e.preventDefault();

    const name = e.target.name;
    const value = e.target.value;

    const editedAdmin = { ...adminFormData };
    editedAdmin[name] = value;

    setAdminFormData(editedAdmin);
  };

  // submit the form data and updates the page
  const handleFormSubmit = (e) => {
    e.preventDefault();

    setPage((prev) => {
      let pr = [...prev];
      let editRow = pr.filter((i) => i.id === adminFormData.id);
      let index = pr.indexOf(...editRow);
      pr.splice(index, 1, adminFormData);

      return pr;
    });

    setEditMode(null);
  };

  // layout of the editable cell
  const editForm = (data) => {
    return (
      <>
        <TableCell align="right" className="text">
          <TextField
            placeholder={data.name}
            variant="outlined"
            name="name"
            onChange={handleFormChange}
            size="small"
          />
        </TableCell>
        <TableCell align="right">
          <TextField
            placeholder={data.email}
            variant="outlined"
            name="email"
            onChange={handleFormChange}
            size="small"
          />
        </TableCell>
        <TableCell align="right">
          <TextField
            placeholder={data.role}
            variant="outlined"
            name="role"
            onChange={handleFormChange}
            size="small"
          />
        </TableCell>
        <TableCell align="center">
          <Button
            variant="contained"
            color="secondary"
            type="submit"
            sx={{ margin: 2 }}
            size="small"
          >
            Save
          </Button>
          <Button
            size="small"
            variant="contained"
            color="secondary"
            sx={{ margin: 2 }}
            onClick={() => {
              setEditMode(null);
            }}
          >
            Cancel
          </Button>
        </TableCell>
      </>
    );
  };

  // layout normal row
  const generateRows = (data) => {
    return (
      <TableRow
        key={data.id}
        hover
        className={row.includes(data) ? "table-row" : null}
      >
        <TableCell align="center">
          <Checkbox
            value={data.id}
            color="secondary"
            onChange={(e, v) => {
              handleSelectedRows(e.target.value, v);
            }}
            checked={row.includes(data) ? true : false}
          />
        </TableCell>
        {editMode === data.id ? (
          editForm(data)
        ) : (
          <>
            <TableCell align="center" className="tt">
              {data.name}
            </TableCell>
            <TableCell align="center" className="tt">
              {data.email}
            </TableCell>
            <TableCell align="center" className="tt">
              {data.role}
            </TableCell>
            <TableCell align="center">
              <Button
                sx={{ padding: 0 }}
                onClick={(e) => {
                  e.preventDefault();
                  setEditMode(data.id);
                  setAdminFormData({
                    id: data.id,
                    name: data.name,
                    email: data.email,
                    role: data.role,
                  });
                }}
              >
                <EditIcon />
              </Button>
              <Button
                color="secondary"
                sx={{ padding: 0 }}
                onClick={() => {
                  handleDeleteRows(data.id);
                }}
              >
                <DeleteIcon />
              </Button>
            </TableCell>
          </>
        )}
      </TableRow>
    );
  };

  // simple search
  const search = (e) => {
    let query = e.target.value.toLowerCase();
    if (query !== "") {
      setSearchAdmins((prev) => {
        let filteredArray = admins.filter((i) => {
          return (
            i.name.toLowerCase().includes(query) ||
            i.email.toLowerCase().includes(query) ||
            i.role.toLowerCase().includes(query)
          );
        });
        return filteredArray;
      });
    } else {
      return admins;
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    pageMaker(1, searchAdmins);
  }, [searchAdmins]);

  return (
    <>
      {/* search-bar */}

      <TextField
        label="Search by name,email or role"
        variant="outlined"
        className="search-bar"
        color="secondary"
        sx={{ margin: 2 }}
        onChange={search}
      />

      {/* table */}
      <TableContainer component={Paper}>
        <form onSubmit={handleFormSubmit}>
          <Table sx={{ minHeight: 750 }} align="center">
            <TableHead>
              <TableRow key={pageNo} hover>
                <TableCell align="center">
                  <Checkbox
                    value={pageNo}
                    color="secondary"
                    onChange={(e, v) => {
                      handleSelectedRows(e.target.value, v);
                    }}
                    checked={pageArray.includes(pageNo) ? true : false}
                  />
                </TableCell>
                <TableCell align="center" className="th">
                  Name
                </TableCell>
                <TableCell align="center" className="th">
                  Email
                </TableCell>
                <TableCell align="center" className="th">
                  Role
                </TableCell>
                <TableCell align="center" className="th">
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {page.map((i) => {
                return generateRows(i);
              })}
              <TableRow hover>
                <TableCell colSpan={2} align="center">
                  <Button
                    variant="contained"
                    color="secondary"
                    className="del-sel-btn"
                    onClick={() => {
                      handleDeleteRows();
                    }}
                  >
                    delete Selected
                  </Button>
                </TableCell>
                <TableCell align="center" colSpan={3}>
                  <Pagination
                    color="secondary"
                    defaultPage={1}
                    count={totalPages}
                    size="large"
                    showFirstButton
                    showLastButton
                    renderItem={(item) => (
                      <PaginationItem
                        slots={{
                          first: KeyboardDoubleArrowLeftIcon,
                          last: KeyboardDoubleArrowRightIcon,
                        }}
                        {...item}
                      />
                    )}
                    onChange={(e, v) => {
                      pageMaker(v, searchAdmins);
                      setPageNo(`p${v}`);
                    }}
                  />
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </form>
      </TableContainer>
    </>
  );
};

export default MyTable;
