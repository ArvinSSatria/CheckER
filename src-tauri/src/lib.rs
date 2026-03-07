use std::process::{Child, Command};
use std::sync::Mutex;
use tauri::Manager;

struct ServerProcess(Mutex<Option<Child>>);

impl Drop for ServerProcess {
    fn drop(&mut self) {
        if let Ok(mut guard) = self.0.lock() {
            if let Some(ref mut child) = *guard {
                let _ = child.kill();
                let _ = child.wait();
            }
        }
    }
}

fn extract_server_zip(
    zip_path: &std::path::Path,
    dest_dir: &std::path::Path,
) -> Result<(), Box<dyn std::error::Error>> {
    let file = std::fs::File::open(zip_path)?;
    let mut archive = zip::ZipArchive::new(file)?;

    for i in 0..archive.len() {
        let mut file = archive.by_index(i)?;
        let name = match file.enclosed_name() {
            Some(n) => n.to_owned(),
            None => continue,
        };
        let out_path = dest_dir.join(&name);

        if file.is_dir() {
            std::fs::create_dir_all(&out_path)?;
        } else {
            if let Some(parent) = out_path.parent() {
                std::fs::create_dir_all(parent)?;
            }
            let mut outfile = std::fs::File::create(&out_path)?;
            std::io::copy(&mut file, &mut outfile)?;
        }
    }
    Ok(())
}

fn ensure_server_extracted(
    app_data_dir: &std::path::Path,
    resource_dir: &std::path::Path,
    exe_dir: &std::path::Path,
    app_version: &str,
) -> std::path::PathBuf {
    let server_dir = app_data_dir.join("nextjs-server");
    let version_file = app_data_dir.join(".server-version");

    // Check if already extracted AND version matches
    let needs_extract = if server_dir.join("server.js").exists() {
        match std::fs::read_to_string(&version_file) {
            Ok(v) => v.trim() != app_version,
            Err(_) => true,
        }
    } else {
        true
    };

    if !needs_extract {
        return server_dir;
    }

    // Clean old extraction
    if server_dir.exists() {
        let _ = std::fs::remove_dir_all(&server_dir);
    }

    // Look for zip in resource dir first, then exe dir
    for dir in &[resource_dir, exe_dir] {
        let zip_path = dir.join("nextjs-server.zip");
        if zip_path.exists() {
            println!("Extracting Next.js server from {:?}...", zip_path);
            std::fs::create_dir_all(&server_dir).ok();
            match extract_server_zip(&zip_path, &server_dir) {
                Ok(_) => {
                    println!("Extraction complete.");
                    let _ = std::fs::write(&version_file, app_version);
                }
                Err(e) => eprintln!("Failed to extract: {}", e),
            }
            return server_dir;
        }
    }

    eprintln!("nextjs-server.zip not found");
    server_dir
}

fn start_nextjs_server(server_dir: &std::path::Path) -> Option<Child> {
    let server_js = server_dir.join("server.js");

    if !server_js.exists() {
        eprintln!("server.js not found at: {:?}", server_js);
        return None;
    }

    match Command::new("node")
        .arg(&server_js)
        .current_dir(server_dir)
        .env("PORT", "3456")
        .env("HOSTNAME", "localhost")
        .spawn()
    {
        Ok(child) => {
            println!("Next.js server started on port 3456 (pid: {})", child.id());
            Some(child)
        }
        Err(e) => {
            eprintln!("Failed to start Next.js server: {}", e);
            None
        }
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .setup(|app| {
            let app_data_dir = app
                .path()
                .app_data_dir()
                .expect("failed to get app data dir");
            std::fs::create_dir_all(&app_data_dir).ok();

            let exe_dir = std::env::current_exe()
                .expect("failed to get exe path")
                .parent()
                .expect("failed to get exe dir")
                .to_path_buf();

            let resource_dir = app.path().resource_dir().unwrap_or(exe_dir.clone());

            let server_dir = ensure_server_extracted(&app_data_dir, &resource_dir, &exe_dir, env!("CARGO_PKG_VERSION"));
            let child = start_nextjs_server(&server_dir);
            app.manage(ServerProcess(Mutex::new(child)));

            if let Some(window) = app.get_webview_window("main") {
                std::thread::spawn(move || {
                    std::thread::sleep(std::time::Duration::from_secs(3));
                    let _ = window.eval("window.location.reload()");
                });
            }

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
