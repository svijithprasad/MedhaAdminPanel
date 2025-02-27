import React, { useState, useEffect } from "react";
import { TextField, Button, Box, Typography, Modal, Stack } from "@mui/material";
import { toast } from "sonner";
import Papa from "papaparse"; // For CSV conversion
import "./index.css";

const TECHNICAL_EVENTS = [
  "coding",
  "webDesigning",
  "gaming",
  "quiz",
  "productLaunch",
  "itManager",
  "reels",
];

const AdminPanel = () => {
  const [data, setData] = useState([]);
  const [filter, setFilter] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [open, setOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    // Detect scroll position and toggle button visibility
    const handleScroll = () => {
      if (window.scrollY > 200) {
        setShowButton(true); // Show button after scrolling down 200px
      } else {
        setShowButton(false); // Hide button if scrolled to top
      }
    };

    // Add event listener for scrolling
    window.addEventListener('scroll', handleScroll);

    // Cleanup on component unmount
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth', // Smooth scrolling effect
    });
  };


  useEffect(() => {
    fetch(`${import.meta.env.VITE_REACT_APP_BACKEND_ENDPOINT}/api/users`)
      .then((res) => res.json())
      .then((data) => setData(data))
      .catch((err) => console.error("Error fetching data", err));
  }, []);

  // Filtering logic
  const filteredData = data.filter((row) =>
    [row.name, row.phone, row.collegeName, row.course, row.totalAmount, row.hodName, row.transactionId]
      .some((field) => field?.toString().toLowerCase().includes(filter.toLowerCase()))
  );

  const handleFilterChange = (event) => {
    setFilter(event.target.value);
  };

  const groupEvents = (eventDetails) => {
    let technical = {};
    let cultural = {};
    Object.entries(eventDetails || {}).forEach(([event, participants]) => {
      if (TECHNICAL_EVENTS.includes(event)) {
        technical[event] = participants;
      } else {
        cultural[event] = participants;
      }
    });
    return { technical, cultural };
  };

  const renderEventDetails = (eventDetails) => {
    const { technical, cultural } = groupEvents(eventDetails);

    const renderGroup = (group, title) =>
      Object.keys(group).length > 0 && (
        <>
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            {title}:
          </Typography>
          {Object.entries(group).map(([eventName, participants]) => (
            <Typography key={eventName} sx={{ fontSize: "0.9em" }}>
              {eventName}: {Object.values(participants).join(", ")}
            </Typography>
          ))}
        </>
      );

    return (
      <>
        {renderGroup(technical, "Technical Events")}
        {renderGroup(cultural, "Cultural Events")}
      </>
    );
  };

  const handleDownloadCSV = () => {
    const csvData = data.map((row) => {
      const { technical, cultural } = groupEvents(row.eventDetails);

      return {
        Name: row.name,
        Phone: row.phone,
        College: row.collegeName,
        Course: row.course,
        "HOD Name": row.hodName,
        "HOD Phone": row.hodPhone,
        Amount: row.totalAmount,
        "Transaction ID": row.transactionId,
        "Technical Events": Object.entries(technical)
          .map(([event, participants]) => `${event}: ${Object.values(participants).join(", ")}`)
          .join(" | "),
        "Cultural Events": Object.entries(cultural)
          .map(([event, participants]) => `${event}: ${Object.values(participants).join(", ")}`)
          .join(" | "),
      };
    });

    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", "medha_admin_data.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("CSV downloaded successfully!");
  };

  const handleOpen = (row) => {
    setSelectedRow(row);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedRow(null);
  };

  const handleInputChange = (event) => {
    setSelectedRow({
      ...selectedRow,
      [event.target.name]: event.target.value,
    });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
  
    fetch(`http://localhost:5000/api/users/${selectedRow._id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        _id: selectedRow._id,
        name: selectedRow.name,
        phone: selectedRow.phone,
        collegeName: selectedRow.collegeName,
        course: selectedRow.course,
        eventDetails: selectedRow.eventDetails, // Include event details
      }),
    })
      .then(response => response.json())
      .then(updatedUser => {
        setData(prevData =>
          prevData.map(user =>
            user._id === updatedUser._id ? updatedUser : user
          )
        );
        handleClose();
        toast.success('Data Updated Successfully!');
      })
      .catch((err) => console.error("Error updating user data", err));
  };
  
  const handleDelete = () => {
    fetch(`http://localhost:5000/api/users/${selectedRow._id}`, {
      method: 'DELETE',
    })
      .then(response => response.json())
      .then(() => {
        setData(prevData => prevData.filter(user => user._id !== selectedRow._id));
        handleClose(); // Close the modal after successful deletion
      })
      .catch((err) => console.error("Error deleting user", err));
  };


  return (
    <div className="admin-panel">
      <header className="header">
        <Typography variant="h5">Medha Admin Panel</Typography>
        <Button variant="outlined" onClick={handleDownloadCSV}>
          Download Data (CSV)
        </Button>
      </header>

      <Box my={3} sx={{ position: 'sticky', top: 10, zIndex: 10, backgroundColor: 'black' }}>
        <TextField
          label="Search"
          variant="outlined"
          value={filter}
          onChange={handleFilterChange}
          fullWidth
          sx={{
            color: 'white',
            '& .MuiOutlinedInput-root': {
              '& fieldset': {
                borderColor: '#f3e5f5',
              },
              '&:hover fieldset': {
                borderColor: '#b39ddb',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#fff',
              },
              '& input': {
                color: 'white',
              },
            },
            '& .MuiInputLabel-root': {
              color: '#f3e5f5',
            },
          }}
        />
      </Box>

      <main style={{ overflowX: "auto" }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Phone</th>
              <th>College</th>
              <th>Course</th>
              <th>HOD Name</th>
              <th>HOD Phone no</th>
              <th>Amount</th>
              <th>Event Details</th>
              <th>Transaction ID</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((row, index) => (
              <tr key={index} onClick={() => handleOpen(row)}>
                <td>{row.name}</td>
                <td>{row.phone}</td>
                <td>{row.collegeName}</td>
                <td>{row.course}</td>
                <td>{row.hodName}</td>
                <td>{row.hodPhone}</td>
                <td>{row.totalAmount}</td>
                <td style={{ minWidth: "300px" }}>{renderEventDetails(row.eventDetails)}</td>
                <td>{row.transactionId}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </main>

      {/* Edit/Delete Modal */}
      <Modal open={open} onClose={handleClose}>
        <Box className="modal-box" sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          backgroundColor: '#222',  // Dark background for modal
          color: 'white',  // White text color
          padding: '24px',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',  // Soft shadow for modern effect
          width: '400px',
          maxWidth: '100%',
          height: '80vh',  // Fixed height of 80% of viewport height
          overflowY: 'auto',  // Enable vertical scrolling if content overflows
        }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>Edit Details</Typography>
          <form onSubmit={handleSubmit}>
            <Stack spacing={2}>
              {/* User Info Fields */}
              <TextField
                label="Name"
                name="name"
                value={selectedRow?.name || ''}
                onChange={handleInputChange}
                fullWidth
                sx={{
                  backgroundColor: '#333',
                  color: 'white',
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': { borderColor: '#444' },
                    '&:hover fieldset': { borderColor: '#007bff' },
                    '&.Mui-focused fieldset': { borderColor: '#fff' },
                    '& input': { color: 'white' },
                  },
                  '& .MuiInputLabel-root': { color: '#f3e5f5' },
                }}
              />
              <TextField
                label="Phone"
                name="phone"
                value={selectedRow?.phone || ''}
                onChange={handleInputChange}
                fullWidth
                sx={{
                  backgroundColor: '#333',
                  color: 'white',
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': { borderColor: '#444' },
                    '&:hover fieldset': { borderColor: '#007bff' },
                    '&.Mui-focused fieldset': { borderColor: '#fff' },
                    '& input': { color: 'white' },
                  },
                  '& .MuiInputLabel-root': { color: '#f3e5f5' },
                }}
              />
              <TextField
                label="College Name"
                name="collegeName"
                value={selectedRow?.collegeName || ''}
                onChange={handleInputChange}
                fullWidth
                sx={{
                  backgroundColor: '#333',
                  color: 'white',
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': { borderColor: '#444' },
                    '&:hover fieldset': { borderColor: '#007bff' },
                    '&.Mui-focused fieldset': { borderColor: '#fff' },
                    '& input': { color: 'white' },
                  },
                  '& .MuiInputLabel-root': { color: '#f3e5f5' },
                }}
              />
              <TextField
                label="Course"
                name="course"
                value={selectedRow?.course || ''}
                onChange={handleInputChange}
                fullWidth
                sx={{
                  backgroundColor: '#333',
                  color: 'white',
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': { borderColor: '#444' },
                    '&:hover fieldset': { borderColor: '#007bff' },
                    '&.Mui-focused fieldset': { borderColor: '#fff' },
                    '& input': { color: 'white' },
                  },
                  '& .MuiInputLabel-root': { color: '#f3e5f5' },
                }}
              />

              {/* Editable Event Participants */}
              {selectedRow?.eventDetails && Object.entries(selectedRow.eventDetails).map(([eventName, participants], idx) => (
                <div key={idx}>
                  <Typography variant="subtitle1" sx={{ fontWeight: '600', marginTop: '10px' }}>{eventName} Participants</Typography>
                  {Object.entries(participants).map(([participantKey, participant], pIdx) => (
                    <TextField
                      key={pIdx}
                      label={`Participant ${pIdx + 1}`}
                      name={`eventDetails-${eventName}-${participantKey}`}
                      value={participant}
                      onChange={(e) => {
                        const updatedParticipants = { ...selectedRow.eventDetails };
                        updatedParticipants[eventName][participantKey] = e.target.value;
                        setSelectedRow({ ...selectedRow, eventDetails: updatedParticipants });
                      }}
                      fullWidth
                      sx={{
                        backgroundColor: '#333',
                        color: 'white',
                        '& .MuiOutlinedInput-root': {
                          '& fieldset': { borderColor: '#444' },
                          '&:hover fieldset': { borderColor: '#007bff' },
                          '&.Mui-focused fieldset': { borderColor: '#fff' },
                          '& input': { color: 'white' },
                        },
                        '& .MuiInputLabel-root': { color: '#f3e5f5' },
                      }}
                    />
                  ))}
                </div>
              ))}

              {/* Save and Delete Buttons */}
              <Stack direction="row" spacing={2}>
                <Button
                  variant="outlined"
                  color="primary"
                  type="submit"
                  sx={{
                    backgroundColor: 'white',
                    color: 'black',
                    border: '1px solid #333',
                    padding: '10px 20px',
                    borderRadius: '6px',
                    fontWeight: '600',
                    flexGrow: 1,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      backgroundColor: '#f3f3f3',
                      borderColor: '#007bff',
                    },
                    '&:focus': {
                      outline: 'none',
                      borderColor: '#007bff',
                    },
                  }}
                >
                  Save Changes
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  onClick={handleDelete}
                  sx={{
                    backgroundColor: 'white',
                    color: 'black',
                    border: '1px solid #333',
                    padding: '10px 20px',
                    borderRadius: '6px',
                    fontWeight: '600',
                    flexGrow: 1,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      backgroundColor: '#f3f3f3',
                      borderColor: '#e53935',
                    },
                    '&:focus': {
                      outline: 'none',
                      borderColor: '#e53935',
                    },
                  }}
                >
                  Delete User
                </Button>
              </Stack>
            </Stack>
          </form>
        </Box>
      </Modal>
    </div>
  );
};

export default AdminPanel;
