axios.defaults.withCredentials = true;

// Or if you're making individual requests:
await axios.post('http://localhost:5500/api/v1/auth/sign-in', data, {
    withCredentials: true
}); 