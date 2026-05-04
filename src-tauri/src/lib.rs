use tauri::{Manager, WebviewUrl, WebviewWindowBuilder, Emitter};
use std::sync::{Arc, Mutex};
use std::thread;
use std::path::PathBuf;
use std::fs;

#[derive(Clone)]
struct AppState {
    user_pet_id: Arc<Mutex<Option<String>>>,
}

fn get_assets_dir(app: &tauri::AppHandle) -> PathBuf {
    app.path().app_data_dir()
        .unwrap_or_else(|_| PathBuf::from("."))
        .join("assets")
}

// ── Overlay ──────────────────────────────────────────────────
#[tauri::command]
fn show_overlay(app: tauri::AppHandle, user_pet_id: String, size: String) {
    if let Some(state) = app.try_state::<AppState>() {
        let mut id = state.user_pet_id.lock().unwrap();
        *id = Some(user_pet_id.clone());
    }

    let (win_w, win_h) = match size.as_str() {
        "small"  => (160.0_f64, 196.0_f64),
        "large"  => (320.0_f64, 392.0_f64),
        _        => (220.0_f64, 270.0_f64),
    };

    if let Some(overlay) = app.get_webview_window("overlay") {
        let _ = overlay.set_size(tauri::Size::Logical(
            tauri::LogicalSize { width: win_w, height: win_h }
        ));
        let _ = overlay.show();
        let _ = overlay.emit("pet-id", user_pet_id);
    } else {
        let url = format!("index.html?window=overlay&pet={}", user_pet_id);
        if let Ok(win) = WebviewWindowBuilder::new(
            &app,
            "overlay",
            WebviewUrl::App(url.into()),
        )
        .title("")
        .inner_size(win_w, win_h)
        .position(50.0, 50.0)
        .transparent(true)
        .decorations(false)
        .always_on_top(true)
        .skip_taskbar(true)
        .resizable(false)
        .build()
        {
            let _ = win.set_ignore_cursor_events(false);
        }
    }
}

#[tauri::command]
fn hide_overlay(app: tauri::AppHandle) {
    if let Some(overlay) = app.get_webview_window("overlay") {
        let _ = overlay.hide();
    }
}

#[tauri::command]
fn resize_overlay(app: tauri::AppHandle, size: String) {
    let (win_w, win_h) = match size.as_str() {
        "small"  => (160.0_f64, 196.0_f64),
        "large"  => (320.0_f64, 392.0_f64),
        _        => (220.0_f64, 270.0_f64),
    };

    if let Some(overlay) = app.get_webview_window("overlay") {
        let _ = overlay.set_size(tauri::Size::Logical(
            tauri::LogicalSize { width: win_w, height: win_h }
        ));
    }
}

#[tauri::command]
fn set_user_pet_id(app: tauri::AppHandle, user_pet_id: String) {
    if let Some(state) = app.try_state::<AppState>() {
        let mut id = state.user_pet_id.lock().unwrap();
        *id = Some(user_pet_id.clone());
    }
    if let Some(overlay) = app.get_webview_window("overlay") {
        let _ = overlay.emit("pet-id", user_pet_id);
    }
}

#[tauri::command]
fn emit_to_dashboard(app: tauri::AppHandle, clicks: u64) {
    if let Some(dashboard) = app.get_webview_window("dashboard") {
        let _ = dashboard.emit("click-update", clicks);
    }
}

#[tauri::command]
fn close_app(app: tauri::AppHandle) {
    app.exit(0);
}

// ── Assets ───────────────────────────────────────────────────

#[tauri::command]
async fn check_pet_assets(app: tauri::AppHandle, slug: String) -> bool {
    let pet_dir = get_assets_dir(&app).join(&slug);
    if !pet_dir.exists() { return false; }

    let required = vec![
        "stage1/stage1_idle.png",
        "stage1/stage1_click.png",
    ];

    required.iter().all(|f| pet_dir.join(f).exists())
}

