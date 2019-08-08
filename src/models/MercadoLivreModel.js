require('es6-promise').polyfill();
require('isomorphic-fetch');
const config = require('../config/meliConfig.js').config;
const app_config = require('../config/appConfig.js').config;
const perguntadoresService = require('../service/perguntadoresService.js');

/**
 *
 * Creates a new object Meli
 *
 * @constructor
 * @param {string} [access_token]
 * @param {string} [refresh_token]
 */

class MercadoLivre {
    constructor(access_token, refresh_token) {
        this._parameters = {
            client_id: app_config.CLIENT_ID,
            client_secret: app_config.SECRETE_KEY,
            access_token: access_token,
            refresh_token: refresh_token
        }
    }

    /**
     *
     * get the auth url.
     *
     * @param {string} redirect_uri
     * @returns {string}
     *
     */
    getAuthURL() {
        const query = {
            response_type: 'code',
            client_id: this._parameters.client_id,
            redirect_uri: app_config.REDIRECT_URL
        };
        return config.auth_url + this.convertObjectToQueryString(query);
    }

    /**
     *
     * Exchange the code for a token
     *
     * @param {string} code
     * @param {string} redirect_uri
     *
     */
    async authorize(code) {
        try {
            const query = {
                grant_type: 'authorization_code',
                client_id: this._parameters.client_id,
                client_secret: this._parameters.client_secret,
                code: code,
                redirect_uri: app_config.REDIRECT_URL
            }
            const authUrl = config.oauth_url + this.convertObjectToQueryString(query)
            const res = await fetch(authUrl, {
                method: 'POST'
            });

            const params = await res.json();
            console.log('Autorization Result: ', params);
            if (params.error) {
                throw params;
            }
            if (params) {
                this._parameters = { ...this._parameters, ...params }
                return {
                    access_token: this._parameters.access_token,
                    refresh_token: this._parameters.refresh_token,
                    user_id: params.user_id
                };
            }
        } catch (err) {
            return err;
        }
    }
    /**
     *
     * Refresh your access token, using the token of the constructor or the token get in the Authorize method
     *
     */
    async refreshAccessToken() {
        try {
            const query = {
                grant_type: 'refresh_token',
                client_id: this._parameters.client_id,
                client_secret: this._parameters.client_secret,
                refresh_token: this._parameters.refresh_token
            }
            const refreshUrl = config.oauth_url;
            console.log('URL refresh: ', refreshUrl);
            const res = await fetch(refreshUrl, {
                method: 'POST',
                body: JSON.stringify(query)
            })

            const refreshed = await res.json();

            if (refreshed.error) {
                throw refreshed;
            }
            console.log('Refreshed: ', refreshed);
            if (refreshed && !refreshed.error) {
                this._parameters.refresh_token = refreshed.refresh_token;
                this._parameters.access_token = refreshed.access_token;

                perguntadoresService.atualizarPerguntador({
                    id: refreshed.user_id,
                    access_token: refreshed.access_token,
                    refresh_token: refreshed.refresh_token
                });

                return { access_token: this._parameters.access_token, refresh_token: this._parameters.refresh_token }
            }

        } catch (err) {
            return err;
        }
    }

    async post(path, body, params) {
        try {
            const query = (typeof (params) == 'object') ?
                this.convertObjectToQueryString(params) :
                this.convertObjectToQueryString({});

            path = config.api_root_url + (path.charAt(0) == '/' ? '' : '/') + path + query;
            console.log('URL: ', path);
            const res = await fetch(path, {
                method: 'POST',
                body: JSON.stringify(body)
            })

            const result = await res.json();
            if (result.error) {
                throw result;
            }
            return result;
        } catch (err) {
            if (err.message === 'expired_token' || err.message === 'invalid_token') {
                const refreshed = await this.refreshAccessToken();
                if (!refreshed.error) {
                    await this.post(path, body, params);
                } else {
                    console.log('REFRESHED ERROR: ', refreshed);
                }
                return;
            }
            console.log(err);
        }
    }

    async get(path, params) {
        try {
            let query = (typeof (params) == 'object') ?
                this.convertObjectToQueryString(params) :
                this.convertObjectToQueryString({});

            path = config.api_root_url + (path.charAt(0) == '/' ? '' : '/') + path + query;
            
            const res = await fetch(path)

            const result = await res.json();

            if(result.error){
                throw result; 
            }

            return result;
        } catch (err) {
            if (err.message === 'expired_token' || err.message === 'invalid_token') {
                console.log('REFRESCAR')
                const refreshed = await this.refreshAccessToken();
                if (!refreshed.error) {
                    await this.get(path, params);
                } else {
                    console.log('REFRESHED ERROR: ', refreshed);
                }
                return;
            }
            console.log(err);
        }
    }

