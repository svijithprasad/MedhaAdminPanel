import React, { useState, useEffect } from 'react';
import { TextField, Button, Box, Typography, Modal, Stack } from '@mui/material';
import { toast } from 'sonner';

const AdminPanel = () => {
  const [data, setData] = useState([]);
  const [filter, setFilter] = useState("");
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
    fetch("http://localhost:5000/api/users")
      .then((res) => res.json())
      .then((data) => setData(data))
      .catch((err) => console.error("Error fetching data", err));
  }, []);

  const handleFilterChange = (event) => {
    setFilter(event.target.value);
  };

  const filteredData = data.filter(row =>
    Object.values(row).some(value =>
      value.toString().toLowerCase().includes(filter.toLowerCase())
    )
  );

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

    // Sending updated data to the backend
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
      }),
    })
      .then(response => response.json())
      .then(updatedUser => {
        // Update the local state with the updated user data
        setData(prevData =>
          prevData.map(user =>
            user._id === updatedUser._id ? updatedUser : user
          )
        );
        handleClose(); // Close the modal after successful update
        toast.success('Data Updated Successfully!')
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

  const downloadExcel = () => {
    const csvContent = data
      .map((row) => Object.values(row).join(","))
      .join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "data.csv";
    link.click();
  };

  // Function to render eventDetails as a string
  const renderEventDetails = (eventDetails) => {
    return Object.entries(eventDetails).map(([eventName, participants]) => {
      const participantsList = Object.entries(participants)
        .map(([participantKey, participant]) => `${participant} (${participantKey})`)
        .join(', '); // Join participants with commas
      return `${eventName}: ${participantsList}`;
    }).join(' | '); // Join events with a pipe symbol
  };

  return (
    <div className="admin-panel">
      <header className="header">
        <Typography variant="h5" color="white">Medha Admin Panel</Typography>
        <Button
          variant="outlined"
          onClick={downloadExcel}
          sx={{
            backgroundColor: 'white',
            color: 'black',
            border: '1px solid #333',
            padding: '7px 15px',
            borderRadius: '6px',
            fontWeight: '600',
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

      <main style={{ maxWidth: "100%", overflowX: "auto", position: "relative" }}>
        <div style={{ overflowX: "auto", maxWidth: "100%" }}>
          <table className="data-table">
            <thead className="table-head">
              <tr>
                {filteredData.length > 0 && Object.keys(filteredData[0]).map((key) => (
                  <th key={key}>{key}</th>
                ))}
                <th>Event Details</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((row, index) => (
                <tr key={index} onClick={() => handleOpen(row)} style={{ cursor: 'pointer' }}>
                  {Object.values(row).map((value, idx) => (
                    <td key={idx}>
                      {typeof value === "object" ?
                        JSON.stringify(value, null, 2) :
                        value
                      }
                    </td>
                  ))}
                  <td>
                    {row.eventDetails ? renderEventDetails(row.eventDetails) : ''}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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

      {showButton && (
        <div
          onClick={scrollToTop}
          style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'white',
            color: 'black',
            borderRadius: '50%',
            padding: '12px',
            fontSize: '18px',
            width: '50px',  // Fixed width and height for perfect roundness
            height: '50px',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
            cursor: 'pointer',  // Adds pointer cursor on hover
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.8)',  // Hover effect
            },
            transition: 'background-color 0.3s',  // Smooth transition for hover effect
          }}
        >
          <i className="fi fi-rr-arrow-small-up" style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'white',
            color: 'black',
            borderRadius: '50%',
            padding: '12px',
            fontSize: '18px',
            width: '50px',  // Fixed width and height for perfect roundness
            height: '50px',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
            cursor: 'pointer',  // Adds pointer cursor on hover
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.8)',  // Hover effect
            },
            transition: 'background-color 0.3s',
            fontSize: '30px'  // Smooth transition for hover effect
          }}></i>
        </div>

      )}
    </div>
  );
};

export default AdminPanel;
