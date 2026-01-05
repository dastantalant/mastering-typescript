import {useAuthStore} from '../stores';

const baseUrl = `${import.meta.env.VITE_API_URL}`;

export const fetchWrapper = {
    get: request('GET'),
    getFile: requestFile('GET'),
    post: request('POST'),
    postNoAuth: requestNoAuth('POST'),
    postFile: requestFileUpload('POST'),
    put: request('PUT'),
    patch: request('PATCH'),
    delete: request('DELETE'),
    postFileDownload: postFileDownload('POST'),
};

function request(method: string) {
    return (url: string, body?: any, {credentials} = {}) => {
        url = baseUrl + url;
        const requestOptions = {
            method,
            headers: authHeader(baseUrl + url)
        };
        if (body) {
            requestOptions.headers['Content-Type'] = 'application/json';
            requestOptions.body = JSON.stringify(body);
        }
        if (credentials) {
            requestOptions.credentials = credentials;
        }
        return fetch(url, requestOptions).then(handleResponse);
    }
}
function requestNoAuth(method: string) {
    return (url: string, body: any, {credentials} = {}) => {
        url = baseUrl + url;
        const requestOptions = {
            method,
            headers: {}
        };
        if (body) {
            requestOptions.headers['Content-Type'] = 'application/json';
            requestOptions.body = JSON.stringify(body);
        }
        return fetch(url, requestOptions).then(handleResponse);
    }
}

export function requestFile(method: string) {
    return (url: string, body: any, {credentials} = {}) => {
        url = baseUrl + url;
        const requestOptions = {
            method,
            headers: authHeader(baseUrl + url)
        };
        if (body) {
            requestOptions.headers['Content-Type'] = 'application/json';
            requestOptions.body = JSON.stringify(body);
        }
        if (credentials) {
            requestOptions.credentials = credentials;
        }
        let contentDisposition = '';
        let keyword = 'filename=';
        return fetch(url, requestOptions).then(response => {
            if (!response.ok) {
                return handleResponse(response);
            }
            contentDisposition = response.headers.get('x-content-disposition')
            return response.blob(); // Ensure binary processing
        })
            .then(blob => {
                const link = document.createElement("a");
                link.href = URL.createObjectURL(blob);
                link.download = contentDisposition.substring(contentDisposition.indexOf(keyword) + keyword.length).trim();
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            })
           // .catch(error => console.error("Download failed:", error));
    }
}
function requestFileUpload(method: string) {
    return (url: string, formData: FormData) => {
        url = baseUrl + url;
        const requestOptions = {
            method,
            headers: authHeader(url),
            body: formData
        };

        delete requestOptions.headers['Content-Type'];

        return fetch(url, requestOptions).then(handleResponse);
    }
}
// helper functions

function authHeader(url: string) {
    // return auth header with jwt if user is logged in and request is to the api url
    const {user} = useAuthStore();
    const isLoggedIn = !!user?.accessToken;
    const isApiUrl = url.startsWith(import.meta.env.VITE_API_URL);
    if (isLoggedIn && isApiUrl) {
        return {Authorization: `Bearer ${user.accessToken}`};
    } else {
        return {};
    }
}

function handleResponse(response: any) {
    return response.text().then(text => {
        const data = text && JSON.parse(text);

        if (!response.ok) {
            const {user, logout} = useAuthStore();
            if ([401, 403].includes(response.status) && user) {
                // auto logout if 401 Unauthorized or 403 Forbidden response returned from api
                logout();
            }

            const error = (data && data.message) || response.statusText;
            return Promise.reject(error);
        }

        return data;
    });
}
function postFileDownload(method: string) {
    return (url: string, body: any, {credentials} = {}) => {
        url = baseUrl + url;
        const requestOptions: any = {
            method,
            headers: authHeader(baseUrl + url)
        };

        if (body) {
            requestOptions.headers['Content-Type'] = 'application/json';
            requestOptions.body = JSON.stringify(body);
        }

        if (credentials) {
            requestOptions.credentials = credentials;
        }

        return fetch(url, requestOptions)
            .then(response => {
                if (!response.ok) {
                    return response.json().then(err => {
                        throw new Error(err.message || `Error: ${response.statusText}`);
                    });
                }

                const contentDisposition = response.headers.get('content-disposition') || '';
                const filename = contentDisposition.split('filename=')[1] || 'download';

                return response.blob().then(blob => {
                    const downloadUrl = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = downloadUrl;
                    a.download = filename;
                    document.body.appendChild(a);
                    a.click();

                    // Очистка
                    setTimeout(() => {
                        document.body.removeChild(a);
                        URL.revokeObjectURL(downloadUrl);
                    }, 100);

                    return { success: true, filename };
                });
            })
            .catch(error => {
                console.error("Download failed:", error);
                throw error;
            });
    }
}

