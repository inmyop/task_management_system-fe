import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, CircularProgress, Checkbox, IconButton, Button, TextField, Box, Modal, Grid, FormControl, FormControlLabel } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import DownloadIcon from '@mui/icons-material/CloudDownload';
import { CloudUpload } from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment'
import Swal from 'sweetalert2';

import moment from 'moment';
import 'moment/locale/id';
import { taskActions } from '_store';
import { useNavigate } from 'react-router-dom';
moment.locale('id');

export { Home };

function Home() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { tasks } = useSelector(x => x.tasks);
    const [editedTask, setEditedTask] = useState(null);
    const [openModalEditTask, setOpenModalEditTask] = useState(false);
    const [newTask, setNewTask] = useState({
        title: '',
        description: '',
        deadline: moment(),
        document: null,
        status: false
    });
    const [openModalAddTask, setOpenModalAddTask] = useState(false);
    const [openModalFilter, setOpenModalFilter] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [dateQuery, setDateQuery] = useState();
    const [filterDate, setFilterDate] = useState(moment());

    const handleSearchChange = (event) => {
        setSearchQuery(event.target.value);
    };
    
    useEffect(() => {
        dispatch(taskActions.getAll({ search: searchQuery }));
    }, [dispatch, searchQuery]);

    useEffect(() => {
        dispatch(taskActions.getAll());
    }, [dispatch]);

    useEffect(() => {
        if(!tasks) navigate("/login")
    }, [tasks, navigate]);

    const handleStatusChange = (task) => {
        console.log(task.status)
        const body = {
            title: task.title,
            description: task.description,
            deadline: task.deadline,
            document: task.document,
            status: !task.status ? 1 : 0,
            task_code: task.task_code
        };
        console.log(body);
        // Dispatch action and use then to handle success/error
        dispatch(taskActions.updateTask(body)).then((result) => {
            // Destructure result to access the payload, error, and other properties
            console.log('alert', result)
            const { payload, error } = result;
            if (payload) {
                // Task added successfully, show success SweetAlert
                Swal.fire({
                    title: 'Success!',
                    text: 'Berhasil memperbarui tugas',
                    icon: 'success',
                    timer: 1000,
                    showConfirmButton: true
                })
                dispatch(taskActions.getAll())
            } else {
                // There was an error, show an error SweetAlert
                Swal.fire({
                    title: 'Error!',
                    text: error?.response?.data?.message || 'Gagal memperbarui tugas',
                    icon: 'error',
                    timer: 1000,
                    showConfirmButton: true
                });
            }
        });
    };

    const handleAddTaskStatusChange = () => {
        setNewTask({...newTask, status: !newTask.status})
    };

    const handleEditStatusChange = () => {
        console.log('task', editedTask)
        setEditedTask({...editedTask, status: !editedTask.status})
    };

    const handleDownload = (task) => {
        console.log(task)
        dispatch(taskActions.downloadTaskFile(task))
      };

    const handleDelete = (taskCode) => {
        dispatch(taskActions.deleteTask(taskCode));
        console.log('code', taskCode)
    }

    const handleEdit = (task) => {
        setEditedTask({ ...task });
        console.log('task',task)
        setOpenModalEditTask(true);
    };

    const handleOpenFilter = () => {
        setOpenModalFilter(true);
    };

    const handleCloseModalFilter = () => {
        setOpenModalFilter(false);
    };

    const handleSaveChangesFilter = () => {
        dispatch(taskActions.getAll({ date: dateQuery})).then((result) => {
            // Destructure result to access the payload, error, and other properties
            const data = result?.payload?.data?.data?.length
            console.log('res', result?.payload?.data?.data?.length)
            setOpenModalFilter(false)
            if(data <= 0) {
                Swal.fire({
                    title: 'Error!',
                    text: 'Tugas tidak ditemukan',
                    icon: 'error',
                    showConfirmButton: true
                });
                dispatch(taskActions.getAll());
            }
        });
    };

    const handleOpenAddTask = (task) => {
        console.log('task',task)
        setOpenModalAddTask(true);
    };

    const handleSaveChangesEdit = () => {
        const body = {
            title: editedTask.title,
            description: editedTask.description,
            deadline: editedTask.deadline,
            document: editedTask.document,
            status: editedTask.status ? 1 : 0,
            task_code: editedTask.task_code
        };
        console.log(body);
        // Dispatch action and use then to handle success/error
        dispatch(taskActions.updateTask(body)).then((result) => {
            // Destructure result to access the payload, error, and other properties
            console.log('alert', result)
            const { payload, error } = result;
            if (payload) {
                // Task added successfully, show success SweetAlert
                Swal.fire({
                    title: 'Success!',
                    text: 'Berhasil mempebarui tugas',
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: true
                })
                setOpenModalEditTask(false);
                dispatch(taskActions.getAll())
            } else {
                // There was an error, show an error SweetAlert
                Swal.fire({
                    title: 'Error!',
                    text: error?.response?.data?.message || 'Gagal memperbarui tugas',
                    icon: 'error',
                    timer: 2000,
                    showConfirmButton: true
                });
            }
        });
    };

    const handleSaveChangesAdd= () => {
        // dispatch atau aksi lainnya untuk menyimpan perubahan
        const body = {
            title: newTask.title,
            description: newTask.description,
            deadline: newTask.deadline.format('YYYY-MM-DD'),
            document: newTask.document,
            status: newTask.isFinish ? 1 : 0
        };
        console.log(body);
        // Dispatch action and use then to handle success/error
        dispatch(taskActions.addTask(body)).then((result) => {
            // Destructure result to access the payload, error, and other properties
            console.log('alert', result)
            const { payload, error } = result;
            if (payload) {
                // Task added successfully, show success SweetAlert
                Swal.fire({
                    title: 'Success!',
                    text: 'Berhasil menambahkan tugas',
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: true
                })
                setOpenModalAddTask(false);
                dispatch(taskActions.getAll())
            } else {
                // There was an error, show an error SweetAlert
                Swal.fire({
                    title: 'Error!',
                    text: error?.response?.data?.message || 'Gagal menambahkan tugas',
                    icon: 'error',
                    timer: 2000,
                    showConfirmButton: true
                });
            }
        });
    };

    const handleCloseModalEdit = () => {
        setEditedTask(null);
        setOpenModalEditTask(false);
    };

    const handleCloseModalAdd = () => {
        setOpenModalAddTask(false);
    };

    const handleDateChange = (newDate) => {
        const newMomentDate = moment(newDate);
        setEditedTask({ ...editedTask, deadline: newMomentDate });
    };

    const handleDateFilterChange = (newDate) => {
        const newMomentDate = moment(newDate);
        setFilterDate(newMomentDate);
        setDateQuery(newMomentDate.format("YYYY-MM-DD"));
    };

    const handleEditFileChange = (e) => {
        const file = e.target.files[0];

        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setEditedTask({ ...editedTask, document: event.target.result });
                // console.log('file res', event.target.result)
            };
            reader.readAsDataURL(file);
        }
    };

    const handleAddFileChange = (e) => {
        const file = e.target.files[0];

        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setNewTask({ ...newTask, document: event.target.result });
                // console.log('file res', event.target.result)
            };
            reader.readAsDataURL(file);
        }
    };
    

    return (
        <div style={{minHeight: "100vh"}}>
            <h1>Daftar Tugas</h1>
            <Grid container spacing={4} className='mb-4' style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Grid item xs={12} sm={12} md={6} lg={3}>
                    <Button fullWidth onClick={handleOpenAddTask} size='medium' variant="contained" color="primary">
                        Tambah Tugas
                    </Button>
                </Grid>
                <Grid item xs={12} sm={12} md={6} lg={3}>
                    <Button fullWidth onClick={handleOpenFilter} size='medium' variant="contained" color="primary">
                        Filter
                    </Button>
                </Grid>
                <Grid item xs={12} sm={12} lg={6}>
                    <TextField
                        fullWidth
                        size='small'
                        label="Cari"
                        variant="outlined"
                        value={searchQuery}
                        onChange={handleSearchChange}
                    />
                </Grid>
            </Grid>

            <Modal 
                open={openModalFilter}
                onClose={handleCloseModalFilter}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description">
                <Box
                    sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        bgcolor: 'background.paper',
                        boxShadow: 24,
                        p: 4,
                        width: 600,
                        borderRadius: 2
                    }}
                >
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <h2>Filter Tugas</h2>
                        </Grid>
                        <Grid item xs={12}>
                            <FormControl fullWidth>
                                <label htmlFor="filter">Filter Deadline</label>
                                <LocalizationProvider dateAdapter={AdapterMoment}>
                                    <DatePicker
                                        htmlFor="filter"
                                        value={filterDate}
                                        onChange={handleDateFilterChange}
                                        renderInput={(params) => <TextField {...params} fullWidth />}
                                    />
                                </LocalizationProvider>
                            </FormControl>
                        </Grid>
                        
                        <Grid item xs={12}>
                            <Button variant="contained" color="success" onClick={handleSaveChangesFilter}>
                                Terapkan
                            </Button>
                            <Button style={{marginLeft: "5px"}} variant="contained" color="error" onClick={handleCloseModalFilter}>
                                Batal
                            </Button>
                        </Grid>
                    </Grid>
                </Box>
            </Modal>

            <Modal
                open={openModalAddTask}
                onClose={handleCloseModalAdd}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <Box
                    sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        bgcolor: 'background.paper',
                        boxShadow: 24,
                        p: 4,
                        width: 600,
                        borderRadius: 2
                    }}
                >
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <h2>Tambah Tugas</h2>
                            <FormControl fullWidth>
                                <label htmlFor="judul">Judul</label>
                                <TextField
                                    htmlFor="judul"
                                    value={newTask.title}
                                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                                />
                            </FormControl>
                        </Grid>
                        <Grid item xs={12}>
                            <FormControl fullWidth>
                                <label htmlFor="deskripsi">Deskripsi</label>
                                <TextField
                                    htmlFor="deskripsi"
                                    value={newTask.description}
                                    onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                                />
                            </FormControl>
                        </Grid>
                        <Grid item xs={12}>
                            <FormControl fullWidth>
                                <label htmlFor="file-input">Berkas</label>
                                <Box display="flex" alignItems="center">
                                    <input
                                        accept="/*"
                                        id="file-input"
                                        type="file"
                                        style={{ display: 'none' }}
                                        onChange={handleAddFileChange}
                                    />
                                    <label htmlFor="file-input">
                                        <IconButton color="primary" component="span">
                                            <CloudUpload />
                                        </IconButton>
                                        <span>Upload File</span>
                                    </label>
                                </Box>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12}>
                            <FormControl fullWidth>
                                <label htmlFor="deadline">Deadline</label>
                                <LocalizationProvider dateAdapter={AdapterMoment}>
                                    <DatePicker
                                        htmlFor="deadline"
                                        value={newTask.deadline}
                                        onChange={handleDateChange}
                                        renderInput={(params) => <TextField {...params} fullWidth />}
                                    />
                                </LocalizationProvider>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} container justifyContent="space-between" alignItems="center">
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={newTask.status}
                                        onChange={(event) => handleAddTaskStatusChange(event)}
                                        inputProps={{ 'aria-label': 'task status' }}
                                    />
                                }
                                label="Tandai Selesai"
                                labelPlacement="start" 
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <Button variant="contained" color="success" onClick={handleSaveChangesAdd}>
                                Simpan
                            </Button>
                            <Button style={{marginLeft: "5px"}} variant="contained" color="error" onClick={handleCloseModalAdd}>
                                Batal
                            </Button>
                        </Grid>
                    </Grid>
                </Box>
            </Modal>

            {tasks?.loading && <CircularProgress />}
            {tasks?.error && <div className="text-danger">Error loading tasks?: {tasks?.error.message}</div>}

            {tasks?.data?.data && (
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Judul</TableCell>
                                <TableCell>Deskripsi</TableCell>
                                <TableCell>Deadline</TableCell>
                                <TableCell>Berkas</TableCell>
                                <TableCell>Selesai</TableCell>
                                <TableCell></TableCell>
                                <TableCell></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {tasks?.data?.data.map((task, id) => (
                                <TableRow key={id}>
                                    <TableCell>{task.title}</TableCell>
                                    <TableCell>{task.description}</TableCell>
                                    <TableCell>{moment(task.deadline).format('ddd, DD/MM/YYYY')}</TableCell>
                                    <TableCell>
                                        <IconButton color='primary' onClick={() => handleDownload(task)}>
                                            <DownloadIcon />
                                        </IconButton>
                                    </TableCell>
                                    <TableCell>
                                        <Checkbox
                                            checked={task.status}
                                            onChange={(event) => handleStatusChange(task)}
                                            inputProps={{ 'aria-label': 'task status' }}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <IconButton color="success" onClick={() => handleEdit(task)}>
                                            <EditIcon />
                                        </IconButton>
                                    </TableCell>
                                    <TableCell>
                                        <IconButton color="error" onClick={() => handleDelete(task.task_code)}>
                                            <DeleteIcon />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            {/* Modal Edit */}
            {editedTask && (
                <Modal
                    open={openModalEditTask}
                    onClose={handleCloseModalEdit}
                    aria-labelledby="modal-modal-title"
                    aria-describedby="modal-modal-description"
                >
                    <Box
                        sx={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            bgcolor: 'background.paper',
                            boxShadow: 24,
                            p: 4,
                            width: 600,
                            borderRadius: 2
                        }}
                    >
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <FormControl fullWidth>
                                    <label htmlFor="judul">Judul</label>
                                    <TextField
                                        htmlFor="judul"
                                        value={editedTask.title}
                                        onChange={(e) => setEditedTask({ ...editedTask, title: e.target.value })}
                                    />
                                </FormControl>
                            </Grid>
                            <Grid item xs={12}>
                                <FormControl fullWidth>
                                    <label htmlFor="deskripsi">Deskripsi</label>
                                    <TextField
                                        htmlFor="deskripsi"
                                        value={editedTask.description}
                                        onChange={(e) => setEditedTask({ ...editedTask, description: e.target.value })}
                                    />
                                </FormControl>
                            </Grid>
                            <Grid item xs={12}>
                                <FormControl fullWidth>
                                    <label htmlFor="file-input">Berkas</label>
                                    <Box display="flex" alignItems="center">
                                        <input
                                            accept="/*"
                                            id="file-input"
                                            type="file"
                                            style={{ display: 'none' }}
                                            onChange={handleEditFileChange}
                                        />
                                        <label htmlFor="file-input">
                                            <IconButton color="primary" component="span">
                                                <CloudUpload />
                                            </IconButton>
                                            <span>Upload File</span>
                                        </label>
                                    </Box>
                                </FormControl>
                            </Grid>

                            <Grid item xs={12}>
                                <FormControl fullWidth>
                                    <label htmlFor="deadline">Deadline</label>
                                    <LocalizationProvider dateAdapter={AdapterMoment}>
                                        <DatePicker
                                            htmlFor="deadline"
                                            value={moment(editedTask.deadline)}
                                            onChange={handleDateChange}
                                            renderInput={(params) => <TextField {...params} fullWidth />}
                                        />
                                    </LocalizationProvider>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} container justifyContent="space-between" alignItems="center">
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={editedTask.status}
                                            onChange={handleEditStatusChange}
                                            inputProps={{ 'aria-label': 'task status' }}
                                        />
                                    }
                                    label="Tandai Selesai"
                                    labelPlacement="start" 
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <Button variant="contained" color="success" onClick={handleSaveChangesEdit}>
                                    Simpan
                                </Button>
                                <Button style={{marginLeft: "5px"}} variant="contained" color="error" onClick={handleCloseModalEdit}>
                                    Batal
                                </Button>
                            </Grid>
                        </Grid>
                    </Box>
                </Modal>
            )}
        </div>
    );
}