    convertObjectToQueryString(obj) {
        // Clone the object obj and loose the reference
        obj = Object.create(obj);
        if (!obj.access_token && this._parameters.access_token) {
            obj.access_token = this._parameters.access_token;
        }
        let result = '?';
        for (let i in obj) {
            result += i + "=";
            if (obj[i] != undefined) {
                if (Array.isArray(obj[i])) {
                    result += obj[i].join() + "&";
                } else {
                    result += obj[i] + "&";
                }
            }
        }
        if (result[result.length - 1] == '&') {
            result = result.substr(0, result.length - 1);
        }
        if (result == '?')
            result = '';
        return result;
    }



}

// const Meli = (access_token, refresh_token) => {

//     let _parameters = {
//         client_id: app_config.CLIENT_ID,
//         client_secret: app_config.SECRETE_KEY,
//         access_token: access_token,
//         refresh_token: refresh_token
//     };


//     /**
//      *
//      * get the auth url.
//      *
//      * @param {string} redirect_uri
//      * @returns {string}
//      *
//      */
//     this.getAuthURL = () => {
//         const query = {
//             response_type: 'code',
//             client_id: _parameters.client_id,
//             redirect_uri: app_config.REDIRECT_URL
//         };
//         return config.auth_url + convertObjectToQueryString(query);
//     };

//     /**
//      *
//      * Exchange the code for a token
//      *
//      * @param {string} code
//      * @param {string} redirect_uri
//      *
//      */
//     this.authorize = async (code, redirect_uri) => {
//         try {
//             const res = await fetch(config.oauth_url, {
//                 method: 'POST',
//                 body: {
//                     grant_type: 'authorization_code',
//                     client_id: _parameters.client_id,
//                     client_secret: _parameters.client_secret,
//                     code: code,
//                     redirect_uri: redirect_uri
//                 }
//             });

//             const params = await res.json();
//             console.log('Parametros: ', params);
//             if (params) {
//                 // _parameters.access_token = params.access_token;
//                 // _parameters.refresh_token = params.refresh_token;
//                 // _parameters.redirect_uri = redirect_uri;
//                 _parameters = { ..._parameters, ...params }
//                 return { access_token: _parameters.access_token, refresh_token: _parameters.refresh_token};
//             }
//         } catch (err) {
//             console.log('Erro na autorização: ', err);
//         }
//     };
//     /**
//      *
//      * Refresh your access token, using the token of the constructor or the token get in the Authorize method
//      *
//      */
//     this.refreshAccessToken = async () => {
//         try {
//             const res = await fetch(config.oauth_url, {
//                 method: 'POST',
//                 body: {
//                     grant_type: 'refresh_token',
//                     client_id: _parameters.client_id,
//                     client_secret: _parameters.client_secret,
//                     refresh_token: _parameters.refresh_token
//                 }
//             })

//             const refreshed = await res.json();

//             console.log('Refreshed: ', refreshed);
//             if(refreshed) {
//                 _parameters.refresh_token = refreshed.refresh_token;
//                 _parameters.access_token = refreshed.access_token;

//                 return { access_token: _parameters.access_token, refresh_token: _parameters.refresh_token }
//             }
//         } catch (err) {
//             console.log('Erro no refresh: ', err);
//         }
//     };

//     // /**
//     //  *
//     //  * get request
//     //  *
//     //  * @param {string} path relative path to get
//     //  * @param {object} [params] automatically add the access_token in the query
//     //  * @param {function} callback function (error,response)
//     //  */
//     // this.get = function (path, params, callback) {
//     //     let cb = callback;
//     //     if (!callback) cb = params;
//     //     let query = (typeof (params) == 'object') ?
//     //         convertObjectToQueryString(params) :
//     //         convertObjectToQueryString({});


//     //     path = config.api_root_url + (path.charAt(0) == '/' ? '' : '/') + path + query;
//     //     //console.log(path);
//     //     needle.get(path, {
//     //     }, function (err, res, body) {
//     //         //console.log(err, body);
//     //         cb(err, res ? res.body : res);
//     //     });
//     // };

