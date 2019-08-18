/* eslint-disable no-console */
import { ShowToastEvent } from 'lightning/platformShowToastEvent';


export const TOAST_TYPE = {
    INFO    : 'info',
    ERROR   : 'error',
    SUCCESS : 'success',
    WARNING : 'warning',
};


export function showNotification(title, message, variant) {
    dispatchEvent(
        new ShowToastEvent({
            title: title,
            message: message,
            variant: variant,
        })
    );
}

/**
 *
 * @param {function} action   apex method
 * @param {JSON}     params   apex method params
 * @param {function} callback will have been executed with the server response as parameter
 */
export function makeServerCall(action, params, callback) {

    action(params)
        .then(result  => { callback(result) })
        .catch(errors => {
            showNotification('Error', reduceErrors(errors).join('. '), TOAST_TYPE.ERROR);
            console.log(`ERROR : ${reduceErrors(errors)}`);
        });
}

/**
 * Reduces one or more LDS errors into a string[] of error messages.
 * @param  {FetchResponse|FetchResponse[]} errors single error or errors[]
 * @return {String[]} Error messages
 */
export function reduceErrors(errors) {
    if (Array.isArray(errors) === false) {
        errors = [errors];
    }

    return (
        errors
            // Remove null/undefined items
            .filter(error => !!error)
            // Extract an error message
            .map(error => {
                // UI API read errors
                if (Array.isArray(error.body)) {
                    return error.body.map(e => e.message);
                }
                // UI API DML, Apex and network errors
                else if (error.body && typeof error.body.message === 'string') {
                    return error.body.message;
                }
                // JS errors
                else if (typeof error.message === 'string') {
                    return error.message;
                }
                // Unknown error shape so try HTTP status text
                return error.statusText;
            })
            // Flatten
            .flat()
            // Remove empty strings
            .filter(message => !!message)
            // Convert errors[] to the dot separated {String}
            // .join('. ')
    );
}