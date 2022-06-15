
export const NoUrlError = {
    message: 'No url specified for the remote file type. You must specify a valid remote url',
    statusCode: 403,
    statusMessage: 'Bad request url.'
};

export const InvalidFileTypeError = {
    message : "Invlaid file type. File type can only be 'local' or 'remote'.",
    statusCode: 403,
    statusMessage: 'Bad file type.'
}