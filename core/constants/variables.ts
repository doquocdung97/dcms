export class Variable {

	static readonly STRING: string 							= 'string';
	static readonly NUMBER: string 							= 'number';
	static readonly DICT: string 								= 'dict';
	static readonly LISTENING_DOCUMENT: string 	= 'document_{0}';
	
	//config
	static readonly ELASTIC_HOST: string = 'ELASTIC_HOST';

	//

	//media
	static readonly FORDER_FILE = 'media';
  static readonly FORDER_FILE_PUBLIC = '/public';
  static readonly FORDER_FILE_PRIVATE = '/private';
  static readonly FORDER_FILE_PUBLIC_ROOT = 'media/public';
	//logger
	static readonly FOLDER = 'logs';
  static readonly ERROR_FILE = 'error.log';
  static readonly INFO_FILE = 'info.log';
  static readonly FORMAT_DATE = 'YYYY-MM-DD HH:mm:ss';
  static readonly LEVEL_ERROR = 'error';
  static readonly LEVEL_INFO = 'info';
  static readonly LEVEL_WARNING = 'warn';

	//export
	static readonly EXPORT_DIR = 'exports';
	

	//database 
	static readonly SQLITE_TYPE = 'sqlite';
	static readonly DATABASE_DEFAULT = {
		"type": "sqlite",
    "path": "/data/db.sqlite"
	}
}