//     // /**
//     //  *
//     //  * post request
//     //  *
//     //  * @param {string} path relative path to post
//     //  * @param {object} body data to send to post, not require stringify
//     //  * @param {object} [params] automatically add the access_token in the query
//     //  * @param {function} callback function (error,response)
//     //  */
//     // this.post = function (path, body, params, callback) {
//     //     let cb = callback;
//     //     if (!callback) cb = params;
//     //     let query = (typeof (params) == 'object') ?
//     //         convertObjectToQueryString(params) :
//     //         convertObjectToQueryString({});

//     //     path = config.api_root_url + (path.charAt(0) == '/' ? '' : '/') + path + query;
//     //     //console.log(path);
//     //     needle.post(path, body, {
//     //         json: true,
//     //         headers: {
//     //             "Content-Type": "application/json"
//     //         }
//     //     }, function (err, res, body) {
//     //         //console.log(err, body);

//     //         cb(err, res ? res.body : res);
//     //     });
//     // };

//     // /**
//     //  *
//     //  * post request (multipart)
//     //  *
//     //  * @param {string} path relative path to post
//     //  * @param {object} body data to send to post, not require stringify
//     //  * @param {object} [params] params automatically add the access_token in the query
//     //  * @param {function} callback function (error,response)
//     //  */
//     // this.upload = function (path, body, params, callback) {
//     //     let cb = callback;
//     //     if (!callback) cb = params;
//     //     let query = (typeof (params) == 'object') ?
//     //         convertObjectToQueryString(params) :
//     //         convertObjectToQueryString({});

//     //     path = config.api_root_url + (path.charAt(0) == '/' ? '' : '/') + path + query;
//     //     //console.log(path);
//     //     needle.post(path, body, {
//     //         multipart: true
//     //     }, function (err, res, body) {
//     //         //console.log(err, body);

//     //         cb(err, res ? res.body : res);
//     //     });
//     // };

//     // /**
//     //  *
//     //  * put request
//     //  *
//     //  * @param {string} path relative path to put
//     //  * @param {object} body data to send to put, not require stringify
//     //  * @param {object} [params] params automatically add the access_token in the query
//     //  * @param {function} callback function (error,response)
//     //  */
//     // this.put = function (path, body, params, callback) {
//     //     let cb = callback;
//     //     if (!callback) cb = params;
//     //     let query = (typeof (params) == 'object') ?
//     //         convertObjectToQueryString(params) :
//     //         convertObjectToQueryString({});

//     //     path = config.api_root_url + (path.charAt(0) == '/' ? '' : '/') + path + query;
//     //     //console.log(path);
//     //     needle.put(path, body, {
//     //         json: true,
//     //         headers: {
//     //             "Content-Type": "application/json"
//     //         }
//     //     }, function (err, res, body) {
//     //         //console.log(err, body);

//     //         cb(err, res ? res.body : res);
//     //     });
//     // };

//     // /**
//     //  *
//     //  * delete request
//     //  *
//     //  * @param {string} path relative path to delete
//     //  * @param {object} [params] params automatically add the access_token in the query
//     //  * @param {function} callback function (error,response)
//     //  */
//     // this.delete = function (path, params, callback) {
//     //     let cb = callback;
//     //     if (!callback) cb = params;
//     //     let query = (typeof (params) == 'object') ?
//     //         convertObjectToQueryString(params) :
//     //         convertObjectToQueryString({});

//     //     path = config.api_root_url + (path.charAt(0) == '/' ? '' : '/') + path + query;
//     //     //console.log(path);
//     //     needle.delete(path, {
//     //         headers: {
//     //             "Content-Type": "application/json"
//     //         }
//     //     }, function (err, res, body) {
//     //         //console.log(err, body);

//     //         cb(err, res ? res.body : res);
//     //     });
//     // };

//     /**
//      *
//      * @param {object} obj this object convert in query string, example: {a: 1, b: "hello"} ?a=1&b=hello
//      * @returns {string}
//      */
//     let convertObjectToQueryString = function (obj) {
//         // Clone the object obj and loose the reference
//         obj = Object.create(obj);
//         if (!obj.access_token && _parameters.access_token)
//             obj.access_token = _parameters.access_token;
//         let result = '?';
//         for (let i in obj) {
//             result += i + "=";
//             if (obj[i] != undefined) {
//                 if (Array.isArray(obj[i])) {
//                     result += obj[i].join() + "&";
//                 } else {
//                     result += obj[i] + "&";
//                 }
//             }
//         }
//         if (result[result.length - 1] == '&') {
//             result = result.substr(0, result.length - 1);
//         }
//         if (result == '?')
//             result = '';
//         return result;
//     }

// };


exports.MercadoLivre = MercadoLivre;