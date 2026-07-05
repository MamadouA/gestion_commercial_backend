
export const FILE_FILTER = {
    filter: (_, file, cb) => {
        const allowed = /\.(jpg|jpeg|png|pdf|doc|docx|xls|xlsx|csv)$/i.test(file.originalname);
        cb(null, allowed);
    },
    limits: { fileSize: 1024 * 1024 * 5 }
}