#[tauri::command]
async fn download_pet_assets(
    app: tauri::AppHandle,
    slug: String,
    zip_url: String,
) -> Result<(), String> {
    let assets_dir = get_assets_dir(&app);
    let pet_dir = assets_dir.join(&slug);

    fs::create_dir_all(&pet_dir)
        .map_err(|e| format!("Error creando directorio: {}", e))?;

    let client = reqwest::Client::new();
    let response = client.get(&zip_url).send().await
        .map_err(|e| format!("Error descargando ZIP: {}", e))?;

    if !response.status().is_success() {
        return Err(format!("ZIP no encontrado: {}", response.status()));
    }

    let bytes = response.bytes().await
        .map_err(|e| format!("Error leyendo ZIP: {}", e))?;

    let zip_path = assets_dir.join(format!("{}_temp.zip", slug));
    fs::write(&zip_path, &bytes)
        .map_err(|e| format!("Error guardando ZIP: {}", e))?;

    let zip_file = fs::File::open(&zip_path)
        .map_err(|e| format!("Error abriendo ZIP: {}", e))?;

    let mut archive = zip::ZipArchive::new(zip_file)
        .map_err(|e| format!("Error leyendo ZIP: {}", e))?;

    for i in 0..archive.len() {
        let mut file = archive.by_index(i)
            .map_err(|e| format!("Error ZIP index: {}", e))?;

        let outpath = pet_dir.join(file.name());

        if file.name().ends_with('/') {
            fs::create_dir_all(&outpath)
                .map_err(|e| format!("Error creando dir: {}", e))?;
        } else {
            if let Some(parent) = outpath.parent() {
                fs::create_dir_all(parent)
                    .map_err(|e| format!("Error creando parent: {}", e))?;
            }
            let mut outfile = fs::File::create(&outpath)
                .map_err(|e| format!("Error creando archivo: {}", e))?;
            std::io::copy(&mut file, &mut outfile)
                .map_err(|e| format!("Error extrayendo: {}", e))?;
        }
    }

    let _ = fs::remove_file(&zip_path);

    Ok(())
}

#[tauri::command]
async fn download_pet_base_image(
    app: tauri::AppHandle,
    slug: String,
    url: String,
) -> Result<String, String> {
    let pet_dir = get_assets_dir(&app).join(&slug);
    fs::create_dir_all(&pet_dir)
        .map_err(|e| format!("Error creando directorio: {}", e))?;

    let file_path = pet_dir.join("base.png");

    if file_path.exists() {
        return Ok(file_path.to_string_lossy().to_string());
    }

    let client = reqwest::Client::new();
    let response = client.get(&url).send().await
        .map_err(|e| format!("Error descargando base: {}", e))?;

    if response.status().is_success() {
        let bytes = response.bytes().await
            .map_err(|e| format!("Error leyendo bytes: {}", e))?;
        fs::write(&file_path, &bytes)
            .map_err(|e| format!("Error escribiendo: {}", e))?;
    }

    Ok(file_path.to_string_lossy().to_string())
}

#[tauri::command]
fn get_pet_base_path(app: tauri::AppHandle, slug: String) -> String {
    let path = get_assets_dir(&app)
        .join(&slug)
        .join("base.png");

    if path.exists() {
        path.to_string_lossy().to_string()
    } else {
        String::new()
    }
}

#[tauri::command]
async fn download_potion_image(
    app: tauri::AppHandle,
    slug: String,
    url: String,
) -> Result<String, String> {
    let potions_dir = get_assets_dir(&app).join("potions");
    fs::create_dir_all(&potions_dir)
        .map_err(|e| format!("Error creando directorio: {}", e))?;

    let filename = format!("{}.png", slug);
    let file_path = potions_dir.join(&filename);

    if file_path.exists() {
        return Ok(file_path.to_string_lossy().to_string());
    }

    let client = reqwest::Client::new();
    let response = client.get(&url).send().await
        .map_err(|e| format!("Error en request: {}", e))?;

    if response.status().is_success() {
        let bytes = response.bytes().await
            .map_err(|e| format!("Error leyendo bytes: {}", e))?;
        fs::write(&file_path, &bytes)
            .map_err(|e| format!("Error escribiendo: {}", e))?;
    }

    Ok(file_path.to_string_lossy().to_string())
}

#[tauri::command]
fn get_asset_path(
    app: tauri::AppHandle,
    slug: String,
    stage: u8,
    animation: String,
) -> String {
    let path = get_assets_dir(&app)
        .join(&slug)
        .join(format!("stage{}", stage))
        .join(format!("stage{}_{}.png", stage, animation));

    if path.exists() {
        path.to_string_lossy().to_string()
    } else {
        String::new()
    }
}

