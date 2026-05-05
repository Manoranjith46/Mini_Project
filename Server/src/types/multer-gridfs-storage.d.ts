declare module "multer-gridfs-storage" {
  import { StorageEngine } from "multer";
  import { EventEmitter } from "events";

  export interface GridFsStorageOptions {
    url?: string;
    options?: any;
    file?: (req: any, file: any) => any;
    db?: any;
    client?: any;
    cache?: boolean | string;
  }

  export class GridFsStorage extends EventEmitter implements StorageEngine {
    constructor(options: GridFsStorageOptions);
    _handleFile(req: any, file: any, cb: (error?: any, info?: any) => void): void;
    _removeFile(req: any, file: any, cb: (error: Error) => void): void;
  }
}
