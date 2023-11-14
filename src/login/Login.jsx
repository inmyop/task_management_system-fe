import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { TextField, Button, Grid, Snackbar } from '@mui/material';
import MuiAlert from '@mui/material/Alert';
import { authActions } from '_store';

export { Login };

function Login() {
    const dispatch = useDispatch();
    const authUser = useSelector((state) => state.auth.user);
    const authError = useSelector((state) => state.auth.error);
    const navigate = useNavigate();

    useEffect(() => {
        if (authUser) navigate('/');
    }, [authUser, navigate]);

    const validationSchema = yup.object().shape({
        email: yup.string().required('Email is required').email('Enter a valid email'),
        password: yup.string().required('Password is required'),
    });

    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: yupResolver(validationSchema),
    });

    const onSubmit = ({ email, password }) => {
        dispatch(authActions.login({ email, password }));
    };

    return (
        <Grid
            container
            direction="column"
            justifyContent="center"
            alignItems="center"
            style={{ height: '100vh' }}
        >
            <Grid item className='bg-light'>
                <Grid item md={6} ld={6} className=''>
                    <form onSubmit={handleSubmit(onSubmit)} style={{ width: '300px' }}>
                        <Grid item>
                            <TextField
                                fullWidth
                                label="Email"
                                type="email"
                                {...register('email')}
                                error={!!errors.email}
                                helperText={errors.email?.message || ''}
                            />
                        </Grid>
                        <Grid item style={{ marginTop: '1rem' }}>
                            <TextField
                                fullWidth
                                label="Password"
                                type="password"
                                {...register('password')}
                                error={!!errors.password}
                                helperText={errors.password?.message || ''}
                            />
                        </Grid>
                        <Grid item style={{ marginTop: '1rem' }}>
                            <Button
                                type="submit"
                                variant="contained"
                                color="primary"
                            >
                                Login
                            </Button>
                            <Button component={Link} to="/register" >Belum punya akun?</Button>
                        </Grid>
                    </form>
                    <Grid item>
                        <Snackbar open={!!authError?.message} autoHideDuration={6000} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
                            <MuiAlert elevation={6} variant="filled" severity="error" onClose={() => dispatch(authActions.clearError())}>
                                {authError?.message}
                            </MuiAlert>
                        </Snackbar>
                    </Grid>
                </Grid>
            </Grid>
        </Grid>
    );
}
