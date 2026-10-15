const fs=require('node:fs'),path=require('node:path');
function migrate(db,transaction,directory){
 db.exec(`CREATE TABLE IF NOT EXISTS booking_operations(booking_id TEXT PRIMARY KEY REFERENCES bookings(id),started_at TEXT,returned_at TEXT);CREATE TABLE IF NOT EXISTS maintenance_blocks(id TEXT PRIMARY KEY,car_id INTEGER NOT NULL REFERENCES vehicles(id),starts_at TEXT NOT NULL,ends_at TEXT NOT NULL,reason TEXT NOT NULL,actor_id TEXT NOT NULL,created_at TEXT NOT NULL,cancelled_at TEXT);CREATE INDEX IF NOT EXISTS maintenance_car_dates ON maintenance_blocks(car_id,starts_at,ends_at);`);
 db.exec("CREATE TABLE IF NOT EXISTS email_jobs(id TEXT PRIMARY KEY,dedupe TEXT NOT NULL UNIQUE,recipient TEXT NOT NULL,subject TEXT NOT NULL,body TEXT NOT NULL,html TEXT NOT NULL,kind TEXT NOT NULL,booking_id TEXT,status TEXT NOT NULL,attempts INTEGER NOT NULL DEFAULT 0,available_at INTEGER NOT NULL,leased_until INTEGER,created_at TEXT NOT NULL,sent_at TEXT,last_error TEXT);CREATE INDEX IF NOT EXISTS email_jobs_due ON email_jobs(status,available_at);");
 db.exec("CREATE TABLE IF NOT EXISTS notice_broadcasts(id TEXT PRIMARY KEY,actor_id TEXT NOT NULL,title TEXT NOT NULL,body TEXT NOT NULL,url TEXT NOT NULL,website_count INTEGER NOT NULL,email_count INTEGER NOT NULL,created_at TEXT NOT NULL);CREATE TABLE IF NOT EXISTS customer_notices(id TEXT PRIMARY KEY,broadcast_id TEXT NOT NULL REFERENCES notice_broadcasts(id),user_id TEXT NOT NULL REFERENCES users(id),title TEXT NOT NULL,body TEXT NOT NULL,url TEXT NOT NULL,created_at TEXT NOT NULL,read_at TEXT);CREATE INDEX IF NOT EXISTS notices_user_date ON customer_notices(user_id,created_at);CREATE TABLE IF NOT EXISTS notice_preferences(user_id TEXT PRIMARY KEY REFERENCES users(id),email_updates INTEGER NOT NULL DEFAULT 1);");
 const columns=t=>db.prepare('PRAGMA table_info('+t+')').all().map(c=>c.name);
 if(!columns('users').includes('suspended'))db.exec('ALTER TABLE users ADD COLUMN suspended INTEGER NOT NULL DEFAULT 0');
 if(!columns('sessions').includes('admin_verified'))db.exec('ALTER TABLE sessions ADD COLUMN admin_verified INTEGER NOT NULL DEFAULT 0');
 if(!db.prepare("SELECT sql FROM sqlite_master WHERE name='bookings'").get().sql.includes("'Rejected'")){
  const backup=path.join(directory,'before-admin-migration.sqlite');if(!fs.existsSync(backup))db.exec("VACUUM INTO '"+backup.replace(/'/g,"''")+"'");
  const sql=db.prepare("SELECT sql FROM sqlite_master WHERE name='bookings'").get().sql.replace(/CREATE TABLE bookings/i,'CREATE TABLE bookings_v2').replace("'Completed','Cancelled'","'Completed','Cancelled','Rejected'");
  db.exec('PRAGMA foreign_keys=OFF');try{transaction(()=>{db.exec(sql);db.exec('INSERT INTO bookings_v2 SELECT * FROM bookings; DROP TABLE bookings; ALTER TABLE bookings_v2 RENAME TO bookings; CREATE INDEX bookings_user ON bookings(user_id,created_at)');});}finally{db.exec('PRAGMA foreign_keys=ON');}if(db.prepare('PRAGMA foreign_key_check').all().length)throw Error('Migration integrity check failed');
 }
 db.exec(`CREATE TABLE IF NOT EXISTS admin_access(user_id TEXT PRIMARY KEY REFERENCES users(id),role TEXT NOT NULL CHECK(role IN ('owner','admin','staff')),permissions TEXT NOT NULL DEFAULT '[]',mfa_secret TEXT,mfa_pending TEXT,mfa_pending_expires INTEGER,mfa_last INTEGER NOT NULL DEFAULT -1);
 CREATE TABLE IF NOT EXISTS admin_audit(id INTEGER PRIMARY KEY,actor_id TEXT,action TEXT NOT NULL,resource TEXT NOT NULL,success INTEGER NOT NULL,created_at TEXT NOT NULL);
 CREATE TABLE IF NOT EXISTS vehicles(id INTEGER PRIMARY KEY,reference TEXT NOT NULL UNIQUE COLLATE NOCASE,data TEXT NOT NULL,status TEXT NOT NULL CHECK(status IN ('available','unavailable','maintenance','archived')),updated_at TEXT NOT NULL);
 CREATE TABLE IF NOT EXISTS cms_pages(slug TEXT PRIMARY KEY,file TEXT NOT NULL UNIQUE,draft TEXT NOT NULL,published TEXT NOT NULL,revision INTEGER NOT NULL DEFAULT 1,updated_at TEXT NOT NULL);
 CREATE TABLE IF NOT EXISTS cms_revisions(id INTEGER PRIMARY KEY,slug TEXT NOT NULL REFERENCES cms_pages(slug),content TEXT NOT NULL,actor_id TEXT NOT NULL,created_at TEXT NOT NULL);
 CREATE TABLE IF NOT EXISTS site_settings(key TEXT PRIMARY KEY,value TEXT NOT NULL);
 CREATE TABLE IF NOT EXISTS media(id TEXT PRIMARY KEY,name TEXT NOT NULL,category TEXT NOT NULL,alt TEXT NOT NULL,width INTEGER NOT NULL,height INTEGER NOT NULL,data BLOB NOT NULL,small BLOB NOT NULL,created_at TEXT NOT NULL);
 CREATE TABLE IF NOT EXISTS booking_internal(booking_id TEXT PRIMARY KEY REFERENCES bookings(id),note TEXT NOT NULL DEFAULT '');
 CREATE TABLE IF NOT EXISTS customer_notes(user_id TEXT PRIMARY KEY REFERENCES users(id),note TEXT NOT NULL DEFAULT '');
 CREATE TABLE IF NOT EXISTS payments(id TEXT PRIMARY KEY,booking_id TEXT NOT NULL REFERENCES bookings(id),amount INTEGER NOT NULL CHECK(amount<>0),kind TEXT NOT NULL CHECK(kind IN ('payment','refund')),reference TEXT NOT NULL UNIQUE,note TEXT NOT NULL,actor_id TEXT NOT NULL,created_at TEXT NOT NULL);
 CREATE TABLE IF NOT EXISTS backups(id TEXT PRIMARY KEY,filename TEXT NOT NULL,sha256 TEXT NOT NULL,size INTEGER NOT NULL,created_at TEXT NOT NULL);
 CREATE TABLE IF NOT EXISTS admin_invitations(token_hash TEXT PRIMARY KEY,user_id TEXT NOT NULL REFERENCES users(id),actor_id TEXT NOT NULL REFERENCES users(id),role TEXT NOT NULL,permissions TEXT NOT NULL,expires INTEGER NOT NULL);
 CREATE INDEX IF NOT EXISTS audit_date ON admin_audit(created_at);
 CREATE UNIQUE INDEX IF NOT EXISTS vehicles_registration ON vehicles(upper(replace(replace(coalesce(json_extract(data,'$.registration'),''),' ',''),'-',''))) WHERE json_extract(data,'$.registration') IS NOT NULL AND json_extract(data,'$.registration')<>'';
 PRAGMA user_version=5;`);
 const fleet=JSON.parse(fs.readFileSync(path.join(__dirname,'fleet.json'),'utf8'));
 if(!db.prepare("SELECT 1 FROM metadata WHERE key='fleet_seeded'").get())transaction(()=>{for(const c of fleet)db.prepare('INSERT OR IGNORE INTO vehicles VALUES(?,?,?,?,?)').run(c.id,'MZG-'+String(c.id).padStart(3,'0'),JSON.stringify({...c,year:null,fuel:'Petrol',features:[],images:[c.image],featured:false,weeklyRate:c.rate*7,monthlyRate:c.rate*30}), 'available',new Date().toISOString());db.prepare("INSERT INTO metadata VALUES('fleet_seeded',?)").run(new Date().toISOString());});
}
module.exports={migrate};