#[tauri::command]
fn get_potion_path(app: tauri::AppHandle, slug: String) -> String {
    let path = get_assets_dir(&app)
        .join("potions")
        .join(format!("{}.png", slug));

    if path.exists() {
        path.to_string_lossy().to_string()
    } else {
        String::new()
    }
}

#[tauri::command]
async fn read_image_as_base64(path: String) -> Result<String, String> {
    let bytes = fs::read(&path)
        .map_err(|e| format!("Error leyendo imagen: {}", e))?;

    let b64 = base64_encode(&bytes);
    Ok(format!("data:image/png;base64,{}", b64))
}

fn base64_encode(input: &[u8]) -> String {
    const CHARS: &[u8] = b"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    let mut result = String::new();
    let mut i = 0;
    while i < input.len() {
        let b0 = input[i] as u32;
        let b1 = if i + 1 < input.len() { input[i + 1] as u32 } else { 0 };
        let b2 = if i + 2 < input.len() { input[i + 2] as u32 } else { 0 };
        result.push(CHARS[((b0 >> 2) & 0x3F) as usize] as char);
        result.push(CHARS[(((b0 << 4) | (b1 >> 4)) & 0x3F) as usize] as char);
        result.push(if i + 1 < input.len() { CHARS[(((b1 << 2) | (b2 >> 6)) & 0x3F) as usize] as char } else { '=' });
        result.push(if i + 2 < input.len() { CHARS[(b2 & 0x3F) as usize] as char } else { '=' });
        i += 3;
    }
    result
}

// ── Click listener ────────────────────────────────────────────

fn start_global_click_listener(app: tauri::AppHandle) {
    thread::spawn(move || {
        rdev::listen(move |event| {
            match event.event_type {
                rdev::EventType::ButtonPress(rdev::Button::Left)
                | rdev::EventType::ButtonPress(rdev::Button::Right) => {
                    if let Some(overlay) = app.get_webview_window("overlay") {
                        if overlay.is_visible().unwrap_or(false) {
                            let _ = overlay.emit("global-click", ());
                        }
                    }
                }
                _ => {}
            }
        }).ok();
    });
}

// ── Setup ─────────────────────────────────────────────────────

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .manage(AppState {
            user_pet_id: Arc::new(Mutex::new(None)),
        })
        .plugin(tauri_plugin_sql::Builder::default().build())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            show_overlay,
            hide_overlay,
            resize_overlay,
            set_user_pet_id,
            emit_to_dashboard,
            close_app,
            check_pet_assets,
            download_pet_assets,
            download_pet_base_image,
            get_pet_base_path,
            download_potion_image,
            get_asset_path,
            get_potion_path,
            read_image_as_base64,
        ])
        .setup(|app| {
            use tauri::tray::{TrayIconBuilder, TrayIconEvent};
            use tauri::menu::{MenuBuilder, MenuItemBuilder};

            let show   = MenuItemBuilder::with_id("show",   "Mostrar dashboard").build(app)?;
            let toggle = MenuItemBuilder::with_id("toggle", "Mostrar/Ocultar mascota").build(app)?;
            let quit   = MenuItemBuilder::with_id("quit",   "Salir").build(app)?;

            let menu = MenuBuilder::new(app)
                .items(&[&show, &toggle, &quit])
                .build()?;

            let _tray = TrayIconBuilder::new()
                .icon(app.default_window_icon().unwrap().clone())
                .menu(&menu)
                .on_menu_event(|app, event| match event.id().as_ref() {
                    "show" => {
                        if let Some(w) = app.get_webview_window("dashboard") {
                            let _ = w.show();
                            let _ = w.set_focus();
                        }
                    }
                    "toggle" => {
                        if let Some(overlay) = app.get_webview_window("overlay") {
                            if overlay.is_visible().unwrap_or(false) {
                                let _ = overlay.hide();
                            } else {
                                let _ = overlay.show();
                            }
                        }
                    }
                    "quit" => app.exit(0),
                    _ => {}
                })
                .on_tray_icon_event(|tray, event| {
                    if let TrayIconEvent::DoubleClick { .. } = event {
                        if let Some(w) = tray.app_handle().get_webview_window("dashboard") {
                            let _ = w.show();
                            let _ = w.set_focus();
                        }
                    }
                })
                .build(app)?;

            start_global_click_listener(app.handle().clone());
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}   