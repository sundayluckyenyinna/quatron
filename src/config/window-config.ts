

export const HomeWindowConfig = {
    autoHideMenuBar: true,
    webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
        webviewTag: true
    }
};

export const GenerateWindowConfig = {
    ...HomeWindowConfig
};

export const RegisterStudentWindowConfig = {
    ...HomeWindowConfig
};

export const RegisterTermWindowConfig = {
    ...HomeWindowConfig
};

export const SubjectWindowConfig = {
    ...HomeWindowConfig
};

export const UploadScoreWindowConfig = {
    ...HomeWindowConfig
};

export const ViewAllStudentWindowConfig = {
    ...HomeWindowConfig
};

export const RemotePageWindowConfig = {
    ...HomeWindowConfig
};

export const SubjectPageWindowConfig = {
    ...HomeWindowConfig
};

export const ManualUploadPageWindowConfig = {
    ...HomeWindowConfig
};